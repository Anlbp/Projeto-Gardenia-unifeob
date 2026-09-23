import random
import csv
from datetime import date, datetime, timedelta

random.seed(42)

NUM_COMPRAS = 15000
NUM_CLIENTES = 800
NUM_PRODUTOS = 100

nomes = [
    "Ana Silva", "Bruno Souza", "Carlos Oliveira", "Daniela Santos",
    "Eduardo Pereira", "Fernanda Costa", "Gabriel Almeida",
    "Helena Rodrigues", "Igor Martins", "Juliana Ferreira",
    "Lucas Gomes", "Mariana Barbosa", "Nicolas Ribeiro",
    "Patricia Carvalho", "Rafael Lima", "Sofia Rocha",
    "Thiago Mendes", "Vanessa Dias", "Wesley Castro", "Yasmin Nunes",
    "Alice Monteiro", "Bernardo Teixeira", "Camila Azevedo",
    "Diego Cardoso", "Elisa Pacheco", "Felipe Moreira",
    "Giovana Freitas", "Henrique Duarte", "Isabela Campos",
    "João Pedro Batista", "Karina Lopes", "Leonardo Pinto",
    "Manuela Correia", "Nathan Vieira", "Olivia Machado",
    "Paulo Henrique Tavares", "Queila Andrade", "Ricardo Fonseca",
    "Sabrina Melo", "Tomás Guimarães", "Ursula Peixoto",
    "Vitor Hugo Rezende", "Wagner Siqueira", "Xênia Brandão",
    "Yuri Amorim", "Zélia Figueiredo", "Amanda Braga",
    "Benício Salgado", "Cecília Novaes", "Davi Lucca Amaral",
    "Beatriz Martins", "Caio Mendes", "Laura Fernandes",
    "Gustavo Ramos", "Isadora Teixeira", "Matheus Rocha",
    "Letícia Cardoso", "João Victor Alves", "Maria Eduarda Lopes",
    "Enzo Barbosa", "Clara Ribeiro", "Arthur Costa",
    "Valentina Dias", "Pedro Henrique Souza", "Lívia Oliveira",
    "Miguel Santos", "Manuela Silva", "Rafaela Almeida",
    "Samuel Pereira", "Lorena Rodrigues", "Henrique Martins"
]

dominios = [
    "gmail.com",
    "hotmail.com",
    "outlook.com",
    "yahoo.com",
    "protonmail.com",
    "icloud.com",
    "live.com",
    "uol.com.br",
    "bol.com.br",
    "terra.com.br",
    "globo.com",
    "zoho.com",
    "mail.com",
    "gmx.com",
    "fastmail.com"
]

cidades = [
    ("São Paulo", "SP"),
    ("Poços de Caldas", "MG"),
    ("Campinas", "SP"),
    ("Belo Horizonte", "MG"),
    ("Rio de Janeiro", "RJ"),
    ("Curitiba", "PR"),
    ("Porto Alegre", "RS"),
    ("Florianópolis", "SC"),
    ("Brasília", "DF"),
    ("Salvador", "BA"),
    ("Recife", "PE"),
    ("Fortaleza", "CE"),
    ("Goiânia", "GO"),
    ("Ribeirão Preto", "SP"),
    ("Uberlândia", "MG"),
    ("Sorocaba", "SP"),
    ("Santos", "SP"),
    ("Juiz de Fora", "MG"),
    ("Londrina", "PR"),
    ("Maringá", "PR")
]

marcas = [
    "Gardênia",
    "Nike",
    "Adidas",
    "Puma",
    "Lacoste",
    "Hering",
    "Renner",
    "Zara",
    "Reserva",
    "Colcci",
    "Levi's",
    "Fila",
    "Olympikus",
    "Mizuno",
    "Calvin Klein",
    "Aramis",
    "Riachuelo",
    "C&A"
]

