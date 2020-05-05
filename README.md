## Scrabble
A strictly multi-player Scrabble game that allows gameplay between people on a network

### Requirements
- A laptop, or any device that allows dragging web elements with a mouse.
- Please note that development was tailored specifically towards laptops, as they fully support the [HTML5 Draggable](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) API, unlike mobile devices or tablets.
- Err...just use a laptop and adjust the zoom as needed.
- Python 3.6+
### Usage
To play the game, you're either the **host** or not (a mere **player**). 

The host is the person who, well, hosts a game session to which other players connect to using the host's **Game ID**.
 The following instructions are meant for the host, as [s]he has to host the server on which the game would run.

#### Dependency Installation
As a host, you need the following:
- A Python virtual environment. If you don't already know how to create one, see [here](https://realpython.com/lessons/creating-virtual-environment/).
- Pipenv: In the activated virtual environment, simply run `pip3 install pipenv`.

#### Game Procedure
 To host a game session:

- Clone and checkout this `master` branch; or alternatively, simply download it as a zip file.
- Ensure the virtual environment is activated. Then, using `pipenv`, install the game's requirements: `pipenv install`.
- When that's done, simply run `pipenv run python3 wsgi.py`. This starts the game server.
- By default, the application tries to get your local private IP address (not localhost) to run on. However, if you're using a VPN or are on a weird network, it may get it wrong. Feel free to modify the `host` variable in the `wsgi.py` file to your actual local private IP address. The only caveat is that you have to host the app on the private IP address and not `localhost`. This is in order to allow other players on your network to visit the application.
- Navigate to your local private IP address (`192.168...:5005`) and get playing. 
- Host a game session. During this, a Game ID would be automatically generated for you. Share this with the people you want to play with.

### Sneak-Peak
Gameplay sneak-peak
![](gameplay.png)

### Motivation
It's Corona times, sadly, and we're stuck indoors for who knows how long. My housemates and I play Scrabble on our game nights. However, gameplay isn't as smooth, as we have to turn the Scrabble board each time its our turn, usually causing the pieces to jangle.

So, I wanted to create a way for all of us to play the game from the comfort of our own rooms, using just the local network all of us are connected to. This entire repo is the result of this effort.

### Known Issues
- Scrabble allows swapping pieces in place of one's turn. This feature currently hasn't been implemented.
- Once pieces have been moved from the rack to the board, they can only be returned to the rack using the 'Recall Pieces' button.
- Last piece in rack sometimes disappears after a player's turn. This bug is known and is currently being attacked. The current fix is simply to use the 'Recall Pieces' button, which effectively refreshes the rack, making the piece re-appear.
- When the played word has more than one valid word, the actually played word may not be what's read out as being played, and may instead be one of the other linked words.

### Collaborations and Development
- Collaborations are more than welcome! The scoring algorithm, for example, I'm sure can be refined.
- Development is done in the `dev` branch: `git checkout dev`. Current issues are in the `DevFlow.md` file.