#!/usr/bin/env python3
"""
Pipeline Gardenia | VM 2: coletar os CSVs da VM 1, inspecionar, limpar e gerar trusted/quarentena.

Reúne as etapas 2 (carregar e inspecionar) e 3 (limpeza) dos notebooks, para rodar no terminal.

Dependências:  pip install pandas numpy matplotlib      (Python 3.9+)

Comandos
--------
  coletar    copia da VM 1 os ciclos novos (só os que têm o marcador ciclo_N.pronto)
  processar  inspeciona e limpa os ciclos coletados ainda não processados
  tudo       coletar + processar
  vigiar     repete "tudo" a cada N segundos, acompanhando o simulador da VM 1

Exemplos
--------
  # a VM 2 busca na VM 1 por SSH (precisa de login sem senha, veja abaixo)
  python3 pipeline_vm2.py tudo --origem usuario@IP_DA_VM1:/home/usuario/simulador/saida

  # a pasta da VM 1 está montada na VM 2 (NFS, sshfs, disco compartilhado) ou é local
  python3 pipeline_vm2.py tudo --origem /mnt/vm1/saida

  # reprocessar um ciclo específico, ou todos
  python3 pipeline_vm2.py processar --ciclo 3
  python3 pipeline_vm2.py processar --todos

  # ficar acompanhando o simulador (consulta a cada 30 s)
  python3 pipeline_vm2.py vigiar --origem usuario@IP_DA_VM1:/home/usuario/simulador/saida --intervalo 30

Login sem senha por SSH (uma vez, na VM 2)
------------------------------------------
  ssh-keygen -t ed25519
  ssh-copy-id usuario@IP_DA_VM1
  ssh usuario@IP_DA_VM1 echo ok        # deve responder "ok" sem pedir senha

Pastas (relativas ao diretório de onde o script é executado)
------------------------------------------------------------
  dados_brutos/   CSVs copiados da VM 1  (clientes_N.csv, produtos_N.csv, compras_N.csv, ciclo_N.pronto)
  saida/          trusted_*_N.csv, quarentena_*_N.csv, relatorio_qualidade_N.csv e trusted_N.pronto
                  (trusted_N.pronto é gravado por último; a VM 3 só busca lotes que o tenham)
  relatorios/lote_N/   relatório em texto, diagnóstico em CSV e gráficos em PNG
"""
import argparse
import contextlib
import difflib
import glob
import io
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
import traceback

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")          # sem interface gráfica: os gráficos são salvos em PNG
import matplotlib.pyplot as plt

pd.set_option("display.max_columns", None)
pd.set_option("display.width", 200)
pd.options.display.float_format = "{:,.2f}".format

TABELAS = ["clientes", "produtos", "compras"]

# ======================================================================= regras
REGEX_EMAIL = r"^[\w.+-]+@[\w-]+\.[\w.-]+$"
REGEX_TEL = r"^\(\d{2}\) \d{5}-\d{4}$"
REGEX_CPF = r"^\d{3}\.\d{3}\.\d{3}-\d{2}$"
CATEGORIAS_VALIDAS = {"Alimentos", "Brinquedos", "Casa", "Eletrônicos", "Esportes", "Livros", "Roupas"}
STATUS_VALIDOS = ["pendente", "pago", "enviado", "entregue", "cancelado"]

COLUNAS_ESPERADAS = {
    "clientes": ["id", "nome", "email", "idade", "telefone", "cpf", "data_nascimento", "data_cadastro", "inconsistente"],
    "produtos": ["id", "nome", "categoria", "preco", "estoque", "peso", "satisfacao_media", "data_cadastro", "inconsistente"],
    "compras": ["id", "cliente_id", "produto_id", "quantidade", "valor_total", "desconto", "data_compra",
                "status", "satisfacao", "inconsistente"],
}
# Colunas de texto são lidas como texto para não perder zeros à esquerda (CPF, telefone)
COLUNAS_TEXTO = {c: str for c in ["nome", "email", "telefone", "cpf", "data_nascimento",
                                  "data_cadastro", "categoria", "data_compra", "status"]}

COR_ACAO = {"corrigido": "#4C72B0", "anulado": "#DD8452", "quarentena": "#C44E52"}
COR_TABELA = {"clientes": "#4C72B0", "produtos": "#55A868", "compras": "#C44E52"}

LOG = []   # uma linha por (tabela, regra, ação); reiniciado a cada lote


def registrar(tabela, regra, acao, qtd):
    qtd = int(qtd)
    if qtd > 0:
        LOG.append({"tabela": tabela, "regra": regra, "acao": acao, "qtd": qtd})


# ======================================================================= utilidades
def num(s):
    return pd.to_numeric(s, errors="coerce")


def txt(s):
    # tira espaços das pontas, colapsa espaços repetidos e transforma vazio em NaN
    out = s.map(lambda v: re.sub(r"\s+", " ", v).strip() if isinstance(v, str) else np.nan)
    return out.where(out != "", np.nan)


def anos_completos(nasc, ref):
    anos = ref.year - nasc.dt.year
    ainda_nao = (nasc.dt.month > ref.month) | ((nasc.dt.month == ref.month) & (nasc.dt.day > ref.day))
    return anos - ainda_nao.astype(int)