produtos_base = [
    ("Camiseta Básica", 59.90, "Algodão", "Camisetas"),
    ("Calça Jeans", 129.90, "Denim", "Calças"),
    ("Tênis Esportivo", 199.90, "Sintético", "Calçados"),
    ("Jaqueta", 249.90, "Poliéster", "Casacos"),
    ("Boné", 39.90, "Algodão", "Acessórios"),
    ("Mochila", 119.90, "Poliéster", "Acessórios"),
    ("Meia Esportiva", 24.90, "Algodão", "Roupas"),
    ("Camisa Social", 99.90, "Algodão", "Camisas"),
    ("Vestido Casual", 159.90, "Viscose", "Vestidos"),
    ("Bermuda", 79.90, "Algodão", "Bermudas"),
    ("Saia Midi", 119.90, "Poliéster", "Saias"),
    ("Blusa de Frio", 149.90, "Lã", "Casacos"),
    ("Casaco de Inverno", 299.90, "Poliéster", "Casacos"),
    ("Shorts Jeans", 89.90, "Denim", "Bermudas"),
    ("Regata", 34.90, "Algodão", "Camisetas"),
    ("Polo", 79.90, "Piquet", "Camisas"),
    ("Legging", 69.90, "Elastano", "Roupas"),
    ("Top Fitness", 49.90, "Poliamida", "Roupas"),
    ("Sutiã", 59.90, "Algodão", "Roupas"),
    ("Cueca Boxer", 29.90, "Algodão", "Roupas"),
    ("Pijama", 109.90, "Algodão", "Roupas"),
    ("Robe", 139.90, "Microfibra", "Roupas"),
    ("Chinelo", 44.90, "Borracha", "Calçados"),
    ("Sandália", 129.90, "Couro Sintético", "Calçados"),
    ("Bota", 279.90, "Couro", "Calçados"),
    ("Sapato Social", 219.90, "Couro", "Calçados"),
    ("Mocassim", 189.90, "Couro", "Calçados"),
    ("Tênis Casual", 169.90, "Lona", "Calçados"),
    ("Cinto", 59.90, "Couro", "Acessórios"),
    ("Carteira", 49.90, "Couro Sintético", "Acessórios"),
    ("Cachecol", 69.90, "Tricô", "Acessórios"),
    ("Luva", 49.90, "Poliéster", "Acessórios"),
    ("Gorro", 44.90, "Acrílico", "Acessórios"),
    ("Óculos de Sol", 149.90, "Policarbonato", "Acessórios"),
    ("Relógio", 299.90, "Aço Inoxidável", "Acessórios"),
    ("Colar", 79.90, "Prata", "Acessórios"),
    ("Brinco", 39.90, "Banho de Ouro", "Acessórios"),
    ("Pulseira", 59.90, "Aço", "Acessórios"),
    ("Anel", 89.90, "Prata", "Acessórios"),
    ("Máscara de Cílios", 49.90, "Sintético", "Cosméticos"),
    ("Carteira de Mão", 89.90, "Couro Sintético", "Bolsas"),
    ("Bolsa Transversal", 159.90, "Couro Sintético", "Bolsas"),
    ("Bolsa Tote", 199.90, "Lona", "Bolsas"),
    ("Clutch", 129.90, "Sintético", "Bolsas"),
    ("Necessaire", 69.90, "Nylon", "Acessórios"),
    ("Mala de Viagem", 399.90, "Poliéster", "Bolsas"),
    ("Guarda-Chuva", 49.90, "Nylon", "Acessórios"),
    ("Meia Calça", 34.90, "Nylon", "Roupas"),
    ("Luvas de Inverno", 59.90, "Lã", "Acessórios"),
    ("Touca de Banho", 24.90, "Silicone", "Acessórios")
]

formas_pagamento = [
    "PIX",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Dinheiro",
    "Boleto",
    "Vale-presente"
]

status_produto = [
    "Ativo",
    "Ativo",
    "Ativo",
    "Ativo",
    "Inativo",
    "Esgotado"
]


def cpf():
    return (
        f"{random.randint(100, 999)}."
        f"{random.randint(100, 999)}."
        f"{random.randint(100, 999)}-"
        f"{random.randint(10, 99)}"
    )


