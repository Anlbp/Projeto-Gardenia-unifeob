#!/usr/bin/env Rscript
# =============================================================================
# VM3 - Vigia de dados tratados -> Spark (RFM + K-Means) -> MongoDB + gráficos
#
# Fluxo a cada ciclo:
#   1. rsync dos CSVs tratados da VM2
#   2. se algo mudou: agrega RFM no Spark, padroniza e roda K-Means
#   3. grava segmentação na coleção gardenia.segmentacao_rfm
#   4. gera gráficos (PNG) e publica:
#        - no MongoDB (GridFS, prefixo "graficos" => gardenia.graficos.files/.chunks)
#        - na pasta do simulador (--simulador)
# =============================================================================

suppressPackageStartupMessages({
  library(tidyverse)
  library(sparklyr)
  library(optparse)
  library(mongolite)
  library(scales)
})

# ---- Argumentos --------------------------------------------------------------
option_list <- list(
  make_option(c("-o", "--origem"), type = "character",
              default = "debian@vm2:/home/debian/gardenia/saida",
              help = "Origem SSH dos CSVs tratados"),
  make_option(c("-i", "--intervalo"), type = "integer", default = 30,
              help = "Intervalo de vigia em segundos"),
  make_option(c("-s", "--simulador"), type = "character",
              default = "Projeto-Gardenia-unifeob-main/recursos/simulador",
              help = "Pasta do simulador onde os gráficos também serão copiados"),
  make_option(c("-k", "--k"), type = "integer", default = 3,
              help = "Número de clusters do K-Means"),
  make_option("--uma-vez", action = "store_true", default = FALSE,
              help = "Executa um único ciclo e sai (útil para testes)")
)
opt <- parse_args(OptionParser(option_list = option_list))

# ---- Configuração ------------------------------------------------------------
pasta_local      <- "/home/debian/spark_work/entrada_trusted"
pasta_resultados <- "/home/debian/spark_work/resultados_spark"
pasta_graficos   <- file.path(pasta_resultados, "graficos")

DB        <- "gardenia"
mongo_url <- Sys.getenv("MONGO_URL", unset = "mongodb://localhost:27017")

dir.create(pasta_local,    showWarnings = FALSE, recursive = TRUE)
dir.create(pasta_graficos, showWarnings = FALSE, recursive = TRUE)

# ---- Sincronização -----------------------------------------------------------
sincronizar_dados <- function() {
  cat("[vigiar VM3] Sincronizando dados tratados da VM2...\n")
  cmd <- sprintf("rsync -avz -e 'ssh -o StrictHostKeyChecking=no' %s/ %s/",
                 opt$origem, pasta_local)
  status <- system(cmd, ignore.stdout = TRUE)
  if (status != 0) {
    cat(sprintf("[aviso] rsync retornou status %d; usando os dados já existentes.\n", status))
  }
  invisible(status == 0)
}

# Assinatura dos arquivos: evita reprocessar quando nada mudou
assinatura_dados <- function() {
  f <- list.files(pasta_local, pattern = "^trusted_.*\\.csv$", full.names = TRUE)
  if (length(f) == 0) return("")
  paste(basename(f), unname(tools::md5sum(f)), collapse = "|")
}

# ---- Spark -------------------------------------------------------------------
escolher_versao_spark <- function() {
  inst <- sparklyr::spark_installed_versions()
  v3 <- inst$spark[startsWith(inst$spark, "3.")]
  if (length(v3) > 0) return(v3[1])
  avail <- sparklyr::spark_available_versions()
  alvo <- tail(avail$spark[startsWith(avail$spark, "3.")], 1)
  sparklyr::spark_install(version = alvo)
  alvo
}

# ---- Gráficos ----------------------------------------------------------------
tema <- theme_minimal(base_size = 12) +
  theme(plot.title = element_text(face = "bold"),
        legend.position = "bottom")

fmt_num <- label_number(big.mark = ".", decimal.mark = ",")

salvar_grafico <- function(p, nome, largura = 9, altura = 6) {
  arq <- file.path(pasta_graficos, paste0(nome, ".png"))
  tryCatch({
    ggsave(arq, plot = p, width = largura, height = altura, dpi = 150, bg = "white")
    arq
  }, error = function(e) {
    cat(sprintf("[aviso] Gráfico '%s' não gerado: %s\n", nome, e$message))
    NULL
  })
}

