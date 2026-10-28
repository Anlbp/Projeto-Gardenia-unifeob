"""
Autenticação — sessão do funcionário e do cliente.
Compartilhado por todos os módulos em routes/.
"""

from functools import wraps
from flask import session, jsonify, redirect

from db import get_db, serialize


def current_employee():
    emp_id = session.get("employee_id")
    if not emp_id:
        return None
    return serialize(get_db().employees.find_one({"_id": emp_id}))


def current_client():
    client_id = session.get("client_id")
    if not client_id:
        return None
    doc = get_db().clients.find_one({"_id": client_id})
    if doc is None:
        return None
    client = serialize(doc)
    client.pop("senha_hash", None)
    return client


def login_required(view):
    """Protege páginas do Portal: sem sessão de funcionário, manda pra /login."""
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not current_employee():
            return redirect("/login")
        return view(*args, **kwargs)
    return wrapped


def api_login_required(view):
    """Protege endpoints da API do Portal: sem sessão, devolve 401 em JSON."""
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not current_employee():
            return jsonify({"error": "Não autenticado"}), 401
        return view(*args, **kwargs)
    return wrapped
