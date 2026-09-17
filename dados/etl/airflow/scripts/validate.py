"""
Módulo de validação da qualidade dos dados.
"""
from typing import Tuple


def validar_cliente(doc: dict) -> Tuple[bool, str]:
    """
    Valida se um documento de cliente atende aos critérios mínimos.

    Regras atuais:
        - Deve ter campo 'CPF' preenchido.
        - CPF não pode ser 'N/A'.

    Args:
        doc: Documento vindo do MongoDB.

    Returns:
        Tupla (é_valido, motivo). Se válido, motivo é string vazia.
    """
    cpf = doc.get('CPF')

    if not cpf:
        return False, 'CPF ausente'

    if cpf == 'N/A':
        return False, 'CPF inválido (N/A)'

    return True, ''


def validar_lote(docs: list[dict]) -> Tuple[list[dict], list[dict]]:
    """
    Valida uma lista de documentos, separando válidos e inválidos.

    Args:
        docs: Lista de documentos.

    Returns:
        Tupla (validos, invalidos).
    """
    validos = []
    invalidos = []

    for doc in docs:
        ok, _ = validar_cliente(doc)
        if ok:
            validos.append(doc)
        else:
            invalidos.append(doc)

    return validos, invalidos
