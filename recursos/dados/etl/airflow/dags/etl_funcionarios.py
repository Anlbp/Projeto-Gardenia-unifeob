from datetime import datetime
from airflow.decorators import dag, task
from airflow.providers.mongo.hooks.mongo import MongoHook

@dag(
    dag_id='etl_funcionarios_mongo',
    start_date=datetime(2026, 1, 1),
    schedule='@daily',
    catchup=False,
    tags=['ETL', 'MongoDB'],
)
def etl_funcionarios():

    @task()
    def extract():
        hook = MongoHook(mongo_conn_id='mongo_default')
        collection = hook.get_collection('funcionarios')
        return list(collection.find())

    @task()
    def transform(dados_brutos):
        limpos = []
        for doc in dados_brutos:
            if doc.get('nome') and doc.get('cpf') != 'N/A':
                doc.pop('_id', None)
                limpos.append(doc)
        return limpos

    @task()
    def load(dados_limpos):
        hook = MongoHook(mongo_conn_id='mongo_default')
        collection = hook.get_collection('funcionarios_limpos')
        if dados_limpos:
            collection.insert_many(dados_limpos)

    load(transform(extract()))

etl_funcionarios()




