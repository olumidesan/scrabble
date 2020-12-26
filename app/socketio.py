
from app import sio
from time import sleep
from itertools import cycle
from threading import Lock

from app.api.utils import (rooms, 
                           make_bag, 
                           get_all_pieces, 
                           get_player_score,
                           get_player_to_play, 
                           get_remaining_pieces)

from flask import request
from flask_socketio import join_room, leave_room, emit



lock = Lock()

@sio.on('join')
def on_join(data):
    """Event handler for room joins"""

    room = data['roomID']
    join_room(room)

    # Mock a bag for the very first
    # connection (host) to the room
    if room not in rooms:
        rooms[room] = dict()

    # If it's not a reconnection event
    if not data.get('isReconnection'):
        emit('joinedRoom', data, room=room)

@sio.on('leave')
def on_leave(data):
    """Event handler for room exits"""

    # Tbd

    # rooms.pop(room)
    # leave_room(room)
    # players.pop(room)
    # room = data['roomID']

    pass

@sio.on('gameStartEvent')
def from_host(data):
    """
    Event handler for host messages
    """
    room = data.get('roomID')

    # Once the game has started, create the needed
    # items for an entire game session. Bag, players...
    rooms[room]['players'] = []
    rooms[room]['bag'] = make_bag()
    rooms[room]['final_scores'] = []
    rooms[room]['player_turns'] = []
    rooms[room]['player_scores'] = {}

    emit('gameStart', data, room=room)

@sio.on('inPlayEvent')
def in_play_event(data):
    """
    Event handler for in play happenings
    """
    emit('inPlay', data, room=data.get('roomID'))


@sio.on('radio')
def radio(data):
    """
    Event handler for in voice transmissions
    """
    emit('voiceT', data, room=data.get('roomID'))

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
    if not data.get('isTurnSkipped'):
        data['updatedScore'] = data['score'] + get_player_score(data.get('name'), room)
    
    emit('validPlay', data, room=room)

@sio.on('drawEvent')
def draw_event(data):
    """
    Event handler for draw play
    """
    room = data.get('roomID')
    ordered_players = data.get('playOrder')

    # Save all players in a room and their turns
    for o_o in ordered_players: # Lol o_o
        rooms[room]['players'].append(o_o)
        rooms[room]['player_scores'][o_o] = 0
        rooms[room]['player_turns'].append(o_o)

    # Convert player turns into round robin list
    rooms[room]['player_turns'] = cycle(rooms[room]['player_turns'])
    next(rooms[room]['player_turns']) # Client knows initially

    # Add bag and its length to payload
    data['bagItems'] = get_all_pieces(room)
    data['bagLength'] = get_remaining_pieces(room)

    emit('drawDone', data, room=room)

@sio.on('finalBoardUpdate')
def board_update(data):
    """
    Event handler for the final board update
    signifying the end of the game
    """
    room = data.get('roomID')
    
    # If all players have announced their final score
    if len(rooms[room]['final_scores']) == len(rooms[room]['players']):
        emit('gameEnd', {"finalPlayerScores": rooms[room]['final_scores']}, room=room)