def montar_motivos(indice, regras, tabela):
    # junta os motivos de rejeição de cada linha e registra a contagem por motivo no log
    motivos = pd.Series([""] * len(indice), index=indice, dtype=object)
    for texto, mascara in regras:
        mascara = mascara.fillna(False).astype(bool)
        registrar(tabela, texto, "quarentena", mascara.sum())
        motivos[mascara] = motivos[mascara].map(lambda m: (m + "; " if m else "") + texto)
    return motivos


def mostrar(df):
    print(df.to_string())


def salvar_figura(fig, caminho):
    fig.tight_layout()
    fig.savefig(caminho, dpi=110)
    plt.close(fig)
    print(f"  gráfico salvo: {caminho}")


class Tee(io.TextIOBase):
    """Escreve no terminal e no arquivo de relatório ao mesmo tempo."""

    def __init__(self, *destinos):
        self.destinos = destinos

    def write(self, s):
        for d in self.destinos:
            d.write(s)
        return len(s)

    def flush(self):
        for d in self.destinos:
            d.flush()


# ======================================================================= coleta (VM 1 -> VM 2)
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
            "Confira: o IP/nome da VM 1, o caminho da pasta, a chave SSH e se "
            "'ssh usuario@IP_DA_VM1 echo ok' funciona sem pedir senha."
        ) from None
    except FileNotFoundError:
        raise RuntimeError(f"{descricao}: o comando '{cmd[0]}' não está instalado nesta máquina.") from None
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"{descricao}: tempo esgotado (a VM 1 está acessível?).") from None


def listar_origem(args):
    """Nomes dos arquivos que existem na pasta da VM 1."""
    if eh_remoto(args.origem):
        host, caminho = dividir_origem(args.origem)
        saida = rodar(comando_ssh(args, host, f"ls -1 {shlex.quote(caminho)}"), "Listar a pasta da VM 1")
        return set(saida.stdout.split())
    if not os.path.isdir(args.origem):
        raise RuntimeError(f"A pasta de origem não existe: {args.origem}")
    return set(os.listdir(args.origem))


def ciclos_prontos(nomes):
    """Ciclos com marcador .pronto E os 3 CSVs presentes."""
    prontos = []
    for n in nomes:
        m = re.fullmatch(r"ciclo_(\d+)\.pronto", n)
        if m:
            c = int(m.group(1))
            if all(f"{t}_{c}.csv" in nomes for t in TABELAS):
                prontos.append(c)
    return sorted(prontos)


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
    disponiveis = ciclos_prontos(nomes)
    incompletos = sorted({int(m.group(1)) for n in nomes if (m := re.fullmatch(r"(?:clientes|produtos|compras)_(\d+)\.csv", n))}
                         - set(disponiveis))
    ja_coletados = {c for c in disponiveis if os.path.exists(os.path.join(args.destino, f"ciclo_{c}.pronto"))}
    novos = [c for c in disponiveis if args.forcar or c not in ja_coletados]

    print(f"[coleta] origem: {args.origem}")
    print(f"[coleta] ciclos prontos na VM 1: {disponiveis or 'nenhum'} | já coletados: {sorted(ja_coletados) or 'nenhum'}")
    if incompletos:
        print(f"[coleta] ciclos ainda em geração (sem marcador, serão ignorados): {incompletos}")

    for c in novos:
        for t in TABELAS:
            copiar_arquivo(args, f"{t}_{c}.csv", args.destino)
        copiar_arquivo(args, f"ciclo_{c}.pronto", args.destino)    # o marcador vai por último
        print(f"[coleta] ciclo {c} copiado para {args.destino}/")
    if not novos:
        print("[coleta] nada novo para copiar.")
    return novos


# ======================================================================= leitura
def ler_csv(caminho):
    with open(caminho, encoding="utf-8") as f:
        primeira = f.readline()
    sep = "\t" if primeira.count("\t") > primeira.count(",") else ","
    return pd.read_csv(caminho, sep=sep, dtype=COLUNAS_TEXTO)


