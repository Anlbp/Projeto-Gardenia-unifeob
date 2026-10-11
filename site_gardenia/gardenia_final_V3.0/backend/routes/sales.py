from flask import Blueprint, jsonify, request

from db import get_db, serialize, serialize_many
from auth_utils import api_login_required
from utils import new_id, today_str, now_hhmm

bp = Blueprint("sales", __name__)


@bp.get("/api/sales")
@api_login_required
def get_sales():
    sales = serialize_many(get_db().sales.find())
    sales.sort(key=lambda s: (s["date"], s["time"]), reverse=True)
    return jsonify(sales)


@bp.post("/api/sales")
@api_login_required
def create_sale():
    body = request.get_json(force=True) or {}
    requested_items = body.get("items", [])
    if not requested_items:
        return jsonify({"error": "Carrinho vazio"}), 400

    db = get_db()
    sale_items = []
    total = 0.0

    for it in requested_items:
        product = db.estoque.find_one({"_id": it.get("sku")})
        if not product:
            continue
        qty = int(it.get("qty") or 1)
        new_qty = max(0, product["qty"] - qty)
        db.estoque.update_one({"_id": product["_id"]}, {"$set": {"qty": new_qty}})

        subtotal = product["price"] * qty
        total += subtotal
        sale_items.append({
            "sku": product["sku"],
            "name": product["name"],
            "category": product["category"],
            "price": product["price"],
            "qty": qty,
        })

    if not sale_items:
        return jsonify({"error": "Nenhum produto válido no carrinho"}), 400

    sale_id = new_id("s-")
    sale = {
        "_id": sale_id,
        "id": sale_id,
        "date": today_str(),
        "time": now_hhmm(),
        "items": sale_items,
        "total": round(total, 2),
    }
    db.sales.insert_one(sale)

    return jsonify(serialize(sale)), 201
