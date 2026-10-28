"""
Conexão com o MongoDB (Atlas ou local) — o único arquivo do projeto que
sabe que existe um banco Mongo por trás. Se um dia trocar de banco, é
aqui que mexe.

A connection string fica no arquivo `.env`, na variável MONGODB_URI.
Troque pela sua string do MongoDB Atlas (Database > Connect > Drivers)
quando for usar de verdade.
"""

import os
import json
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
from werkzeug.security import generate_password_hash

import config

_client = None
_db = None

SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")


class DatabaseNotConfigured(Exception):
    """Levantada quando o .env ainda não tem uma connection string válida,
    ou quando a conexão com o Mongo falha por qualquer motivo."""
    pass


def auto_seed_mock(db):
    """Popula os dados de demonstração automaticamente no modo local."""
    def read_json(name):
        path = os.path.join(SEED_DIR, name)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    try:
        products = read_json("products.json")
        for p in products:
            p["_id"] = p["id"]
        if products:
            db.products.insert_many(products)

        estoque = read_json("estoque.json")
        for p in estoque:
            p["_id"] = p["sku"]
        if estoque:
            db.estoque.insert_many(estoque)

        clients = read_json("clients.json")
        for c in clients:
            c["_id"] = c["cpf"]
            if "senha_hash" not in c or not c["senha_hash"]:
                c["senha_hash"] = generate_password_hash("123456")
        if clients:
            db.clients.insert_many(clients)

        employees = read_json("employees.json")
        for e in employees:
            e["_id"] = e["id"]
            if "senha_hash" not in e or not e["senha_hash"]:
                e["senha_hash"] = generate_password_hash("123456")
        if employees:
            db.employees.insert_many(employees)

        sales = read_json("sales.json")
        for s in sales:
            s["_id"] = s["id"]
        if sales:
            db.sales.insert_many(sales)

        finance = read_json("finance.json")
        for f in finance:
            f["_id"] = f["id"]
        if finance:
            db.finance.insert_many(finance)
    except Exception as exc:
        print("Aviso ao carregar dados locais de demonstração:", exc)


def get_db():
    """
    Retorna o banco de dados.
    1. Se MONGODB_URI estiver configurada, conecta no MongoDB (Atlas ou local).
    2. Se não estiver configurada ou falhar, ativa o Modo Local em Memória (mongomock),
       populando os dados de demonstração automaticamente sem quebrar a aplicação!
    """
    global _client, _db

    if _db is not None:
        return _db

    # 1. Tentativa de conexão com MongoDB real (se configurado)
    if config.MONGODB_URI and "coloque-aqui" not in config.MONGODB_URI:
        try:
            _client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=4000)
            _client.admin.command("ping")
            _db = _client[config.MONGODB_DB]
            ensure_indexes(_db)
            print("[OK] Conectado com sucesso ao MongoDB!")
            return _db
        except PyMongoError as exc:
            print(f"[AVISO] Nao foi possivel conectar ao MongoDB remoto: {exc}")
            print("-> Alternando para o Modo Local em Memoria...")

    # 2. Fallback automático: Modo Local em Memória com mongomock
    try:
        import mongomock
        _client = mongomock.MongoClient()
        _db = _client[config.MONGODB_DB]
        auto_seed_mock(_db)
        ensure_indexes(_db)
        print("[OK] Modo Local em Memoria Ativado (mongomock)!")
        print("[OK] Banco inicializado e populado com dados de teste. Tudo pronto!")
        return _db
    except ImportError:
        raise DatabaseNotConfigured(
            "MONGODB_URI não configurado e mongomock não encontrado. "
            "Execute 'pip install mongomock' no terminal."
        )


def ensure_indexes(db):
    """
    Cria índices únicos no banco — é o próprio MongoDB quem passa a
    recusar duplicatas de e-mail, mesmo que dois cadastros cheguem ao
    mesmo tempo (uma checagem só em Python não garante isso sozinha).
    Rodar de novo não tem problema: create_index é idempotente.
    """
    db.clients.create_index([("email", ASCENDING)], unique=True)
    db.employees.create_index([("email", ASCENDING)], unique=True)
    # sku, cpf e id gerado já são o _id de cada coleção (únicos por padrão do Mongo)


def serialize(doc):
    """Remove o campo interno _id do documento antes de mandar pro front-end."""
    if doc is None:
        return None
    d = dict(doc)
    d.pop("_id", None)
    return d


def serialize_many(cursor):
    return [serialize(d) for d in cursor]
