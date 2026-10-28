from flask import Blueprint, render_template

from db import get_db, serialize_many
from auth_utils import current_client

bp = Blueprint("storefront", __name__)


@bp.route("/")
def home():
    products = serialize_many(get_db().products.find().sort("id", 1))
    return render_template("index.html", products=products, client=current_client())
