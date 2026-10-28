"""
Configuração do projeto — lê tudo do arquivo .env.
"""

import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "")
MONGODB_DB = os.environ.get("MONGODB_DB", "gardenia_modas")
SECRET_KEY = os.environ.get("SECRET_KEY", "gardenia-dev-troque-essa-chave")
