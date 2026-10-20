#!/usr/bin/env python3
"""
Pipeline Gardenia | VM 3: buscar os dados limpos da VM 2 e processá-los com Apache Spark (etapa 7).

O que faz
---------
1. coletar   : copia da VM 2 os lotes limpos (trusted_clientes/produtos/compras_N.csv). Só copia lotes que tenham
               o marcador trusted_N.pronto, que a VM 2 grava por último.
2. processar : lê TODOS os lotes coletados de uma vez (Spark), monta a tabela de fatos, calcula agregações
               (receita por mês, categoria, faixa etária, top produtos), faz RFM + K-Means (Spark MLlib) e um
               teste de escala (a mesma agregação com 1x, 10x e 100x os dados).

Requisitos
----------
  Java 17 ou mais novo      sudo apt install -y default-jre-headless
  pip install pyspark pandas numpy matplotlib

Comandos
--------
  coletar    copia os lotes novos da VM 2
  processar  roda o Spark sobre os lotes coletados
  tudo       coletar + processar
  vigiar     repete "tudo" a cada N segundos

Exemplos
--------
  python3 pipeline_vm3.py tudo --origem usuario@IP_DA_VM2:/home/usuario/gardenia/saida
  python3 pipeline_vm3.py processar --forcar --k 4
  python3 pipeline_vm3.py vigiar --origem usuario@IP_DA_VM2:/home/usuario/gardenia/saida --intervalo 60

Login sem senha por SSH (uma vez, na VM 3)
------------------------------------------
  ssh-keygen -t ed25519
  ssh-copy-id usuario@IP_DA_VM2
  ssh usuario@IP_DA_VM2 echo ok        # deve responder "ok" sem pedir senha

Pastas (relativas ao diretório de onde o script é executado)
------------------------------------------------------------
  dados_trusted/        CSVs limpos copiados da VM 2
  resultados_spark/     resultados em CSV, fato_vendas.parquet, spark_resumo.png, relatorio_spark.txt
"""
import argparse
import contextlib
import json
import shlex
import shutil
import subprocess
import sys
import traceback

import matplotlib
matplotlib.use("Agg")          # sem interface gráfica: os gráficos são salvos em PNG
import io
import glob
import os
import re
import time

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pyspark.sql import SparkSession, functions as F
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import ClusteringEvaluator


# ======================================================================= coleta (VM 2 -> VM 3)
OPCOES_SSH = ["-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=15"]


def eh_remoto(origem):
    # "usuario@host:/pasta" ou "host:/pasta". Caminho local começa com / ou . e não tem ":" antes
    return ":" in origem and not origem.startswith(("/", ".", "~"))


def dividir_origem(origem):
    host, caminho = origem.split(":", 1)
    return host, (caminho or ".")


def comando_ssh(args, host, remoto):
    cmd = ["ssh"] + OPCOES_SSH
    if args.ssh_chave:
        cmd += ["-i", os.path.expanduser(args.ssh_chave)]
    if args.ssh_porta:
        cmd += ["-p", str(args.ssh_porta)]
    return cmd + [host, remoto]


def comando_scp(args, host, caminho_remoto, destino):
    cmd = ["scp", "-p", "-q"] + OPCOES_SSH
    if args.ssh_chave:
        cmd += ["-i", os.path.expanduser(args.ssh_chave)]
    if args.ssh_porta:
        cmd += ["-P", str(args.ssh_porta)]
    return cmd + [f"{host}:{caminho_remoto}", destino]


def rodar(cmd, descricao):
    try:
        return subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=300)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"{descricao} falhou (código {e.returncode}).\n{(e.stderr or '').strip()}\n"
            "Confira: o IP/nome da VM 2, o caminho da pasta, a chave SSH e se "
            "'ssh usuario@IP_DA_VM2 echo ok' funciona sem pedir senha."
        ) from None
    except FileNotFoundError:
        raise RuntimeError(f"{descricao}: o comando '{cmd[0]}' não está instalado nesta máquina.") from None
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"{descricao}: tempo esgotado (a VM 2 está acessível?).") from None


