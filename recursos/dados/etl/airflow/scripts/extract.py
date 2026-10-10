"""
Módulo de extração de dados do MongoDB.
"""
from typing import Iterator
from airflow.providers.mongo.hooks.mongo import MongoHook


def extrair_clientes(
    mongo_conn_id: str = 'mongo_default',
    database: str = 'clientes',
    collection: str = 'clientes',
    batch_size: int = 1000,
) -> Iterator[dict]:
    """
    Extrai documentos da coleção de clientes em lotes (generator).

    Usar generator evita carregar 30 mil documentos na memória de uma vez.

    Args:
        mongo_conn_id: ID da conexão configurada no Airflow.
        database: Nome do banco de dados.
        collection: Nome da coleção de origem.
        batch_size: Tamanho do lote para leitura em streaming.

    Yields:
        Cada documento da coleção, um por vez.
    """
    hook = MongoHook(mongo_conn_id=mongo_conn_id)
    col = hook.get_collection(collection, mongo_db=database)

    for doc in col.find({}, batch_size=batch_size):
        yield doc