# ======================================================================= ETAPA 2: inspeção
def diagnosticar(raw, data_ref):
    """Conta as anomalias de cada tabela (sem corrigir nada). Retorna um DataFrame."""
    regras = []

    def regra(tabela, coluna, descricao, mascara):
        mascara = mascara.fillna(False).astype(bool)
        regras.append({"tabela": tabela, "coluna": coluna, "regra": descricao,
                       "qtd": int(mascara.sum()), "pct": round(100 * mascara.mean(), 1)})

    def vazio(s):
        return s.isna() | (s.astype(str).str.strip() == "")

    def formato_invalido(s, regex):
        return s.notna() & ~s.astype(str).str.match(regex)

    def caixa_produto_ok(nome):
        return all(p == p.capitalize() or p == "TV" for p in str(nome).split())

    agora = data_ref
    c, p, k = raw["clientes"], raw["produtos"], raw["compras"]
    data = lambda s: pd.to_datetime(s, errors="coerce")

    regra("clientes", "nome", "ausente/vazio", vazio(c["nome"]))
    regra("clientes", "nome", "caixa fora do padrão (Title Case)",
          c["nome"].notna() & (c["nome"].astype(str) != c["nome"].astype(str).str.strip().str.title()))
    regra("clientes", "email", "ausente", c["email"].isna())
    regra("clientes", "email", "formato inválido (ex.: sem @)", formato_invalido(c["email"], REGEX_EMAIL))
    regra("clientes", "telefone", "ausente", c["telefone"].isna())
    regra("clientes", "telefone", "formato inválido", formato_invalido(c["telefone"], REGEX_TEL))
    regra("clientes", "cpf", "ausente", c["cpf"].isna())
    regra("clientes", "cpf", "formato inválido", formato_invalido(c["cpf"], REGEX_CPF))
    regra("clientes", "idade", "ausente", num(c["idade"]).isna())
    regra("clientes", "idade", "fora de 18-100", num(c["idade"]).notna() & ~num(c["idade"]).between(18, 100))
    regra("clientes", "data_nascimento", "ilegível", c["data_nascimento"].notna() & data(c["data_nascimento"]).isna())
    regra("clientes", "data_nascimento", "no futuro", data(c["data_nascimento"]) > agora)

    regra("produtos", "nome", "ausente/vazio", vazio(p["nome"]))
    regra("produtos", "nome", "caixa fora do padrão", p["nome"].notna() & ~p["nome"].astype(str).map(caixa_produto_ok))
    regra("produtos", "categoria", "ausente/vazia", vazio(p["categoria"]))
    regra("produtos", "categoria", "fora da lista válida", ~vazio(p["categoria"]) & ~p["categoria"].isin(CATEGORIAS_VALIDAS))
    regra("produtos", "preco", "<= 0", num(p["preco"]) <= 0)
    regra("produtos", "estoque", "negativo", num(p["estoque"]) < 0)
    regra("produtos", "peso", "<= 0", num(p["peso"]) <= 0)
    regra("produtos", "satisfacao_media", "ausente", num(p["satisfacao_media"]).isna())
    regra("produtos", "satisfacao_media", "fora de 0-5",
          num(p["satisfacao_media"]).notna() & ~num(p["satisfacao_media"]).between(0, 5))

    status_norm = k["status"].astype(str).str.strip().str.lower()
    regra("compras", "quantidade", "<= 0", num(k["quantidade"]) <= 0)
    regra("compras", "valor_total", "<= 0", num(k["valor_total"]) <= 0)
    regra("compras", "desconto", "negativo", num(k["desconto"]) < 0)
    regra("compras", "desconto", "maior que valor_total", num(k["desconto"]) > num(k["valor_total"]))
    regra("compras", "data_compra", "ilegível", k["data_compra"].notna() & data(k["data_compra"]).isna())
    regra("compras", "data_compra", "no futuro", data(k["data_compra"]) > agora)
    regra("compras", "status", "caixa/espaços fora do padrão", k["status"].notna() & (k["status"] != status_norm))
    regra("compras", "status", "valor inexistente (mesmo após lower)",
          k["status"].notna() & ~status_norm.isin(STATUS_VALIDOS))
    regra("compras", "satisfacao", "fora de 1-5", num(k["satisfacao"]).notna() & ~num(k["satisfacao"]).between(1, 5))
    regra("compras", "cliente_id", "FK: não existe em clientes", k["cliente_id"].notna() & ~num(k["cliente_id"]).isin(num(c["id"])))
    regra("compras", "produto_id", "FK: não existe em produtos", k["produto_id"].notna() & ~num(k["produto_id"]).isin(num(p["id"])))
    return pd.DataFrame(regras)


def etapa_inspecao(raw, lote, pasta_rel):
    print("\n" + "=" * 70)
    print(f"ETAPA 2 | INSPEÇÃO DOS DADOS BRUTOS (lote {lote})")
    print("=" * 70)

    for nome, df in raw.items():
        faltando = set(COLUNAS_ESPERADAS[nome]) - set(df.columns)
        extras = set(df.columns) - set(COLUNAS_ESPERADAS[nome])
        status = "OK" if not faltando and not extras else f"ATENÇÃO faltando={sorted(faltando)} extras={sorted(extras)}"
        print(f"{nome:10s} {str(df.shape):12s} colunas: {status}")
        if faltando:
            raise ValueError(f"{nome}: colunas obrigatórias ausentes: {sorted(faltando)}")

    nulos = pd.DataFrame({n: (df.drop(columns=["inconsistente"]).isna().mean() * 100).round(1) for n, df in raw.items()}).fillna("-")
    print("\n% de nulos por coluna (raw):")
    mostrar(nulos)

    print("\ninconsistente (marcação do gerador):")
    for n, df in raw.items():
        print(f"  {n:10s} {df['inconsistente'].astype(str).str.lower().value_counts().to_dict()}")

    print("\nprodutos.categoria:")
    print(raw["produtos"]["categoria"].value_counts(dropna=False).to_string())
    status_norm = raw["compras"]["status"].astype(str).str.strip().str.lower()
    print(f"\ncompras.status: {raw['compras']['status'].nunique()} variações distintas. Após strip + lower:")
    print(status_norm.value_counts().head(8).to_string())

    data_ref = max(pd.to_datetime(raw["clientes"]["data_cadastro"], errors="coerce").max(),
                   pd.to_datetime(raw["produtos"]["data_cadastro"], errors="coerce").max())
    if pd.isna(data_ref):
        data_ref = pd.Timestamp.now()

    diag = diagnosticar(raw, data_ref + pd.Timedelta(days=1))
    print("\nAnomalias por regra (só as que ocorrem). As regras 'FK' dependem de o lote estar completo:")
    mostrar(diag[diag["qtd"] > 0].sort_values(["tabela", "pct"], ascending=[True, False]).reset_index(drop=True))
    diag.to_csv(os.path.join(pasta_rel, f"diagnostico_{lote}.csv"), index=False)

    # gráfico: nulos por coluna
    fig, eixos = plt.subplots(1, 3, figsize=(16, 4.5))
    for ax, (nome, df) in zip(eixos, raw.items()):
        pct = (df.drop(columns=["inconsistente"]).isna().mean() * 100).sort_values()
        ax.barh(pct.index, pct.values, color="#4C72B0")
        ax.set_title(f"Nulos por coluna: {nome}")
        ax.set_xlabel("% de registros nulos")
        ax.set_xlim(0, max(10, pct.max() * 1.15))
    salvar_figura(fig, os.path.join(pasta_rel, f"02_nulos_raw_{lote}.png"))

    # gráfico: regras violadas (sem FK)
    g = diag[(diag["qtd"] > 0) & ~diag["regra"].str.startswith("FK")].copy()
    if not g.empty:
        g["rotulo"] = g["tabela"] + "." + g["coluna"] + ": " + g["regra"]
        g = g.sort_values("pct")
        fig, ax = plt.subplots(figsize=(10, max(4, 0.35 * len(g))))
        ax.barh(g["rotulo"], g["pct"], color=g["tabela"].map(COR_TABELA))
        ax.set_title("Anomalias detectadas na zona raw (por regra)")
        ax.set_xlabel("% de registros que violam a regra")
        salvar_figura(fig, os.path.join(pasta_rel, f"02_anomalias_raw_{lote}.png"))
    return nulos, data_ref


