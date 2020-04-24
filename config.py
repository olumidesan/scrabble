import os
from app.utils import token_generator


class CommonConfig:
    ASYNC_MODE = 'eventlet'        
    SECRET_KEY = token_generator()
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = f'sqlite:////{os.getcwd()}/scrabble.db'

class Dev(CommonConfig):
    DEBUG = TESTING = True

class Prod(CommonConfig):
    DEBUG = TESTING = False