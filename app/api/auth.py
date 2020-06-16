from app import CLIENT_TOKEN
from .errors import error_response
from flask_httpauth import HTTPTokenAuth

token_auth = HTTPTokenAuth(scheme='Bearer')

@token_auth.verify_token
def verify_token(token):
    return token == CLIENT_TOKEN

@token_auth.error_handler
def token_auth_error():
    return error_response(401)

