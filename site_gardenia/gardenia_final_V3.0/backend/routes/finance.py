from flask import Blueprint, jsonify, request

from db import get_db, serialize, serialize_many
from auth_utils import api_login_required
from utils import new_id

bp = Blueprint("finance", __name__)


@bp.get("/api/finance")
@api_login_required
def get_finance():
    return jsonify(serialize_many(get_db().finance.find()))


@bp.post("/api/finance")
@api_login_required
def create_finance_row():
    body = request.get_json(force=True) or {}
    row_id = new_id("f-")
    row = {
        "_id": row_id,
        "id": row_id,
        "date": body.get("date", ""),
        "desc": body.get("desc", ""),
        "cat": body.get("cat", ""),
        "in": float(body.get("in") or 0),
        "out": float(body.get("out") or 0),
    }
    get_db().finance.insert_one(row)
    return jsonify(serialize(row)), 201


@bp.put("/api/finance/<row_id>")
@api_login_required
def update_finance_row(row_id):
    body = request.get_json(force=True) or {}
    db = get_db()
    row = db.finance.find_one({"_id": row_id})
    if not row:
        return jsonify({"error": "Linha não encontrada"}), 404

    updates = {f: body[f] for f in ("date", "desc", "cat", "in", "out") if f in body}
    if updates:
        db.finance.update_one({"_id": row_id}, {"$set": updates})
        row = db.finance.find_one({"_id": row_id})

    return jsonify(serialize(row))


@bp.delete("/api/finance/<row_id>")
@api_login_required
def delete_finance_row(row_id):
    result = get_db().finance.delete_one({"_id": row_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Linha não encontrada"}), 404
    return "", 204
