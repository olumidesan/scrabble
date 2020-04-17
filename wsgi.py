
from config import Dev, Prod
from app import create_app, sio, env

app_env = Dev # Default

if env == 'PROD':
    app_env = Prod

app = create_app(app_env)

if __name__ == '__main__':
    print(f"Running in {env} environment...")
    sio.run(app, host='192.168.0.165', port=5005)