# ======================================================================= ETAPA 3: limpeza
def limpar_clientes(df, data_ref, limite_futuro):
    c = df.copy()

    antes = txt(c["nome"])
    depois = antes.str.title()
    registrar("clientes", "nome: caixa/espaços padronizados", "corrigido", (antes.notna() & (antes != depois)).sum())
    c["nome"] = depois

    em = txt(c["email"]).str.lower()
    sem_arroba = em.notna() & ~em.str.contains("@", na=False)
    conserto = em.str.replace(r"^([\w.+-]+?)email\.com$", r"\1@email.com", regex=True)
    em2 = em.where(~sem_arroba, conserto)
    registrar("clientes", "email: '@' recolocado", "corrigido", (sem_arroba & (em2 != em)).sum())
    invalido = em2.notna() & ~em2.str.match(REGEX_EMAIL, na=False)
    registrar("clientes", "email: formato inválido", "anulado", invalido.sum())
    c["email"] = em2.where(~invalido, np.nan)

    tel = txt(c["telefone"])
    invalido = tel.notna() & ~tel.str.match(REGEX_TEL, na=False)
    registrar("clientes", "telefone: formato inválido", "anulado", invalido.sum())
    c["telefone"] = tel.where(~invalido, np.nan)

    cpf = txt(c["cpf"])
    digitos = cpf.str.replace(r"\D", "", regex=True)
    invalido = cpf.notna() & (~cpf.str.match(REGEX_CPF, na=False) | digitos.str.fullmatch(r"(\d)\1+", na=False))
    registrar("clientes", "cpf: formato inválido", "anulado", invalido.sum())
    c["cpf"] = cpf.where(~invalido, np.nan)

    nasc = pd.to_datetime(c["data_nascimento"], errors="coerce")
    invalido = c["data_nascimento"].notna() & (nasc.isna() | (nasc > limite_futuro))
    registrar("clientes", "data_nascimento: ilegível ou futura", "anulado", invalido.sum())
    nasc = nasc.where(~invalido)

    original = num(c["idade"])
    calculada = anos_completos(nasc, data_ref)
    idade = calculada.where(calculada.between(18, 100))
    idade = idade.fillna(original.where(original.between(18, 100)).where(nasc.isna()))
    registrar("clientes", "idade: recalculada/preenchida", "corrigido", (idade.notna() & (idade != original)).sum())
    registrar("clientes", "idade: fora de 18-100", "anulado", (original.notna() & idade.isna()).sum())
    c["idade"] = idade.astype("Int64")

    c["data_nascimento"] = nasc
    c["data_cadastro"] = pd.to_datetime(c["data_cadastro"], errors="coerce")
    c["cadastro_incompleto"] = c[["email", "telefone", "cpf"]].isna().any(axis=1)
    return c.drop(columns=["inconsistente"])