gerar_graficos <- function(df, cent, feats, silhueta_k = NULL, mensal = NULL) {
  arqs <- list()
  add  <- function(x) if (!is.null(x)) arqs[[length(arqs) + 1]] <<- x

  n_seg <- nlevels(df$segmento)
  paleta <- if (n_seg == 3) {
    c("Alto valor" = "#2E7D32", "Médio valor" = "#F9A825", "Baixo valor" = "#C62828")
  } else {
    setNames(hue_pal()(n_seg), levels(df$segmento))
  }
  escala_cor  <- scale_color_manual(values = paleta, name = "Segmento")
  escala_fill <- scale_fill_manual(values = paleta, name = "Segmento")

  long <- df %>%
    pivot_longer(all_of(feats), names_to = "metrica", values_to = "valor")

  # 1. K-Means: segmentação (frequência x monetário) com centróides
  p <- ggplot(df, aes(frequencia, monetario, color = segmento)) +
    geom_point(alpha = 0.7, size = 2) +
    stat_ellipse(level = 0.9, linetype = 2, na.rm = TRUE) +
    geom_point(data = cent, shape = 4, size = 5, stroke = 2, color = "black") +
    escala_cor +
    scale_y_continuous(labels = fmt_num) +
    labs(title = "Segmentação de clientes (K-Means)",
         subtitle = "X = centróide de cada segmento",
         x = "Frequência (nº de compras)", y = "Monetário (R$)") + tema
  add(salvar_grafico(p, "kmeans_segmentacao"))

  # 2. Clusters no plano PCA (todas as variáveis padronizadas)
  if (length(feats) >= 2 && nrow(df) > 3) {
    pca <- prcomp(df[feats], scale. = TRUE)
    var_exp <- summary(pca)$importance[2, 1:2]
    dpca <- tibble(PC1 = pca$x[, 1], PC2 = pca$x[, 2], segmento = df$segmento)
    p <- ggplot(dpca, aes(PC1, PC2, color = segmento)) +
      geom_point(alpha = 0.7, size = 2) +
      stat_ellipse(level = 0.9, linetype = 2, na.rm = TRUE) +
      escala_cor +
      labs(title = "Clusters no plano PCA",
           x = sprintf("PC1 (%.0f%% da variância)", 100 * var_exp[1]),
           y = sprintf("PC2 (%.0f%% da variância)", 100 * var_exp[2])) + tema
    add(salvar_grafico(p, "clusters_pca"))
  }

  # 3. Tamanho de cada segmento
  p <- df %>% count(segmento) %>%
    ggplot(aes(segmento, n, fill = segmento)) +
    geom_col(show.legend = FALSE) +
    geom_text(aes(label = n), vjust = -0.4) +
    escala_fill +
    labs(title = "Clientes por segmento", x = NULL, y = "Clientes") + tema
  add(salvar_grafico(p, "clusters_tamanho", 7, 5))

  # 4. Boxplots por segmento
  p <- ggplot(long, aes(segmento, valor, fill = segmento)) +
    geom_boxplot(outlier.alpha = 0.5, show.legend = FALSE) +
    facet_wrap(~metrica, scales = "free_y") +
    escala_fill +
    labs(title = "Distribuição das métricas por segmento (boxplot)",
         x = NULL, y = NULL) + tema +
    theme(axis.text.x = element_text(angle = 20, hjust = 1))
  add(salvar_grafico(p, "boxplot_metricas_segmento", 11, 6))

  # 5. Histogramas
  p <- ggplot(long, aes(valor)) +
    geom_histogram(bins = 30, fill = "#1565C0", color = "white") +
    facet_wrap(~metrica, scales = "free") +
    labs(title = "Distribuição das métricas RFM (histograma)",
         x = NULL, y = "Clientes") + tema
  add(salvar_grafico(p, "histograma_metricas", 11, 5))

  p <- ggplot(long, aes(valor, fill = segmento)) +
    geom_histogram(bins = 30, position = "stack", color = "white") +
    facet_wrap(~metrica, scales = "free") +
    escala_fill +
    labs(title = "Histograma das métricas por segmento", x = NULL, y = "Clientes") + tema
  add(salvar_grafico(p, "histograma_metricas_segmento", 11, 5))

  # 6. Heatmap de correlação
  if (length(feats) >= 2) {
    cm <- cor(df[feats], use = "pairwise.complete.obs")
    cm_long <- as.data.frame(as.table(cm)) %>% rename(var1 = Var1, var2 = Var2, r = Freq)
    p <- ggplot(cm_long, aes(var1, var2, fill = r)) +
      geom_tile(color = "white") +
      geom_text(aes(label = sprintf("%.2f", r))) +
      scale_fill_gradient2(low = "#C62828", mid = "white", high = "#1565C0",
                           limits = c(-1, 1), name = "Correlação") +
      labs(title = "Heatmap de correlação (RFM)", x = NULL, y = NULL) + tema
    add(salvar_grafico(p, "heatmap_correlacao", 7, 6))
  }

  # 7. Heatmap do perfil dos segmentos (z-score das médias, com valores reais)
  cent_long <- cent %>%
    pivot_longer(all_of(feats), names_to = "metrica", values_to = "media") %>%
    group_by(metrica) %>%
    mutate(z = if (isTRUE(sd(media) > 0)) (media - mean(media)) / sd(media) else 0) %>%
    ungroup()
  p <- ggplot(cent_long, aes(metrica, segmento, fill = z)) +
    geom_tile(color = "white") +
    geom_text(aes(label = fmt_num(round(media, 1)))) +
    scale_fill_gradient2(low = "#C62828", mid = "white", high = "#2E7D32",
                         name = "Z-score") +
    labs(title = "Perfil dos segmentos (média por métrica)",
         subtitle = "Cor = posição relativa entre segmentos; número = média real",
         x = NULL, y = NULL) + tema
  add(salvar_grafico(p, "heatmap_perfil_segmentos", 8, 5))

  # 8. Regressão linear: monetário ~ frequência
  if (nrow(df) >= 3 && isTRUE(var(df$frequencia) > 0)) {
    m  <- lm(monetario ~ frequencia, data = df)
    r2 <- summary(m)$r.squared
    p <- ggplot(df, aes(frequencia, monetario)) +
      geom_point(aes(color = segmento), alpha = 0.7, size = 2) +
      geom_smooth(method = "lm", formula = y ~ x, color = "black", se = TRUE) +
      escala_cor +
      scale_y_continuous(labels = fmt_num) +
      labs(title = "Regressão linear: monetário ~ frequência",
           subtitle = sprintf("monetário = %.2f + %.2f × frequência  |  R² = %.3f",
                              coef(m)[1], coef(m)[2], r2),
           x = "Frequência", y = "Monetário (R$)") + tema
    add(salvar_grafico(p, "regressao_freq_monetario"))

    dres <- tibble(ajustado = fitted(m), residuo = resid(m), segmento = df$segmento)
    p <- ggplot(dres, aes(ajustado, residuo, color = segmento)) +
      geom_hline(yintercept = 0, linetype = 2) +
      geom_point(alpha = 0.7) +
      escala_cor +
      scale_x_continuous(labels = fmt_num) + scale_y_continuous(labels = fmt_num) +
      labs(title = "Resíduos da regressão", x = "Valor ajustado", y = "Resíduo") + tema
    add(salvar_grafico(p, "regressao_residuos"))
  }

  # 9. Silhueta por k (diagnóstico para escolher k)
  if (!is.null(silhueta_k) && nrow(silhueta_k) > 0 && any(!is.na(silhueta_k$silhueta))) {
    p <- ggplot(silhueta_k, aes(k, silhueta)) +
      geom_line(color = "#1565C0") + geom_point(size = 3, color = "#1565C0") +
      geom_vline(xintercept = opt$k, linetype = 2, color = "grey40") +
      scale_x_continuous(breaks = silhueta_k$k) +
      labs(title = "Silhueta por número de clusters",
           subtitle = "Quanto maior, melhor separados; linha tracejada = k em uso",
           x = "k", y = "Silhueta") + tema
    add(salvar_grafico(p, "silhueta_por_k", 7, 5))
  }

  # 10. Série temporal de faturamento (se houver coluna de data)
  if (!is.null(mensal) && nrow(mensal) > 1) {
    p <- ggplot(mensal, aes(mes, faturamento)) +
      geom_col(fill = "#90CAF9") +
      geom_line(color = "#1565C0", linewidth = 1) +
      geom_point(color = "#1565C0") +
      scale_y_continuous(labels = fmt_num) +
      scale_x_date(date_labels = "%m/%Y") +
      labs(title = "Faturamento mensal (compras não canceladas)",
           x = NULL, y = "Faturamento (R$)") + tema
    add(salvar_grafico(p, "faturamento_mensal", 10, 5))
  }

  unlist(arqs)
}

