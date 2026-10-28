import datetime

from flask import Blueprint, jsonify

from db import get_db
from auth_utils import api_login_required
from utils import today_str

bp = Blueprint("metrics", __name__)


@bp.get("/api/metrics/summary")
@api_login_required
def metrics_summary():
    db = get_db()
    products = list(db.estoque.find())
    clients_total = db.clients.count_documents({})
    sales = list(db.sales.find())

    today = today_str()
    sales_today = [s for s in sales if s["date"] == today]
    vendas_hoje = sum(s["total"] for s in sales_today)
    ticket_medio = (vendas_hoje / len(sales_today)) if sales_today else 0

    return jsonify({
        "vendas_hoje": round(vendas_hoje, 2),
        "ticket_medio": round(ticket_medio, 2),
        "estoque_total": sum(p["qty"] for p in products),
        "estoque_baixo": len([p for p in products if p["qty"] <= 3]),
        "clientes_total": clients_total,
    })


@bp.get("/api/metrics/week")
@api_login_required
def metrics_week():
    sales = list(get_db().sales.find())
    totals_by_date = {}
    for s in sales:
        totals_by_date[s["date"]] = totals_by_date.get(s["date"], 0) + s["total"]

    dias_semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    labels, data = [], []
    today = datetime.date.today()
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        labels.append("Hoje" if i == 0 else dias_semana[d.weekday()])
        data.append(round(totals_by_date.get(d.isoformat(), 0), 2))

    return jsonify({"labels": labels, "data": data})


@bp.get("/api/metrics/categories")
@api_login_required
def metrics_categories():
    sales = list(get_db().sales.find())
    totals = {}
    for s in sales:
        for item in s["items"]:
            cat = item.get("category", "Outros")
            totals[cat] = totals.get(cat, 0) + item["qty"]

    if not totals:
        return jsonify({"labels": [], "data": []})

    labels = list(totals.keys())
    data = [totals[k] for k in labels]
    return jsonify({"labels": labels, "data": data})


@bp.get("/api/metrics/top-products")
@api_login_required
def metrics_top_products():
    sales = list(get_db().sales.find())
    totals = {}
    for s in sales:
        for item in s["items"]:
            totals[item["name"]] = totals.get(item["name"], 0) + item["qty"]
    top = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:5]
    return jsonify([{"name": n, "qty": q} for n, q in top])


@bp.get("/api/metrics/recent-sales")
@api_login_required
def metrics_recent_sales():
    sales = list(get_db().sales.find())
    sales.sort(key=lambda s: (s["date"], s["time"]), reverse=True)
    recent = sales[:6]
    return jsonify([{
        "time": s["time"],
        "total": s["total"],
        "items": sum(i["qty"] for i in s["items"]),
        "label": ", ".join(i["name"] for i in s["items"]),
    } for s in recent])
