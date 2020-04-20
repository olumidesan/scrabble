
from threading import Lock
from itertools import cycle
from flask import jsonify, request
from app.socketio import rooms, players

from . import api_bp as api
from .auth import token_auth, error_response
from .utils import get_pieces, get_remaining_pieces


lock = Lock()
turn_order = None


@api.route('/rooms')
def sio_rooms():
    """Returns the list of socketIO rooms"""
    return jsonify(dict(rooms=rooms))

# Should be a GET request, but I need the roomID 
# for each request. Should re-factor later
@api.route('/turn', methods=['POST'])
def player_turns():
    """Returns the next player to play"""
    
    global turn_order
    player_to_play = ''

    room_id = request.get_json(silent=True).get('roomID')
    if turn_order == None:
        turn_order = cycle(players.get(room_id))
        next(turn_order) # Client knows already, initially.

    player_to_play = next(turn_order)

    return jsonify(dict(playerToPlay=player_to_play)) # Camel for JS, snake for Python

@api.route('/bag', methods=['POST'])
def bag():
    payload = request.get_json(silent=True)
    amount = payload.get('amount')

    with lock: 
        new_pieces = get_pieces(amount)

    return jsonify(dict(pieces=new_pieces))