# ---- Publicação dos gráficos -------------------------------------------------
publicar_graficos <- function(arquivos) {
  if (length(arquivos) == 0) return(invisible())

  # Pasta do simulador
  ok_dir <- dir.create(opt$simulador, showWarnings = FALSE, recursive = TRUE) ||
    dir.exists(opt$simulador)
  if (ok_dir) {
    file.copy(arquivos, opt$simulador, overwrite = TRUE)
    cat(sprintf("[simulador] %d gráficos copiados para %s\n", length(arquivos), opt$simulador))
  } else {
    cat(sprintf("[aviso] Não consegui criar a pasta do simulador: %s\n", opt$simulador))
  }

  # MongoDB (GridFS): gardenia.graficos.files / gardenia.graficos.chunks
  fs <- gridfs(db = DB, url = mongo_url, prefix = "graficos")
  meta <- as.character(jsonlite::toJSON(
    list(gerado_em = format(Sys.time(), "%Y-%m-%d %H:%M:%S"), origem = "vigia_vm3"),
    auto_unbox = TRUE))
  for (a in arquivos) {
    nome <- basename(a)
    try(fs$remove(nome), silent = TRUE)  # substitui a versão anterior
    fs$upload(a, name = nome, content_type = "image/png", metadata = meta)
  }
  cat(sprintf("[MongoDB] %d gráficos gravados em %s.graficos (GridFS)\n", length(arquivos), DB))
}

