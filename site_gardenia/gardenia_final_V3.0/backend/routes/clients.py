from flask import Blueprint, jsonify, request

from db import get_db, serialize_many
from auth_utils import api_login_required
from utils import only_digits

bp = Blueprint("clients", __name__)


@bp.get("/api/clients")
@api_login_required
def get_clients():
    query = request.args.get("q", "").strip().lower()
    clients = [c for c in serialize_many(get_db().clients.find())]
    for c in clients:
        c.pop("senha_hash", None)

    if not query:
        return jsonify(clients)

    digits = only_digits(query)

    def matches(c):
        if query in c["name"].lower():
            return True
        if digits and (digits in only_digits(c["phone"]) or digits in only_digits(c["cpf"])):
            return True
        return False

    return jsonify([c for c in clients if matches(c)])
