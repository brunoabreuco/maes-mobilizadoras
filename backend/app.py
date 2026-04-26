import os
from flask import Flask
from pathlib import Path


DIR_BACKEND = Path(__file__).parent


def create_app():
    app = Flask(__name__)

    @app.route('/')
    def hello():
        return 'Hello, <b>World!</b> - Mães Mobilizadoras'

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
else:
    app = create_app()
