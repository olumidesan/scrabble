
class CommonConfig:
    
    # Redis Settings
    REDIS_CHANNEL_NAME = 'scrabble'
    REDIS_BROKER_PATH = 'redis://localhost:6379/0'

    SECRET_KEY = 'guessmenot'
    ASYNC_MODE = 'eventlet'        
        
class Dev(CommonConfig):
    DEBUG = TESTING = True

class Prod(CommonConfig):
    DEBUG = TESTING = False