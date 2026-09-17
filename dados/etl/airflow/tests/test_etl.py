import pytest
from airflow.models import DagBag

# Fixture para carregar os DAGs apenas uma vez durante os testes
@pytest.fixture(scope="session")
def dagbag():
    return DagBag(dag_folder="dags", include_examples=False)

def test_no_import_errors(dagbag):
    """Verifica se não há erros de importação nos DAGs."""
    assert len(dagbag.import_errors) == 0, f"Erros de importação encontrados: {dagbag.import_errors}"

def test_dag_is_loaded(dagbag):
    """Verifica se o DAG 'etl_clientes_mongo' foi carregado corretamente."""
    assert "etl_clientes_mongo" in dagbag.dags, "O DAG 'etl_clientes_mongo' não foi encontrado."

def test_dag_has_tasks(dagbag):
    """Verifica se o DAG possui pelo menos uma tarefa."""
    dag = dagbag.get_dag("etl_clientes_mongo")
    assert len(dag.tasks) > 0, "O DAG não possui nenhuma tarefa."