def limpar_produtos(df):
    bruto = df.copy()
    p = df.copy()

    nome_antes = txt(p["nome"])
    p["nome"] = nome_antes.str.title().str.replace(r"\bTv\b", "TV", regex=True)
    p["categoria"] = txt(p["categoria"])
    for col in ["preco", "estoque", "peso", "satisfacao_media"]:
        p[col] = num(p[col])

    motivos = montar_motivos(p.index, [
        ("nome ausente", p["nome"].isna()),
        ("categoria inválida ou ausente", ~p["categoria"].isin(CATEGORIAS_VALIDAS)),
        ("preço <= 0 ou ausente", ~(p["preco"] > 0)),
        ("estoque negativo ou ausente", ~(p["estoque"] >= 0)),
        ("peso <= 0 ou ausente", ~(p["peso"] > 0)),
    ], "produtos")
    rejeitado = motivos != ""

    registrar("produtos", "nome: caixa/espaços padronizados", "corrigido",
              (~rejeitado & nome_antes.notna() & (nome_antes != p["nome"])).sum())
    sat_invalida = p["satisfacao_media"].notna() & ~p["satisfacao_media"].between(0, 5)
    registrar("produtos", "satisfacao_media: fora de 0-5", "anulado", (~rejeitado & sat_invalida).sum())
    p["satisfacao_media"] = p["satisfacao_media"].where(~sat_invalida)

    ok = p[~rejeitado].drop(columns=["inconsistente"]).copy()
    ok["estoque"] = ok["estoque"].astype("int64")
    ok["data_cadastro"] = pd.to_datetime(ok["data_cadastro"], errors="coerce")

    # na quarentena ficam os valores ORIGINAIS, para quem for investigar
    quarentena = bruto[rejeitado].drop(columns=["inconsistente"]).assign(motivo_rejeicao=motivos[rejeitado])
    return ok, quarentena


def corrigir_status(serie):
    # normaliza caixa/espaços e corrige typos por similaridade (ex.: "pndente" -> "pendente")
    normal = txt(serie).str.lower()
    mapa = {}
    for v in normal.dropna().unique():
        if v in STATUS_VALIDOS:
            mapa[v] = v
        else:
            parecidos = difflib.get_close_matches(v, STATUS_VALIDOS, n=1, cutoff=0.75)
            mapa[v] = parecidos[0] if parecidos else np.nan
    return normal, normal.map(mapa)


def limpar_compras(df, clientes_ok, produtos_ok, ids_produtos_raw, limite_futuro):
    bruto = df.copy()
    k = df.copy()

    for col in ["cliente_id", "produto_id", "quantidade", "valor_total", "desconto", "satisfacao"]:
        k[col] = num(k[col])

    normal, status_final = corrigir_status(k["status"])
    ja_valido = k["status"].isin(STATUS_VALIDOS)
    caixa = ~ja_valido & normal.isin(STATUS_VALIDOS)
    typo = status_final.notna() & ~normal.isin(STATUS_VALIDOS)
    k["status"] = status_final

    data = pd.to_datetime(k["data_compra"], errors="coerce")
    k["data_compra"] = data

    motivos = montar_motivos(k.index, [
        ("quantidade <= 0 ou ausente", ~(k["quantidade"] > 0)),
        ("valor_total <= 0 ou ausente", ~(k["valor_total"] > 0)),
        ("desconto negativo ou maior que o valor_total", (k["desconto"] < 0) | (k["desconto"] > k["valor_total"])),
        ("data_compra ilegível ou futura", data.isna() | (data > limite_futuro)),
        ("status ausente ou irreconhecível", k["status"].isna()),
        ("cliente_id inexistente", ~k["cliente_id"].isin(clientes_ok["id"])),
        ("produto_id inexistente", ~k["produto_id"].isin(ids_produtos_raw)),
        ("produto_id em quarentena", k["produto_id"].isin(ids_produtos_raw) & ~k["produto_id"].isin(produtos_ok["id"])),
    ], "compras")
    rejeitado = motivos != ""

    registrar("compras", "status: caixa/espaços corrigidos", "corrigido", (~rejeitado & caixa).sum())
    registrar("compras", "status: typo corrigido por similaridade", "corrigido", (~rejeitado & typo).sum())
    sat_invalida = k["satisfacao"].notna() & ~k["satisfacao"].between(1, 5)
    registrar("compras", "satisfacao: fora de 1-5", "anulado", (~rejeitado & sat_invalida).sum())
    k["satisfacao"] = k["satisfacao"].where(~sat_invalida)

    ok = k[~rejeitado].drop(columns=["inconsistente"]).copy()
    for col in ["cliente_id", "produto_id", "quantidade"]:
        ok[col] = ok[col].astype("int64")
    ok["satisfacao"] = ok["satisfacao"].astype("Int64")

    quarentena = bruto[rejeitado].drop(columns=["inconsistente"]).assign(motivo_rejeicao=motivos[rejeitado])
    return ok, quarentena


