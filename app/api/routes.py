
from . import api_bp as api
from .auth import token_auth, error_response
from .utils import get_pieces, get_remaining_pieces

from app.socketio import rooms

from threading import Lock
from flask import jsonify, request

lock = Lock()


@api.route('/bag', methods=['GET', 'POST'])
def bag():
    if request.method == 'GET':
        return jsonify(dict(pieces_left=get_remaining_pieces()))
    
    # Implicit POST
    payload = request.get_json(silent=True)
    amount = payload.get('amount')

    with lock: # Not really needed, in truth. 
        new_pieces = get_pieces(amount)

    return jsonify(dict(pieces=new_pieces))

@api.route('/rooms')
def sio_rooms():
    # Returns the list of socketIO rooms
    return jsonify(dict(rooms=rooms))
