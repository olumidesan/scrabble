import React, { Component } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Board from '../Board/Board';
import Rack from '../Rack/Rack';
import ScoreTable from '../ScoreTable/ScoreTable';
import makeServerRequest from '../../helpers/axios';


export default class GameUser extends Component {
    constructor(props) {
        super(props);

        this.numOfPlayers = 0;
        this.socket = io('http://192.168.0.165:5005', { transports: ['websocket'] });

        // Randomly generated id that represents the game room, just in case the client
        // decides to be a game session host
        this.roomID = `SC-${window.crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0, 6)}`;

        this.state = {
            name: '',
            roomID: '',
            players: [],
            isHost: false,
            isTurn: false,
            gameStarted: false,
            connectedPlayers: 0,
            bagLength: 100
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
        this.setState({ isHost: false, name: '' }) // Essentially a reset
        this.numOfPlayers = 0;

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

        // Incase socket.io loses connection to the server
        this.socket.on('reconnect_attempt', () => {
            this.socket.io.opts.transports = ['polling', 'websocket'];
        });

        // When a new player joins (host or not)
        this.socket.on('joinedRoom', (data) => {
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
                    this.socket.emit('fromHost', {
                        allPlayers: this.state.players,
                        roomID: this.state.roomID,
                        gameStarted: true
                    });
                }
            });
        });

        // When a draw has been made. Announce who goes first.
        this.socket.on('drawDone', (data) => {
            let firstToPlay = data.playOrder[0];
            let firsToPlayMessage, playOrderMessage = '';

            // Reorder the state's players to match the turn order
            this.setState({ players: data.playOrder, bagLength: data.bagLength });

            if (firstToPlay === this.state.name) {
                this.setState({ isTurn: true });
                firsToPlayMessage = `${firstToPlay} (You) get to play first`;
            }
            else {
                firsToPlayMessage = `${firstToPlay} gets to play first.`;
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

            toast.info(firsToPlayMessage);
            toast.warn(`Heads up: The turn order is, ${playOrderMessage}.`)
        });

        // If the game has started, remove the configuration
        // elements. Then update the state of the connected clients.
        this.socket.on('gameChannel', (data) => {
            if (data.gameStarted === true) {
                // The host already has its name and connected players state up to date
                // The remainder of the clients don't however. This does the actual update
                this.setState({
                    gameStarted: true,
                    connectedPlayers: !this.state.isHost ? data.allPlayers.length : this.state.connectedPlayers,
                    players: !this.state.isHost ? [...data.allPlayers] : [...this.state.players]
                });

                // Unhide main game space and remove the config divs
                document.querySelector('.entry').removeAttribute('style');
                document.querySelectorAll('.configElements').forEach((node) => {
                    node.remove();
                });
            }

            let welcomeMessage = this.state.isHost ?
                "All players have joined. Make a draw using the yellow button on your button rack. You'll"
                :
                "The host will make a draw, and you'll"
            toast.success(`✨ Welcome, ${this.state.name}! ${welcomeMessage} be notified (just like this) of who gets to play first. Good luck!`)
        });

        // Register for event to effect an actual valid play
        this.socket.on('validPlay', (data) => {
            let message;

            // Update turn column on board
            this.state.players.forEach(player => {
                if (player === data.playerToPlay) {
                    document.getElementById(`turn_${player}`).innerText = 'Yes';
                }
                else {
                    document.getElementById(`turn_${player}`).innerText = 'No';
                }
            })

            // Update local state
            if (data.playerToPlay === this.state.name) {
                this.setState({ isTurn: true, bagLength: data.bagLength });
                message = `${data.playerToPlay}, it's your turn to play.`;
            }
            else {
                this.setState({ isTurn: false, bagLength: data.bagLength });
                message = `${data.playerToPlay}'s turn to play.`;
            }

            // Tell player whose turn it is
            toast.info(message);
        });
    }

    render() {
        let formInput =
            <div className='configForm'>
                <form>
                    <div className="field">
                        <label className="label">Your Name: <span className="imp">*</span> </label>
                        <div className="control">
                            <input className="input" type='text' onChange={this.saveUser} name='text' placeholder='e.g: Josiah' />
                        </div>
                    </div>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select onChange={this.savePlayers} value={this.state.numOfPlayers}>
                                <option value='' defaultValue>Choose the number of players</option>
                                <option value='2'>2</option>
                                <option value='3'>3</option>
                                <option value='4'>4</option>
                            </select>
                        </div>
                    </div>
                    <br />
                    <div className='centralize field is-grouped is-grouped-centered'>
                        <button style={{ marginRight: '5px' }} className="button optionButton is-fullwidth is-light" onClick={this.showHome}>Cancel</button>
                        <button style={{ marginLeft: '5px' }} className="button optionButton is-fullwidth is-link" onClick={this.startGame}>Start</button>
                    </div>
                </form>
            </div>;
        let joinForm =
            <div className='joinForm'>
                <form>
                    <div className="field">
                        <label className="label">Your Name: <span className="imp">*</span></label>
                        <div className="control">
                            <input className="input" type='text' onChange={this.saveUser} name='name' placeholder='e.g. Olumidesan' />
                        </div>
                    </div>

                    <div className="field">
                        <div className="field is-expanded">
                            <label className="label">Game ID: <span className="imp">*</span></label>
                            <div className="field has-addons">
                                <p className="control">
                                    <span className="button is-static">
                                        SC-
                                        </span>
                                </p>
                                <div className="control">
                                    <input className="input" type='text' onChange={this.saveID} name='gameID' placeholder='e.g. 903318' />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='centralize field is-grouped is-grouped-centered'>
                        <button style={{ marginRight: '5px' }} className="button optionButton is-fullwidth is-light" onClick={this.showHome}>Cancel</button>
                        <button style={{ marginLeft: '5px' }} className="button optionButton is-fullwidth is-link" onClick={this.joinRoom}>Join</button>
                    </div>
                </form>
            </div>
        let landingPage =
            <div className='landing'>
                <div className="title centralize">
                    SCRABBLE
                </div>
                <div className="field is-grouped">
                    <div className="control">
                        <button onClick={this.registerHost} className="button mainButton is-success">Host Game</button>
                    </div>
                    <div className="control">
                        <button onClick={this.showJoin} className="button mainButton is-link">Join Game</button>
                    </div>
                </div>
            </div>;
        let hostWaitingRoom =
            <div className="waitingMessage">
                <div className="centralize title is-5">
                    <span>Waiting for all players to join...</span>
                </div>
                <hr />
                <div>Your name: <b>{this.state.name}</b></div>
                <div>Game ID: <b>{this.state.roomID}</b></div>
                <div>Connected players: <b>{this.state.connectedPlayers}/{this.numOfPlayers}</b></div>
                <hr />
                <div className="subtitle is-7">
                    <span role='img' aria-label="info">⚠️</span> Don't forget to share your Game ID with the other players you want to join your game session.
                </div>
            </div>
        let playerWaitingRoom =
            <div className="waitingMessage">
                <div className="centralize title is-5">
                    <span>Waiting for all players to join...</span>
                </div>
                <hr />
                <div>Your name: <b>{this.state.name}</b></div>
                <div>Game ID: <b>{this.state.roomID}</b></div>
                <div>You're in the waiting room. The game will start once all players like you have joined the host's session.</div>
            </div>
        let gameConfig =
            <div className="configElements">
                {landingPage}
                {formInput}
                {joinForm}
                {this.state.isHost ? hostWaitingRoom : playerWaitingRoom}
            </div>
        let gameComponents =
            <div className="entry columns is-vcentered">
                <div className="column is-two-thirds">
                    <Board
                        roomID={this.state.roomID}
                        socket={this.socket}
                        name={this.state.name}
                        isTurn={this.state.isTurn} />
                </div>
                <div className="column">
                </div>
                <div className="column">
                </div>
                <div className="column is-one-third">
                    <div className="extras">
                        <ScoreTable socket={this.socket}
                            name={this.state.name}
                            isTurn={this.state.isTurn}
                            players={this.state.players} />
                            { this.state.gameStarted ?
                        <Rack socket={this.socket}
                            name={this.state.name}
                            roomID={this.state.roomID}
                            isHost={this.state.isHost}
                            isTurn={this.state.isTurn}
                            bagLength={this.state.bagLength}
                            gameStarted={this.state.gameStarted}
                            players={this.state.players} /> : null }
                    </div>
                </div>
            </div>
        return (
            <div className='gameSpace'>
                {gameComponents}
                {gameConfig}
            </div>
        )
    }
}