def etapa_limpeza(raw, lote, nulos_antes_pct, data_ref, pasta_rel, pasta_saida):
    print("\n" + "=" * 70)
    print(f"ETAPA 3 | LIMPEZA (lote {lote})")
    print("=" * 70)
    LOG.clear()
    limite_futuro = data_ref.normalize() + pd.Timedelta(days=1)
    print(f"Data de referência: {data_ref} (datas depois de {limite_futuro.date()} são futuras)")

    clientes_ok = limpar_clientes(raw["clientes"], data_ref, limite_futuro)
    produtos_ok, produtos_q = limpar_produtos(raw["produtos"])
    compras_ok, compras_q = limpar_compras(raw["compras"], clientes_ok, produtos_ok,
                                           set(num(raw["produtos"]["id"])), limite_futuro)

    trusted = {"clientes": clientes_ok, "produtos": produtos_ok, "compras": compras_ok}
    quarentena = {"clientes": pd.DataFrame(), "produtos": produtos_q, "compras": compras_q}

    # ---- relatório de qualidade
    resumo = pd.DataFrame([{
        "tabela": t, "linhas_raw": len(raw[t]), "trusted": len(trusted[t]),
        "quarentena": len(quarentena[t]), "% aproveitado": round(100 * len(trusted[t]) / len(raw[t]), 1),
    } for t in TABELAS])
    print("\nResumo por tabela:")
    mostrar(resumo)

    rel = pd.DataFrame(LOG)
    print("\nO que foi feito, por regra:")
    mostrar(rel.sort_values(["tabela", "acao", "qtd"], ascending=[True, True, False]).reset_index(drop=True))

    # ---- verificações (as mesmas que o DW da etapa 4 assume)
    for t in TABELAS:
        assert "inconsistente" not in trusted[t].columns, f"{t}: coluna 'inconsistente' ainda presente"
        assert trusted[t]["id"].is_unique, f"{t}: ids duplicados na trusted"
    for t in ["produtos", "compras"]:
        assert (quarentena[t]["motivo_rejeicao"].str.len() > 0).all(), f"{t}: quarentena sem motivo_rejeicao"
        assert len(trusted[t]) + len(quarentena[t]) == len(raw[t]), f"{t}: linhas perdidas"
    assert compras_ok["cliente_id"].isin(clientes_ok["id"]).all(), "compras com cliente inexistente na trusted"
    assert compras_ok["produto_id"].isin(produtos_ok["id"]).all(), "compras com produto inexistente na trusted"
    assert (compras_ok["quantidade"] > 0).all() and (compras_ok["valor_total"] > 0).all()
    assert (compras_ok["desconto"] <= compras_ok["valor_total"]).all()
    assert compras_ok["status"].isin(STATUS_VALIDOS).all()
    print("\nTodas as verificações de integridade passaram.")

    # ---- gráficos
    nulos_depois = {t: (trusted[t][nulos_antes_pct[t].index].isna().mean() * 100).round(1) for t in TABELAS}
    fig, eixos = plt.subplots(1, 3, figsize=(17, 5))
    for ax, t in zip(eixos, TABELAS):
        idx = np.arange(len(nulos_antes_pct[t]))
        ax.barh(idx - 0.19, nulos_antes_pct[t].values, height=0.38, color="#8C8C8C", label="antes (raw)")
        ax.barh(idx + 0.19, nulos_depois[t].values, height=0.38, color="#4C72B0", label="depois (trusted)")
        ax.set_yticks(idx)
        ax.set_yticklabels(nulos_antes_pct[t].index)
        ax.set_title(f"Nulos por coluna: {t}")
        ax.set_xlabel("% de registros nulos")
        ax.legend(loc="lower right")
    salvar_figura(fig, os.path.join(pasta_rel, f"03_nulos_antes_depois_{lote}.png"))
    for t in TABELAS:
        delta = (nulos_depois[t] - nulos_antes_pct[t]).sort_values()
        m = delta.index[-1]
        print(f"{t}: maior aumento de nulos em '{m}' ({nulos_antes_pct[t][m]}% -> {nulos_depois[t][m]}%). "
              "Aumentos vêm de valores inválidos anulados; quedas, de registros que foram para a quarentena.")

    g = rel.assign(rotulo=rel["tabela"] + " | " + rel["regra"]).sort_values("qtd")
    fig, ax = plt.subplots(figsize=(11, max(5, 0.32 * len(g))))
    ax.barh(g["rotulo"], g["qtd"], color=g["acao"].map(COR_ACAO))
    ax.set_title("Registros afetados por regra de limpeza")
    ax.set_xlabel("quantidade de registros")
    ax.legend([plt.Rectangle((0, 0), 1, 1, color=c) for c in COR_ACAO.values()], COR_ACAO.keys(), loc="lower right")
    salvar_figura(fig, os.path.join(pasta_rel, f"03_acoes_por_regra_{lote}.png"))
    top = g.iloc[-1]
    print(f"Regra com mais registros afetados: '{top['regra']}' ({top['tabela']}), {top['qtd']} registros ({top['acao']}).")

    motivos = rel[rel["acao"] == "quarentena"].assign(rotulo=lambda d: d["tabela"] + " | " + d["regra"]).sort_values("qtd")
    if not motivos.empty:
        fig, ax = plt.subplots(figsize=(11, max(4, 0.4 * len(motivos))))
        ax.barh(motivos["rotulo"], motivos["qtd"], color=motivos["tabela"].map(COR_TABELA))
        ax.set_title("Motivos de rejeição (quarentena)")
        ax.set_xlabel("ocorrências (um registro pode ter mais de um motivo)")
        salvar_figura(fig, os.path.join(pasta_rel, f"03_motivos_quarentena_{lote}.png"))
    for t in ["produtos", "compras"]:
        q = len(quarentena[t])
        print(f"{t}: {q} de {len(raw[t])} registros ({100 * q / len(raw[t]):.1f}%) foram para a quarentena.")

    if len(produtos_ok) and len(compras_ok):
        fig, eixos = plt.subplots(2, 3, figsize=(17, 9))
        idade = clientes_ok["idade"].dropna().astype(int)
        eixos[0, 0].hist(idade, bins=20, color="#4C72B0")
        eixos[0, 0].set(title="Idade dos clientes", xlabel="idade (anos)", ylabel="clientes")
        eixos[0, 1].hist(produtos_ok["preco"], bins=25, color="#55A868")
        eixos[0, 1].set(title="Preço dos produtos", xlabel="preço (R$)", ylabel="produtos")
        cat = produtos_ok["categoria"].value_counts()
        eixos[0, 2].barh(cat.index[::-1], cat.values[::-1], color="#55A868")
        eixos[0, 2].set(title="Produtos por categoria", xlabel="produtos")
        st = compras_ok["status"].value_counts()
        eixos[1, 0].barh(st.index[::-1], st.values[::-1], color="#C44E52")
        eixos[1, 0].set(title="Compras por status", xlabel="compras")
        mes = compras_ok.groupby(compras_ok["data_compra"].dt.to_period("M"))["valor_total"].sum()
        eixos[1, 1].plot(mes.index.astype(str), mes.values, marker="o", color="#C44E52")
        eixos[1, 1].set(title="Valor vendido por mês", xlabel="mês", ylabel="valor_total (R$)")
        eixos[1, 1].tick_params(axis="x", rotation=60)
        sat = compras_ok["satisfacao"].dropna().astype(int).value_counts().sort_index()
        eixos[1, 2].bar(sat.index.astype(str), sat.values, color="#DD8452")
        eixos[1, 2].set(title="Satisfação das compras", xlabel="nota", ylabel="compras")
        salvar_figura(fig, os.path.join(pasta_rel, f"03_eda_trusted_{lote}.png"))
        print(f"Idade: mediana de {clientes_ok['idade'].median():.0f} anos. "
              f"Preço: mediana de R$ {produtos_ok['preco'].median():.2f}. "
              f"Categoria com mais produtos: {cat.index[0]}. Status mais frequente: {st.index[0]}. "
              f"Mês com mais vendas: {mes.idxmax()} (R$ {mes.max():,.2f}).")
    else:
        print("Sem produtos ou compras válidos neste lote: gráficos da EDA não gerados.")

    # ---- gravar
    os.makedirs(pasta_saida, exist_ok=True)
    saidas = {
        f"trusted_clientes_{lote}.csv": clientes_ok,
        f"trusted_produtos_{lote}.csv": produtos_ok,
        f"trusted_compras_{lote}.csv": compras_ok,
        f"quarentena_produtos_{lote}.csv": produtos_q,
        f"quarentena_compras_{lote}.csv": compras_q,
        f"relatorio_qualidade_{lote}.csv": rel,
    }
    print()
    marcador = os.path.join(pasta_saida, f"trusted_{lote}.pronto")
    if os.path.exists(marcador):
        os.remove(marcador)                       # reprocessamento: a VM 3 não deve pegar um lote pela metade
    for nome, d in saidas.items():
        destino = os.path.join(pasta_saida, nome)
        d.to_csv(destino + ".tmp", index=False)
        os.replace(destino + ".tmp", destino)     # cada arquivo só "existe" quando está completo
        print(f"  {destino}  ({len(d)} linhas)")
    # marcador por último: avisa à VM 3 que o lote inteiro (trusted + quarentena + relatório) está pronto
    with open(marcador + ".tmp", "w", encoding="utf-8") as f:
        json.dump({"lote": int(lote), "gerado_em": time.strftime("%Y-%m-%d %H:%M:%S"),
                   "linhas": {n: len(d) for n, d in saidas.items()}}, f, ensure_ascii=False)
    os.replace(marcador + ".tmp", marcador)
    return resumo, rel