def telefone():
    return (
        f"({random.randint(11, 99)}) "
        f"{random.randint(90000, 99999)}"
        f"{random.randint(1000, 9999)}"
    )


def data_aleatoria(inicio, fim):
    intervalo = (fim - inicio).days
    return inicio + timedelta(
        days=random.randint(0, intervalo)
    )


def alterar_nome(nome):
    tipo = random.randint(1, 5)

    if tipo == 1:
        return nome.upper()

    if tipo == 2:
        return nome.lower()

    if tipo == 3:
        return " " + nome

    if tipo == 4:
        return nome + " "

    partes = nome.split(" ")

    if len(partes) > 1:
        posicao = random.randint(0, len(partes) - 1)
        partes[posicao] += "  "

    return " ".join(partes)


def alterar_email(email):
    tipo = random.randint(1, 6)

    if tipo == 1:
        return email.upper()

    if tipo == 2:
        return email.replace("@", "")

    if tipo == 3:
        return email.replace(".com", ".con")

    if tipo == 4:
        return email.replace("@", " @")

    if tipo == 5:
        return email + " "

    return email.replace(".", "..", 1)


def alterar_telefone(telefone_original):
    tipo = random.randint(1, 5)

    if tipo == 1:
        return telefone_original.replace(" ", "")

    if tipo == 2:
        return telefone_original.replace("(", "").replace(")", "")

    if tipo == 3:
        return telefone_original.replace("-", "")

    if tipo == 4:
        return ""

    return "55" + telefone_original.replace(" ", "")


def alterar_cpf(cpf_original):
    tipo = random.randint(1, 5)

    if tipo == 1:
        return cpf_original.replace(".", "").replace("-", "")

    if tipo == 2:
        return cpf_original.replace(".", " ")

    if tipo == 3:
        return cpf_original.upper()

    if tipo == 4:
        return ""

    return cpf_original + " "


inicio = date(2024, 1, 1)
fim = date(2025, 12, 31)

data_hora_geracao = datetime.now().strftime(
    "%Y-%m-%d %H:%M:%S"
)


clientes = []

for i in range(1, NUM_CLIENTES + 1):

    nome = random.choice(nomes)

    email_nome = (
        nome.lower()
        .replace(" ", ".")
        .replace("á", "a")
        .replace("ã", "a")
        .replace("é", "e")
        .replace("ê", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ô", "o")
        .replace("ú", "u")
        .replace("ç", "c")
    )

    email = (
        f"{email_nome}{i}"
        f"@{random.choice(dominios)}"
    )

    cidade, estado = random.choice(cidades)

    clientes.append([
        f"C{i:05d}",
        nome,
        email,
        cpf(),
        telefone(),
        cidade,
        estado,
        data_aleatoria(
            date(2022, 1, 1),
            date(2025, 12, 31)
        ).isoformat(),
        data_hora_geracao
    ])


produtos = []

for i in range(1, NUM_PRODUTOS + 1):

    nome, preco_base, material, categoria = (
        random.choice(produtos_base)
    )

    preco = round(
        preco_base *
        random.choice([
            0.75, 0.85, 0.90,
            1.0, 1.0, 1.0,
            1.10, 1.20, 1.35
        ]),
        2
    )

    satisfacao = round(
        random.uniform(2.5, 5.0),
        1
    )

    estoque = random.randint(0, 250)

    fabricacao = data_aleatoria(
        date(2023, 1, 1),
        date(2025, 6, 30)
    )

    marca = random.choice(marcas)

    produtos.append([
        f"P{i:04d}",
        nome,
        preco,
        satisfacao,
        material,
        categoria,
        marca,
        estoque,
        random.choice(status_produto),
        fabricacao.isoformat(),
        data_hora_geracao
    ])


compras = []

for i in range(1, NUM_COMPRAS + 1):

    cliente = random.choice(clientes)
    produto = random.choice(produtos)

    quantidade = random.randint(1, 5)

    preco = produto[2]

    satisfacao = round(
        random.uniform(1.0, 5.0),
        1
    )

    valor_total = round(
        quantidade * preco,
        2
    )

    desconto = random.choice([
        0, 0, 0, 0.05,
        0.10, 0.15, 0.20
    ])

    valor_com_desconto = round(
        valor_total * (1 - desconto),
        2
    )

    compras.append([
        f"CO{i:06d}",
        cliente[3],
        produto[0],
        data_aleatoria(
            inicio,
            fim
        ).isoformat(),
        quantidade,
        preco,
        satisfacao,
        valor_total,
        desconto,
        valor_com_desconto,
        random.choice(formas_pagamento),
        data_hora_geracao
    ])


# ============================================================
# INCONSISTÊNCIAS NOS CLIENTES
# ============================================================

for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.06)
):
    clientes[i][1] = alterar_nome(clientes[i][1])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.05)
):
    clientes[i][2] = alterar_email(clientes[i][2])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.04)
):
    clientes[i][3] = alterar_cpf(clientes[i][3])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.05)
):
    clientes[i][4] = alterar_telefone(clientes[i][4])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.04)
):
    cidade = clientes[i][5]

    clientes[i][5] = random.choice([
        cidade.upper(),
        cidade.lower(),
        " " + cidade,
        cidade + " "
    ])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.03)
):
    clientes[i][6] = random.choice([
        clientes[i][6].lower(),
        clientes[i][6].upper() + " ",
        "",
        "SP",
        "MG"
    ])


