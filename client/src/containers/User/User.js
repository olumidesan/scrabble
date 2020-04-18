import React, { Component } from 'react';
import io from 'socket.io-client';
import Extras from '../Extras/Extras';

export default class User extends Component {
    constructor(props) {
        super(props);

        this.numOfPlayers = 0;
        this.yCID = window.crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0, 6);
        this.socket = io('http://192.168.0.165:5005', { transports: ['websocket'] });

        this.state = {
            score: 0,
            name: '',
            roomID: '',
            players: [],
            isHost: false,
            isTurn: false,
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
        this.setState({ roomID: event.target.value })
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
        document.querySelector('.message').style.display = 'block';
        this.socket.emit('join', { name: this.state.name, roomID: this.yCID });
    }

    joinRoom = (e) => {
        e.preventDefault();
        this.socket.emit('join', { name: this.state.name, roomID: this.state.roomID });
    }

    componentDidMount = () => {
        this.socket.on('reconnect_attempt', () => {
            this.socket.io.opts.transports = ['polling', 'websocket'];
        });
        document.querySelector('.message').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'none';
        document.querySelector('.configForm').style.display = 'none';
        this.socket.on('joinedRoom', (data) => {
            this.setState({
                players: [...this.state.players, data.name],
                connectedPlayers: this.state.connectedPlayers + 1,
            }, () => {
                if (this.state.isHost && (this.state.connectedPlayers === this.numOfPlayers)) {
                    this.socket.emit('fromHost', {
                        hostName: this.state.name,
                        roomID: this.state.roomID,
                        gameStarted: true
                    });
                }
            });
        });
        this.socket.on('gameChannel', (data) => {
            if (data.gameStarted === true) {
                document.querySelectorAll('.configElements').forEach((node) => {
                    node.remove();
                });
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
                    <input type='text' value={this.state.name} onChange={this.saveUser} name='text' placeholder='Your name...' />
                    <br />
                    <select onChange={this.savePlayers} value={this.state.numOfPlayers}>
                        <option value='' defaultValue>Choose the number of players</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                    </select>
                    <button onClick={this.startGame}>Start!</button>
                </form>
            </div>;
        let formJoin =
            <div className='joinForm'>
                <form>
                    <input type='text' value={this.state.name} onChange={this.saveUser} name='text' placeholder='Your name...' />
                    <br />
                    <input type='text' value={this.state.roomID} onChange={this.saveID} name='text' placeholder='Room ID...' />
                    <br />
                    <button onClick={this.joinRoom}>Join</button>
                </form>
            </div>
        let landingPage =
            <div className='landing'>
                <button onClick={this.registerHost}>New Game</button>
                <br />
                <button onClick={this.showJoin}>Join Game</button>
            </div>;
        let gameStart =
            <div className="message">
                <span>Waiting for players to join...</span>
                <br />
                <span>Room ID: {this.state.roomID}</span>
                <br />
                <span>Number of players: {this.state.connectedPlayers}/{this.numOfPlayers}</span>
            </div>
        return (
            <div className='userSpace'>
                <div className="configElements">
                    {landingPage}
                    {formInput}
                    {formJoin}
                    {gameStart}
                </div>
                {this.state.gameStarted ?
                    <Extras
                        roomID={this.state.roomID}
                        socket={this.socket}
                        name={this.state.name}
                        isTurn={this.state.isTurn} /> : null}
            </div>
        )
    }
}
