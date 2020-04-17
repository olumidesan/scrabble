
from app import sio

from flask import session, request
from flask_socketio import join_room, leave_room, emit

# @sio.on('connect')
# def on_join():
#     """Clients' initial connection"""
    
#     session["sio_id"] = request.sid

@sio.on('join')
def on_join(data):
    room = data['roomID']
    name = data['name']
    join_room(room)
    emit('joinedRoom', dict(response=f'{name} has joined the room.'), room=room)