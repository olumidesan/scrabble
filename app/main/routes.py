
from app import CLIENT_TOKEN

from . import main_bp as main
from flask import request, render_template

# Entry point to serve client
@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_client(path):
    return render_template('index.html',
                            b2ctk=CLIENT_TOKEN,
                            ip=request.host.split(":")[0])