# ======================================================================= IA (opcional)
def interpretar_com_ia(resumo, rel, lote, pasta_rel):
    chave = os.environ.get("GEMINI_API_KEY")
    if not chave:
        print("\n[IA] Sem GEMINI_API_KEY no ambiente: interpretação por IA ignorada.")
        return
    try:
        from google import genai
        prompt = f"""Você é um analista de dados sênior revisando a limpeza de um projeto de Data Warehouse (loja de roupas, dados simulados).
Com base APENAS nos números abaixo, escreva em português, em 3 parágrafos curtos:
1) o que a limpeza revelou sobre a qualidade dos dados brutos (quais problemas dominam);
2) o impacto na quantidade de dados aproveitáveis (trusted vs quarentena) e se isso é preocupante;
3) recomendações para melhorar a origem dos dados (cadastro, gerador, validações).
Não invente números que não estejam nos dados.

RESUMO POR TABELA:
{resumo.to_string(index=False)}

REGRAS APLICADAS (tabela, regra, ação, quantidade):
{rel.sort_values(["tabela", "acao", "qtd"], ascending=[True, True, False]).to_string(index=False)}
"""
        resp = genai.Client(api_key=chave).models.generate_content(model="gemini-3.8-flash", contents=prompt)
        caminho = os.path.join(pasta_rel, f"interpretacao_ia_{lote}.md")
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(resp.text)
        print("\n[IA] Interpretação (gerada por IA; leia antes de confiar):\n")
        print(resp.text)
        print(f"\n[IA] salva em {caminho}")
    except Exception as e:      # falha da IA nunca derruba o pipeline
        print(f"\n[IA] A chamada falhou ({type(e).__name__}): {str(e)[:300]}")


