import os

from server.utils import token_generator
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

class CommonConfig:
    """Shared configuration across all environments"""

    ENV = os.getenv("ENV")
    ASYNC_MODE = 'eventlet'        
    SECRET_KEY = token_generator()

    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.getcwd()}/scrabble.db'

class Dev(CommonConfig):
    """Development Config"""
    DEBUG = TESTING = True

class Prod(CommonConfig):
    """Production Config"""
    DEBUG = TESTING = False