
from app import sio
from time import sleep
from collections import defaultdict

from flask import session, request
from flask_socketio import join_room, leave_room, emit

from .utils import players, get_player_to_play
from app.api.utils import rooms, make_bag, get_all_pieces, get_remaining_pieces


@sio.on('join')
def on_join(data):
    """Event handler for room joins"""

    room = data['roomID']
    join_room(room)

    # Mock a bag for the very first
    # connection (host) to the room
    if room not in rooms:
        rooms[room] = []

    # If it's not a reconnection event
    if not data.get('isReconnection'):
        emit('joinedRoom', data, room=room)

@sio.on('leave')
def on_leave(data):
    """Event handler for room exits"""

    room = data['roomID']
    
    # Do stuff
    # rooms.pop(room)
    # leave_room(room)
    # players.pop(room)

@sio.on('gameStartEvent')
def from_host(data):
    """
    Event handler for host messages
    """
    room = data.get('roomID')

    # Once the game has started, create a 
    # bag for that game session
    rooms[room] = make_bag()

    emit('gameStart', data, room=room)

@sio.on('inPlayEvent')
def in_play_event(data):
    """
    Event handler for in play happenings
    """
    emit('inPlay', data, room=data.get('roomID'))

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

    room = data.get('roomID')

    # Update payload
    data['bagItems'] = get_all_pieces(room)
    data['bagLength'] = get_remaining_pieces(room)
    data['playerToPlay'] = get_player_to_play(room)
    
    emit('validPlay', data, room=room)

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
    data['bagItems'] = get_all_pieces(room)
    data['bagLength'] = get_remaining_pieces(room)

    emit('drawDone', data, room=room)