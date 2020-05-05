import React, { Component } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Board from '../Board/Board';
import Rack from '../Rack/Rack';
import makeServerRequest from '../../helpers/axios';
import ScoreTable from '../../components/ScoreTable/ScoreTable';
import WaitingRoom from '../../components/WaitingRoom/WaitingRoom';
import LandingPage from '../../components/LandingPage/LandingPage';
import JoinGameForm from '../../components/JoinGameForm/JoinGameForm';
import CreateGameForm from '../../components/CreateGameForm/CreateGameForm';


export default class GameUser extends Component {
    constructor(props) {
        super(props);

        this.numOfPlayers = 0;
        this.socket = io('http://192.168.0.165:5005', { transports: ['websocket'] });
        // this.socket = io(`http://${window.serverIP}:5005`, { transports: ['websocket'] });

        // Randomly generated id that represents the game room, just in case the client
        // decides to be a game session host
        this.roomID = `SC-${window.crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0, 6)}`;

        this.state = {
            name: '',
            roomID: '',
            players: [],
            bagItems: {},
            isTurn: false,
            isHost: false,
            bagLength: 100,
            gameEnded: false,
            gameStarted: false,
            connectedPlayers: 0,
        }
    }

    getPlayedPieces = () => {
        return document.querySelectorAll('.bp');
    }

    getPiecesOnRack = () => {
        // Storage for the pieces on the rack
        let pieces = [];

        // For each piece in the rack, get the letter and value and then
        // store each one in the above array.
        document.querySelectorAll('.pieceContainer').forEach((piece) => {
            pieces.push({
                letter: piece.textContent.slice(0, 1),
                value: parseInt(piece.textContent.slice(1))
            });
        });

        return pieces;
    }

    concretizePlayedPieces = () => {
        // Make all the pieces permanent. Do this, essentially, 
        // by removing their identifiable class
        let playedPieces = this.getPlayedPieces();
        if (playedPieces.length > 0) {
            playedPieces.forEach((piece) => {
                // Remove previously identifiable attrs.
                piece.removeAttribute('class');
                piece.removeAttribute('id');
                // Add class of validated play (vP)
                piece.setAttribute('class', 'vP');
                piece.setAttribute('draggable', false);
                piece.parentNode.setAttribute('draggable', false);
            });
        }
    }

    showJoin = () => {
        document.querySelector('.landing').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'block';
    }

    registerHost = () => {
        if (!this.state.isHost) {
            this.setState({ isHost: true, roomID: this.roomID });
        }

        document.querySelector('.landing').style.display = 'none';
        document.querySelector('.configForm').style.display = 'block';
    }

    saveID = (event) => {
        this.setState({ roomID: `SC-${event.target.value}`.toString() })
    }

    saveUser = (event) => {
        this.setState({ name: event.target.value })
    }

    savePlayers = (event) => {
        this.numOfPlayers = parseInt(event.target.value);
    }

    startGame = (e) => {
        e.preventDefault();

        // Name should be at least three letters
        if (this.state.name.length < 3) {
            toast.error("Kindly enter a longer name. Don't be shy.");
            return;
        }
        // Number of players must be two, three or four
        if (![2, 3, 4].includes(this.numOfPlayers)) {
            toast.error("Kindly select a valid number of players");
            return;
        }
        document.querySelector('.configForm').style.display = 'none';
        document.querySelector('.waitingMessage').style.display = 'block';
        this.socket.emit('join', { name: this.state.name, roomID: this.roomID });
    }

    joinRoom = (e) => {
        e.preventDefault();

        // Name should be at least three letters
        if (this.state.name.length < 3) {
            toast.error("Kindly enter a longer name. Don't be shy.");
            return;
        }
        // Game IDs must be nine characters
        if (this.state.roomID.length !== 9) {
            toast.error("Sorry, that's an invalid Game ID.");
            return;
        }

        // Get all the current game session IDs and validate
        // that the inputted Game ID is valid 
        let gameIDs = makeServerRequest({ requestType: 'get', url: '/rooms', payload: {} });
        gameIDs.then(data => {
            // Validate
            if (!data.rooms.includes(this.state.roomID)) {
                toast.error(`😬 There's currently no game session with ID, ${this.state.roomID}.`);
                return;
            }

            // Join the room
            this.socket.emit('join', { name: this.state.name, roomID: this.state.roomID });
            // Show waiting room
            document.querySelector('.joinForm').style.display = 'none';
            document.querySelector('.waitingMessage').style.display = 'block';
        });
    }

