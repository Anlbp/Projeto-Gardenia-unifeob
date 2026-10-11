"""
Conexão com o MongoDB (Atlas ou local) — o único arquivo do projeto que
sabe que existe um banco Mongo por trás. Se um dia trocar de banco, é
aqui que mexe.

A connection string fica no arquivo `.env`, na variável MONGODB_URI.
Troque pela sua string do MongoDB Atlas (Database > Connect > Drivers)
quando for usar de verdade.
"""

from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError

import config

_client = None
_db = None


class DatabaseNotConfigured(Exception):
    """Levantada quando o .env ainda não tem uma connection string válida,
    ou quando a conexão com o Mongo falha por qualquer motivo."""
    pass


def get_db():
    """
    Retorna o banco (lazy connect: só conecta de verdade na primeira vez
    que alguma rota precisa dele — assim o servidor ainda sobe mesmo que
    o Mongo não esteja configurado ainda, e cada rota mostra um aviso
    claro em vez de quebrar).
    """
    global _client, _db

    if _db is not None:
        return _db

    if not config.MONGODB_URI or "coloque-aqui" in config.MONGODB_URI:
        raise DatabaseNotConfigured(
            "MONGODB_URI não configurado. Abra backend/.env e cole a "
            "connection string do seu cluster MongoDB Atlas na variável MONGODB_URI."
        )

    try:
        _client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")  # força a conexão agora, pra falhar cedo se algo estiver errado
        _db = _client[config.MONGODB_DB]
        ensure_indexes(_db)
        return _db
    except PyMongoError as exc:
        raise DatabaseNotConfigured(
            f"Não foi possível conectar ao MongoDB: {exc}. Confira a connection "
            "string, o usuário/senha e se o seu IP está liberado no Network "
            "Access do MongoDB Atlas."
        ) from exc


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
