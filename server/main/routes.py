
from server import CLIENT_TOKEN

from . import main_bp as main
from flask import request, render_template

# Entry point to serve client
@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_client(path):
    host_url = request.host_url[:-1] if request.host_url.endswith('/') else request.host_url
    return render_template('index.html',
                            ip=host_url,
                            b2ctk=CLIENT_TOKEN)