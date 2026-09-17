import pytest
from airflow.models import DagBag

from scripts.transform import transformar_cliente
from scripts.validate import validar_cliente


@pytest.fixture(scope="session")
def dagbag():
    return DagBag(dag_folder="dags", include_examples=False)


# --- Testes de integridade do DAG ---

def test_no_import_errors(dagbag):
    assert len(dagbag.import_errors) == 0, f"Erros: {dagbag.import_errors}"


def test_dag_is_loaded(dagbag):
    assert "etl_clientes_mongo" in dagbag.dags


def test_dag_has_tasks(dagbag):
    dag = dagbag.get_dag("etl_clientes_mongo")
    assert len(dag.tasks) > 0


# --- Testes da camada de validação ---

def test_validar_cliente_com_cpf_valido():
    doc = {'Nome': 'Ana', 'CPF': '123.456.789-00'}
    ok, _ = validar_cliente(doc)
    assert ok is True


def test_validar_cliente_com_cpf_na():
    doc = {'Nome': 'Ana', 'CPF': 'N/A'}
    ok, motivo = validar_cliente(doc)
    assert ok is False
    assert 'N/A' in motivo


def test_validar_cliente_sem_cpf():
    doc = {'Nome': 'Ana'}
    ok, motivo = validar_cliente(doc)
    assert ok is False
    assert 'ausente' in motivo


# --- Testes da camada de transformação ---

def test_transformar_remove_id_e_telefone():
    doc = {'_id': 'abc', 'Nome': 'Ana', 'Telefone': '11 99999-9999'}
    resultado = transformar_cliente(doc)
    assert '_id' not in resultado
    assert 'Telefone' not in resultado


def test_transformar_adiciona_timestamp():
    doc = {'Nome': 'Ana'}
    resultado = transformar_cliente(doc)
    assert 'processado_em' in resultado


def test_transformar_nao_altera_original():
    doc = {'_id': 'abc', 'Nome': 'Ana'}
    transformar_cliente(doc)
    assert '_id' in doc  # o original não foi modificado
