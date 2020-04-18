import React, { Component } from 'react';
import axios from '../../helpers/axios';

export class Rack extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPieces: [],
            noOfPieces: 0
        }
    }
    getFromBag = (amount) => {
        axios.post('/bag', { amount: amount })
            .then(r => {
                this.setState({ currentPieces: r.data.pieces },
                    () => { this.populateRack(this.state.currentPieces) });
            })
            .catch(e => console.log(e.data));
    }

    recallPieces = () => {
        // Current implementation is to remove all pieces played on the board
        // and then re-create the initial rack pieces.

        // It has to be your turn for this function to work
        if (this.props.isTurn) {
            let playedPieces = document.querySelectorAll('.bp');
            if (playedPieces.length > 0) {
                playedPieces.forEach((piece) => piece.remove())
            }
            this.populateRack(this.state.currentPieces);
        }
    }

    inPlaceShuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    shufflePieces = () => {
        let pieces = []; // For the pieces that will be shuffled

        // For each piece in the rack, get the letter and value and then
        // store each one in the above array
        document.querySelectorAll('.pieceContainer').forEach((piece) => {
            pieces.push({
                letter: piece.textContent.slice(0, 1),
                value: parseInt(piece.textContent.slice(1))
            })
        });
        // Shuffle and update rack
        this.populateRack(this.inPlaceShuffle(pieces));
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
            piece = `<div class='piece'><div class='letter'>${alphabet.letter}</div><span>${alphabet.value}</span></div>`;
            pieceContainer.innerHTML = piece;
            rack.appendChild(pieceContainer);
        }
    }

    componentDidMount = () => {
        this.getFromBag(7);
    }

    render() {
        return (
            <div className="rack">
                <div className="rackPieces">
                </div>
                <div className='rackOptions'>
                    <div className="tileOptions">
                        <div className="tileOption"><button onClick={this.recallPieces}>Recall</button></div>
                        <div className="tileOption"><button onClick={this.shufflePieces}>Shuffle</button></div>
                        <div className="tileOption"><button onClick={this.shufflePieces}>Swap</button></div>
                        {/* <div className="tileOption"><button onClick={this.shufflePieces}>Skip Turn</button></div>
                        <div className="tileOption"><button onClick={this.shufflePieces}>Play</button></div> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default Rack;
