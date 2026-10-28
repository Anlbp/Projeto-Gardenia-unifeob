"""
Popula o MongoDB com os dados de demonstração (os mesmos da versão
em JSON), só pra você já ter algo pra ver na tela assim que conectar.

Como usar:
    1. Preencha o MONGODB_URI no arquivo .env
    2. python seed_db.py

Rodar de novo NÃO duplica os dados — ele limpa as coleções antes de
inserir. Se quiser preservar o que já está no banco, comente as
linhas "delete_many".
"""

import json
import os
from werkzeug.security import generate_password_hash
from db import get_db

SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")


def read_json(name):
    with open(os.path.join(SEED_DIR, name), "r", encoding="utf-8") as f:
        return json.load(f)


def seed():
    db = get_db()  # já cria os índices únicos (ver db.py)

    # ---- Produtos da loja (catálogo público) ----
    products = read_json("products.json")
    for p in products:
        p["_id"] = p["id"]
    db.products.delete_many({})
    if products:
        db.products.insert_many(products)
    print(f"✓ products: {len(products)} itens")

    # ---- Estoque interno (Portal) ----
    estoque = read_json("estoque.json")
    for p in estoque:
        p["_id"] = p["sku"]
    db.estoque.delete_many({})
    if estoque:
        db.estoque.insert_many(estoque)
    print(f"✓ estoque: {len(estoque)} itens")

    # ---- Clientes (senha de demonstração: 123456 pra todos) ----
    clients = read_json("clients.json")
    for c in clients:
        c["_id"] = c["cpf"]
        if "senha_hash" not in c or not c["senha_hash"]:
            c["senha_hash"] = generate_password_hash("123456")
    db.clients.delete_many({})
    if clients:
        db.clients.insert_many(clients)
    print(f"✓ clients: {len(clients)} itens (senha padrão: 123456)")

    # ---- Funcionários (senha de demonstração: 123456 pra todos) ----
    employees = read_json("employees.json")
    for e in employees:
        e["_id"] = e["id"]
        if "senha_hash" not in e or not e["senha_hash"]:
            e["senha_hash"] = generate_password_hash("123456")
    db.employees.delete_many({})
    if employees:
        db.employees.insert_many(employees)
    print(f"✓ employees: {len(employees)} itens (senha padrão: 123456)")

    # ---- Vendas ----
    sales = read_json("sales.json")
    for s in sales:
        s["_id"] = s["id"]
    db.sales.delete_many({})
    if sales:
        db.sales.insert_many(sales)
    print(f"✓ sales: {len(sales)} itens")

    # ---- Financeiro ----
    finance = read_json("finance.json")
    for row in finance:
        row["_id"] = row["id"]
    db.finance.delete_many({})
    if finance:
        db.finance.insert_many(finance)
    print(f"✓ finance: {len(finance)} itens")

    print("\nPronto! Banco populado com os dados de demonstração.")


if __name__ == "__main__":
    seed()