def listar_origem(args):
    """Nomes dos arquivos que existem na pasta da VM 2."""
    if eh_remoto(args.origem):
        host, caminho = dividir_origem(args.origem)
        saida = rodar(comando_ssh(args, host, f"ls -1 {shlex.quote(caminho)}"), "Listar a pasta da VM 2")
        return set(saida.stdout.split())
    if not os.path.isdir(args.origem):
        raise RuntimeError(f"A pasta de origem não existe: {args.origem}")
    return set(os.listdir(args.origem))


def lotes_prontos(nomes):
    """Lotes com marcador trusted_N.pronto E os 3 CSVs trusted presentes."""
    prontos = []
    for n in nomes:
        m = re.fullmatch(r"trusted_(\d+)\.pronto", n)
        if m:
            c = int(m.group(1))
            if all(f"trusted_{t}_{c}.csv" in nomes for t in TABELAS):
                prontos.append(c)
    return sorted(prontos)


def ler_marcador_origem(args, nome):
    if eh_remoto(args.origem):
        host, caminho = dividir_origem(args.origem)
        return rodar(comando_ssh(args, host, f"cat {shlex.quote(caminho.rstrip('/') + '/' + nome)}"),
                     f"Ler {nome}").stdout.strip()
    with open(os.path.join(args.origem, nome), encoding="utf-8") as f:
        return f.read().strip()


def ler_marcador_local(destino, nome):
    caminho = os.path.join(destino, nome)
    if not os.path.exists(caminho):
        return None
    with open(caminho, encoding="utf-8") as f:
        return f.read().strip()


def copiar_arquivo(args, nome, destino):
    final = os.path.join(destino, nome)
    temporario = final + ".part"
    if eh_remoto(args.origem):
        host, caminho = dividir_origem(args.origem)
        rodar(comando_scp(args, host, f"{caminho.rstrip('/')}/{nome}", temporario), f"Copiar {nome}")
    else:
        shutil.copy2(os.path.join(args.origem, nome), temporario)
    os.replace(temporario, final)      # só aparece com o nome final quando a cópia terminou


def coletar(args):
    os.makedirs(args.destino, exist_ok=True)
    nomes = listar_origem(args)
    disponiveis = lotes_prontos(nomes)
    sem_marcador = sorted({int(m.group(1)) for n in nomes if (m := re.fullmatch(r"trusted_clientes_(\d+)\.csv", n))}
                          - set(disponiveis))

    print(f"[coleta] origem: {args.origem}")
    print(f"[coleta] lotes prontos na VM 2: {disponiveis or 'nenhum'}")
    if sem_marcador:
        print(f"[coleta] lotes sem marcador (VM 2 ainda gravando, ou versão antiga do pipeline_vm2.py): {sem_marcador}")

    novos = []
    for c in disponiveis:
        nome_marc = f"trusted_{c}.pronto"
        remoto = ler_marcador_origem(args, nome_marc)
        # recopia se o lote foi reprocessado na VM 2 (o marcador muda a cada processamento)
        if not args.forcar and ler_marcador_local(args.destino, nome_marc) == remoto:
            continue
        marcador_local = os.path.join(args.destino, nome_marc)
        if os.path.exists(marcador_local):
            os.remove(marcador_local)           # lote em atualização: não pode ser lido pela metade
        for t in TABELAS:
            copiar_arquivo(args, f"trusted_{t}_{c}.csv", args.destino)
        copiar_arquivo(args, nome_marc, args.destino)       # o marcador vai por último
        novos.append(c)
        print(f"[coleta] lote {c} copiado para {args.destino}/")
    if not novos:
        print("[coleta] nada novo para copiar.")
    return novos


# ======================================================================= Spark (núcleo compartilhado com o notebook)
TABELAS = ["clientes", "produtos", "compras"]
COR_SEGMENTO = {"VIP": "#C44E52", "Regular": "#DD8452", "Baixo engajamento": "#4C72B0"}


def criar_spark(master="local[*]", memoria=None, particoes=8):
    """Sessão Spark. master="local[*]" usa todos os núcleos da máquina; num cluster seria "spark://host:7077"."""
    b = (SparkSession.builder.master(master).appName("gardenia-etapa7")
         .config("spark.ui.enabled", "false")
         .config("spark.sql.shuffle.partitions", str(particoes))
         .config("spark.sql.execution.arrow.pyspark.enabled", "false"))
    if memoria:
        b = b.config("spark.driver.memory", memoria)
    spark = b.getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")
    return spark


