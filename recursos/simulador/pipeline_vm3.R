#!/usr/bin/env Rscript
suppressPackageStartupMessages({
  library(sparklyr)
  library(dplyr)
  library(readr)
  library(optparse)
})

option_list <- list(
  make_option(c("-o", "--origem"), type="character", default=NULL, help="Origem SSH da VM2"),
  make_option(c("-d", "--destino"), type="character", default="dados_trusted", help="Pasta local trusted"),
  make_option(c("-s", "--saida"), type="character", default="resultados_spark", help="Pasta de resultados"),
  make_option(c("-i", "--intervalo"), type="integer", default=30, help="Intervalo em segundos")
)

args <- parse_args(OptionParser(option_list=option_list))

coletar_trusted <- function(origem, destino) {
  dir.create(destino, showWarnings = FALSE, recursive = TRUE)
  cmd <- sprintf("scp -p -o StrictHostKeyChecking=accept-new %s/trusted_*.pronto %s/ 2>/dev/null", origem, destino)
  system(cmd)
  
  prontos <- list.files(destino, pattern = "trusted_.*\\.pronto$")
  if (length(prontos) == 0) return()
  
  ciclos <- as.numeric(gsub("\\D", "", prontos))
  for (c in ciclos) {
    system(sprintf("scp -p -o StrictHostKeyChecking=accept-new %s/trusted_*_%d.csv %s/ 2>/dev/null", origem, c, destino))
  }
}

processar_spark <- function(pasta_trusted, pasta_saida) {
  dir.create(pasta_saida, showWarnings = FALSE, recursive = TRUE)
  
  # Verifica se já existe alguma versão 3.x do Spark instalada
  versoes_instaladas <- sparklyr::spark_installed_versions()
  v3_instaladas <- versoes_instaladas$spark[startsWith(versoes_instaladas$spark, "3.")]
  
  if (length(v3_instaladas) == 0) {
    avail <- sparklyr::spark_available_versions()
    v3_target <- tail(avail$spark[startsWith(avail$spark, "3.")], 1)
    cat(sprintf("[Spark] Instalando Apache Spark %s...\n", v3_target))
    sparklyr::spark_install(version = v3_target)
    v_spark <- v3_target
  } else {
    v_spark <- v3_instaladas[1]
  }

  cat(sprintf("[Spark] Conectando ao cluster local Spark %s em R...\n", v_spark))
  sc <- spark_connect(master = "local", version = v_spark)
  
  # Leitura dos dados
  cli_path <- file.path(pasta_trusted, "trusted_clientes_*.csv")
  com_path <- file.path(pasta_trusted, "trusted_compras_*.csv")
  
  if (length(list.files(pasta_trusted, pattern="trusted_compras_.*\\.csv$")) == 0) {
    cat("[Spark] Nenhum dado de compras encontrado para processar ainda.\n")
    spark_disconnect(sc)
    return()
  }

  sp_clientes <- spark_read_csv(sc, name = "clientes", path = cli_path)
  sp_compras  <- spark_read_csv(sc, name = "compras", path = com_path)

  # Agregação RFM
  rfm <- sp_compras %>%
    filter(status != "cancelado") %>%
    group_by(cliente_id) %>%
    summarise(
      frequencia = n(),
      monetario  = sum(valor_total, na.rm = TRUE)
    )

  cat("[Spark MLlib] Executando algoritmo K-Means...\n")
  modelo_kmeans <- rfm %>%
    ml_kmeans(k = 3, features = c("frequencia", "monetario"))

  resultados <- ml_predict(modelo_kmeans, rfm) %>% collect()

  write_csv(resultados, file.path(pasta_saida, "segmentacao_clientes_rfm.csv"))
  cat("[sucesso] Análise RFM concluída com sucesso no Spark.\n")

  spark_disconnect(sc)
}

if (is.null(args$origem)) {
  stop("Informe a origem com -o/--origem (ex: debian@192.168.122.X:/home/debian/gardenia/saida)")
}

cat("[vigiar VM3] Monitorando VM2 via R + Spark...\n")
while (TRUE) {
  tryCatch({
    coletar_trusted(args$origem, args$destino)
    processar_spark(args$destino, args$saida)
  }, error = function(e) {
    cat(sprintf("[erro] %s\n", e$message))
  })
  Sys.sleep(args$intervalo)
}