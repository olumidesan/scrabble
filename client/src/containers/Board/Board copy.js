import React from 'react';

class Board extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPiece: null,
            destination: null,
            isBoardDrag: false
        }
    }

    populateBoard = (e, p) => {
        // Only the just-played piece has an id of 'jp'. 
        // Ensure this is the case for each play
        let playedPieces = document.querySelectorAll('#jp');
        if (playedPieces.length > 0) {
            playedPieces.forEach(p => p.removeAttribute('id'));
        }
        let bp = document.createElement('div');
        bp.setAttribute('id', 'jp');
        bp.setAttribute('class', 'bp');
        bp.innerHTML = e;
        document.querySelectorAll('.tile')[p].appendChild(bp);
    }

    updateDragEvent = (e) => {
        const boardTiles = document.querySelectorAll('.tile');

        [].indexOf.call(br, child)
        // let nst = [];
        // let playedPieces = document.querySelectorAll('.bp');
        // document.querySelector('#jp')
        // // for (let i = 0; i < playedPieces.length; i++) {

        // // }
        // playedPieces.forEach((piece) => {
        //     if (e === piece.innerHTML) {
        //         nst.push(piece);
        //     }
        // });

        // if (nst.length === 1) {
        //     nst[0].remove();
        // }
        // else {
        //     nst.forEach((piece) => {
        //         // piece.remove();
        //     });
        // }
        let playedPiece = document.querySelector('#jp');
        if (playedPiece !== null) {
            playedPiece.remove();
        }
    }

    componentDidMount = () => {
        // All the tiles on the board
        const boardTiles = document.querySelectorAll('.tile');

        /* Events fired on the drag target */

        document.addEventListener("dragstart", (event) => {
            if (this.props.isTurn) {
                if (event.target.className.includes('bp')) {
                    this.setState({ isBoardDrag: true });
                }
                this.setState({ currentPiece: event.target });
            }
        });

        /* Events fired on the drop target */

        // When the draggable element enters the droptarget, change the border style
        document.addEventListener("dragenter", (event) => {
            event.preventDefault();
            if (this.props.isTurn) {
                if (event.target.className.includes('droppable')) {
                    event.target.style.border = "0.4px solid yellow";
                }
            }
        });

        // By default, data/elements cannot be dropped in other elements. 
        // To allow a drop, we must prevent the default handling of the element
        document.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        // When the draggable element leaves the droptarget, reset the style
        document.addEventListener("dragleave", (event) => {
            if (this.props.isTurn) {
                event.target.removeAttribute('style');
            }
        });

        document.addEventListener("drop", (event) => {
            event.preventDefault();
            if (this.props.isTurn) {
                // `Play()` implementation would turn these newly created elements into fixed ones,
                // impossible to modify (recall())

                if (event.target.className.includes('droppable')) {
                    event.target.removeAttribute('style'); //  Reset the border

                    // Only the just-played piece has an id of jp. 
                    // Ensure this is the case for each play
                    let playedPieces = document.querySelectorAll('#jp');
                    if (playedPieces.length > 0) {
                        playedPieces.forEach(p => p.removeAttribute('id'));
                    }

                    // Make a new parent element with a custom class and duplicate the
                    // contents of the current piece to it, and then add it as a child 
                    // to the tile where it is placed
                    let bp = document.createElement('div');
                    bp.setAttribute('draggable', 'true');
                    bp.setAttribute('id', 'jp');
                    bp.setAttribute('class', 'bp');
                    bp.innerHTML = this.state.currentPiece.innerHTML;
                    // Make piece appear on board
                    event.target.appendChild(bp);

                    // Since new elements (pieces) are created on each rack-to-board move
                    // Get the piece (element) that was just played and its position on
                    // the board
                    let elementPosition;
                    boardTiles.forEach((node, index) => {
                        if (node.outerHTML === event.target.outerHTML) {
                            console.log(index, 'yes');
                            elementPosition = index;
                        }
                    });

                    // If it's a board drag i.e the user is shifting the position of the
                    // piece whilst still playing on the board
                    if (this.state.isBoardDrag) {
                        let children = this.state.currentPiece.parentNode.children; // Get all the children of the source tile
                        // Special tiles (dL, tW, etc) will have more than one children (one for the actual message and
                        // the other for the piece that was previously on it). Normal tiles will have just one child.
                        // We want to remove the just the piece from the tile. So, get an index based on the length of the children.
                        let index = children.length === 1 ? 0 : 1;
                        // Remove appropriately
                        this.state.currentPiece.parentNode.removeChild(children[index]);
                        // Reset state
                        this.setState({ isBoardDrag: false });

                        // Reflect on other players' boards 
                        // that a board-drag happened
                        this.props.socket.emit('boardEvent', {
                            name: this.props.name,
                            roomID: this.props.roomID,
                            elementString: bp.innerHTML,
                        });
                    }
                    // Implicit movement of tile from rack to board
                    else {
                        // The rack pieces can be deleted, as they have been duplicated on the board
                        document.getElementById(this.state.currentPiece.id).remove();
                    }


                    // Reflect on other players' boards that a rack-event
                    // happened
                    this.props.socket.emit('rackEvent', {
                        name: this.props.name,
                        roomID: this.props.roomID,
                        elementString: bp.innerHTML,
                        elementPosition: elementPosition
                    });

                }
            }
        });

        /* Register Socket.io Event Listeners */

        // For events that happen when a piece is moved from
        // the rack to the board
        this.props.socket.on('rackToBoard', (data) => {
            if (data.name !== this.props.name) {
                this.populateBoard(data.elementString, data.elementPosition)
            }
        });

        // For events that happen when a piece is moved from one
        // position on the board to another
        this.props.socket.on('boardDrag', (data) => {
            if (data.name !== this.props.name) {
                this.updateDragEvent(data.elementString)
            }
        });
    }

    render() {
        return (
            <div className='boardContainer'>
                <div className="board">
                    <div className='row'>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dW">
                        </div>
                        <div className="droppable tile">
                        </div>
                    </div>
                    <div className='row'>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile dL">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile">
                        </div>
                        <div className="droppable tile tW">
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Board;
