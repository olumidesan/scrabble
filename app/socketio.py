
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

@sio.on('fromHost')
def from_host(data):
    """
    Event handler for host messages
    Essentially a rebroadcast
    """
    
    emit('gameChannel', data, room=data.get('roomID'))

@sio.on('rackEvent')
def rack_to_board(data):
    """
    Event handler for player messages
    Essentially a rebroadcast
    """
    
    # Simulate delay to allow previous piece to be 
    # removed from board
    sleep(0.2)
    emit('rackToBoard', data, room=data.get('roomID'))

@sio.on('boardEvent')
def board_drag(data):
    """
    Event handler for player messages
    Essentially a rebroadcast
    """

    emit('boardDrag', data, room=data.get('roomID'))