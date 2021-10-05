import uuid
from itertools import cycle
from random import shuffle, seed
from secrets import choice, randbelow


# Default random seed
SEED = randbelow(2021)

# The piece, weight, number of each scrabble piece
scrabble_pieces = {
    ' ': (0, 2),
    'A': (1, 9),
    'E': (1, 12),
    'I': (1, 9),
    'O': (1, 8),
    'U': (1, 4),
    'N': (1, 6),
    'R': (1, 6),
    'T': (1, 6),
    'L': (1, 4),
    'S': (1, 4),
    'D': (2, 4),
    'G': (2, 3),
    'B': (3, 2),
    'C': (3, 2),
    'M': (3, 2),
    'P': (3, 2),
    'F': (4, 2),
    'H': (4, 2),
    'V': (4, 2),
    'W': (4, 2),
    'Y': (4, 2),
    'K': (5, 1),
    'J': (8, 1),
    'X': (8, 1),
    'Z': (10, 1),
    'Q': (10, 1),
}


def seeded_shuffle(data):
    """
    Shuffle data with pre-determined seed
    """
    seed(SEED)  # Seed state
    data = list(data)  # Listify
    shuffle(data)  # Shuffle data
    return data  # Returned shuffled


def generate_uuid(): return str(uuid.uuid4().hex[:6])


class ScrabblePiece:
    def __init__(self, index: int, piece: str, weight: int, number: int):
        self.piece = piece
        self.weight = weight
        self.number = number
        self._id = f"{index}__{generate_uuid()}"

    @property
    def id(self):
        return self._id

    def increment(self) -> None:
        self.number += 1

    def decrement(self) -> None:
        if self.number > 0:
            self.number -= 1

    def serialize(self) -> dict:
        return {
            "id": self._id,
            "piece": self.piece,
            "weight": self.weight,
            "number": self.number
        }

    def __repr__(self) -> str:
        return f"ScrabblePiece <id={self.id}, piece={self.piece}, weight={self.weight}, number={self.number}>"


class ScrabbleBag:

    def __init__(self) -> None:
        self.pieces = {piece: ScrabblePiece(index, piece, weight, number)
                       for index, (piece, (weight, number)) in enumerate(scrabble_pieces.items())}

    def __len__(self) -> int:
        return sum([i.number for i in self.pieces.values()])

    def _get_remaining_pieces(self) -> list:
        return [i for i in self.pieces.values() if i.number > 0]

    def get_piece_by_id(self, pid: str) -> list:
        return list(filter(lambda piece: piece.id == pid, self.pieces.values()))[0]

    def get_pieces(self, amount) -> list:
        """
        Gets pieces from the bag 
        and updates the bag, of course
        """

        # Storage for the requested new pieces
        new_pieces = []

        # Get the number of the remaining pieces
        pieces_left = self._get_remaining_pieces()
        num_pieces_left = sum([i.number for i in pieces_left])

        # If the requested amount is less than the number of
        # pieces in the bag, re-assign the amount to the remainder
        amount = num_pieces_left if num_pieces_left <= amount else amount

        # Fill up the requested new pieces
        while len(new_pieces) != amount:
            # Get a random piece
            piece = choice(pieces_left)

            if piece.number > 0:
                piece.decrement()
                new_pieces.append(piece.serialize())

        return new_pieces

    def serialize(self) -> dict:
        return {
            "length": len(self),
            "pieces": {name: piece.serialize() for name, piece in sorted(self.pieces.items())}
        }

    def __repr__(self) -> str:
        return f"ScrabbleBag <size={len(self)}>"


class Player:
    def __init__(self, name, room_id, score, turn, is_host, is_speaking):
        self.name = name
        self.turn = turn
        self.score = score
        self.room_id = room_id
        self.is_host = is_host
        self.has_score_set = False
        self.is_speaking = is_speaking

    def get_score(self) -> int:
        return self.score

    def set_score(self, score):
        self.score = score
        self.has_score_set = True

    def update_score(self, score):
        self.score += score

    def serialize(self) -> dict:
        return {
            "name": self.name,
            "turn": self.turn,
            "roomID": self.room_id,
            "isHost": self.is_host,
            "score": self.get_score(),
            "isSpeaking": self.is_speaking,
        }

    def __repr__(self) -> str:
        return f"Player <name={self.name}, score={self._score}, host={self.is_host}>"


class GameRoom:
    def __init__(self, id, limit=4, time_to_play=None, audio_is_enabled=False):

        self.id = id
        self.limit = limit

        self._logs = []
        self._players = {}
        self._turn_skips = 0
        self._is_joinable = True
        self._bag = ScrabbleBag()
        self._player_turns = None
        self._time_to_play = time_to_play
        self._audio_is_enabled = audio_is_enabled

    @property
    def bag(self):
        return self._bag

    @property
    def time_to_play(self):
        return self._time_to_play

    @property
    def audio_is_enabled(self):
        return self._audio_is_enabled

    def get_turn_skips(self) -> int:
        return self._turn_skips

    def log(self, data) -> None:
        self._logs.append(data)

    def get_logs(self) -> list:
        return self._logs

    def reset_turn_skips(self) -> None:
        self._turn_skips = 0

    def increment_turn_skips(self) -> None:
        self._turn_skips += 1

    def get_bag(self) -> dict:
        return self._bag.serialize()

    def add_player(self, player: Player):
        self._players[player.name] = player

    def remove_player(self, player: Player):
        self._players.pop(player.name)

    def get_player(self, name) -> Player:
        return self._players.get(name)

    def get_player_to_play(self) -> dict:
        return next(self._player_turns).serialize()

    def get_player_turns(self) -> list:
        return [i.name for i in seeded_shuffle(self._players.values())]

    def is_joinable(self) -> bool:
        return len(self._players) != self.limit and self._is_joinable

    def serialize(self) -> dict:
        return dict(id=self.id, limit=self.limit, joinable=self.is_joinable())

    def get_connected_players(self):
        return [i.serialize() for i in self._players.values()]

    def has_game_ended(self) -> bool:
        return all([p.has_score_set for p in self._players.values()])

    def close(self):
        if self._is_joinable:
            self._is_joinable = False

            # Ready for round-robining
            players = seeded_shuffle(self._players.values())

            # Turn to round-robin
            self._player_turns = cycle(players)
            self.get_player_to_play()  # Start

    def __repr__(self) -> str:
        return f"GameRoom <{self.id}>"


class GameRooms(dict):
    def __init__(self, *args, **kwargs):
        self.update(*args, **kwargs)

    def get_room(self, room_id: str) -> GameRoom:
        return self.get(room_id)

    def add_room(self, room: GameRoom):
        return self.__setitem__(room.id, room)

    def __repr__(self) -> str:
        room_ids = [i for i in self.keys()]
        return f"GameRooms <{room_ids}>"
