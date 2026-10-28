from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash
from pymongo.errors import DuplicateKeyError

from db import get_db, serialize_many
from auth_utils import api_login_required
from utils import new_id

bp = Blueprint("employees", __name__)


@bp.get("/api/employees")
@api_login_required
def get_employees():
    employees = serialize_many(get_db().employees.find())
    return jsonify([{k: v for k, v in e.items() if k != "senha_hash"} for e in employees])


@bp.post("/api/employees")
@api_login_required
def create_employee():
    body = request.get_json(force=True) or {}
    senha = body.get("senha") or ""
    if len(senha) < 4:
        return jsonify({"error": "A senha precisa ter pelo menos 4 caracteres."}), 400

    emp_id = new_id("e-")
    employee = {
        "_id": emp_id,
        "id": emp_id,
        "name": body.get("name", "").strip() or "Sem nome",
        "email": body.get("email", "").strip(),
        "role": body.get("role", "Vendedor(a)"),
        "perms": body.get("perms", []),
        "senha_hash": generate_password_hash(senha),
    }
    try:
        get_db().employees.insert_one(employee)
    except DuplicateKeyError:
        return jsonify({"error": "Já existe um funcionário com esse e-mail."}), 400

    return jsonify({k: v for k, v in employee.items() if k not in ("_id", "senha_hash")}), 201


@bp.delete("/api/employees/<emp_id>")
@api_login_required
def delete_employee(emp_id):
    result = get_db().employees.delete_one({"_id": emp_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Funcionário não encontrado"}), 404
    return "", 204
