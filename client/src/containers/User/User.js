import React, { Component } from 'react';
import io from 'socket.io-client';
import Board from '../Board/Board';
import Rack from '../Rack/Rack';
import ScoreTable from '../ScoreTable/ScoreTable';

export default class GameUser extends Component {
    constructor(props) {
        super(props);

        this.numOfPlayers = 0;
        this.socket = io('http://192.168.0.165:5005', { transports: ['websocket'] });
        this.yCID = `SC-${window.crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0, 6)}`;

        this.state = {
            score: 0,
            name: '',
            roomID: '',
            players: [],
            isHost: false,
            isTurn: true,
            gameStarted: false,
            connectedPlayers: 0
        }
    }

    showJoin = () => {
        document.querySelector('.landing').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'block';
    }

    registerHost = () => {
        if (!this.state.isHost) {
            this.setState({ isHost: true, roomID: this.yCID });
        }
        document.querySelector('.landing').style.display = 'none';
        document.querySelector('.configForm').style.display = 'block';
    }

    saveID = (event) => {
        this.setState({ roomID: `SC-${event.target.value}` })
    }

    saveUser = (event) => {
        this.setState({ name: event.target.value })
    }

    savePlayers = (event) => {
        this.numOfPlayers = parseInt(event.target.value);
    }

    startGame = (e) => {
        e.preventDefault();
        document.querySelector('.configForm').style.display = 'none';
        document.querySelector('.waitingMessage').style.display = 'block';
        this.socket.emit('join', { name: this.state.name, roomID: this.yCID });
    }

    joinRoom = (e) => {
        e.preventDefault();
        // if (e.target.value.length < 3) {

        // }
        this.socket.emit('join', { name: this.state.name, roomID: this.state.roomID });
        if (!this.state.gameStarted) {
            document.querySelector('.joinForm').style.display = 'none';
            document.querySelector('.waitingMessage').style.display = 'block';
        }
    }

    showHome = (e) => {
        e.preventDefault();
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
            // connected players. For this host, this happens 
            // immediately the game starts
            this.setState({
                players: [...this.state.players, data.name],
                connectedPlayers: this.state.connectedPlayers + 1,
            }, () => {
                // If the client is the host and the number of connected players
                // is the same as the number of required players, then announce
                // that the game has started.
                if (this.state.isHost && (this.state.connectedPlayers === this.numOfPlayers)) {
                    this.socket.emit('fromHost', {
                        hostName: this.state.name,
                        roomID: this.state.roomID,
                        gameStarted: true
                    });
                }
            });
        });

        // If the game has started, remove the configuration
        // elements. Then update the state of the connected clients.
        this.socket.on('gameChannel', (data) => {
            if (data.gameStarted === true) {
                document.querySelector('.entry').removeAttribute('style');
                document.querySelectorAll('.configElements').forEach((node) => {
                    node.remove();
                });
                // The host already has its name and connected players state up to date
                // The remainder of the clients don't however. This does the actual update
                this.setState({
                    gameStarted: true,
                    isTurn: true,
                    connectedPlayers: !this.state.isHost ? this.state.connectedPlayers + 1 : this.state.connectedPlayers,
                    players: !this.state.isHost ? [...this.state.players, data.hostName] : [...this.state.players]
                });
            }
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
                            <button style={{marginRight:'5px'}} className="button optionButton is-fullwidth is-light" onClick={this.showHome}>Cancel</button>
                            <button style={{marginLeft:'5px'}} className="button optionButton is-fullwidth is-link" onClick={this.startGame}>Start</button>
                    </div>
                </form>
            </div>;
        let joinForm =
            <div className='joinForm'>
                <form>
                    <div className="field">
                        <label className="label">Your Name: <span className="imp">*</span></label>
                        <div className="control">
                            <input className="input" type='text' onChange={this.saveUser} name='text' placeholder='e.g. Olumidesan' />
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
                                    <input className="input" type='text' onChange={this.saveID} name='text' placeholder='e.g. 903318' />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='centralize field is-grouped is-grouped-centered'>
                            <button style={{marginRight:'5px'}} className="button optionButton is-fullwidth is-light" onClick={this.showHome}>Cancel</button>
                            <button style={{marginLeft:'5px'}} className="button optionButton is-fullwidth is-link" onClick={this.joinRoom}>Join</button>
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
                        <ScoreTable players={this.state.players} />
                        <Rack isTurn={this.state.isTurn} />
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
