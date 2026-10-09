import random
from datetime import date, timedelta

random.seed(42)

NUM_COMPRAS = 5000
NUM_CLIENTES = 150
NUM_PRODUTOS = 30

nomes = [
    "Ana Silva", "Bruno Souza", "Carlos Oliveira", "Daniela Santos",
    "Eduardo Pereira", "Fernanda Costa", "Gabriel Almeida",
    "Helena Rodrigues", "Igor Martins", "Juliana Ferreira",
    "Lucas Gomes", "Mariana Barbosa", "Nicolas Ribeiro",
    "Patricia Carvalho", "Rafael Lima", "Sofia Rocha",
    "Thiago Mendes", "Vanessa Dias", "Wesley Castro", "Yasmin Nunes",
    "Alice Monteiro", "Bernardo Teixeira", "Camila Azevedo", "Diego Cardoso",
    "Elisa Pacheco", "Felipe Moreira", "Giovana Freitas", "Henrique Duarte",
    "Isabela Campos", "João Pedro Batista", "Karina Lopes", "Leonardo Pinto",
    "Manuela Correia", "Nathan Vieira", "Olivia Machado", "Paulo Henrique Tavares",
    "Queila Andrade", "Ricardo Fonseca", "Sabrina Melo", "Tomás Guimarães",
    "Ursula Peixoto", "Vitor Hugo Rezende", "Wagner Siqueira", "Xênia Brandão",
    "Yuri Amorim", "Zélia Figueiredo", "Amanda Braga", "Benício Salgado",
    "Cecília Novaes", "Davi Lucca Amaral"
]

dominios = [
    "exemplo.com", "gmail.com", "hotmail.com", "outlook.com",
    "yahoo.com", "protonmail.com", "icloud.com", "live.com",
    "uol.com.br", "bol.com.br", "terra.com.br", "globo.com",
    "zoho.com", "mail.com", "gmx.com", "fastmail.com"
]

produtos_base = [
    ("Camiseta Básica", 59.90, "Algodão"),
    ("Calça Jeans", 129.90, "Denim"),
    ("Tênis Esportivo", 199.90, "Sintético"),
    ("Jaqueta", 249.90, "Poliéster"),
    ("Boné", 39.90, "Algodão"),
    ("Mochila", 119.90, "Poliéster"),
    ("Meia Esportiva", 24.90, "Algodão"),
    ("Camisa Social", 99.90, "Algodão"),
    ("Vestido Casual", 159.90, "Viscose"),
    ("Bermuda", 79.90, "Algodão"),
    ("Saia Midi", 119.90, "Poliéster"),
    ("Blusa de Frio", 149.90, "Lã"),
    ("Casaco de Inverno", 299.90, "Poliéster"),
    ("Shorts Jeans", 89.90, "Denim"),
    ("Regata", 34.90, "Algodão"),
    ("Polo", 79.90, "Piquet"),
    ("Legging", 69.90, "Elastano"),
    ("Top Fitness", 49.90, "Poliamida"),
    ("Sutiã", 59.90, "Algodão"),
    ("Cueca Boxer", 29.90, "Algodão"),
    ("Pijama", 109.90, "Algodão"),
    ("Robe", 139.90, "Microfibra"),
    ("Chinelo", 44.90, "Borracha"),
    ("Sandália", 129.90, "Couro Sintético"),
    ("Bota", 279.90, "Couro"),
    ("Sapato Social", 219.90, "Couro"),
    ("Mocassim", 189.90, "Couro"),
    ("Tênis Casual", 169.90, "Lona"),
    ("Cinto", 59.90, "Couro"),
    ("Carteira", 49.90, "Couro Sintético"),
    ("Cachecol", 69.90, "Tricô"),
    ("Luva", 49.90, "Poliéster"),
    ("Gorro", 44.90, "Acrílico"),
    ("Óculos de Sol", 149.90, "Policarbonato"),
    ("Relógio", 299.90, "Aço Inoxidável"),
    ("Colar", 79.90, "Prata"),
    ("Brinco", 39.90, "Banho de Ouro"),
    ("Pulseira", 59.90, "Aço"),
    ("Anel", 89.90, "Prata"),
    ("Máscara de Cílios", 49.90, "Sintético"),
    ("Carteira de Mão", 89.90, "Couro Sintético"),
    ("Bolsa Transversal", 159.90, "Couro Sintético"),
    ("Bolsa Tote", 199.90, "Lona"),
    ("Clutch", 129.90, "Sintético"),
    ("Necessaire", 69.90, "Nylon"),
    ("Mala de Viagem", 399.90, "Poliéster"),
    ("Guarda-Chuva", 49.90, "Nylon"),
    ("Meia Calça", 34.90, "Nylon"),
    ("Luvas de Inverno", 59.90, "Lã"),
    ("Touca de Banho", 24.90, "Silicone")
]

