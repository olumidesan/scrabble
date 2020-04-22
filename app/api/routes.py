
from threading import Lock
from itertools import cycle
from flask import jsonify, request

from app import db
from app.models import Word
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

@api.route('/bag/<int:amount>')
def bag(amount):
    """
    Returns the requested number of pieces
    from the bag
    """

    with lock: 
        new_pieces = get_pieces(amount)

    return jsonify(dict(pieces=new_pieces))

@api.route('/turn/<room_id>')
def player_turns(room_id):
    """Returns the next player to play"""
    
    player_to_play = ''
    room = players.get(room_id)

    try:         
        # If the first item is still None i.e
        # it's still a mere list
        if room[0] == None:
            # Pop out the None
            room.pop(0)
            # Change the room to a round-robin list
            players[room_id] = cycle(room)
            next(players[room_id]) # Client knows already, initially.
            player_to_play = next(players[room_id]) # Who's next to play?

    except TypeError:
        player_to_play = next(room)

    # Camel for JS, snake for Python
    return jsonify(dict(playerToPlay=player_to_play)) 