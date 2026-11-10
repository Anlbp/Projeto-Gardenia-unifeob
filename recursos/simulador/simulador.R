#!/usr/bin/env Rscript

# Argumentos via linha de comando
args <- commandArgs(trailingOnly = TRUE)
ciclos <- 5
intervalo <- 10
saida <- "saida"
linhas <- 2000  # linhas por CSV

for (i in seq_along(args)) {
  if (args[i] == "--ciclos" && (i + 1) <= length(args)) ciclos <- as.integer(args[i + 1])
  if (args[i] == "--intervalo" && (i + 1) <= length(args)) intervalo <- as.integer(args[i + 1])
  if (args[i] == "--saida" && (i + 1) <= length(args)) saida <- args[i + 1]
  if (args[i] == "--linhas" && (i + 1) <= length(args)) linhas <- as.integer(args[i + 1])
}

dir.create(saida, showWarnings = FALSE, recursive = TRUE)

# ---------------------------------------------------------------------------
# Bases para gerar dados variados
# ---------------------------------------------------------------------------
nomes <- c("Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel",
           "Helena", "Igor", "Juliana", "Lucas", "Mariana", "Rafael", "Sofia",
           "Thiago", "Vitor", "Camila", "Rodrigo", "Beatriz", "Felipe", "Larissa",
           "Gustavo", "Renata", "Marcelo", "Aline", "Diego")
sobrenomes <- c("Silva", "Souza", "Oliveira", "Lima", "Santos", "Pereira", "Costa",
                "Rodrigues", "Almeida", "Nascimento", "Carvalho", "Ribeiro", "Martins",
                "Barbosa", "Rocha", "Dias", "Moreira", "Cardoso", "Teixeira", "Gomes")
dominios <- c("email.com", "gmail.com", "outlook.com", "hotmail.com", "yahoo.com.br")
ddds <- c(11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 31, 41, 51, 61, 71, 81, 85, 91)

# Categorias válidas são as mesmas do script original: Roupas e Esportes
catalogo <- list(
  Roupas   = c("Camiseta", "Calça Jeans", "Jaqueta", "Bermuda", "Vestido", "Moletom", "Camisa", "Saia"),
  Esportes = c("Tênis", "Bola", "Raquete", "Luva", "Meia", "Mochila Esportiva", "Garrafa Térmica")
)
modificadores <- c("Azul", "Preto", "Branco", "Vermelho", "Verde", "Cinza", "Slim", "Classic", "Pro", "Light")

# CPF com dígitos verificadores corretos (formato 000.000.000-00)
gerar_cpf <- function(n) {
  vapply(seq_len(n), function(i) {
    repeat {
      d <- sample(0:9, 9, replace = TRUE)
      if (length(unique(d)) > 1) break
    }
    r1 <- sum(d * 10:2) %% 11
    d10 <- if (r1 < 2) 0 else 11 - r1
    r2 <- sum(c(d, d10) * 11:2) %% 11
    d11 <- if (r2 < 2) 0 else 11 - r2
    x <- c(d, d10, d11)
    do.call(sprintf, c(list("%d%d%d.%d%d%d.%d%d%d-%d%d"), as.list(x)))
  }, character(1))
}

gerar_telefone <- function(n) {
  sprintf("(%d) 9%04d-%04d", sample(ddds, n, replace = TRUE),
          sample(0:9999, n, replace = TRUE), sample(0:9999, n, replace = TRUE))
}

# Distribui os tipos de linha de forma embaralhada, mantendo a proporção
# do script original (clientes 2/5 ok, produtos 3/5 ok, compras 3/5 ok)
distribuir <- function(n, tipos) sample(rep_len(tipos, n))