def cpf():
    return f"{random.randint(100, 999)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(10, 99)}"

def telefone():
    return f"({random.randint(11, 99)}) {random.randint(90000, 99999)}{random.randint(1000, 9999)}"

def data_aleatoria(inicio, fim):
    intervalo = (fim - inicio).days
    return inicio + timedelta(days=random.randint(0, intervalo))

def dinheiro(valor):
    return f"{valor:.2f}"

inicio = date(2024, 1, 1)
fim = date(2025, 12, 31)

clientes = []
for i in range(1, NUM_CLIENTES + 1):
    nome = random.choice(nomes)
    email_nome = nome.lower().replace(" ", ".")
    email = f"{email_nome}{i}@{random.choice(dominios)}"
    clientes.append([
        f"C{i:05d}",
        nome,
        email,
        cpf(),
        telefone()
    ])

produtos = []
for i in range(1, NUM_PRODUTOS + 1):
    nome, preco, material = random.choice(produtos_base)
    preco = round(preco * random.choice([0.9, 1.0, 1.1, 1.2]), 2)
    satisfacao = round(random.uniform(3.0, 5.0), 1)
    fabricacao = data_aleatoria(date(2023, 1, 1), date(2025, 6, 30))
    produtos.append([
        f"P{i:03d}",
        nome,
        preco,
        satisfacao,
        material,
        fabricacao.isoformat()
    ])

compras = []
for i in range(1, NUM_COMPRAS + 1):
    cliente = random.choice(clientes)
    produto = random.choice(produtos)
    quantidade = random.randint(1, 5)
    preco = produto[2]
    satisfacao = round(random.uniform(1.0, 5.0), 1)
    valor_total = round(quantidade * preco, 2)

    compras.append([
        f"CO{i:05d}",
        cliente[3],
        produto[0],
        data_aleatoria(inicio, fim).isoformat(),
        quantidade,
        preco,
        satisfacao,
        valor_total
    ])

# Problemas controlados de qualidade nos dados de compras
for i in random.sample(range(NUM_COMPRAS), 80):
    compras[i][1] = ""

for i in random.sample(range(NUM_COMPRAS), 60):
    compras[i][4] = ""

for i in random.sample(range(NUM_COMPRAS), 50):
    compras[i][6] = ""

for i in random.sample(range(NUM_COMPRAS), 50):
    compras[i][3] = compras[i][3].replace("-", "/")

for i in random.sample(range(NUM_COMPRAS), 40):
    compras[i][5] = str(compras[i][5]).replace(".", ",")

for i in random.sample(range(NUM_COMPRAS), 40):
    compras[i][6] = str(compras[i][6]).replace(".", ",")

for i in random.sample(range(NUM_COMPRAS), 30):
    compras[i][2] = compras[i][2].lower()

# Duplicidades controladas
for i in random.sample(range(NUM_COMPRAS), 50):
    compras.append(compras[i].copy())

# Categorias divergentes
for i in random.sample(range(len(compras)), 30):
    compras[i][2] = "produto_" + str(random.randint(1, NUM_PRODUTOS))

# Problemas controlados nas tabelas auxiliares
clientes[3][2] = clientes[3][2].upper()
clientes[7][4] = clientes[7][4].replace(" ", "")
clientes[12][3] = ""
clientes[18][1] = "Ana  Silva"

produtos[2][4] = "algodao"
produtos[5][5] = produtos[5][5].replace("-", "/")
produtos[9][2] = ""
produtos[14][3] = ""

with open("dados_brutos_5000.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("=== TABELA: COMPRAS ===\n")
    arquivo.write("ID_Compra,CPF_Cliente,ID_Produto,Data_Compra,Quantidade,Preco_Unitario,Satisfacao,Valor_Total\n")

    for compra in compras:
        arquivo.write(",".join(map(str, compra)) + "\n")

    arquivo.write("\n=== TABELA: PRODUTOS ===\n")
    arquivo.write("ID_Produto,Produto,Preco_Unitario,Satisfacao_Media,Material,Data_Fabricacao\n")

    for produto in produtos:
        arquivo.write(",".join(map(str, produto)) + "\n")

    arquivo.write("\n=== TABELA: CLIENTES ===\n")
    arquivo.write("ID,Nome,Email,CPF,Telefone\n")

    for cliente in clientes:
        arquivo.write(",".join(map(str, cliente)) + "\n")

print(f"Arquivo gerado: dados_brutos_5000.txt")
print(f"Registros de compras: {len(compras)}")
print(f"Clientes: {len(clientes)}")
print(f"Produtos: {len(produtos)}")