# ======================================================================= orquestração
def processar_lote(lote, args):
    pasta_rel = os.path.join(args.relatorios, f"lote_{lote}")
    os.makedirs(pasta_rel, exist_ok=True)
    caminho_rel = os.path.join(pasta_rel, f"relatorio_{lote}.txt")

    with open(caminho_rel, "w", encoding="utf-8") as arq, contextlib.redirect_stdout(Tee(sys.stdout, arq)):
        inicio = time.time()
        print(f"PROCESSANDO LOTE {lote}  |  {time.strftime('%Y-%m-%d %H:%M:%S')}")
        raw = {}
        for t in TABELAS:
            caminho = os.path.join(args.entrada, f"{t}_{lote}.csv")
            if not os.path.exists(caminho):
                raise FileNotFoundError(f"Não encontrei {caminho}. Rode 'coletar' antes.")
            raw[t] = ler_csv(caminho)
            print(f"{t:10s} <- {caminho}  {raw[t].shape}")

        nulos_pct = {n: (df.drop(columns=["inconsistente"]).isna().mean() * 100).round(1) for n, df in raw.items()}
        _, data_ref = etapa_inspecao(raw, lote, pasta_rel)
        resumo, rel = etapa_limpeza(raw, lote, nulos_pct, data_ref, pasta_rel, args.saida)
        if args.ia:
            interpretar_com_ia(resumo, rel, lote, pasta_rel)
        print(f"\nLote {lote} concluído em {time.time() - inicio:.1f}s. Relatório: {caminho_rel}")


def lotes_disponiveis(entrada):
    achados = set()
    for caminho in glob.glob(os.path.join(entrada, "ciclo_*.pronto")):
        m = re.fullmatch(r"ciclo_(\d+)\.pronto", os.path.basename(caminho))
        if m:
            achados.add(int(m.group(1)))
    return sorted(achados)


def processar(args):
    prontos = lotes_disponiveis(args.entrada)
    if args.ciclo is not None:
        alvo = [args.ciclo]
    elif args.todos:
        alvo = prontos
    else:   # padrão: só os que ainda não têm saída trusted
        alvo = [c for c in prontos if not os.path.exists(os.path.join(args.saida, f"trusted_{c}.pronto"))]
    if not alvo:
        print("[processar] nenhum ciclo novo para processar.")
        return []
    print(f"[processar] ciclos a processar: {alvo}")
    feitos = []
    for c in alvo:
        try:
            processar_lote(c, args)
            feitos.append(c)
        except Exception as e:
            print(f"\n[processar] ERRO no ciclo {c}: {type(e).__name__}: {e}", file=sys.stderr)
            if args.depurar:
                traceback.print_exc()
            if not args.continuar:
                raise SystemExit(1)
    return feitos


def montar_parser():
    p = argparse.ArgumentParser(description="Pipeline da VM 2: coletar, inspecionar e limpar os dados da VM 1.",
                                formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    p.add_argument("comando", choices=["coletar", "processar", "tudo", "vigiar"])
    p.add_argument("--origem", help="pasta da VM 1: usuario@host:/caminho (SSH) ou um diretório local/montado")
    p.add_argument("--destino", default="dados_brutos", help="onde guardar os CSVs coletados (padrão: dados_brutos)")
    p.add_argument("--entrada", default=None, help="de onde ler os CSVs ao processar (padrão: o mesmo de --destino)")
    p.add_argument("--saida", default="saida", help="onde gravar trusted/quarentena (padrão: saida)")
    p.add_argument("--relatorios", default="relatorios", help="onde gravar relatórios e gráficos (padrão: relatorios)")
    p.add_argument("--ciclo", type=int, help="processar apenas este ciclo (reprocessa mesmo que já exista)")
    p.add_argument("--todos", action="store_true", help="reprocessar todos os ciclos coletados")
    p.add_argument("--forcar", action="store_true", help="coletar de novo mesmo os ciclos já coletados")
    p.add_argument("--ssh-chave", help="arquivo da chave privada SSH (ex.: ~/.ssh/id_ed25519)")
    p.add_argument("--ssh-porta", type=int, help="porta SSH da VM 1 (padrão: 22)")
    p.add_argument("--intervalo", type=int, default=30, help="segundos entre consultas no modo 'vigiar' (padrão: 30)")
    p.add_argument("--ia", action="store_true", help="gerar interpretação por IA (precisa de GEMINI_API_KEY e google-genai)")
    p.add_argument("--continuar", action="store_true", help="se um ciclo falhar, seguir para o próximo")
    p.add_argument("--depurar", action="store_true", help="mostrar o traceback completo nos erros")
    return p


def main():
    args = montar_parser().parse_args()
    args.entrada = args.entrada or args.destino

    if args.comando in ("coletar", "tudo", "vigiar") and not args.origem:
        print("erro: informe --origem (ex.: usuario@IP_DA_VM1:/home/usuario/simulador/saida)", file=sys.stderr)
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
            print(f"[vigiar] consultando a VM 1 a cada {args.intervalo}s. CTRL + C para parar.")
            args.continuar = True
            while True:
                try:
                    coletar(args)
                    processar(args)
                except RuntimeError as e:       # VM 1 fora do ar não derruba o monitor
                    print(f"[vigiar] {e}", file=sys.stderr)
                time.sleep(args.intervalo)
    except RuntimeError as e:
        print(f"erro: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\n[vigiar] interrompido.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