def lotes_trusted(pasta):
    """Lotes que podem ser lidos: os 3 trusted_*_N.csv existem e, se a pasta usa marcadores
    (trusted_N.pronto, gravados pela VM 2), o marcador também existe."""
    arquivos = set(os.listdir(pasta)) if os.path.isdir(pasta) else set()
    usa_marcador = any(re.fullmatch(r"trusted_\d+\.pronto", n) for n in arquivos)
    lotes = []
    for n in arquivos:
        m = re.fullmatch(r"trusted_clientes_(\d+)\.csv", n)
        if not m:
            continue
        N = int(m.group(1))
        if not all(f"trusted_{t}_{N}.csv" in arquivos for t in TABELAS):
            continue
        if usa_marcador and f"trusted_{N}.pronto" not in arquivos:
            continue
        lotes.append(N)
    return sorted(lotes)


def ler_tabela(spark, pasta, tabela, lotes):
    """Lê trusted_<tabela>_N.csv de cada lote e empilha, com a coluna 'lote'."""
    partes = []
    for n in lotes:
        caminho = os.path.abspath(os.path.join(pasta, f"trusted_{tabela}_{n}.csv"))
        partes.append(spark.read.csv(caminho, header=True, inferSchema=False).withColumn("lote", F.lit(n)))
    df = partes[0]
    for p in partes[1:]:
        df = df.unionByName(p)
    return df


def carregar(spark, pasta, lotes):
    """Devolve clientes, produtos e compras já tipados. A chave de cada registro é (lote, id),
    porque o simulador reinicia os ids a cada ciclo."""
    cli = (ler_tabela(spark, pasta, "clientes", lotes)
           .select("lote", F.col("id").cast("int").alias("cliente_id"), "nome",
                   F.col("idade").cast("int").alias("idade"),
                   F.to_timestamp("data_cadastro").alias("data_cadastro"),
                   (F.col("cadastro_incompleto") == "True").alias("cadastro_incompleto")))
    cli = cli.withColumn("faixa_etaria", F.when(F.col("idade").isNull(), "sem idade")
                         .when(F.col("idade") < 25, "18-24").when(F.col("idade") < 35, "25-34")
                         .when(F.col("idade") < 45, "35-44").when(F.col("idade") < 55, "45-54")
                         .when(F.col("idade") < 65, "55-64").otherwise("65+"))
    prod = (ler_tabela(spark, pasta, "produtos", lotes)
            .select("lote", F.col("id").cast("int").alias("produto_id"), F.col("nome").alias("produto"),
                    "categoria", F.col("preco").cast("double").alias("preco"),
                    F.col("satisfacao_media").cast("double").alias("satisfacao_media")))
    comp = (ler_tabela(spark, pasta, "compras", lotes)
            .select("lote", F.col("id").cast("int").alias("compra_id"),
                    F.col("cliente_id").cast("int").alias("cliente_id"),
                    F.col("produto_id").cast("int").alias("produto_id"),
                    F.col("quantidade").cast("int").alias("quantidade"),
                    F.col("valor_total").cast("double").alias("valor_total"),
                    F.col("desconto").cast("double").alias("desconto"),
                    F.to_timestamp("data_compra").alias("data_compra"),
                    "status", F.col("satisfacao").cast("int").alias("satisfacao")))
    return cli, prod, comp


def montar_fato(cli, prod, comp):
    """Tabela de fatos: cada compra com os dados do produto e do cliente (join por lote + id)."""
    fato = (comp.join(prod.select("lote", "produto_id", "produto", "categoria", "preco"), ["lote", "produto_id"], "inner")
                .join(cli.select("lote", "cliente_id", "idade", "faixa_etaria"), ["lote", "cliente_id"], "inner")
                .withColumn("valor_liquido", F.col("valor_total") - F.col("desconto"))
                .withColumn("mes", F.date_format("data_compra", "yyyy-MM"))
                .withColumn("valida", F.col("status") != "cancelado"))
    return fato


def pdf(df):
    return df.toPandas()