# ---- Processamento -----------------------------------------------------------
rotular_clusters <- function(df, k) {
  ordem <- df %>%
    group_by(prediction) %>%
    summarise(m = mean(monetario), .groups = "drop") %>%
    arrange(desc(m)) %>%
    pull(prediction)
  nomes <- if (k == 3) c("Alto valor", "Médio valor", "Baixo valor") else paste("Segmento", seq_len(k))
  df$segmento <- factor(nomes[match(df$prediction, ordem)], levels = nomes)
  df
}

processar_spark_e_mongo <- function() {
  if (length(list.files(pasta_local, pattern = "^trusted_compras_.*\\.csv$")) == 0) {
    cat("[Spark] Aguardando novos dados de compras...\n")
    return(invisible(FALSE))
  }

  sc <- spark_connect(master = "local", version = escolher_versao_spark())
  on.exit(spark_disconnect(sc), add = TRUE)

  sp_compras <- spark_read_csv(sc, name = "compras",
                               path = file.path(pasta_local, "trusted_compras_*.csv"))
  cols <- colnames(sp_compras)

  base <- sp_compras
  if ("status" %in% cols) base <- base %>% filter(status != "cancelado")

  col_data <- intersect(c("data_compra", "data_pedido", "data", "data_venda"), cols)[1]
  tem_data <- !is.na(col_data)

  # ---- Agregação RFM no Spark
  cat("[Spark] Agregando RFM por cliente...\n")
  if (tem_data) {
    rfm_sp <- base %>%
      group_by(cliente_id) %>%
      summarise(frequencia    = n(),
                monetario     = sum(valor_total, na.rm = TRUE),
                ultima_compra = max(as.character(!!rlang::sym(col_data))))
  } else {
    rfm_sp <- base %>%
      group_by(cliente_id) %>%
      summarise(frequencia = n(),
                monetario  = sum(valor_total, na.rm = TRUE))
  }
  rfm <- collect(rfm_sp)

  if (tem_data) {
    ult <- as.Date(substr(rfm$ultima_compra, 1, 10))
    ref <- max(ult, na.rm = TRUE) + 1
    rfm$recencia <- as.numeric(ref - ult)
    rfm$recencia[is.na(rfm$recencia)] <- max(rfm$recencia, na.rm = TRUE)
    rfm$ultima_compra <- NULL
  } else {
    cat("[aviso] Nenhuma coluna de data encontrada: segmentando só com frequência e monetário.\n")
  }

  feats <- intersect(c("recencia", "frequencia", "monetario"), names(rfm))
  rfm <- rfm %>% mutate(across(all_of(feats), as.numeric)) %>% drop_na(all_of(feats))

  if (nrow(rfm) <= opt$k) {
    cat(sprintf("[Spark] Poucos clientes (%d) para k=%d. Aguardando mais dados.\n", nrow(rfm), opt$k))
    return(invisible(FALSE))
  }

  # ---- Padronização + K-Means (MLlib)
  cat("[Spark MLlib] Padronizando variáveis e executando K-Means...\n")
  sdf <- copy_to(sc, rfm, "rfm", overwrite = TRUE)
  sdf_esc <- sdf %>%
    ft_vector_assembler(input_cols = feats, output_col = "features_raw") %>%
    ft_standard_scaler(input_col = "features_raw", output_col = "features",
                       with_mean = TRUE, with_std = TRUE)

  modelo <- ml_kmeans(sdf_esc, k = opt$k, seed = 42)
  pred <- ml_predict(modelo, sdf_esc) %>%
    select(dplyr::all_of(c("cliente_id", feats, "prediction"))) %>%
    collect()

  # Silhueta para diferentes k (diagnóstico, opcional)
  silhueta_k <- tryCatch({
    ks <- 2:min(8, nrow(rfm) - 1)
    map_dfr(ks, function(kk) {
      m <- ml_kmeans(sdf_esc, k = kk, seed = 42)
      s <- ml_clustering_evaluator(ml_predict(m, sdf_esc),
                                   features_col = "features",
                                   prediction_col = "prediction",
                                   metric_name = "silhouette")
      tibble(k = kk, silhueta = s)
    })
  }, error = function(e) {
    cat(sprintf("[aviso] Silhueta por k não calculada: %s\n", e$message))
    NULL
  })
  if (!is.null(silhueta_k)) {
    cat(sprintf("[diagnóstico] Silhueta com k=%d: %.3f\n", opt$k,
                silhueta_k$silhueta[silhueta_k$k == opt$k][1]))
  }

  # Rótulos estáveis: segmento ordenado pelo monetário médio
  pred <- rotular_clusters(pred, opt$k)
  cent <- pred %>%
    group_by(segmento) %>%
    summarise(across(all_of(feats), mean), clientes = n(), .groups = "drop")

  # Faturamento mensal (opcional)
  mensal <- NULL
  if (tem_data) {
    mensal <- tryCatch({
      base %>%
        mutate(mes = substr(as.character(!!rlang::sym(col_data)), 1, 7)) %>%
        group_by(mes) %>%
        summarise(faturamento = sum(valor_total, na.rm = TRUE)) %>%
        collect() %>%
        mutate(mes = as.Date(paste0(mes, "-01"))) %>%
        drop_na(mes) %>%
        arrange(mes)
    }, error = function(e) NULL)
  }

  # ---- MongoDB: segmentação
  resultados <- pred %>%
    transmute(cliente_id, across(all_of(feats)),
              cluster = prediction,
              segmento = as.character(segmento),
              data_processamento = Sys.time())

  cat("[MongoDB] Gravando resultados na coleção 'segmentacao_rfm'...\n")
  con <- mongo(collection = "segmentacao_rfm", db = DB, url = mongo_url)
  con$drop()
  con$insert(resultados)
  cat(sprintf("[sucesso] %d clientes segmentados e salvos no MongoDB!\n", nrow(resultados)))

  # ---- Gráficos
  cat("[gráficos] Gerando gráficos...\n")
  arquivos <- gerar_graficos(pred, cent, feats, silhueta_k, mensal)
  publicar_graficos(arquivos)

  invisible(TRUE)
}

# ---- Loop de vigia -----------------------------------------------------------
ultima_assinatura <- ""

repeat {
  sincronizar_dados()

  sig <- assinatura_dados()
  if (sig != "" && identical(sig, ultima_assinatura)) {
    cat("[vigiar VM3] Sem dados novos; nada a reprocessar.\n")
  } else {
    ok <- tryCatch(processar_spark_e_mongo(), error = function(e) {
      cat(sprintf("[erro] Falha no processamento: %s\n", e$message))
      FALSE
    })
    if (isTRUE(ok)) ultima_assinatura <- sig
  }

  if (isTRUE(opt$uma_vez)) break
  Sys.sleep(opt$intervalo)
}