for i in random.sample(
    range(NUM_CLIENTES),
    int(NUM_CLIENTES * 0.04)
):
    clientes[i][7] = random.choice([
        clientes[i][7].replace("-", "/"),
        clientes[i][7].replace("-", ""),
        "",
        clientes[i][7] + " "
    ])


# ============================================================
# INCONSISTÊNCIAS NOS PRODUTOS
# ============================================================

for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.08)
):
    produtos[i][1] = random.choice([
        produtos[i][1].upper(),
        produtos[i][1].lower(),
        " " + produtos[i][1],
        produtos[i][1] + " ",
        produtos[i][1].replace(" ", "  ")
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.05)
):
    produtos[i][2] = random.choice([
        "",
        str(produtos[i][2]).replace(".", ","),
        str(produtos[i][2]) + " ",
        None
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.05)
):
    produtos[i][3] = random.choice([
        "",
        None,
        0,
        5.5,
        6.0
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.08)
):
    produtos[i][4] = random.choice([
        produtos[i][4].lower(),
        produtos[i][4].upper(),
        " " + produtos[i][4],
        produtos[i][4] + " ",
        produtos[i][4].replace("ã", "a")
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.06)
):
    produtos[i][5] = random.choice([
        produtos[i][5].lower(),
        produtos[i][5].upper(),
        produtos[i][5] + " ",
        "",
        "categoria_desconhecida"
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.06)
):
    produtos[i][6] = random.choice([
        produtos[i][6].lower(),
        produtos[i][6].upper(),
        produtos[i][6] + " ",
        ""
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.05)
):
    produtos[i][7] = random.choice([
        "",
        -1,
        -10,
        None,
        produtos[i][7]
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.04)
):
    produtos[i][8] = random.choice([
        "",
        "ativo",
        "ATIVO",
        "Disponível",
        "desconhecido"
    ])


for i in random.sample(
    range(NUM_PRODUTOS),
    int(NUM_PRODUTOS * 0.06)
):
    produtos[i][9] = random.choice([
        produtos[i][9].replace("-", "/"),
        produtos[i][9].replace("-", ""),
        "",
        produtos[i][9] + " "
    ])


# ============================================================
# INCONSISTÊNCIAS NAS COMPRAS
# ============================================================

for i in random.sample(
    range(NUM_COMPRAS),
    150
):
    compras[i][1] = ""


for i in random.sample(
    range(NUM_COMPRAS),
    100
):
    if compras[i][1]:
        compras[i][1] = (
            compras[i][1]
            .replace(".", "")
            .replace("-", "")
        )


for i in random.sample(
    range(NUM_COMPRAS),
    100
):
    compras[i][2] = compras[i][2].lower()