def analises(cli, prod, fato):
    """Agregações distribuídas: o Spark calcula, e só o resultado pequeno vem para o pandas."""
    v = F.when(F.col("valida"), F.col("valor_liquido")).otherwise(0.0)
    res = {}
    res["resumo_lotes"] = pdf(
        fato.groupBy("lote").agg(
            F.count("*").alias("compras"),
            F.countDistinct("cliente_id").alias("clientes_que_compraram"),
            F.round(F.sum(v), 2).alias("receita_liquida"),
            F.round(F.avg(F.when(~F.col("valida"), 1.0).otherwise(0.0)) * 100, 1).alias("pct_cancelamento"))
        .orderBy("lote"))
    res["receita_mensal"] = pdf(
        fato.groupBy("mes").agg(F.round(F.sum(v), 2).alias("receita_liquida"),
                                F.sum(F.col("valida").cast("int")).alias("compras_validas"))
        .orderBy("mes"))
    res["por_categoria"] = pdf(
        fato.groupBy("categoria").agg(
            F.round(F.sum(v), 2).alias("receita_liquida"),
            F.sum(F.col("valida").cast("int")).alias("compras_validas"),
            F.round(F.avg(F.when(F.col("valida"), F.col("valor_liquido"))), 2).alias("ticket_medio"),
            F.round(F.avg(F.when(~F.col("valida"), 1.0).otherwise(0.0)) * 100, 1).alias("pct_cancelamento"),
            F.round(F.avg("satisfacao"), 2).alias("satisfacao_media"))
        .orderBy(F.desc("receita_liquida")))
    res["por_faixa_etaria"] = pdf(
        fato.groupBy("faixa_etaria").agg(F.round(F.sum(v), 2).alias("receita_liquida"),
                                         F.sum(F.col("valida").cast("int")).alias("compras_validas"))
        .orderBy("faixa_etaria"))
    res["top_produtos"] = pdf(
        fato.groupBy("lote", "produto_id", "produto", "categoria").agg(F.round(F.sum(v), 2).alias("receita_liquida"))
        .orderBy(F.desc("receita_liquida")).limit(10))
    return res


def rfm_spark(cli, fato):
    """RFM por cliente (lote, cliente_id). Data de referência = última data_cadastro do lote.
    Compras canceladas não contam."""
    ref = cli.groupBy("lote").agg(F.max("data_cadastro").alias("data_ref"))
    base = fato.filter("valida").join(ref, "lote")
    return (base.groupBy("lote", "cliente_id").agg(
        F.greatest(F.lit(0), F.datediff(F.first("data_ref"), F.max("data_compra"))).alias("recencia"),
        F.countDistinct("compra_id").alias("frequencia"),
        F.round(F.sum("valor_liquido"), 2).alias("monetario")))


def preparar_features(rfm):
    d = (rfm.withColumn("f_rec", F.log1p("recencia")).withColumn("f_freq", F.log1p("frequencia"))
            .withColumn("f_val", F.log1p("monetario")))
    vec = VectorAssembler(inputCols=["f_rec", "f_freq", "f_val"], outputCol="bruto").transform(d)
    modelo_esc = StandardScaler(inputCol="bruto", outputCol="features", withMean=True, withStd=True).fit(vec)
    return modelo_esc.transform(vec)


def avaliar_k(X, ks=range(2, 8), semente=42):
    linhas = []
    ev = ClusteringEvaluator(featuresCol="features", predictionCol="prediction", metricName="silhouette")
    for k in ks:
        m = KMeans(k=k, seed=semente, featuresCol="features", predictionCol="prediction").fit(X)
        linhas.append({"k": k, "inercia": round(m.summary.trainingCost, 2),
                       "silhouette": round(ev.evaluate(m.transform(X)), 3)})
    return pd.DataFrame(linhas)


def segmentar(X, k, semente=42):
    """K-Means do MLlib. Os grupos recebem nome pela nota do centro:
    recência baixa + frequência alta + valor alto = nota maior. Maior nota = VIP."""
    modelo = KMeans(k=k, seed=semente, featuresCol="features", predictionCol="cluster").fit(X)
    centros = np.array(modelo.clusterCenters())                       # colunas: rec, freq, val (padronizadas)
    nota = -centros[:, 0] + centros[:, 1] + centros[:, 2]
    ordem = list(np.argsort(nota))                                    # menor nota primeiro
    if k == 2:
        nomes = ["Baixo engajamento", "VIP"]
    elif k == 3:
        nomes = ["Baixo engajamento", "Regular", "VIP"]
    else:
        nomes = ["Baixo engajamento"] + [f"Regular {i}" for i in range(1, k - 1)] + ["VIP"]
    mapa = {int(c): nomes[i] for i, c in enumerate(ordem)}
    pred = modelo.transform(X)
    seg = F.create_map(*[x for c, n in mapa.items() for x in (F.lit(c), F.lit(n))])[F.col("cluster")]
    pred = pred.withColumn("segmento", seg)
    sil = ClusteringEvaluator(featuresCol="features", predictionCol="cluster", metricName="silhouette").evaluate(pred)
    return pred.select("lote", "cliente_id", "recencia", "frequencia", "monetario", "cluster", "segmento"), sil, nomes[::-1]


