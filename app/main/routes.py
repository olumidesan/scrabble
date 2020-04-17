
from . import main_bp as main

@main.route('/', defaults={'path': ''})
def entry():
    return "Yup"
    
@main.route('/robots.txt')
def robots():
    return send_from_directory(current_app.static_folder, request.path[1:])
