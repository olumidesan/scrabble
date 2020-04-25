import React from 'react'

function WaitingRoom(props) {
    let hostMessage = (
        <div>
            <div>Connected players: <b>{props.connectedPlayers}/{props.numOfPlayers}</b></div>
            <hr />
            <div className="subtitle is-7">
                <span role='img' aria-label="info">⚠️</span> Don't forget to share your Game ID with the other players you want to join your game session.
            </div>
        </div>);
    let playerMessage = (
        <div>
            <div>You're in the waiting room. The game will start once all players like you have joined the host's session.</div>
        </div>
    )
    let room = (
        <div className="waitingMessage">
            <div className="centralize title is-5">
                <span>Waiting for all players to join...</span>
            </div>
            <hr />
            <div>Your name: <b>{props.name}</b></div>
            <div>Game ID: <b>{props.roomID}</b></div>
            {props.isHost ? hostMessage : playerMessage}
        </div>
    );
    return (
        <div>
            {room}
        </div>
    )
}

export default WaitingRoom;
