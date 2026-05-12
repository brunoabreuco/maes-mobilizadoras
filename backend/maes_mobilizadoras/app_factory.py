from pathlib import Path

import os

from dotenv import load_dotenv

from flask import Flask
from supabase import create_client

from maes_mobilizadoras.models import db
from maes_mobilizadoras.limiter import limiter


BASE_DIR = Path(__file__).parent.parent


def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    limiter.init_app(app)

    # Cliente Supabase com service role key para operacoes admin (delete_user)
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )
    app.extensions["supabase"] = supabase

    with app.app_context():
        db.create_all()

    from maes_mobilizadoras.api_routes import api

    app.register_blueprint(api)

    return app
