from datetime import datetime
from airflow.decorators import dag, task
from airflow.providers.mongo.hooks.mongo import MongoHook

@dag(
    dag_id='etl_clientes_mongo',
    start_date=datetime(2026, 1, 1),
    schedule='@daily',
    catchup=False,
    tags=['ETL', 'MongoDB', 'clientes'],
)
def etl_clientes():

    @task()
    def etl_completo():
        hook = MongoHook(mongo_conn_id='mongo_default')
        origem = hook.get_collection('clientes')
        destino = hook.get_collection('clientes_limpos')

        # Limpa a coleção de destino antes de carregar (opcional)
        destino.delete_many({})

        # Processa em lotes, sem carregar tudo na memória
        lote = []
        total_processado = 0
        total_inserido = 0

        for doc in origem.find({}, batch_size=1000):
            total_processado += 1

            # Descarta documentos com CPF "N/A" ou vazio
            if doc.get('CPF') == 'N/A' or not doc.get('CPF'):
                continue

            # Remove campos indesejados
            doc.pop('_id', None)
            doc.pop('Telefone', None)
            doc['processado_em'] = datetime.now().isoformat()

            lote.append(doc)

            # Insere quando o lote chega a 1000 documentos
            if len(lote) >= 1000:
                destino.insert_many(lote)
                total_inserido += len(lote)
                lote = []

        # Insere o que sobrou no último lote
        if lote:
            destino.insert_many(lote)
            total_inserido += len(lote)

        return {
            'total_lido': total_processado,
            'total_inserido': total_inserido,
        }

    etl_completo()

etl_clientes()


