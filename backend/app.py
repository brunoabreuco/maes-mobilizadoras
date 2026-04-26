from flask import Flask
from maes_mobilizadoras.models import db
from pathlib import Path

BASE_DIR = Path(__file__).parent

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + str(BASE_DIR / 'maes_mobilizadoras.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    @app.route('/')
    def hello():
        return 'Hello, <b>World!</b> - Mães Mobilizadoras'

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
else:
    app = create_app()