    showHome = (e) => {
        e.preventDefault();
        // Essentially a reset
        this.numOfPlayers = 0;
        this.setState({ isHost: false, name: '' })

        document.querySelector('.landing').style.display = 'block';
        document.querySelector('.joinForm').style.display = 'none';
        document.querySelector('.configForm').style.display = 'none';
    }

    componentDidMount = () => {
        // Hide some configs initially
        document.querySelector('.waitingMessage').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'none';
        document.querySelector('.configForm').style.display = 'none';
        document.querySelector('.entry').style.display = 'none';

        /* Register event listeners */

        // window.addEventListener('beforeunload', this.beforeUnload);

        // Incase socket.io loses connection to the server
        this.socket.on('reconnect_attempt', () => {
            this.socket.io.opts.transports = ['polling', 'websocket'];
            document.getElementById('connstatus').setAttribute('title', "Reconnecting...");
            document.getElementById('connstatus').setAttribute('class', 'has-text-warning');
        });

        // On connect
        this.socket.on('connect', () => {
            document.getElementById('connstatus').setAttribute('title', "Server Connection: Good");
            document.getElementById('connstatus').setAttribute('class', 'has-text-success');
            if (this.state.gameStarted) {
                this.socket.emit('join', { roomID: this.roomID, isReconnection: true });
            }
        });

        // On disconnect
        this.socket.on('disconnect', () => {
            if (this.state.gameStarted) {
                toast.error("Lost connection to the game server. Trying to reconnect...");
            }
            document.getElementById('connstatus').setAttribute('title', "Connection Lost");
            document.getElementById('connstatus').setAttribute('class', 'has-text-danger');
        });

        // When a new player joins (host or not)
        this.socket.on('joinedRoom', (data) => {
            // The room is closed once the game has started
            if (!this.state.gameStarted) {
                // Save the player's name and update the number of
                // connected players. For the host, this happens 
                // immediately the game starts
                this.setState({
                    players: [...this.state.players, data.name],
                    connectedPlayers: this.state.connectedPlayers + 1,
                }, () => {
                    // If the client is the host and the number of connected players
                    // is the same as the number of required players, then announce
                    // that the game has started. Also send all the registered players
                    // to everybody so they can update their state
                    if (this.state.isHost && (this.state.connectedPlayers === this.numOfPlayers)) {
                        this.socket.emit('gameStartEvent', {
                            allPlayers: this.state.players,
                            roomID: this.state.roomID,
                            gameStarted: true
                        });
                    }
                });
            }
        });

        // When a draw has been made. Announce who goes first.
        this.socket.on('drawDone', (data) => {
            let firstToPlay = data.playOrder[0];
            let firsToPlayMessage, playOrderMessage = '';

            // Reorder the state's players to match the turn order.
            // Also note the length of pieces in the bag
            this.setState({
                players: data.playOrder,
                bagLength: data.bagLength,
                bagItems: data.bagItems
            });

            if (firstToPlay === this.state.name) {
                this.setState({ isTurn: true });
                firsToPlayMessage = `You get to play first`;
            }
            else {
                firsToPlayMessage = `${firstToPlay} gets to play first`;
            }

            // Show on the score table whose turn it is
            document.getElementById(`turn_${firstToPlay}`).innerText = 'Yes';

            // Also announce the turn order
            data.playOrder.forEach((player, index) => {
                if (player === this.state.name) {
                    player = `${player} (You)`;
                }
                if ((index + 1) === data.playOrder.length) {
                    playOrderMessage += player;
                }
                else {
                    playOrderMessage += `${player}, then `
                }
            });

            toast.warn(`${firsToPlayMessage}. Also note that the turn order is, ${playOrderMessage}.`)
        });

        // If the game has started, remove the configuration
        // elements. Then update the state of the connected clients.
        this.socket.on('gameStart', (data) => {
            // The host already has its name and connected players state up to date
            // The remainder of the clients don't however. This does the actual update
            this.setState({
                gameStarted: true,
                players: !this.state.isHost ? [...data.allPlayers] : [...this.state.players],
                connectedPlayers: !this.state.isHost ? data.allPlayers.length : this.state.connectedPlayers,
            });

            // Unhide main game space and remove the config divs
            document.querySelector('.entry').removeAttribute('style');
            document.querySelectorAll('.configElements').forEach((node) => {
                node.remove();
            });

            let welcomeMessage = this.state.isHost ?
                "All players have joined. Make a draw using the yellow button on your button rack. You'll"
                :
                "The host will make a draw, and you'll"
            toast.success(`✨ Welcome, ${this.state.name}! ${welcomeMessage} be notified (just like this) of who gets to play first. Good luck!`)
        });

        // When the game ends. Show a modal with the winner
        this.socket.on('gameEnd', (data) => {
            let finalMessage = '';
            let winner = { name: '', score: 0 };

            data.finalPlayerScores.forEach(player => {
                // Update final player's score on board
                document.getElementById(`score_${player.name}`).innerText = player.score;

                // Once that's done, compare and     get winner
                if (player.score > winner.score) {
                    winner.name = player.name;
                    winner.score = player.score;
                }
            });

            // Construct final message
            if (this.state.name === winner.name) {
                finalMessage = `Congratulations, ${winner.name}! You are the winner with ${winner.score} points.`;
            }
            else {
                finalMessage = `${winner.name} is the winner with ${winner.score} points. Good game, ${this.state.name}.`;
            }

            // Once all scores have been checked, update the board with the winner
            document.getElementById(`pid_${winner.name}`).innerText = `${document.getElementById(`pid_${winner.name}`).innerText} 🏆`;

            // Show modal with final message
            this.toggleModal();
            document.getElementById('winner').innerText = finalMessage;
        });


        // Register for event to effect an actual valid play
        this.socket.on('validPlay', (data) => {
            let turnMessage, message;

            // Make played pieces permanent for everybody
            this.concretizePlayedPieces();

            // Update local state upon each play
            if (data.playerToPlay === this.state.name) {
                this.setState({
                    isTurn: true,
                    bagItems: data.bagItems,
                    bagLength: data.bagLength,
                }, () => turnMessage = `your turn to play`);
            }
            else {
                this.setState({
                    isTurn: false,
                    bagItems: data.bagItems,
                    bagLength: data.bagLength,
                }, () => turnMessage = `${data.playerToPlay}'s turn to play`);
            }

            // Update turn column on board
            this.state.players.forEach(player => {
                if (player === data.playerToPlay) {
                    document.getElementById(`turn_${player}`).innerText = 'Yes';
                }
                else {
                    document.getElementById(`turn_${player}`).innerText = 'No';
                }
            });

            // If a turn is skipped, then there's no score associated with that 
            // turn. Use this as a conditional to render score or turn skipped
            // message
            if (data.isTurnSkipped) {
                message = data.name === this.state.name ?
                    "You skipped your turn" :
                    message = `Turn skipped by ${data.name}`;
            }
            else {
                // Construct score message
                message = data.name === this.state.name ?
                    `You played "${data.word}" worth ${data.score} points` :
                    `${data.name} played "${data.word}" worth ${data.score} points`;

                // Update the score board with the score
                let scoreDiv = document.getElementById(`score_${data.name}`);
                scoreDiv.innerText = parseInt(scoreDiv.innerText) + data.score
            }

            // If the player's rack is empty and the bag is also 
            // empty, the game has ended
            if (data.numOfRem === 0 && data.bagLength === 0) {
                let score = 0;

                // Announce to everybody
                toast.info(`${message}.`);
                this.setState({ gameEnded: true });

                /* Once tha game has ended, according to the official Scrabble rules, the 
                remaining pieces left on each player's rack are counted and subtracted from
                their final score.*/

                // Get the score for the player
                score = parseInt(document.getElementById(`score_${this.state.name}`).innerText);

                // Get the remaining pieces on the player's rack
                let remainingRackPieces = this.getPiecesOnRack();
                // For each of them, deduct their value from the player's score
                remainingRackPieces.forEach(piece => {
                    score = score - piece.value;
                });

                // Post the scores
                // This is done as a post request to streamline the posts, as all
                // clients will be doing this at the same time.
                makeServerRequest({
                    requestType: 'post', url: '/scores', payload: {
                        roomID: this.state.roomID,
                        name: this.state.name,
                        score: score
                    }
                })
                // Emit an update after posting
                .then(() => {
                    this.socket.emit('finalBoardUpdate', { roomID: this.state.roomID, });
                });
            }
            // If the game hasn't ended
            else {
                let emptyMessage = '';
                // Announce to everybody
                toast.info(`${message}. It's ${turnMessage}.`);

                if (data.bagLength === 0) {
                    emptyMessage = "No pieces are left in the bag";
                }
                else if (data.bagLength === 1) {
                    emptyMessage = "Only one piece is left in the bag";
                }
                else {
                    emptyMessage = `Only ${data.bagLength} pieces are left in the bag.`;
                }

                if (data.bagLength <= 7) {
                    this.socket.emit('inPlayEvent',
                        {
                            roomID: this.state.roomID,
                            eventType: 'bagNearEmpty',
                            message: `Heads up: ${emptyMessage}`
                        });
                }
            }
        });
    }

