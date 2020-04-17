
import os
env = os.getenv('WEBSITE_ENV')

import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

sio = SocketIO()

def create_app(config_class):
    app = Flask(__name__, 
                static_folder='client',
                static_url_path='/client')

    app.config.from_object(config_class)    
    
    from . import socketio
    from .api import api_bp
    from .main import main_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)
    
    CORS(app)
    sio.init_app(app, 
                 async_mode=app.config['ASYNC_MODE'], 
                 channel=app.config['REDIS_CHANNEL_NAME'], 
                 message_queue=app.config['REDIS_BROKER_PATH'],
                 cors_allowed_origins=['http://localhost:3000', 'http://localhost:5005', 
                                        'http://localhost:5000', 'http://192.168.0.165:5005', 'http://192.168.0.165:3000']) 

    return app