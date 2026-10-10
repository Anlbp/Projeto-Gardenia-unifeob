"""
Módulo de transformação de dados.
"""
from datetime import datetime


def transformar_cliente(doc: dict) -> dict:
    """
    Aplica as transformações necessárias em um documento de cliente.

    Transformações:
        - Remove o campo '_id' (não serializável no XCom).
        - Remove o campo 'Telefone'.
        - Adiciona o campo 'processado_em' com o timestamp atual.

    Args:
        doc: Documento original.

    Returns:
        Documento transformado.
    """
    doc = dict(doc)  # cópia rasa, evita alterar o original

    doc.pop('_id', None)
    doc.pop('Telefone', None)
    doc['processado_em'] = datetime.now().isoformat()

    return doc


def transformar_lote(docs: list[dict]) -> list[dict]:
    """
    Aplica transformação em uma lista de documentos.

    Args:
        docs: Lista de documentos válidos.

    Returns:
        Lista de documentos transformados.
    """
    return [transformar_cliente(doc) for doc in docs]
