
import os
env = os.getenv('CODE_ENV')

import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from .utils import token_generator


sio = SocketIO()
db = SQLAlchemy()
CLIENT_TOKEN = token_generator()


def create_app(config_class):
    app = Flask(__name__, 
                static_folder='client',
                static_url_path='/client')

    app.config.from_object(config_class)    
    
    from .api import api_bp
    from .main import main_bp
    from . import socketio, models

    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)

    CORS(app)
    db.init_app(app)
    sio.init_app(app, 
                 cors_allowed_origins='*', 
                 async_mode=app.config['ASYNC_MODE'])

    return app