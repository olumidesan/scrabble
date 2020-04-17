import React from 'react';
import Rack from '../Rack/Rack';
import Bag from '../Bag/Bag';


class Extras extends React.Component {
    state = {
        currentPiece: null,
        destination: null,
        isBoardDrag: false
    }

    removeElement = (id) => {
        var elem = document.getElementById(id);
        return elem.parentNode.removeChild(elem);
    }

    componentDidMount = () => {
        let log = console.log;
        const sT = ['dW', 'dL', 'tL', 'tW'];

        /* Events fired on the drag target */
        document.addEventListener("dragstart", (event) => {
            if (event.target.className.includes('bp')) {
                this.setState({ isBoardDrag: true });
            }
            this.setState({ currentPiece: event.target });
            // event.target.style.opacity = "0.2";
        });

        // // Output some text when finished dragging the p element and reset the opacity
        // document.addEventListener("dragend", function (event) {
        //     // document.getElementById("demo").innerHTML = "Finished dragging the p element.";
        //     event.target.style.opacity = "0";
        //     event.target.removeAttribute('draggable');
        // });

        /* Events fired on the drop target */
        // When the draggable p element enters the droptarget, change the DIVS's border style
        document.addEventListener("dragenter", function (event) {
            if (event.target.className.includes('droppable')) {
                event.target.style.border = "0.1px dotted white";
            }
            else {
                event.preventDefault();
            }
        });

        // By default, data/elements cannot be dropped in other elements. 
        // To allow a drop, we must prevent the default handling of the element
        document.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        // When the draggable p element leaves the droptarget, reset the DIVS's border style
        document.addEventListener("dragleave", function (event) {
            event.target.style.border = "";
        });

        document.addEventListener("drop", (event) => {
            event.preventDefault();

            if (event.target.className.includes('droppable')) {
                event.target.style.border = ""; //  Reset the border

                // Make a new parent element with a custom class and duplicate the
                // contents of the current piece to it and then add it as a child 
                // to the tile where it is placed
                let bp = document.createElement('div');
                bp.setAttribute('draggable', 'true');
                bp.setAttribute('class', 'bp');
                bp.innerHTML = this.state.currentPiece.innerHTML;
                event.target.appendChild(bp);

                // for (const t of sT) {
                //     // Check if the destination tile (where the piece was dropped) includes one of the special types
                //     // If it does, then hide the words
                //     if (event.target.className.includes(t)) {
                //         event.target.children[0].style.display = 'None'
                //     }
                //     // Check if the source tile (where the piece was taken from) includes one of the special types
                //     // If yes, undo its hide
                //     if ([...this.state.currentPiece.parentNode.classList].includes(t)) {
                //         this.state.currentPiece.parentNode.children[0].style.display = 'unset';
                //     }
                // }
                // If it's a board drag i.e the user is shifting the position of the
                // piece whilst still playing
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
                }
                // Implicit movement of tile from rack to board
                else {
                    document.getElementById(this.state.currentPiece.id).remove();
                }

            }
        });
    }

    render() {
        return (
            <div className="extras">
                <Rack />
            </div>
        )
    }
}

export default Extras;
