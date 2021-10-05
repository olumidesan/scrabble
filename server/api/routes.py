
from time import sleep
from threading import RLock

from . import api_bp as api
from .auth import token_auth
from flask import jsonify, request

from server import sio
from server.models import Word
from server.socketio import game_rooms

GameLock = RLock()
router = api.route


"""Server ping route"""
@router('/ping')
@token_auth.login_required
def ping(): return dict(status="pingSuccess")


@router('/room/<room_id>')
@token_auth.login_required
def sio_rooms(room_id):
    """
    Returns the contents of a game room, if it exists
    """

    name = request.args.get("name")
    room = game_rooms.get_room(room_id)

    if room:
        # Check if name is already being used
        existing_names = list(filter(lambda x: x['name'].lower() == name.lower(), room.get_connected_players()))
        
        if len(existing_names) > 0:
            response = dict(status="nameError", message="Name is already being used by another player")
        else:
            response = dict(status="success", room=room.serialize())

    else:
        response = dict(status="error", message="No such game room")

    return response


@router('/bag/<int:amount>')
@token_auth.login_required
def bag(amount):
    """
    Returns the requested number of pieces
    from the bag in the room
    """
    room_id = request.args.get('roomID')
    game_room = game_rooms.get_room(room_id)

    if not game_room:
        return dict(status="error", message="No such game room")

    # Synchronize fetch
    with GameLock:
        pieces = game_room.bag.get_pieces(amount)

    return dict(status="success", pieces=pieces)

@router('/logs/<room_id>')
@token_auth.login_required
def logs(room_id):
    """
    Returns game history in a game room
    """
    game_room = game_rooms.get_room(room_id)

    if not game_room:
        return dict(status="error", message="No such game room")

    return dict(status="success", logs=game_room.get_logs())


@router('/validate', methods=['POST'])
@token_auth.login_required
def validate():
    """
    Validates that all the posted words are valid
    """
    # Get the words to be validated
    words = request.get_json().get('words')

    # Default response: Success, with all words valid
    response = dict(status="success", message="All words are valid")

    # Validate all. If any is invalid, return an error
    for word in words:
        word = word.upper()

        valid = Word.query.filter_by(word=word).first()
        if not valid:
            response = dict(status="error", message=f"'{word}' is not a valid Scrabble word")
            break # Shortcircuit

    return response


@router('/scores', methods=['POST'])
@token_auth.login_required
def scores():
    """
    Updates the players' scores in a room
    """

    payload = request.get_json()

    name = payload.get('name')
    score = payload.get('score')
    room_id = payload.get('roomID')

    game_room = game_rooms.get_room(room_id)

    # Get player in room and update score
    player = game_room.get_player(name)
    player.set_score(score)

    # If all players have sent, announce winner to all
    if game_room.has_game_ended():
        sleep(1) 
        sio.emit("gameEnd", game_room.get_connected_players(), room=room_id)

    return dict(status="success")