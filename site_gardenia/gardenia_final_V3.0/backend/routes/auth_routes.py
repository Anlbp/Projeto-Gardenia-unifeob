import re
from flask import Blueprint, jsonify, request, render_template, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError

from db import get_db
from auth_utils import current_employee, current_client, api_login_required
from utils import only_digits

bp = Blueprint("auth", __name__)


@bp.route("/login")
def login_page():
    if current_employee():
        return redirect("/portal")
    if current_client():
        return redirect("/")
    return render_template("login.html")


@bp.post("/api/clients/register")
def register_client():
    """Cadastro de cliente feito pelo site — salva no banco e faz login automático na sessão."""
    body = request.get_json(force=True) or {}
    name = (body.get("name") or body.get("nome") or "").strip()
    email = (body.get("email") or "").strip()
    cpf = (body.get("cpf") or "").strip()
    senha = (body.get("senha") or body.get("password") or "1234").strip()
    phone = (body.get("phone") or body.get("telefone") or "(19) 99999-9999").strip()
    birth_date = (body.get("birth_date") or body.get("data_nascimento") or "2000-01-01").strip()

    if not name or not email:
        return jsonify({"error": "Nome e e-mail são obrigatórios."}), 400

    if not cpf:
        # Cria identificador a partir do email se o CPF não foi informado
        cpf = email.lower()

    if len(senha) < 4:
        return jsonify({"error": "A senha precisa ter pelo menos 4 caracteres."}), 400

    db = get_db()

    if db.clients.find_one({"_id": cpf}):
        return jsonify({"error": "Já existe um cadastro com esse CPF."}), 400

    client = {
        "_id": cpf,
        "name": name,
        "email": email,
        "birth_date": birth_date,
        "cpf": cpf,
        "phone": phone,
        "senha_hash": generate_password_hash(senha),
        "purchases": [],
    }
    try:
        db.clients.insert_one(client)
    except DuplicateKeyError:
        return jsonify({"error": "Já existe um cadastro com esse e-mail."}), 400

    session["client_id"] = cpf
    return jsonify({"ok": True, "redirect": "/"}), 201


@bp.post("/api/auth/client-login")
def client_login():
    body = request.get_json(force=True) or {}
    email = (body.get("email") or "").strip().lower()
    senha = body.get("senha") or ""

    client = get_db().clients.find_one({"email": re.compile(f"^{re.escape(email)}$", re.I)})

    if not client or not check_password_hash(client.get("senha_hash", ""), senha):
        return jsonify({"error": "E-mail ou senha inválidos."}), 401

    session["client_id"] = client["_id"]
    return jsonify({"ok": True, "redirect": "/"})


@bp.post("/api/auth/login")
def employee_login():
    body = request.get_json(force=True) or {}
    email = (body.get("email") or "").strip().lower()
    senha = body.get("senha") or ""

    employee = get_db().employees.find_one({"email": re.compile(f"^{re.escape(email)}$", re.I)})

    if not employee or not check_password_hash(employee.get("senha_hash", ""), senha):
        return jsonify({"error": "E-mail ou senha inválidos."}), 401

    session["employee_id"] = employee["_id"]
    return jsonify({"ok": True, "redirect": "/portal"})


@bp.get("/logout")
def logout():
    session.pop("employee_id", None)
    session.pop("client_id", None)
    return redirect("/")


@bp.get("/api/me")
@api_login_required
def me():
    e = current_employee()
    return jsonify({"id": e["id"], "name": e["name"], "role": e["role"], "perms": e["perms"]})
