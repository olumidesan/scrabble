
from app import env
from . import main_bp as main
from flask import render_template


# @main.route('/', defaults={'path': ''})
# @main.route('/<path:path>')
# def serve_client(path):
#     return render_template('index.html', website_env=env)

@main.route('/')
def index():
    return 'Yup'
    
@main.route('/robots.txt')
def robots():
    return send_from_directory(current_app.static_folder, request.path[1:])
