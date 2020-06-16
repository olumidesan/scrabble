
from flask import jsonify, request
from threading import Lock

from app import db
from app.models import Word

from . import api_bp as api
from .auth import token_auth
from .utils import rooms, update_scores, get_pieces, get_remaining_pieces


lock = Lock()

@api.route('/rooms')
# @token_auth.login_required
def sio_rooms():
    """Returns the list of socketIO rooms"""
    return jsonify(dict(rooms=list(rooms.keys())))

@api.route('/bag/<int:amount>')
# @token_auth.login_required
def bag(amount):
    """
    Returns the requested number of pieces
    from the bag in the room
    """
    room_id = request.args.get('roomID')
    return jsonify(dict(pieces=get_pieces(amount, room_id)))

@api.route('/words-check', methods=['POST'])
# @token_auth.login_required
def words_check():
    """
    Validates that all the posted words are valid
    """
    # Get the words to be validated
    words = request.get_json().get('words')

    # Validate all. If any is invalid, return an error
    for word in words:
        valid = Word.query.filter_by(word=word).first()
        if not valid:
            return jsonify(dict(error=f"'{word}' is not a valid Scrabble word"))

    return jsonify(dict(valid="true"))

@api.route('/scores', methods=['POST'])
# @token_auth.login_required
def scores():
    """
    Updates the players' scores in a room
    """

    payload = request.get_json()

    name = payload.get('name')
    room = payload.get('roomID')
    score = payload.get('score')

    # Synchronize
    with lock:
        update_scores(room, name, score)

    return jsonify(dict(message="success"))

# For game save feature/page refresh.Tbd
# @api.route('/snapshot/<room_id>', methods=['GET', 'POST'])
# def snapshot(room_id):
#     """Saves/Returns room board states"""
    
#     if request.method == 'GET':
#         snapshot = snapshots.get(room_id)
#         return jsonify(dict(snapshot=snapshot))
    
#     # Implicit POST
#     snapshots[room_id].append(request.get_json(silent=True))

#     return jsonify(dict(message="Saved successfully"))