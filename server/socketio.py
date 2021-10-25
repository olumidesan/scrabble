
from server import sio
from datetime import datetime

from .data import GameRoom, GameRooms, Player
from flask_socketio import join_room, leave_room, emit


game_rooms = GameRooms()


@sio.on('join')
def on_join(data):
    """Event handler for room joins"""

    limit = data.get('limit')
    player = data.get('player')
    room_id = data.get('roomID')
    time_to_play = data.get('timeToPlay')
    enable_audio = data.get('enableAudio')

    # Create new player from player data
    new_player = Player(player['name'], 
                        player['roomID'],
                        player['score'],
                        player['turn'],
                        player['isHost'],
                        player['isSpeaking'])

    # Get exisitng game room, if any
    existing_game_room = game_rooms.get_room(room_id)

    if existing_game_room:
        # Join room if the game hasn't started and the room is not yet full
        if existing_game_room.is_joinable():
            existing_game_room.add_player(new_player)
            join_room(room_id)

    else: # If room_id doesn't exist, then create new with required params
        new_game_room = GameRoom(room_id, limit, time_to_play, enable_audio)
        game_rooms.add_room(new_game_room)
        existing_game_room = new_game_room
        existing_game_room.add_player(new_player)
        join_room(room_id)

    new_player.activate() # Make player object usable

    # Tell client of connected players, so they can know
    data['mode'] = "create"
    data['timeToPlay'] = existing_game_room.time_to_play
    data['enableAudio'] = existing_game_room.audio_is_enabled
    data['connectedPlayers'] = existing_game_room.get_connected_players()

    # Not Implemented
    # If it's not a reconnection event
    # if not data.get('isReconnection'):
    emit('joinedRoom', data, room=room_id)


@sio.on('resume')
def on_resume(data):
    """Event handler for room joins"""

    room_id = data.get('roomID')
    game_room = game_rooms.get_room(room_id)
    player_name = data.get('player').get('name')

    if game_room:
        join_room(room_id)

        player = game_room.get_player(player_name)
        player.activate()

        # Tell client of connected players, so they can know
        data['mode'] = "resume"
        data['timeToPlay'] = game_room.time_to_play
        data['enableAudio'] = game_room.audio_is_enabled
        data['connectedPlayers'] = game_room.get_connected_players()

        emit('joinedRoom', data, room=room_id)


@sio.on('leave')
def on_leave(data):
    """Event handler for room exits"""

    room_id = data['roomID'] # Get room
    game_room = game_rooms.get_room(room_id)

    if game_room:            
        # Will use this if the option to kill sessions
        # is enabled. It currently isn't implemented
        # game_rooms.pop(room_id) # Remove room

        leave_room(room_id) # Remove sio room

        # Make all players inactive (so game can be resumed)
        for player in game_room.get_all_players():
            player.deactivate()        
        
        emit('leftRoom', data, room=room_id) # Announce


@sio.on('gameCreateEvent')
def on_create(data):
    """
    Event handler for game official creation
    """
    room_id = data.get('roomID')
    game_room = game_rooms.get_room(room_id)

    # Close the room
    game_room.close()  # Game has started

    # Tell client of all connected players
    data['allPlayers'] = game_room.get_connected_players()

    emit('gameCreate', data, room=room_id)


@sio.on('gameResumeEvent')
def on_resume(data):
    """
    Event handler for game official resumption
    """
    room_id = data.get('roomID')
    game_room = game_rooms.get_room(room_id)

    # Close the room
    game_room.close()  # Game has started

    # Tell client of all connected players
    data['rack'] = { p.name:p.get_rack() for p in game_room.get_all_players() }
    data['allPlayers'] = game_room.get_connected_players()
    data['usedTiles'] = game_room.get_board()

    emit('gameResume', data, room=room_id)


@sio.on('inPlayEvent')
def in_play_event(data):
    """
    Event handler for in-play happenings (board-drags, etc)
    """
    emit('inPlay', data, room=data.get('roomID'))


@sio.on('radioEvent')
def radio(data):
    """
    Event handler for voice chatting
    """
    emit('audioTransmission', data, room=data.get('roomID'))


@sio.on('recallEvent')
def recall_event(data):
    """
    Event handler for when pieces are recalled on the board
    """
    emit('recallPieces', data, room=data.get('roomID'))


@sio.on('playEvent')
def play_event(data):
    """
    Event handler for an actual valid play
    """

    name = data.get('name')
    score = data.get('score')
    room_id = data.get('roomID')
    played_word = data.get('word')
    turn_skipped = data.get('isTurnSkipped')
    turn_swapped = data.get('isTurnSwapped')
    game_room = game_rooms.get_room(room_id)

    # Get bag and player in room
    room_bag = game_room.bag
    player = game_room.get_player(name)

    # Update payload
    # If turn wasn't skipped nor pieces swapped
    if not turn_swapped and not turn_skipped:
        player.update_score(score) # Update score
        log = f"{name} played {played_word} worth {score} points"

    # Track turn skips
    if turn_skipped:
        game_room.increment_turn_skips()
        log = f"{name} skipped turn"

    else:
        game_room.reset_turn_skips()

    if turn_swapped:
        pieces_swapped = data.get('piecesSwapped')
        for piece_data in pieces_swapped:

            # Cut off client index to get id
            piece_id = piece_data.get('id')[2:]

            # Get scrabble piece and increment number
            bag_piece = room_bag.get_piece_by_id(piece_id)
            bag_piece.increment()
        
        log = f"{name} swapped {len(pieces_swapped)} pieces"

    data['bag'] = game_room.get_bag()
    data['updatedScore'] = player.get_score()
    data['turnSkips'] = game_room.get_turn_skips()
    data['playerToPlay'] = game_room.get_player_to_play()
    
    # Log event to game room    
    game_room.log({"time": datetime.now().strftime("%H:%M:%S"), "event": log}) 

    emit('validPlay', data, room=room_id)


@sio.on('drawEvent')
def draw_event(data):
    """
    Event handler for draw play
    """
    room_id = data.get('roomID')
    game_room = game_rooms.get(room_id)

    # Get player turns from room
    players = game_room.get_player_turns()

    data['players'] = players
    data['bag'] = game_room.get_bag()

    emit('drawDone', data, room=room_id)


@sio.on('resumeEvent')
def draw_event(data):
    """
    Event handler for draw play
    """
    room_id = data.get('roomID')
    game_room = game_rooms.get(room_id)

    # Get the player whose turn it was to play
    player_to_play = list(filter(lambda p: p.get_turn(), game_room.get_all_players()))[0]
    data['playerToPlay'] = player_to_play.name

    data['bag'] = game_room.get_bag()

    emit('ResumeDone', data, room=room_id)