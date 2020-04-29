
from app import sio
from time import sleep
from collections import defaultdict

from flask import session, request
from flask_socketio import join_room, leave_room, emit

# ----------- Persistence ------------
# Don't want to use a database. 
# Currently relying on Python's 
# thread-safe built-in data-types 

# For all socketio rooms, aliased
# as game IDs
rooms = []
# -------------------------------------

from .utils import players, get_player_to_play
from app.api.utils import get_all_pieces, get_remaining_pieces


@sio.on('join')
def on_join(data):
    """Event handler for room joins"""

    room = data['roomID']
    join_room(room)

    # Add to the rooms if not already there
    rooms.append(room) if room not in rooms else None

    # If it's not a reconnection event
    if not data.get('isReconnection'):
        emit('joinedRoom', data, room=room)

@sio.on('fromHost')
def from_host(data):
    """
    Event handler for host messages
    """
    room = data.get('roomID')
    emit('gameChannel', data, room=room)

@sio.on('rackEvent')
def rack_to_board(data):
    """
    Event handler for rack-to-board plays
    """
    
    # Simulate delay to allow previous piece to be 
    # removed from board
    sleep(0.2)
    emit('rackToBoard', data, room=data.get('roomID'))

@sio.on('boardEvent')
def board_drag(data):
    """
    Event handler for board drag plays
    """
    emit('boardDrag', data, room=data.get('roomID'))

@sio.on('recallEvent')
def recall_event(data):
    """
    Event handler for recall pieces plays
    """
    emit('recallPieces', data, room=data.get('roomID'))

@sio.on('playEvent')
def play_event(data):
    """
    Event handler for an actual valid play
    """

    room_id = data.get('roomID')

    # Update payload
    data['bagItems'] = get_all_pieces()
    data['bagLength'] = get_remaining_pieces()
    data['playerToPlay'] = get_player_to_play(room_id)
    
    emit('validPlay', data, room=room_id)

@sio.on('drawEvent')
def draw_event(data):
    """
    Event handler for draw play
    """
    room = data.get('roomID')
    ordered_players = data.get('playOrder')

    # Add a turn order variable as the first
    # item for each room
    players[room].append(None)

    for o_o in ordered_players: # Lol o_o
        players[room].append(o_o)

    # Add bag and its length to payload
    data['bagItems'] = get_all_pieces()
    data['bagLength'] = get_remaining_pieces()

    emit('drawDone', data, room=room)