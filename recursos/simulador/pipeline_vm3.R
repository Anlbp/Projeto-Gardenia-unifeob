#!/usr/bin/env Rscript

suppressPackageStartupMessages({
  library(tidyverse)
  library(sparklyr)
  library(optparse)
  library(mongolite)
})

# Argumentos via linha de comando
option_list <- list(
  make_option(c("-o", "--origem"), type="character", default="debian@192.168.122.125:/home/debian/gardenia/saida", help="Origem SSH"),
  make_option(c("-i", "--intervalo"), type="integer", default=30, help="Intervalo de vigia em segundos")
)
opt <- parse_args(OptionParser(option_list=option_list))

pasta_local <- "/home/debian/spark_work/entrada_trusted"
pasta_resultados <- "/home/debian/spark_work/resultados_spark"

sincronizar_dados <- function() {
  dir.create(pasta_local, showWarnings = FALSE, recursive = TRUE)
  cat("[vigiar VM3] Sincronizando dados tratados da VM2...\n")
  system(sprintf("rsync -avz -e 'ssh -o StrictHostKeyChecking=no' %s/ %s/", opt$origem, pasta_local), ignore.stdout = TRUE)
}

processar_spark_e_mongo <- function() {
  versoes_instaladas <- sparklyr::spark_installed_versions()
  v3_instaladas <- versoes_instaladas$spark[startsWith(versoes_instaladas$spark, "3.")]
  
  if (length(v3_instaladas) == 0) {
    avail <- sparklyr::spark_available_versions()
    v3_target <- tail(avail$spark[startsWith(avail$spark, "3.")], 1)
    sparklyr::spark_install(version = v3_target)
    v_spark <- v3_target
  } else {
    v_spark <- v3_instaladas[1]
  }

  sc <- spark_connect(master = "local", version = v_spark)
  
  cli_path <- file.path(pasta_local, "trusted_clientes_*.csv")
  com_path <- file.path(pasta_local, "trusted_compras_*.csv")
  
  if (length(list.files(pasta_local, pattern="trusted_compras_.*\\.csv$")) == 0) {
    cat("[Spark] Aguardando novos dados de compras...\n")
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

  cat("[Spark MLlib] Executando agrupamento K-Means...\n")
  modelo_kmeans <- rfm %>%
    ml_kmeans(k = 3, features = c("frequencia", "monetario"))

  resultados <- ml_predict(modelo_kmeans, rfm) %>% collect()
  resultados$data_processamento <- Sys.time()

  # Persistência no MongoDB via mongolite
  cat("[MongoDB] Gravando resultados na coleção 'segmentacao_rfm'...\n")
  mongo_conn <- mongo(
    collection = "segmentacao_rfm",
    db = "gardenia",
    url = "mongodb://localhost:27017"
  )
  
  # Limpa e insere o lote atualizado
  mongo_conn$drop()
  mongo_conn$insert(resultados)
  
  cat(sprintf("[sucesso] %d clientes segmentados e salvos no MongoDB!\n", nrow(resultados)))

  spark_disconnect(sc)
}

# Loop contínuo de vigia
while (TRUE) {
  sincronizar_dados()
  tryCatch({
    processar_spark_e_mongo()
  }, error = function(e) {
    cat(sprintf("[erro] Falha no processamento: %s\n", e$message))
  })
  Sys.sleep(opt$intervalo)
}