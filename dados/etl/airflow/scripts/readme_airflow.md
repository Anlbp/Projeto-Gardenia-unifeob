# 🚀 Airflow ETL - Guia para Iniciantes no Linux

Bem-vindo! Este guia foi feito para quem **nunca usou Apache Airflow** e quer colocar um pipeline ETL (Extract, Transform, Load) rodando no Linux do zero.

O projeto faz um fluxo simples e didático:

```
MongoDB (origem) → Validação → Transformação → MongoDB (destino)
```

---

## 📋 Índice

1. [O que é Airflow?](#o-que-é-airflow)
2. [Estrutura do projeto](#estrutura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação passo a passo](#instalação-passo-a-passo)
5. [Configurando o MongoDB no Airflow](#configurando-o-mongodb-no-airflow)
6. [Executando a DAG](#executando-a-dag)
7. [Entendendo o código](#entendendo-o-código)
8. [Problemas comuns](#problemas-comuns)
9. [Próximos passos](#próximos-passos)

---

## O que é Airflow?

O **Apache Airflow** é um orquestrador de tarefas. Pense nele como um "gerente" que:

- Executa tarefas na **ordem correta** (primeiro extrai, depois valida, depois carrega).
- Agenda execuções (todo dia às 6h, por exemplo).
- Mostra **logs** e **histórico** de cada execução numa interface web.
- Reexecuta automaticamente se algo falhar.

No Airflow, você escreve um arquivo Python chamado **DAG** (Directed Acyclic Graph) que descreve o fluxo.

---

## Estrutura do projeto

```
airflow-etl/
├── dags/
│   └── pipeline_clientes.py     # A DAG (o "fluxo")
├── scripts/
│   ├── __init__.py              # Marca a pasta como pacote Python
│   ├── extract.py               # Extrai do MongoDB
│   ├── transform.py             # Transforma os dados
│   ├── validate.py              # Valida os dados
│   └── load.py                  # Carrega no MongoDB
├── requirements.txt
└── README.md
```

---

## Pré-requisitos

Você precisa ter instalado no Linux:

- **Python 3.9+** → `python3 --version`
- **pip** → `pip3 --version`
- **MongoDB** (local ou na nuvem). Para instalar localmente no Ubuntu:

```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

- **virtualenv** (recomendado):

```bash
sudo apt install -y python3-venv
```

---

## Instalação passo a passo

### 1. Clone o projeto e entre na pasta

```bash
git clone <url-do-seu-repo> airflow-etl
cd airflow-etl
```

### 2. Crie um ambiente virtual

```bash
python3 -m venv .venv
source .venv/bin/activate
```

> 💡 Sempre que abrir um terminal novo, rode `source .venv/bin/activate` antes de usar o Airflow.

### 3. Defina a pasta do Airflow

O Airflow precisa saber onde guardar configs e DAGs. Crie a variável de ambiente:

```bash
export AIRFLOW_HOME=~/airflow
echo 'export AIRFLOW_HOME=~/airflow' >> ~/.bashrc
```

### 4. Instale o Airflow e dependências

Use a versão mais recente estável (ajuste a versão do Python se necessário):

```bash
AIRFLOW_VERSION=2.9.3
PYTHON_VERSION="$(python3 --version | cut -d ' ' -f 2 | cut -d '.' -f 1-2)"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
pip install apache-airflow-providers-mongo
```

Crie um `requirements.txt` com:

```
apache-airflow==2.9.3
apache-airflow-providers-mongo
pymongo
```

E instale:

```bash
pip install -r requirements.txt
```

### 5. Inicialize o banco do Airflow

```bash
airflow db init
```

### 6. Crie um usuário para acessar a interface web

```bash
airflow users create \
    --username admin \
    --firstname Admin \
    --lastname User \
    --role Admin \
    --email admin@example.com \
    --password admin
```

### 7. Aponte o Airflow para as suas DAGs

Edite o arquivo `~/airflow/airflow.cfg` e ajuste a linha `dags_folder`:

```ini
dags_folder = /caminho/para/airflow-etl/dags
```

Ou crie um link simbólico:

```bash
ln -s $(pwd)/dags ~/airflow/dags
```

> ⚠️ Os arquivos dentro de `scripts/` também precisam estar acessíveis. Coloque a pasta `scripts/` **dentro** de `dags/` ou ajuste o `sys.path` na DAG.

### 8. Suba o Airflow

Abra **dois terminais** (com o venv ativado em ambos):

**Terminal 1 - Webserver:**

```bash
airflow webserver --port 8080
```

**Terminal 2 - Scheduler:**

```bash
airflow scheduler
```

Acesse: **http://localhost:8080**  
Login: `admin` / `admin`

---

## Configurando o MongoDB no Airflow

O código usa `mongo_conn_id='mongo_default'`. Você precisa criar essa conexão.

### Pela interface web (mais fácil)

1. Vá em **Admin → Connections**.
2. Clique em **+ Add a new record**.
3. Preencha:
   - **Connection Id:** `mongo_default`
   - **Connection Type:** `MongoDB`
   - **Host:** `localhost` (ou o host do seu Mongo)
   - **Port:** `27017`
   - **Login / Password:** se seu Mongo exigir autenticação
   - **Extra:** `{"authSource": "admin"}` (se aplicável)
4. Salve.

### Pela linha de comando

```bash
airflow connections add 'mongo_default' \
    --conn-type 'mongo' \
    --conn-host 'localhost' \
    --conn-port 27017
```

### Popule dados de exemplo (opcional)

```bash
mongosh
```

```javascript
use clientes
db.clientes.insertMany([
  { CPF: "12345678900", Nome: "Ana", Telefone: "11-99999-0000" },
  { CPF: "N/A",         Nome: "Bob", Telefone: "11-98888-1111" },
  { Nome: "Sem CPF",    Telefone: "11-97777-2222" }
])
```

---

## Executando a DAG

Na interface web:

1. Localize a DAG **`pipeline_clientes`**.
2. Ative o toggle à esquerda.
3. Clique em **Trigger DAG** (botão ▶️).
4. Clique no nome da DAG → **Graph View** para ver as tarefas acendendo em verde.

Pela CLI:

```bash
airflow dags list
airflow dags trigger pipeline_clientes
airflow tasks test pipeline_clientes extrair 2024-01-01
```

Após rodar, confira o resultado no Mongo:

```javascript
use clientes
db.clientes_limpos.find().pretty()
```

---

## Entendendo o código

### `scripts/extract.py` — Extração

```python
def extrair_clientes(...) -> Iterator[dict]:
```

- Usa `MongoHook` para se conectar ao Mongo via conexão do Airflow.
- Retorna um **generator** (`yield`), o que evita carregar 30 mil documentos na memória de uma vez.
- Lê em lotes (`batch_size`).

### `scripts/validate.py` — Validação

```python
def validar_cliente(doc) -> Tuple[bool, str]
def validar_lote(docs) -> Tuple[list, list]
```

- Regras de qualidade: precisa ter `CPF` e ele não pode ser `"N/A"`.
- Separa documentos em **válidos** e **inválidos**.

### `scripts/transform.py` — Transformação

```python
def transformar_cliente(doc) -> dict
```

- Remove `_id` (não serializável em XCom).
- Remove `Telefone`.
- Adiciona `processado_em` com timestamp ISO.

### `scripts/load.py` — Carga

```python
def carregar_clientes(docs, ...) -> int
```

- Insere em lotes de `batch_size`.
- Opcionalmente limpa a coleção antes (`limpar_antes=True`).
- Retorna o total inserido.

### `dags/pipeline_clientes.py` — A DAG

Orquestra tudo com `PythonOperator`:

```
extrair → validar → transformar → carregar
```

Cada task passa dados para a próxima via **XCom** (mecanismo de troca de mensagens do Airflow).

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `airflow: command not found` | Ative o venv: `source .venv/bin/activate` |
| `ModuleNotFoundError: scripts` | Coloque `scripts/` dentro de `dags/` ou adicione `sys.path.append(...)` na DAG |
| DAG não aparece na UI | Verifique `dags_folder` no `airflow.cfg` e rode `airflow dags list` |
| `Connection 'mongo_default' not found` | Crie a conexão em Admin → Connections |
| Erro de permissão em `~/airflow` | `chmod -R 755 ~/airflow` |
| Webserver não sobe | Veja se a porta 8080 está livre: `sudo lsof -i :8080` |
| Scheduler não executa | Confirme que os **dois** processos (webserver + scheduler) estão rodando |

---

## Próximos passos

- 🔁 Trocar `PythonOperator` por `@task` (TaskFlow API) para código mais limpo.
- 📅 Ajustar o `schedule` da DAG (ex.: `"0 6 * * *"` para rodar às 6h).
- 🔔 Adicionar `on_failure_callback` para alertas por e-mail/Slack.
- 🧪 Escrever testes unitários para `validate.py` e `transform.py`.
- 🐳 Rodar tudo via **Docker Compose** (ambiente oficial do Airflow).
- 📊 Integrar com **Metabase** ou **Grafana** para visualizar os dados limpos.

---

## 📚 Referências

- [Documentação oficial do Airflow](https://airflow.apache.org/docs/)
- [Provider MongoDB para Airflow](https://airflow.apache.org/docs/apache-airflow-providers-mongo/stable/index.html)
- [Tutorial oficial: escrevendo sua primeira DAG](https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html)

---

Feito com ❤️ para quem está começando. Bons pipelines! 🚀