def perfil_segmentos(seg, ordem):
    total_v = seg.agg(F.sum("monetario")).first()[0]
    total_c = seg.count()
    p = pdf(seg.groupBy("segmento").agg(
        F.count("*").alias("clientes"),
        F.round(F.avg("recencia"), 1).alias("recencia_media"),
        F.round(F.avg("frequencia"), 2).alias("frequencia_media"),
        F.round(F.avg("monetario"), 2).alias("valor_medio"),
        F.round(F.sum("monetario"), 2).alias("valor_total")))
    p["pct_clientes"] = (p["clientes"] / total_c * 100).round(1)
    p["pct_valor"] = (p["valor_total"] / total_v * 100).round(1)
    p["segmento"] = pd.Categorical(p["segmento"], categories=ordem, ordered=True)
    return p.sort_values("segmento").reset_index(drop=True)


def teste_de_escala(fato, fatores=(1, 10, 100)):
    """Repete a tabela de fatos N vezes (crossJoin) e mede o tempo de uma agregação.
    Serve para mostrar o comportamento do Spark com volume maior; os dados repetidos não vão para os resultados."""
    spark = fato.sparkSession
    linhas = []
    for f in fatores:
        grande = fato.crossJoin(spark.range(f).withColumnRenamed("id", "copia"))
        t0 = time.time()
        n = grande.count()
        grande.groupBy("categoria", "mes").agg(F.sum("valor_liquido").alias("r")).collect()
        linhas.append({"fator": f, "linhas": n, "segundos": round(time.time() - t0, 2)})
    return pd.DataFrame(linhas)


def salvar_resultados(pasta, res, avaliacao, perf, seg, fato, escala=None):
    """CSV para os resultados pequenos; Parquet (particionado por lote) para a tabela de fatos."""
    os.makedirs(pasta, exist_ok=True)
    tabelas = dict(res)
    tabelas["avaliacao_k"] = avaliacao
    tabelas["perfil_segmentos"] = perf
    tabelas["rfm_segmentos"] = seg.toPandas()
    if escala is not None:
        tabelas["teste_de_escala"] = escala
    for nome, d in tabelas.items():
        destino = os.path.join(pasta, f"{nome}.csv")
        d.to_csv(destino + ".tmp", index=False)
        os.replace(destino + ".tmp", destino)
        print(f"  {destino}  ({len(d)} linhas)")
    parquet = os.path.abspath(os.path.join(pasta, "fato_vendas.parquet"))
    fato.drop("valida").write.mode("overwrite").partitionBy("lote").parquet(parquet)
    print(f"  {parquet}  (Parquet, particionado por lote)")


