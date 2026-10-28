from flask import Blueprint, render_template

from auth_utils import login_required

bp = Blueprint("portal", __name__)


@bp.get("/portal")
@login_required
def portal():
    return render_template("portal.html")
