# ETL de Clientes com Apache Airflow e MongoDB Atlas

Pipeline de ETL que extrai dados de clientes de uma coleção no MongoDB Atlas, 
remove registros com CPF inválido ("N/A"), elimina o campo Telefone e carrega 
os dados tratados em uma nova coleção pronta para análise.

## 🏗️ Arquitetura

MongoDB Atlas (coleção `clientes`)
    ↓ [Airflow DAG: etl_clientes_mongo]
    ↓ Extract → Transform → Load
MongoDB Atlas (coleção `clientes_limpos`)

## 🛠️ Tecnologias

- Apache Airflow 3.0.2
- MongoDB Atlas
- Python 3.12
- Airflow MongoDB Provider

## 🚀 Como Executar

### Pré-requisitos
- Python 3.12+
- Conta no MongoDB Atlas com cluster configurado
- IP liberado em Network Access

### Passo a passo
```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/etl-clientes-airflow.git
cd etl-clientes-airflow

# 2. Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure o AIRFLOW_HOME
export AIRFLOW_HOME=~/airflow-projeto/airflow_home

# 5. Configure a conexão com o MongoDB
export AIRFLOW_CONN_MONGO_DEFAULT='mongo://user:pass@cluster.mongodb.net:27017/clientes?use_srv=true'

# 6. Inicie o Airflow
airflow standalone

# 7. Acesse http://localhost:8080 e dispare o DAG `etl_clientes_mongo`
