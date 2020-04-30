
from threading import Lock
from flask import jsonify, request
from collections import defaultdict

from app import db
from app.models import Word
from app.socketio import rooms

from . import api_bp as api
from .auth import token_auth, error_response
from .utils import get_pieces, get_remaining_pieces


lock = Lock()
turn_order = None
snapshots = defaultdict(list)



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

@api.route('/words-check', methods=['POST'])
def words_check():
    """
    Validates that all the posted words are valid
    """

    words = request.get_json().get('words')
    for word in words:
        valid = Word.query.filter_by(word=word).first()
        if not valid:
            return jsonify(dict(error=f"'{word}' is not a valid Scrabble word"))

    return jsonify(dict(valid="true"))

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