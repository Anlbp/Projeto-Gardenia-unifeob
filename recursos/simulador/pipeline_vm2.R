#!/usr/bin/env Rscript
suppressPackageStartupMessages({
  library(tidyverse)
  library(jsonlite)
  library(optparse)
})

# ==========================================
# Opções de Linha de Comando
# ==========================================
option_list <- list(
  make_option(c("-o", "--origem"), type="character", default=NULL, help="Origem SSH (ex: debian@IP:/caminho)"),
  make_option(c("-d", "--destino"), type="character", default="dados_brutos", help="Pasta destino dos brutos"),
  make_option(c("-s", "--saida"), type="character", default="saida", help="Pasta de saída trusted"),
  make_option(c("-i", "--intervalo"), type="integer", default=15, help="Intervalo de vigia em segundos")
)

parser <- OptionParser(option_list=option_list)
args <- parse_args(parser)

# ==========================================
# Função de Coleta via SCP
# ==========================================
coletar <- function(origem, destino) {
  dir.create(destino, showWarnings = FALSE, recursive = TRUE)
  cmd <- sprintf("scp -p -o StrictHostKeyChecking=accept-new %s/ciclo_*.pronto %s/ 2>/dev/null", origem, destino)
  system(cmd)
  
  prontos <- list.files(destino, pattern = "ciclo_.*\\.pronto$")
  if (length(prontos) == 0) return(c())
  
  ciclos <- as.numeric(str_extract(prontos, "\\d+"))
  for (c in ciclos) {
    if (!file.exists(file.path(destino, sprintf("trusted_%d.pronto", c)))) {
      system(sprintf("scp -p -o StrictHostKeyChecking=accept-new %s/*_%d.csv %s/ 2>/dev/null", origem, c, destino))
      cat(sprintf("[coleta] Ciclo %d copiado.\n", c))
    }
  }
  return(ciclos)
}

# ==========================================
# Função de Limpeza e Tratamento
# ==========================================
processar_ciclo <- function(ciclo, pasta_in, pasta_out) {
  dir.create(pasta_out, showWarnings = FALSE, recursive = TRUE)
  cat(sprintf("[processar] Limpando ciclo %d...\n", ciclo))
  
  # Leitura dos CSVs brutos
  f_cli <- file.path(pasta_in, sprintf("clientes_%d.csv", ciclo))
  f_pro <- file.path(pasta_in, sprintf("produtos_%d.csv", ciclo))
  f_com <- file.path(pasta_in, sprintf("compras_%d.csv", ciclo))
  
  if (!file.exists(f_cli) || !file.exists(f_pro) || !file.exists(f_com)) return()

  clientes <- read_csv(f_cli, show_col_types = FALSE)
  produtos <- read_csv(f_pro, show_col_types = FALSE)
  compras  <- read_csv(f_com, show_col_types = FALSE)

  # 1. Limpeza de Clientes
  cli_clean <- clientes %>%
    mutate(
      nome = str_to_title(str_squish(nome)),
      email = str_to_lower(str_squish(email)),
      idade = as.integer(idade)
    ) %>%
    filter(!is.na(nome) & str_detect(email, "^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$"))

  # 2. Limpeza e Quarentena de Produtos
  prod_clean <- produtos %>%
    mutate(preco = as.numeric(preco), estoque = as.integer(estoque)) %>%
    filter(!is.na(preco) & preco > 0 & estoque >= 0)

  prod_quarentena <- anti_join(produtos, prod_clean, by = "id") %>%
    mutate(motivo_rejeicao = "Preco invalido ou estoque negativo")

  # 3. Limpeza e Quarentena de Compras
  compras_clean <- compras %>%
    mutate(
      quantidade = as.integer(quantidade),
      valor_total = as.numeric(valor_total),
      status = str_to_lower(str_squish(status))
    ) %>%
    filter(quantidade > 0 & valor_total > 0 & status %in% c("pendente", "pago", "enviado", "entregue", "cancelado")) %>%
    semi_join(cli_clean, by = c("cliente_id" = "id")) %>%
    semi_join(prod_clean, by = c("produto_id" = "id"))

  compras_quarentena <- anti_join(compras, compras_clean, by = "id") %>%
    mutate(motivo_rejeicao = "Inconsistencia de FK ou valores negativos")

  # Salvar resultados trusted
  write_csv(cli_clean, file.path(pasta_out, sprintf("trusted_clientes_%d.csv", ciclo)))
  write_csv(prod_clean, file.path(pasta_out, sprintf("trusted_produtos_%d.csv", ciclo)))
  write_csv(compras_clean, file.path(pasta_out, sprintf("trusted_compras_%d.csv", ciclo)))
  
  # Salvar quarentenas
  write_csv(prod_quarentena, file.path(pasta_out, sprintf("quarentena_produtos_%d.csv", ciclo)))
  write_csv(compras_quarentena, file.path(pasta_out, sprintf("quarentena_compras_%d.csv", ciclo)))

  # Marcador de lote pronto
  writeLines(toJSON(list(ciclo=ciclo, status="pronto"), auto_unbox=TRUE), 
             file.path(pasta_out, sprintf("trusted_%d.pronto", ciclo)))
  
  cat(sprintf("[sucesso] Ciclo %d processado e salvo na pasta trusted.\n", ciclo))
}

# ==========================================
# Loop de Vigia
# ==========================================
if (is.null(args$origem)) {
  stop("Informe a origem SSH com -o/--origem (ex: debian@192.168.122.X:/home/debian/simulador/saida)")
}

cat(sprintf("[vigiar] Iniciando monitoramento em R a cada %d segundos...\n", args$intervalo))
while (TRUE) {
  tryCatch({
    ciclos <- coletar(args$origem, args$destino)
    for (c in ciclos) {
      if (!file.exists(file.path(args$saida, sprintf("trusted_%d.pronto", c)))) {
        processar_ciclo(c, args$destino, args$saida)
      }
    }
  }, error = function(e) {
    cat(sprintf("[erro] %s\n", e$message))
  })
  Sys.sleep(args$intervalo)
}