gerar_ciclo <- function(ciclo) {
  cat(sprintf("[simulador R] Gerando dados do ciclo %d (%d linhas por tabela)...\n", ciclo, linhas))
  n <- linhas
  hoje <- Sys.Date()

  # 1. Tabela Clientes (com anomalias propositais para testar a VM 2)
  # Anomalias (as mesmas do original):
  #   email   -> nome em minúsculas + e-mail sem "@"
  #   idade_alta -> nome em MAIÚSCULAS + idade 150
  #   idade_neg  -> idade -5
  tipo <- distribuir(n, c("ok", "ok", "email", "idade_alta", "idade_neg"))
  nome <- paste(sample(nomes, n, replace = TRUE), sample(sobrenomes, n, replace = TRUE))
  email <- paste0(tolower(gsub(" ", ".", nome)), sample(1:999, n, replace = TRUE),
                  "@", sample(dominios, n, replace = TRUE))
  idade_real <- sample(18:80, n, replace = TRUE)

  # Data de nascimento coerente com a idade real
  lt <- as.POSIXlt(rep(hoje, n))
  lt$year <- lt$year - idade_real
  data_nascimento <- as.character(as.Date(lt) - sample(0:364, n, replace = TRUE))

  idade <- idade_real
  idade[tipo == "idade_alta"] <- 150
  idade[tipo == "idade_neg"] <- -5
  email[tipo == "email"] <- sub("@", ".", email[tipo == "email"], fixed = TRUE)
  nome[tipo == "email"] <- tolower(nome[tipo == "email"])
  nome[tipo == "idade_alta"] <- toupper(nome[tipo == "idade_alta"])

  clientes <- data.frame(
    id = 1:n,
    nome = nome,
    email = email,
    idade = idade,
    telefone = gerar_telefone(n),
    cpf = gerar_cpf(n),
    data_nascimento = data_nascimento,
    data_cadastro = as.character(hoje - sample(365:1095, n, replace = TRUE)),
    inconsistente = ifelse(tipo == "ok", "False", "True")
  )

  # 2. Tabela Produtos
  # Anomalias (as mesmas do original):
  #   negativo  -> preço e estoque negativos
  #   categoria -> categoria "CategoriaInvalida"
  tipo <- distribuir(n, c("ok", "ok", "ok", "negativo", "categoria"))
  categoria <- sample(names(catalogo), n, replace = TRUE)
  nome <- vapply(categoria, function(cat) {
    paste(sample(catalogo[[cat]], 1), sample(modificadores, 1))
  }, character(1), USE.NAMES = FALSE)
  preco <- round(runif(n, 10, 500), 2)
  estoque <- sample(1:300, n, replace = TRUE)

  neg <- tipo == "negativo"
  preco[neg] <- -preco[neg]
  estoque[neg] <- -estoque[neg]
  categoria[tipo == "categoria"] <- "CategoriaInvalida"

  produtos <- data.frame(
    id = 1:n,
    nome = nome,
    categoria = categoria,
    preco = preco,
    estoque = estoque,
    peso = round(runif(n, 0.1, 5), 2),
    satisfacao_media = round(runif(n, 1, 5), 1),
    data_cadastro = as.character(hoje - sample(365:1095, n, replace = TRUE)),
    inconsistente = ifelse(tipo == "ok", "False", "True")
  )

  # 3. Tabela Compras
  # Anomalias (as mesmas do original):
  #   qtd_zero -> quantidade 0, valor_total 0, status "cancelado"
  #   qtd_neg  -> quantidade -1, status "invalido"
  tipo <- distribuir(n, c("ok", "ok", "ok", "qtd_zero", "qtd_neg"))
  quantidade <- sample(1:5, n, replace = TRUE)
  desconto <- sample(c(0, 0, 5, 10, 15), n, replace = TRUE)
  valor_total <- round(quantidade * runif(n, 10, 500) * (1 - desconto / 100), 2)
  status <- sample(c("pago", "pendente", "entregue"), n, replace = TRUE)

  quantidade[tipo == "qtd_zero"] <- 0
  valor_total[tipo == "qtd_zero"] <- 0
  status[tipo == "qtd_zero"] <- "cancelado"
  quantidade[tipo == "qtd_neg"] <- -1
  status[tipo == "qtd_neg"] <- "invalido"

  compras <- data.frame(
    id = 1:n,
    cliente_id = sample(1:n, n, replace = TRUE),
    produto_id = sample(1:n, n, replace = TRUE),
    quantidade = quantidade,
    valor_total = valor_total,
    desconto = desconto,
    data_compra = as.character(hoje - sample(0:364, n, replace = TRUE)),
    status = status,
    satisfacao = sample(1:5, n, replace = TRUE),
    inconsistente = ifelse(tipo == "ok", "False", "True")
  )

  # Gravando os CSVs brutos do ciclo
  write.csv(clientes, file.path(saida, sprintf("clientes_%d.csv", ciclo)), row.names = FALSE, quote = FALSE)
  write.csv(produtos, file.path(saida, sprintf("produtos_%d.csv", ciclo)), row.names = FALSE, quote = FALSE)
  write.csv(compras, file.path(saida, sprintf("compras_%d.csv", ciclo)), row.names = FALSE, quote = FALSE)

  # Marcador de ciclo pronto (usado como sinalizador pela VM 2)
  writeLines(sprintf('{"ciclo": %d, "status": "pronto"}', ciclo), file.path(saida, sprintf("ciclo_%d.pronto", ciclo)))
  cat(sprintf("[simulador R] Ciclo %d gravado na pasta '%s/'.\n", ciclo, saida))
}

n_ciclo <- 1
while (ciclos == 0 || n_ciclo <= ciclos) {
  gerar_ciclo(n_ciclo)
  n_ciclo <- n_ciclo + 1
  if (ciclos != 0 && n_ciclo > ciclos) break
  Sys.sleep(intervalo)
}