for i in random.sample(
    range(NUM_COMPRAS),
    70
):
    compras[i][2] = (
        "produto_" +
        str(random.randint(1, NUM_PRODUTOS + 30))
    )


for i in random.sample(
    range(NUM_COMPRAS),
    120
):
    compras[i][3] = random.choice([
        compras[i][3].replace("-", "/"),
        compras[i][3].replace("-", ""),
        "",
        compras[i][3] + " "
    ])


for i in random.sample(
    range(NUM_COMPRAS),
    100
):
    compras[i][4] = random.choice([
        "",
        None,
        0,
        -1
    ])


for i in random.sample(
    range(NUM_COMPRAS),
    100
):
    if compras[i][5] is not None:
        compras[i][5] = str(
            compras[i][5]
        ).replace(".", ",")


for i in random.sample(
    range(NUM_COMPRAS),
    50
):
    compras[i][5] = ""


for i in random.sample(
    range(NUM_COMPRAS),
    100
):
    compras[i][6] = random.choice([
        "",
        None,
        0
    ])


for i in random.sample(
    range(NUM_COMPRAS),
    80
):
    if compras[i][6] is not None:
        compras[i][6] = str(
            compras[i][6]
        ).replace(".", ",")


for i in random.sample(
    range(NUM_COMPRAS),
    50
):
    compras[i][7] = ""


for i in random.sample(
    range(NUM_COMPRAS),
    70
):
    compras[i][8] = random.choice([
        "",
        None,
        "10%",
        "0,10",
        -0.5,
        2
    ])


for i in random.sample(
    range(NUM_COMPRAS),
    80
):
    compras[i][10] = random.choice([
        "",
        "pix",
        "PIX ",
        "cartao",
        "Cartão",
        "Dinheiro ",
        "desconhecido"
    ])


# ============================================================
# DUPLICIDADES
# ============================================================

for i in random.sample(
    range(NUM_COMPRAS),
    150
):
    compras.append(
        compras[i].copy()
    )


# ============================================================
# GERAÇÃO DOS CSVs
# ============================================================

with open(
    "clientes.csv",
    "w",
    newline="",
    encoding="utf-8-sig"
) as arquivo:

    escritor = csv.writer(arquivo)

    escritor.writerow([
        "ID",
        "Nome",
        "Email",
        "CPF",
        "Telefone",
        "Cidade",
        "Estado",
        "Data_Cadastro",
        "Data_Hora_Geracao"
    ])

    escritor.writerows(clientes)


with open(
    "produtos.csv",
    "w",
    newline="",
    encoding="utf-8-sig"
) as arquivo:

    escritor = csv.writer(arquivo)

    escritor.writerow([
        "ID_Produto",
        "Produto",
        "Preco_Unitario",
        "Satisfacao_Media",
        "Material",
        "Categoria",
        "Marca",
        "Estoque",
        "Status",
        "Data_Fabricacao",
        "Data_Hora_Geracao"
    ])

    escritor.writerows(produtos)


with open(
    "compras.csv",
    "w",
    newline="",
    encoding="utf-8-sig"
) as arquivo:

    escritor = csv.writer(arquivo)

    escritor.writerow([
        "ID_Compra",
        "CPF_Cliente",
        "ID_Produto",
        "Data_Compra",
        "Quantidade",
        "Preco_Unitario",
        "Satisfacao",
        "Valor_Total",
        "Desconto",
        "Valor_Com_Desconto",
        "Forma_Pagamento",
        "Data_Hora_Geracao"
    ])

    escritor.writerows(compras)


print()

print("GERADOR DE DADOS - LOJA DE ROUPAS GARDÊNIA")
print()
print(f"Data e hora da geração: {data_hora_geracao}")
print()
print("Arquivos gerados:")
print(" - clientes.csv")
print(" - produtos.csv")
print(" - compras.csv")
print()
print(f"Clientes gerados: {len(clientes)}")
print(f"Produtos gerados: {len(produtos)}")
print(f"Compras geradas: {len(compras)}")
print()
print("Geração concluída com sucesso.")