import React, { Component } from 'react';
import io from 'socket.io-client';

export default class User extends Component {
    constructor(props) {
        super(props);

        this.socket = io('http://192.168.0.165:5005', { transports: ['websocket'] });
        this.state = {
            name: '',
            isHost: false,
            roomID: '',
            isConfigured: false,
            isTurn: false,
            connectedPlayers: 0,
            numOfPlayers: 0,
            yCID: window.crypto.getRandomValues(new Uint32Array(1))[0].toString(),
        }
    }

    showJoin = () => {
        document.querySelector('.landing').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'block';
    }

    registerHost = () => {
        if (!this.state.isHost) {
            this.setState({ isHost: true });
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
        this.setState({ numOfPlayers: parseInt(event.target.value) })
    }

    startGame = (e) => {
        e.preventDefault();
        this.setState({ isConfigured: true });
        document.querySelector('.configForm').style.display = 'none';
        document.querySelector('.message').style.display = 'block';
        this.socket.emit('join', { name: this.state.name, roomID: this.state.yCID });
    }
    joinRoom = (e) => {
        e.preventDefault();
        this.socket.emit('join', { name: this.state.name, roomID: this.state.roomID });
        // document.querySelector('.joinForm').style.display = 'none';
    }

    componentDidMount = () => {
        this.socket.on('reconnect_attempt', () => {
            this.socket.io.opts.transports = ['polling', 'websocket'];
        });
        document.querySelector('.message').style.display = 'none';
        document.querySelector('.configForm').style.display = 'none';
        document.querySelector('.joinForm').style.display = 'none';
        this.socket.on('joinedRoom', (data) => {
            console.log(data);
            this.setState({ connectedPlayers: this.state.connectedPlayers + 1 })
        })
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
                <span>Room ID: {this.state.yCID}</span>
                <br />
                <span>Number of players: {this.state.connectedPlayers}/{this.state.numOfPlayers}</span>
            </div>
        return (
            <div className='userSpace'>
                {landingPage}
                {formInput}
                {formJoin}
                {gameStart}
            </div>
        )
    }
}
