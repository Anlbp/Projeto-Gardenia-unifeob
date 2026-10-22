#!/usr/bin/env Rscript

# Argumentos via linha de comando
args <- commandArgs(trailingOnly = TRUE)
ciclos <- 5
intervalo <- 10
saida <- "saida"

for (i in seq_along(args)) {
  if (args[i] == "--ciclos" && (i + 1) <= length(args)) ciclos <- as.integer(args[i + 1])
  if (args[i] == "--intervalo" && (i + 1) <= length(args)) intervalo <- as.integer(args[i + 1])
  if (args[i] == "--saida" && (i + 1) <= length(args)) saida <- args[i + 1]
}

dir.create(saida, showWarnings = FALSE, recursive = TRUE)

gerar_ciclo <- function(c) {
  cat(sprintf("[simulador R] Gerando dados do ciclo %d...\n", c))

  # 1. Tabela Clientes (com anomalias propositais para testar a VM 2)
  clientes <- data.frame(
    id = 1:15,
    nome = c("Ana Silva", "bruno souza", "CARLOS OLIVEIRA", "Daniela Lima", "Eduardo Santos"),
    email = c("ana@email.com", "bruno.email.com", "carlos@email.com", "daniela@email.com", "eduardo@email.com"),
    idade = c(25, 30, 150, 42, -5),
    telefone = "(11) 99999-8888",
    cpf = "123.456.789-00",
    data_nascimento = "1990-01-01",
    data_cadastro = as.character(Sys.Date()),
    inconsistente = c("False", "True", "True", "False", "True")
  )

  # 2. Tabela Produtos
  produtos <- data.frame(
    id = 1:10,
    nome = c("Camiseta", "Calça Jeans", "Jaqueta", "Tênis", "Meia"),
    categoria = c("Roupas", "Roupas", "Roupas", "Esportes", "CategoriaInvalida"),
    preco = c(49.9, 120.0, -10.0, 250.0, 15.0),
    estoque = c(10, 5, -2, 20, 100),
    peso = 0.5,
    satisfacao_media = 4.5,
    data_cadastro = as.character(Sys.Date()),
    inconsistente = c("False", "False", "True", "False", "True")
  )

  # 3. Tabela Compras
  compras <- data.frame(
    id = 1:20,
    cliente_id = sample(1:15, 20, replace = TRUE),
    produto_id = sample(1:10, 20, replace = TRUE),
    quantidade = c(1, 2, 0, 3, -1),
    valor_total = c(50.0, 100.0, 0.0, 150.0, 200.0),
    desconto = 0,
    data_compra = as.character(Sys.Date()),
    status = c("pago", "pendente", "cancelado", "entregue", "invalido"),
    satisfacao = 5,
    inconsistente = c("False", "False", "True", "False", "True")
  )

  # Gravando os CSVs brutos do ciclo
  write.csv(clientes, file.path(saida, sprintf("clientes_%d.csv", c)), row.names = FALSE, quote = FALSE)
  write.csv(produtos, file.path(saida, sprintf("produtos_%d.csv", c)), row.names = FALSE, quote = FALSE)
  write.csv(compras, file.path(saida, sprintf("compras_%d.csv", c)), row.names = FALSE, quote = FALSE)

  # Marcador de ciclo pronto (usado como sinalizador pela VM 2)
  writeLines(sprintf('{"ciclo": %d, "status": "pronto"}', c), file.path(saida, sprintf("ciclo_%d.pronto", c)))
  cat(sprintf("[simulador R] Ciclo %d gravado na pasta '%s/'.\n", c, saida))
}

c <- 1
while (ciclos == 0 || c <= ciclos) {
  gerar_ciclo(c)
  c <- c + 1
  if (ciclos != 0 && c > ciclos) break
  Sys.sleep(intervalo)
}