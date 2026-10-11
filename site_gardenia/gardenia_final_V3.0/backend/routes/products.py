from flask import Blueprint, jsonify, request

from db import get_db, serialize, serialize_many
from auth_utils import api_login_required
from utils import new_id

bp = Blueprint("products", __name__)


@bp.get("/api/products")
@api_login_required
def get_products():
    return jsonify(serialize_many(get_db().estoque.find()))


@bp.post("/api/products")
@api_login_required
def create_product():
    body = request.get_json(force=True) or {}
    db = get_db()

    sku = (body.get("sku") or "").strip() or new_id("sku-")
    if db.estoque.find_one({"_id": sku}):
        return jsonify({"error": "SKU já existe"}), 400

    product = {
        "_id": sku,
        "sku": sku,
        "name": body.get("name", "").strip() or "Produto sem nome",
        "category": body.get("category", "Outros"),
        "size": body.get("size") or "—",
        "color": body.get("color") or "—",
        "price": float(body.get("price") or 0),
        "qty": int(body.get("qty") or 0),
    }
    db.estoque.insert_one(product)
    return jsonify(serialize(product)), 201


@bp.patch("/api/products/<sku>")
@api_login_required
def update_product(sku):
    body = request.get_json(force=True) or {}
    db = get_db()
    product = db.estoque.find_one({"_id": sku})
    if not product:
        return jsonify({"error": "Produto não encontrado"}), 404

    updates = {}
    if "delta" in body:
        updates["qty"] = max(0, product["qty"] + int(body["delta"]))
    for field in ("name", "category", "size", "color", "price", "qty"):
        if field in body and field != "delta":
            updates[field] = body[field]

    if updates:
        db.estoque.update_one({"_id": sku}, {"$set": updates})
        product = db.estoque.find_one({"_id": sku})

    return jsonify(serialize(product))


@bp.delete("/api/products/<sku>")
@api_login_required
def delete_product(sku):
    result = get_db().estoque.delete_one({"_id": sku})
    if result.deleted_count == 0:
        return jsonify({"error": "Produto não encontrado"}), 404
    return "", 204