    toggleModal = () => {
        document.getElementById('endModal').classList.toggle('is-active');
    }

    // beforeUnload = () => {
    //     this.socket.emit('leave', { roomID: this.state.roomID })
    // }

    // componentWillUnmount = () => {
    //     window.removeEventListener('beforeunload', this.beforeUnload);
    // }

    render() {
        let gameConfig =
            <div className="configElements">
                <LandingPage registerHost={this.registerHost} showJoinForm={this.showJoin} />
                <CreateGameForm savePlayers={this.savePlayers}
                    saveUser={this.saveUser}
                    showHome={this.showHome}
                    startGame={this.startGame} />
                <JoinGameForm saveID={this.saveID}
                    saveUser={this.saveUser}
                    joinRoom={this.joinRoom}
                    showHome={this.showHome} />
                <WaitingRoom name={this.state.name}
                    roomID={this.state.roomID}
                    isHost={this.state.isHost}
                    numOfPlayers={this.numOfPlayers}
                    connectedPlayers={this.state.connectedPlayers} />
            </div>
        let gameComponents =
            <div className="entry columns is-vcentered">
                <div className="column is-two-thirds">
                    <Board
                        socket={this.socket}
                        name={this.state.name}
                        isTurn={this.state.isTurn}
                        roomID={this.state.roomID}
                        gameEnded={this.state.gameEnded} />
                </div>
                <div className="column">
                </div>
                <div className="column">
                </div>
                <div className="column is-one-third">
                    <div className="extras">
                        <div className='connection'>
                            <span id="connstatus" ><i className="fas fa-wifi"></i></span>&nbsp;
                        </div>
                        <ScoreTable
                            name={this.state.name}
                            players={this.state.players} />

                        {this.state.gameStarted ?
                            <Rack socket={this.socket}
                                name={this.state.name}
                                roomID={this.state.roomID}
                                isHost={this.state.isHost}
                                isTurn={this.state.isTurn}
                                players={this.state.players}
                                bagItems={this.state.bagItems}
                                bagLength={this.state.bagLength}
                                gameEnded={this.state.gameEnded}
                                gameStarted={this.state.gameStarted}
                                getPlayedPieces={this.getPlayedPieces}
                                getPiecesOnRack={this.getPiecesOnRack} /> :
                            null}
                    </div>
                </div>
            </div>
        return (
            <div className='gameSpace'>
                <div id="endModal" className="modal">
                    <div onClick={this.toggleModal} className="modal-background"></div>
                    <div className="modal-card bagItems">
                        <section className="modal-card-body">
                            <div className='endMessage'>
                                <div className="centralize trophy"><span role="img" aria-label="trophy">🏆</span></div>
                                <div id="winner" className="subtitle is-5"></div>
                            </div>
                        </section>
                    </div>
                </div>
                {gameComponents}
                {gameConfig}
            </div>
        )
    }
}
