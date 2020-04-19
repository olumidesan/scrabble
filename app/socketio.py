
from app import sio
from time import sleep

from flask import session, request
from flask_socketio import join_room, leave_room, emit

@sio.on('join')
def on_join(data):
    """Event handler for room joins"""

    room = data['roomID']
    join_room(room)
    
    emit('joinedRoom', data, room=room)

# Re-broadcast events for player to other players
@sio.on('fromHost')
def from_host(data):
    """
    Event handler for host messages
    """
    
    emit('gameChannel', data, room=data.get('roomID'))

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

@sio.on('drawEvent')
def recall_event(data):
    """
    Event handler for play draw
    """

    emit('drawDone', data, room=data.get('roomID'))