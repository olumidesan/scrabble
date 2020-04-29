
import string
import random

from itertools import cycle
from collections import defaultdict


# For all players associated with rooms
# identified by their roomID and ordered 
# by turn
players = defaultdict(list)


def token_generator(size=32, chars=string.ascii_uppercase + string.digits):
    """Generates Random tokens"""

    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def get_player_to_play(room_id):
    """Returns the player to play next in a given room"""
   
    player_to_play = ''
    room = players.get(room_id)

    try:         
        # If the first item is still None i.e
        # it's still a mere list
        if room[0] == None:
            # Pop out the None
            room.pop(0)
            # Change the room to a round-robin list
            players[room_id] = cycle(room)
            next(players[room_id]) # Client knows already, initially.
            player_to_play = next(players[room_id]) # Who's next to play?

    except TypeError:
        player_to_play = next(room)
    
    return player_to_play

    