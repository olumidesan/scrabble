from config import Dev, Prod
from server import create_app, sio
from server.utils import get_local_ip_address


PORT = 5005
IP_ADDRESS = get_local_ip_address()

env_type = Dev.ENV
app_env = Dev  # Default

if env_type == 'PROD':
    app_env = Prod

app = create_app(app_env)

if __name__ == '__main__':
    print(f"Running in {env_type} environment at http://{IP_ADDRESS}:{PORT}.")
    sio.run(app, host=IP_ADDRESS, port=PORT)
