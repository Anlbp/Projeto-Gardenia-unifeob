"""
Módulo de carga de dados no MongoDB.
"""
from airflow.providers.mongo.hooks.mongo import MongoHook


def carregar_clientes(
    docs: list[dict],
    mongo_conn_id: str = 'mongo_default',
    database: str = 'clientes',
    collection: str = 'clientes_limpos',
    batch_size: int = 1000,
    limpar_antes: bool = True,
) -> int:
    """
    Carrega documentos na coleção de destino em lotes.

    Args:
        docs: Lista de documentos transformados.
        mongo_conn_id: ID da conexão Airflow.
        database: Banco de dados.
        collection: Coleção de destino.
        batch_size: Tamanho de cada insert_many.
        limpar_antes: Se True, apaga a coleção antes de inserir.

    Returns:
        Quantidade de documentos inseridos.
    """
    hook = MongoHook(mongo_conn_id=mongo_conn_id)
    col = hook.get_collection(collection, mongo_db=database)

    if limpar_antes:
        col.delete_many({})

    total_inserido = 0
    for i in range(0, len(docs), batch_size):
        lote = docs[i:i + batch_size]
        if lote:
            col.insert_many(lote)
            total_inserido += len(lote)

    return total_inserido
