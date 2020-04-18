import React from 'react';
import Rack from '../Rack/Rack';
// import Bag from '../Bag/Bag';


class Extras extends React.Component {

    // removeElement = (id) => {
    //     var elem = document.getElementById(id);
    //     return elem.parentNode.removeChild(elem);
    // }

    constructor(props) {
        super(props);

        this.state = {
            currentPiece: null,
            destination: null,
            isBoardDrag: false
        }
    }

    populateBoard = (e, p) => {
        let bp = document.createElement('div');
        bp.setAttribute('class', 'bp');
        bp.innerHTML = e;
        document.querySelectorAll('.tile')[p].appendChild(bp);
    }

    updateDragEvent = (e) => {
        document.querySelectorAll('.bp').forEach((node) => {
            if (e === node.innerHTML) {
                node.remove();
            }
        });
    }

    componentDidMount = () => {
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
        // When the draggable element enters the droptarget, change the DIVS's border style
        document.addEventListener("dragenter", (event) => {
            if (this.props.isTurn) {
                if (event.target.className.includes('droppable')) {
                    event.target.style.border = "0.1px dotted white";
                }
                else {
                    event.preventDefault();
                }
            }
        });

        // By default, data/elements cannot be dropped in other elements. 
        // To allow a drop, we must prevent the default handling of the element
        document.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        // When the draggable p element leaves the droptarget, reset the DIVS's border style
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

                    // Make a new parent element with a custom class and duplicate the
                    // contents of the current piece to it, and then add it as a child 
                    // to the tile where it is placed
                    let bp = document.createElement('div');
                    bp.setAttribute('draggable', 'true');
                    bp.setAttribute('class', 'bp');
                    bp.innerHTML = this.state.currentPiece.innerHTML;
                    event.target.appendChild(bp);

                    // Since new elements (pieces) are created on each rack-to-board move
                    // Get the piece (element) that was just played and its position on
                    // the board
                    let elementPosition;
                    boardTiles.forEach((node, index) => {
                        if (node.outerHTML === event.target.outerHTML) {
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
                        this.setState({ destination: event.target, isBoardDrag: false });
                        this.props.socket.emit('boardEvent', {
                            // index: index,
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
                    // Emit to reflect on other players' boards
                    this.props.socket.emit('rackEvent', {
                        name: this.props.name,
                        roomID: this.props.roomID,
                        elementString: bp.innerHTML,
                        elementPosition: elementPosition
                    });

                }
            }
        });

        // Listen for player events
        this.props.socket.on('rackToBoard', (data) => {
            if (data.name !== this.props.name) {
                this.populateBoard(data.elementString, data.elementPosition)
            }
        });

        this.props.socket.on('boardDrag', (data) => {
            if (data.name !== this.props.name) {
                this.updateDragEvent(data.elementString)
            }
        });
    }

    render() {
        return (
            <div className="extras">
                <Rack isTurn={this.props.isTurn} />
            </div>
        )
    }
}

export default Extras;
