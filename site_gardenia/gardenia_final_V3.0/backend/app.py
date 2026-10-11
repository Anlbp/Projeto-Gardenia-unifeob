"""
Gardênia Modas — backend único do projeto, pronto pro MongoDB.

Cada assunto tem seu próprio módulo dentro de routes/ (clientes, estoque,
vendas, financeiro, funcionários, métricas, login). Esse arquivo só
junta tudo: cria o app Flask, registra os módulos e trata os erros
de forma amigável quando o banco não está configurado.

Como rodar:
    cd backend
    pip install -r requirements.txt
    # edite o .env com sua connection string do MongoDB Atlas
    python seed_db.py      # popula o banco com dados de demonstração (uma vez só)
    python app.py

Abre em http://127.0.0.1:5000 — sempre acesse por esse endereço, nunca
abrindo o index.html direto no navegador.
"""

import os
from flask import Flask, jsonify, request

import config
from db import DatabaseNotConfigured

from routes import storefront, auth_routes, portal, clients, products, sales, finance, employees, metrics

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(FRONTEND_DIR, "templates"),
        static_folder=os.path.join(FRONTEND_DIR, "static"),
    )
    app.secret_key = config.SECRET_KEY

    for module in (storefront, auth_routes, portal, clients, products, sales, finance, employees, metrics):
        app.register_blueprint(module.bp)

    @app.errorhandler(DatabaseNotConfigured)
    def handle_db_not_configured(err):
        if request.path.startswith("/api/"):
            return jsonify({"error": str(err)}), 503
        return f"""
            <div style="font-family:sans-serif;max-width:560px;margin:80px auto;line-height:1.6;">
                <h2>Banco de dados não configurado</h2>
                <p>{err}</p>
                <p>Depois de preencher o <code>.env</code>, rode <code>python seed_db.py</code>
                uma vez pra popular o banco com dados de demonstração.</p>
            </div>
        """, 503

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
