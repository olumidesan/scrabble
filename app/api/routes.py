

from . import api_bp as api
from .auth import token_auth, error_response

from random import choice
from flask import jsonify, request


pieces_weight = {
    ' ': 0,
    'A': 1,
    'E': 1,
    'I': 1,
    'O': 1,
    'U': 1,
    'N': 1,
    'R': 1,
    'T': 1,
    'L': 1,
    'S': 1,
    'D': 2,
    'G': 2,
    'B': 3,
    'C': 3,
    'M': 3,
    'P': 3,
    'F': 4,
    'H': 4,
    'V': 4,
    'W': 4,
    'Y': 4,
    'K': 5,
    'J': 8,
    'X': 8,
    'Z': 10,
    'Q': 10
}

pieces_number = {
    ' ': 2,
    'A': 9,
    'E': 12,
    'I': 9,
    'O': 8,
    'U': 4,
    'N': 6,
    'R': 6,
    'T': 6,
    'L': 4,
    'S': 4,
    'D': 4,
    'G': 3,
    'B': 2,
    'C': 2,
    'M': 2,
    'P': 2,
    'F': 2,
    'H': 2,
    'V': 2,
    'W': 2,
    'Y': 2,
    'K': 1,
    'J': 1,
    'X': 1,
    'Z': 1,
    'Q': 1
}


pieces = list(pieces_number.keys())

def get_pieces(amount):
    """Gets pieces from the bag"""

    # Storage for the requested new pieces
    new_pieces = [] 
    # Get the number of the remaining tiles
    bag_length = sum(pieces_number.values()) 

    # If the requested amount is less than the number of
    # pieces in the bag, re-assign the amount to the remainder
    amount = bag_length if bag_length < amount else amount

    # Fill up the requested new pieces
    while len(new_pieces) != amount:
        # Get a random piece
        piece = choice(pieces)
        # If the piece hasn't been exhaused
        if pieces_number.get(piece) > 0:
            # Add it to the result array
            new_pieces.append(dict(letter=piece, value=pieces_weight[piece]))
            # Decrease the number of said piecce
            pieces_number[piece] -= 1   

    return new_pieces

@api.route('/bag', methods=['GET', 'POST'])
# @token_auth.login_required
def bag():
    if request.method == 'GET':
        return jsonify(dict(pieces_left=sum(pieces_number.values())))
    
    # Implicit post
    payload = request.get_json(silent=True)
    amount = payload.get('amount')

    new_pieces = get_pieces(amount)

    return jsonify(dict(pieces=new_pieces))


    # if payload.get('login') != current_app.config.get('ADMIN_GITHUB_NAME'):
    #     return error_response(401)
