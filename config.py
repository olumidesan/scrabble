import os

class CommonConfig:
    # Redis Settings
    REDIS_CHANNEL_NAME = 'scrabble'
    REDIS_BROKER_PATH = 'redis://localhost:6379/0'

    SECRET_KEY = 'guessmenot'
    ASYNC_MODE = 'eventlet'        
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = f'sqlite:////{os.getcwd()}/scrabble.db'

class Dev(CommonConfig):
    DEBUG = TESTING = True

class Prod(CommonConfig):
    DEBUG = TESTING = False