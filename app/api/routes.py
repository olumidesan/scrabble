
from flask import jsonify, request

from app import db
from app.models import Word

from . import api_bp as api
from .auth import token_auth, error_response
from .utils import rooms, get_pieces, get_remaining_pieces


turn_order = None


@api.route('/rooms')
def sio_rooms():
    """Returns the list of socketIO rooms"""
    return jsonify(dict(rooms=list(rooms.keys())))

@api.route('/bag/<int:amount>')
def bag(amount):
    """
    Returns the requested number of pieces
    from the bag
    """
    room_id = request.args.get('roomID')
    return jsonify(dict(pieces=get_pieces(amount, room_id)))

@api.route('/words-check', methods=['POST'])
def words_check():
    """
    Validates that all the posted words are valid
    """

    words = request.get_json().get('words')
    # for word in words:
    #     valid = Word.query.filter_by(word=word).first()
    #     if not valid:
    #         return jsonify(dict(error=f"'{word}' is not a valid Scrabble word"))

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