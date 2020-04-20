
from app import env, CLIENT_TOKEN
from . import main_bp as main
from flask import render_template, send_from_directory


@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_client(path):
    return render_template('index.html', app_env=env, b2ctk=CLIENT_TOKEN)
    
@main.route('/robots.txt')
def robots():
    return send_from_directory(current_app.static_folder, request.path[1:])