def grafico_resumo(res, perf, avaliacao, ordem):
    """Painel 2x3 com os resultados principais."""
    fig, ax = plt.subplots(2, 3, figsize=(17, 9))
    cor = "#4C72B0"

    m = res["receita_mensal"]
    ax[0, 0].plot(m["mes"], m["receita_liquida"] / 1e3, marker="o", color=cor)
    ax[0, 0].set_title("Receita líquida por mês (1º e último mês podem estar incompletos)")
    ax[0, 0].set_ylabel("R$ mil"); ax[0, 0].tick_params(axis="x", rotation=60)

    c = res["por_categoria"]
    ax[0, 1].barh(c["categoria"][::-1], c["receita_liquida"][::-1] / 1e3, color=cor)
    ax[0, 1].set_title("Receita líquida por categoria"); ax[0, 1].set_xlabel("R$ mil")

    ax[0, 2].barh(c["categoria"][::-1], c["pct_cancelamento"][::-1], color="#C44E52")
    ax[0, 2].set_title("% de compras canceladas por categoria"); ax[0, 2].set_xlabel("%")

    f = res["por_faixa_etaria"]
    ax[1, 0].bar(f["faixa_etaria"], f["receita_liquida"] / 1e3, color=cor)
    ax[1, 0].set_title("Receita líquida por faixa etária"); ax[1, 0].set_ylabel("R$ mil")

    cores = [COR_SEGMENTO.get(s, "#888888") for s in perf["segmento"].astype(str)]
    ax[1, 1].bar(perf["segmento"].astype(str), perf["clientes"], color=cores)
    for i, (n, pv) in enumerate(zip(perf["clientes"], perf["pct_valor"])):
        ax[1, 1].text(i, n, f"{pv:.0f}% do valor", ha="center", va="bottom", fontsize=9)
    ax[1, 1].set_title("Clientes por segmento (K-Means no Spark)"); ax[1, 1].set_ylabel("clientes")

    ax[1, 2].plot(avaliacao["k"], avaliacao["silhouette"], marker="o", color=cor)
    ax[1, 2].set_title("Silhouette por número de grupos (K)"); ax[1, 2].set_xlabel("K"); ax[1, 2].set_ylabel("silhouette")
    for a in ax.ravel():
        a.grid(alpha=.3)
    fig.tight_layout()
    return fig


# ======================================================================= processamento
class Tee(io.TextIOBase):
    def __init__(self, *destinos):
        self.destinos = destinos

    def write(self, s):
        for d in self.destinos:
            d.write(s)
        return len(s)

    def flush(self):
        for d in self.destinos:
            d.flush()


def mostrar(df):
    print(df.to_string(index=False))


def assinatura(destino, lotes):
    """Identifica o estado dos dados: lotes + conteúdo dos marcadores (muda quando a VM 2 reprocessa)."""
    return {str(n): ler_marcador_local(destino, f"trusted_{n}.pronto") for n in lotes}


def verificar_java():
    if shutil.which("java") is None:
        raise RuntimeError("Java não encontrado. O Spark precisa de Java 17 ou mais novo:\n"
                           "  sudo apt install -y default-jre-headless")


def processar(args):
    lotes = lotes_trusted(args.destino)
    if not lotes:
        print(f"[processar] nenhum lote pronto em {args.destino}/. Rode 'coletar' antes.")
        return False

    ass = assinatura(args.destino, lotes)
    arq_estado = os.path.join(args.saida, "ultimo_processamento.json")
    if not args.forcar and os.path.exists(arq_estado):
        with open(arq_estado, encoding="utf-8") as f:
            if json.load(f).get("assinatura") == ass:
                print(f"[processar] lotes {lotes} já processados. Use --forcar para refazer.")
                return False

    verificar_java()
    os.makedirs(args.saida, exist_ok=True)
    caminho_rel = os.path.join(args.saida, "relatorio_spark.txt")
    with open(caminho_rel, "w", encoding="utf-8") as arq, contextlib.redirect_stdout(Tee(sys.stdout, arq)):
        inicio = time.time()
        print(f"ETAPA 7 | SPARK  |  {time.strftime('%Y-%m-%d %H:%M:%S')}  |  lotes: {lotes}")
        spark = criar_spark(args.master, args.memoria)
        try:
            print(f"Spark {spark.version}  |  master={args.master}  |  paralelismo={spark.sparkContext.defaultParallelism}")
            cli, prod, comp = carregar(spark, args.destino, lotes)
            fato = montar_fato(cli, prod, comp).cache()
            print(f"\nclientes: {cli.count()} | produtos: {prod.count()} | compras: {comp.count()} "
                  f"| fato_vendas: {fato.count()}")

            print("\n--- Resumo por lote")
            res = analises(cli, prod, fato)
            mostrar(res["resumo_lotes"])
            print("\n--- Receita líquida por categoria")
            mostrar(res["por_categoria"])
            print("\n--- Top 10 produtos por receita")
            mostrar(res["top_produtos"])

            print("\n--- RFM + K-Means (Spark MLlib)")
            X = preparar_features(rfm_spark(cli, fato)).cache()
            n_clientes = X.count()
            print(f"Clientes com compra válida: {n_clientes}")
            avaliacao = avaliar_k(X)
            mostrar(avaliacao)
            k = args.k or int(avaliacao.loc[avaliacao["silhouette"].idxmax(), "k"])
            seg, sil, ordem = segmentar(X, k)
            seg = seg.cache()
            perf = perfil_segmentos(seg, ordem)
            print(f"\nK usado: {k}  |  silhouette do modelo final: {sil:.3f}")
            mostrar(perf)

            escala = None
            if args.escala:
                print("\n--- Teste de escala (mesma agregação com mais dados)")
                escala = teste_de_escala(fato, args.escala)
                mostrar(escala)

            print("\n--- Gravando resultados")
            salvar_resultados(args.saida, res, avaliacao, perf, seg, fato, escala)
            fig = grafico_resumo(res, perf, avaliacao, ordem)
            png = os.path.join(args.saida, "spark_resumo.png")
            fig.savefig(png, dpi=110, bbox_inches="tight")
            print(f"  {png}")
        finally:
            spark.stop()
        print(f"\nEtapa 7 concluída em {time.time() - inicio:.1f}s. Relatório: {caminho_rel}")

    with open(arq_estado + ".tmp", "w", encoding="utf-8") as f:
        json.dump({"assinatura": ass, "k": k, "silhouette": round(sil, 3),
                   "processado_em": time.strftime("%Y-%m-%d %H:%M:%S")}, f, ensure_ascii=False)
    os.replace(arq_estado + ".tmp", arq_estado)
    return True


