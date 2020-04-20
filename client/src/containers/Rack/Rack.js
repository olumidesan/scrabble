import React, { Component } from 'react';
import makeServerRequest from '../../helpers/axios';

export class Rack extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPieces: []
        }
    }

    skipTurn = () => {
        // tbd
    }

    playTurn = () => {
        // You can, of course, only play when it's
        // your turn
        if (this.props.isTurn) {
            // Before scoring
            // Validate board play
            // Compute score
            // Validate words

            // After validating
            // Update board with score


            // Make played pieces immovable


            // Pass turn
            let nextPlayerToPlay = makeServerRequest({
                requestType: 'post',
                url: '/turn',
                payload: { roomID: this.props.roomID }
            });
            nextPlayerToPlay.then(data => {
                this.props.socket.emit('playEvent', {
                    playerToPlay: data.playerToPlay,
                    roomID: this.props.roomID
                });
            });

            // Refill player's rack
            let remainingPieces = this.getPiecesOnRack();
            let newPieces = this.getFromBag(7 - remainingPieces.length);
            newPieces.then((data) => {
                // Refill rack
                data.pieces.forEach(piece => remainingPieces.push(piece));
            }).then(() => {
                this.setState({ currentPieces: remainingPieces });
                this.populateRack(remainingPieces);
            });
        }
    }

    swapPieces = () => {
        // tbd
    }

    makeDraw = (e) => {
        // Select a random player to start from all the players
        e.preventDefault();

        // Shuffle all the players. The resulting order is the order
        // with which the players will take turns
        let playOrder = this.inPlaceShuffle(this.props.players);

        // Tell the others who gets to play first
        this.props.socket.emit('drawEvent', {
            playOrder: playOrder,
            roomID: this.props.roomID
        });

        // Remove the draw button, as the draw has been done
        let drawButton = document.getElementById('drawButton');
        if (drawButton !== null) {
            drawButton.remove();
        }
    }

    getFromBag = (amount) => {
        // Get passed amount from bag
        if (amount > 0) {
            let pieces = makeServerRequest({
                requestType: 'post',
                url: '/bag',
                payload: { amount: amount }
            });
            return pieces;
        }
    }

    clearPlayedPieces = () => {
        // Clear the board of all played pieces.
        // Defined separately to allow for `recallPieces()` reuse
        let playedPieces = document.querySelectorAll('.bp');
        if (playedPieces.length > 0) {
            playedPieces.forEach((piece) => piece.remove())
        }
    }

    shufflePieces = () => {
        // Get the pieces on the rack
        let pieces = this.getPiecesOnRack();

        // Shuffle and update rack
        this.populateRack(this.inPlaceShuffle(pieces));
    }

    recallPieces = () => {
        // Current implementation is to remove all pieces played on the board
        // and then re-create the initial rack pieces.

        // It has to be your turn for this function to work
        if (this.props.isTurn) {
            this.props.socket.emit('recallEvent', {
                name: this.props.name,
                roomID: this.props.roomID
            })
            this.clearPlayedPieces();
            this.populateRack(this.state.currentPieces);
        }
    }

    inPlaceShuffle = (arr) => {
        // https://stackoverflow.com/cant-remember

        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    getPiecesOnRack = () => {
        // Storage for the pieces on the rack
        let pieces = [];

        // For each piece in the rack, get the letter and value and then
        // store each one in the above array
        document.querySelectorAll('.pieceContainer').forEach((piece) => {
            pieces.push({
                letter: piece.textContent.slice(0, 1),
                value: parseInt(piece.textContent.slice(1))
            });
        });

        return pieces;
    }

    populateRack = (pieces) => {
        let rack = document.querySelector('.rackPieces');
        while (rack.firstChild) {
            rack.firstChild.remove();
        }
        for (const [index, alphabet] of Object.entries(pieces)) {
            let piece;
            let pieceContainer = document.createElement('div');
            pieceContainer.setAttribute('id', `userPiece${index}`);
            pieceContainer.setAttribute('class', 'pieceContainer');
            pieceContainer.setAttribute('draggable', 'true');
            piece = `<div class='piece'><span class="letter">${alphabet.letter}</span><span class="value">${alphabet.value}</span></div>`;
            pieceContainer.innerHTML = piece;
            rack.appendChild(pieceContainer);
        }
    }

    componentDidMount = () => {
        // Register for event to effect a recall when a player does 
        // that. Effects reflection among all players
        this.props.socket.on('recallPieces', (data) => {
            if (data.name !== this.props.name) {
                this.clearPlayedPieces();
            }
        });
        let newPieces = this.getFromBag(7 - this.state.currentPieces.length);
        newPieces.then((data) => {
            this.setState({ currentPieces: data.pieces },
                () => { this.populateRack(this.state.currentPieces) });
        });
    }

    render() {
        return (
            <div className="rack">
                <div className="rackPieces">
                </div>
                <div className='rackButtons'>
                    <div className='bag'>
                        <span><i className="fa fa-shopping-bag fa-2x"></i></span>
                        <span className="bagLength">{this.props.bagLength}</span>
                    </div>
                    <div className="buttons is-fullwidth has-addons">
                        <button title="Recall Pieces" onClick={this.recallPieces} className="button rackButton is-link"><i className="fas fa-undo"></i></button>
                        <button title="Shuffle Pieces" onClick={this.shufflePieces} className="button rackButton is-link"><i className="fas fa-random"></i></button>
                        <button title="Swap Pieces" onClick={this.swapPieces} className="button rackButton is-link"><i className="fas fa-exchange-alt"></i></button>
                        <button title="Skip Turn" onClick={this.skipTurn} className="button rackButton is-link"><i className="fas fa-forward"></i></button>
                        <button title="Play" className="button rackButton is-success" onClick={this.playTurn}><i className="fas fa-play"></i></button>
                        {this.props.isHost ?
                            <button id="drawButton" title="Draw" className="button rackButton is-warning" onClick={this.makeDraw}>Draw</button>
                            : null}
                    </div>
                </div>
            </div>
        )
    }
}

export default Rack;