def lista_de_inteiros(texto):
    return tuple(int(x) for x in texto.split(",") if x.strip())


def montar_parser():
    p = argparse.ArgumentParser(description="Pipeline da VM 3: buscar os dados limpos da VM 2 e processar com Spark.",
                                formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    p.add_argument("comando", choices=["coletar", "processar", "tudo", "vigiar"])
    p.add_argument("--origem", help="pasta 'saida' da VM 2: usuario@host:/caminho (SSH) ou um diretório local/montado")
    p.add_argument("--destino", default="dados_trusted", help="onde guardar os CSVs coletados (padrão: dados_trusted)")
    p.add_argument("--saida", default="resultados_spark", help="onde gravar os resultados (padrão: resultados_spark)")
    p.add_argument("--forcar", action="store_true", help="coletar e processar de novo mesmo sem novidades")
    p.add_argument("--k", type=int, default=3, help="número de segmentos do K-Means; 0 = o de maior silhouette (padrão: 3)")
    p.add_argument("--escala", type=lista_de_inteiros, default=(1, 10, 100),
                   help="fatores do teste de escala, separados por vírgula (padrão: 1,10,100). Vazio = não roda")
    p.add_argument("--master", default="local[*]", help='master do Spark (padrão: local[*]; num cluster: spark://host:7077)')
    p.add_argument("--memoria", help="memória do driver do Spark, ex.: 4g")
    p.add_argument("--ssh-chave", help="arquivo da chave privada SSH (ex.: ~/.ssh/id_ed25519)")
    p.add_argument("--ssh-porta", type=int, help="porta SSH da VM 2 (padrão: 22)")
    p.add_argument("--intervalo", type=int, default=60, help="segundos entre consultas no modo 'vigiar' (padrão: 60)")
    p.add_argument("--depurar", action="store_true", help="mostrar o traceback completo nos erros")
    return p


def main():
    args = montar_parser().parse_args()
    if args.comando in ("coletar", "tudo", "vigiar") and not args.origem:
        print("erro: informe --origem (ex.: usuario@IP_DA_VM2:/home/usuario/gardenia/saida)", file=sys.stderr)
        return 2
    try:
        if args.comando == "coletar":
            coletar(args)
        elif args.comando == "processar":
            processar(args)
        elif args.comando == "tudo":
            coletar(args)
            processar(args)
        elif args.comando == "vigiar":
            print(f"[vigiar] consultando a VM 2 a cada {args.intervalo}s. CTRL + C para parar.")
            while True:
                try:
                    coletar(args)
                    processar(args)
                except RuntimeError as e:       # VM 2 fora do ar não derruba o monitor
                    print(f"[vigiar] {e}", file=sys.stderr)
                time.sleep(args.intervalo)
    except RuntimeError as e:
        print(f"erro: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\ninterrompido.")
        return 130
    except Exception as e:
        print(f"erro: {type(e).__name__}: {e}", file=sys.stderr)
        if args.depurar:
            traceback.print_exc()
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
