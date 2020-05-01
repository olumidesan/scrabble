import React, { Component } from 'react';
import { toast } from 'react-toastify';
import makeServerRequest from '../../helpers/axios';
import { letterMapping, piecesWeight } from '../../helpers/definitions';

export class Rack extends Component {
    constructor(props) {
        super(props);

        this.playWeights = [];
        this.boardTiles = null;

        this.state = {
            currentPieces: []
        }
    }

    // Returns the pieces above the piece at index
    getPiecesAbove = (index) => {
        let words = [];
        let loopLength = 15;
        let position = 'top';

        if (this.isBoardEdge(position, index)) {
            return words;
        }

        while (true) {
            let ind = index - loopLength;
            let tile = this.boardTiles[ind];
            if (tile.firstChild !== null) {
                words.unshift({
                    letter: this.getWordFromPiece(tile.firstChild),
                    value: this.getValueFromPiece(tile.firstChild)
                });
                loopLength += 15;
                // After getting the letter, check if the piece is at
                // the edge of the board. If it is, then exit, as there'll
                // be nothing in the next position.
                if (this.isBoardEdge(position, ind)) {
                    break;
                }
            }
            else {
                break;
            }
        }
        console.log(words, 'up')
        words.reduce((obj, item) => (obj[item.key] = item.value, obj), {});
        // return words.split("").reverse().join("");
    }

    // Returns the pieces below the piece at index
    getPiecesDown = (index) => {
        let words = [];
        let loopLength = 15;
        let position = 'down';

        if (this.isBoardEdge(position, index)) {
            return words;
        }

        while (true) {
            let ind = index + loopLength;
            let tile = this.boardTiles[ind];
            if (tile.firstChild !== null) {
                words.push({
                    letter: this.getWordFromPiece(tile.firstChild),
                    value: this.getValueFromPiece(tile.firstChild)
                });
                loopLength += 15;
                // After getting the letter, check if the piece is at
                // the edge of the board. If it is, then exit, as there'll
                // be nothing in the next position.
                if (this.isBoardEdge(position, ind)) {
                    break;
                }
            }
            else {
                break;
            }
        }
        console.log(words, 'down')
        return words.reduce((obj, item) => (obj[item.key] = item.value, obj), {});
        // return words
    }

    // Saves the current play's weight. Essentially means to record whether
    // the play had stuff like dL, tW, etc.
    updatePlayWeight = (tileClasses, pieceClasses, word) => {
        if (pieceClasses.includes('bp') && tileClasses.includes('dL')) {
            this.playWeights.push([word, 'dL'])
        }
        else if (pieceClasses.includes('bp') && tileClasses.includes('tL')) {
            this.playWeights.push([word, 'tL'])
        }
        else if (pieceClasses.includes('bp') && tileClasses.includes('dW')) {
            this.playWeights.push([word, 'dW'])
        }
        else if (pieceClasses.includes('bp') && tileClasses.includes('tW')) {
            this.playWeights.push([word, 'tW'])
        }
    }

    // Returns the pieces on the left of the piece at index
    getPiecesLeft = (index) => {
        let words = [];
        let loopLength = 1;
        let position = 'left';

        if (this.isBoardEdge(position, index)) {
            return words;
        }

        while (true) {
            let ind = index - loopLength;
            let tile = this.boardTiles[ind];
            if (tile.firstChild !== null) {
                words.unshift({
                    letter: this.getWordFromPiece(tile.firstChild),
                    value: this.getValueFromPiece(tile.firstChild)
                });
                loopLength += 1;
                // After getting the letter, check if the piece is at
                // the edge of the board. If it is, then exit, as there'll
                // be nothing in the next position.
                if (this.isBoardEdge(position, ind)) {
                    break;
                }
            }
            else {
                break
            }
        }
        console.log(words, 'left')
        return words.reduce((obj, item) => (obj[item.key] = item.value, obj), {});
        // return words.split("").reverse().join("");
    }

    // Returns the pieces on the right of the piece at index
    getPiecesRight = (index) => {
        let words = [];
        let loopLength = 1;
        let position = 'right';

        if (this.isBoardEdge(position, index)) {
            return words;
        }

        while (true) {
            let ind = index + loopLength;
            let tile = this.boardTiles[ind];
            if (tile.firstChild !== null) {
                words.push({
                    letter: this.getWordFromPiece(tile.firstChild),
                    value: this.getValueFromPiece(tile.firstChild)
                });
                loopLength += 1;
                // After getting the letter, check if the piece is at
                // the edge of the board. If it is, then exit, as there'''
                // be nothing in the next position.
                if (this.isBoardEdge(position, ind)) {
                    break;
                }
            }
            else {
                break
            }

        }
        console.log(words, 'right')
        return words.reduce((obj, item) => (obj[item.key] = item.value, obj), {});
        // return words
    }

    // Returns the character (letter), given a piece 
    getWordFromPiece = (piece) => {
        let letter = piece.firstChild.textContent.slice(0, 1);
        return letter;
    }
    // Returns the value (integer), given a piece 
    getValueFromPiece = (piece) => {
        let value = parseInt(piece.firstChild.textContent.slice(1));
        return value;
    }

    // Returns if a passed in tile and position is at
    // the edge of the board in said position
    isBoardEdge = (position, index) => {
        if (position === 'down') {
            return index >= 0 && index < 15;
        }
        else if (position === 'top') {
            return index > 209 && index < 225;
        }
        else if (position === 'left') {
            return (index % 15) === 0;
        }
        else { // Implicit right
            return (index % 15) === 14;
        }
    }

    splitWords = (allwords) => {
        console.log(allwords, "ALl words")
        let validWords = [];
        let countableWords = [];
        for (let wordObj of allwords) {
            let fullword = '';
            let countableWord = '';
            if (wordObj.value !== 0) {
                countableWord += wordObj.letter;
            }
            fullword += wordObj.letter;
            validWords.push(fullword);
            countableWords.push(countableWord);
        }
        console.log(validWords)
        console.log(countableWords)

        return [validWords, countableWords];
    }

    /* Should return the valid words played. These will eventually be weighted
    amounting to the final play score */
    getPlayedWords = (playedPieces) => {
        let allwords = []; // Storage for all the played words
        let wrdV, wrdH, playDirection = this.getPlayDirection.cachedDirection;

        playedPieces.forEach((piece, index) => {
            let tile = this.getTilePositionOnBoard(piece.parentNode);
            let letter = this.getWordFromPiece(this.boardTiles[tile]);
            let value = this.getValueFromPiece(this.boardTiles[tile]);
            let tileClasses = [...this.boardTiles[tile].classList];
            let pieceClasses = [...piece.classList];

            this.updatePlayWeight(tileClasses, pieceClasses, letter);
            let veryFirst = { letter: letter, value: value };

            // The first piece that's played, in the playing direction, would have all the words
            // played in that direction. So, for the very first piece, get the pieces played in all
            // directions
            if (index === 0) {
                // If it's the first play and only one piece
                // was played. No need for serere. Break
                if (playedPieces.length === 1) {
                    allwords.push(veryFirst);
                    return this.splitWords(allwords);
                }

                wrdH = { ...this.getPiecesLeft(tile), ...veryFirst, ...this.getPiecesRight(tile) };
                console.log(wrdH, 'wrdh')
                // Validate only words with at least two characters
                if (Object.keys(wrdH).length > 2) {
                    allwords.push(wrdH);
                }

                wrdV = { ...this.getPiecesAbove(tile), ...veryFirst, ...this.getPiecesDown(tile) };
                console.log(wrdV, 'wrdv')
                if (Object.keys(wrdV).length > 2) {
                    allwords.push(wrdV);
                }
            }
            // While for the others, get only those opposite the playing direction
            else {
                if (playDirection === 'right') {
                    wrdV = { ...this.getPiecesAbove(tile), ...veryFirst, ...this.getPiecesDown(tile) };
                    console.log(wrdV, 'wrdvv')
                    if (Object.keys(wrdV).length > 2) {
                        allwords.push(wrdV);
                    }
                }
                else {
                    wrdH = { ...this.getPiecesLeft(tile), ...veryFirst, ...this.getPiecesRight(tile) };
                    console.log(wrdH, 'wrdhh')
                    if (Object.keys(wrdH).length > 2) {
                        allwords.push(wrdH);
                    }
                }
            }
        });

        return this.splitWords(allwords);
    }

    computeScore = (countableWords) => { // Can do better than O(n)3
        let score = 0;
        // For each word
        countableWords.forEach(word => {
            let mul = 1; // Assign a default multiplier
            // For each string in each word
            [...word].forEach(s => {
                // Get the associated weight with the string
                let weight = piecesWeight[s];
                // For each weighted play, previously identified
                this.playWeights.forEach(a => {
                    // If the strings are equal
                    if (s === a[0]) {
                        // Confirm the type of weighted play and 
                        // update accordingly
                        if (['dL', 'tL'].includes(a[1])) {
                            weight *= letterMapping[a[1]];
                        }
                        else if (['tW', 'dW'].includes(a[1])) {
                            mul = letterMapping[a[1]];
                        }
                    }
                });
                score = score + weight;
            });
            score = score * mul;
        });
        return score;
    }

    playTurn = () => {
        // You can, of course, only play when it's your turn
        if (this.props.isTurn) {
            // Reset the played weights per turn
            this.playWeights = [];

            // Get pieces that were played
            let playedPieces = this.props.getPlayedPieces();

            // Check if the player has played anything
            if ((playedPieces.length) > 0) {

                // Validate board play based on Scrabble's rules
                if (!this.validateBoardPlay(playedPieces)) {
                    toast.error("Sorry, that's an invalid move.");
                    return;
                }

                // Validate words, compute score, and announce to everybody
                let [validWords, countableWords] = this.getPlayedWords(playedPieces);

                let wordValidation = makeServerRequest({
                    requestType: 'post',
                    url: '/words-check',
                    payload: { words: validWords }
                });

                wordValidation.then(resp => {
                    // Invalid word is contained in the response payload
                    // Announce invalid word and exit
                    if (resp.error) {
                        toast.error(resp.error);
                        return;
                    }

                    // Implicit that all words are valid

                    // If validated, then get what's on the rack. This
                    // will need to be refilled
                    let remainingPieces = this.getPiecesOnRack();

                    // Compute score
                    let score = this.computeScore(countableWords);

                    // Get new pieces and Refill player's rack
                    let newPieces = this.getFromBag(playedPieces.length);

                    // Refill rack
                    newPieces.then((data) => {
                        data.pieces.forEach(piece => remainingPieces.push(piece));
                    }).then(() => {
                        this.setState({ currentPieces: remainingPieces });
                        this.populateRack(remainingPieces);
                        // Publish score [among other things] to everyone
                        this.props.socket.emit('playEvent', {
                            roomID: this.props.roomID,
                            name: this.props.name,
                            score: score,
                            word: validWords[0]
                        });
                    });
                });

            }
            else {
                toast.error("Err...You haven't played anything. You can alternatively skip your turn.");
                return;
            }
        }
    }

    skipTurn = () => {
        if (this.props.isTurn) {
            let confirmed = window.confirm("Are you sure you want to skip your turn?");
            if (confirmed) {
                this.recallPieces();
                this.props.socket.emit('playEvent', {
                    isTurnSkipped: true,
                    name: this.props.name,
                    roomID: this.props.roomID,
                });
            }
        }
    }

    swapPieces = () => {
        // tbd
    }

    getPlayDirection = (playedPieces) => {
        let dirCount = 0;
        let playDirection = 'down'; // Default; assumed
        let topmost = this.getTilePositionOnBoard(playedPieces[0].parentNode);

        // Essentially, since each row on the board has a length of 15,
        // go round the board 15 times, effectively making your destination
        // just one tile away from the current tile. If during that journey,
        // a tile is found with a child having the identifiable class of a 
        // just-played piece ('bp'), the surely, the play direction was right
        for (let i = 1; i < 16; i++) {
            let index = topmost + i;
            // End of the board. If play direction hasn't been detected as right,
            // then it's implicitly down
            if (index > 224) {
                break;
            }
            let piece = this.boardTiles[index].firstChild;

            // Here, the play direction is gotten, and if, at the last
            // index (at the tile directly below the main tile), a piece
            // with a currently-playing class is found, then add 15 (just
            // an identifier for the eventual check to come). This confirms 
            // that the user played in two directions, which is not allowed
            // in Scrabble
            if (piece !== null) {
                if ([...piece.classList].includes('bp')) {
                    if (i === 15) {
                        dirCount += 15;
                        playDirection = 'down';
                    }
                    else {
                        dirCount += 1;
                        playDirection = 'right';
                    }
                }
            }
        }

        // If two directions were detected, invaidate the entire
        // thing
        if (dirCount > 15) {
            return false;
        }
        return playDirection;
    }

    validateBoardPlay = (playedPieces) => {
        let isValidPlay = false;
        let boardIsEmpty = document.querySelectorAll('.vP').length === 0;

        // Implicit down playDirection. 
        // Looping 15 times takes you to the tile directly below
        let loopLength = 15;

        // If only one piece was played
        if (playedPieces.length === 1) {
            // If the player was first to play (and played just one)
            // Confirm that that played piece was at the center.
            isValidPlay = boardIsEmpty ?
                this.checkIfPlayWasCentered(playedPieces) :
                this.validateNearestNeighbours(playedPieces) >= 1;
        }
        else { // 2 or more pieces were played
            let playDirection = this.getPlayDirection(playedPieces);

            // Validate that the play direction didn't oscillate between the two
            // options
            if (playDirection === false) {
                return false;
            }
            // Simple cache for reuse. This is always called before the 
            // reuser
            this.getPlayDirection.cachedDirection = playDirection;

            if (playDirection === 'right') {
                loopLength = 1;
            }

            // The first to play doesn't meet any valid plays
            // when [s]he plays.  The consequent players do
            if (!boardIsEmpty) {

                if (this.validateNearestNeighbours(playedPieces) < 1) {
                    return false;
                }

                let validCount = this.getValidPlayCount(playedPieces, loopLength, boardIsEmpty);
                if (validCount < (playedPieces.length - 1)) {
                    return false;
                }

                isValidPlay = true;
            }
            else {
                // All of them should be valid
                let validCount = this.getValidPlayCount(playedPieces, loopLength, boardIsEmpty);
                if (validCount < (playedPieces.length - 1)) {
                    return false;
                }

                // Check all the played pieces' positions. At least one 
                // must be on the center tile
                isValidPlay = this.checkIfPlayWasCentered(playedPieces);
            }
        }
        // Return validation result
        return isValidPlay;
    }

    validateNearestNeighbours = (playedPieces) => {
        let validCount = 0;

        playedPieces.forEach(piece => {
            let tilesToCheck = [];
            let indexLeft, indexUp, indexDown, indexRight;
            let pieceTilePosition = this.getTilePositionOnBoard(piece.parentNode);

            // Get the indices of the tiles at the top, left, right,
            // and bottom of the played piece. Eventually, at least
            // one of them must point to a validated play piece
            indexUp = pieceTilePosition - 15;
            indexLeft = pieceTilePosition - 1;
            indexDown = pieceTilePosition + 15;
            indexRight = pieceTilePosition + 1;

            // The rules of Scrabble are such that after the very first play, every subsequent
            // play must be linked either through the top, left, bottom or right, with a previously 
            // played tile. 
            // At the top of the board (top left), the pieces play on the very first row do not have any 
            // indexes up (they themselves are the very least indices). Conversely, at the bottom of the 
            // board, (bottom right), the pieces played on the very bottom row do not have any indexes at
            // the bottom because they themselves are the most indices. The below blocks checks these and
            // ensures only the right tiles are eventually checked
            if (indexUp >= 0) {
                tilesToCheck.push(this.boardTiles[indexUp]);
            }
            if (indexLeft >= 0) {
                tilesToCheck.push(this.boardTiles[indexLeft]);
            }
            if (indexDown <= 224) {
                tilesToCheck.push(this.boardTiles[indexDown]);
            }
            if (indexRight <= 224) {
                tilesToCheck.push(this.boardTiles[indexRight]);
            }

            // Check all the played pieces' positions. At least one must be 
            // linked (top, left, bottom, right) to a previously-played 
            // piece. That's how Scrabble works
            tilesToCheck.forEach((tile) => {
                if (tile.firstChild !== null) {
                    if ([...tile.firstChild.classList].includes('vP')) {
                        validCount += 1;
                    }
                }
            });
        });

        return validCount;
    }

    getValidPlayCount = (playedPieces, loopLength, boardIsEmpty) => {
        let condition;
        let validCount = 0;

        playedPieces.forEach((piece, index) => {
            if ((index + 1) !== playedPieces.length) {
                // Get the tile for the piece by the playDirection
                let tileIndex = this.getTilePositionOnBoard(piece.parentNode);
                let tile = this.boardTiles[tileIndex + loopLength];

                // If it doesn't have a first child, then no new piece was appended to it
                // Invalidate the play
                if (tile.firstChild === null) {
                    return false;
                }
                // Get the classlist of the piece by the playDirection
                let pieceClasses = [...tile.firstChild.classList];

                condition = boardIsEmpty ?
                    pieceClasses.includes('bp') :
                    condition = pieceClasses.includes('bp') || pieceClasses.includes('vP');

                // Includes either
                if (condition) {
                    validCount += 1;
                }
            }
        });

        return validCount;
    }

    checkIfPlayWasCentered = (playedPieces) => {
        let confirmed = false;

        playedPieces.forEach(piece => {
            // Get the tile for the piece
            let tile = this.boardTiles[this.getTilePositionOnBoard(piece.parentNode)];
            // Center tile has a class of 'cT'. Check against this
            if ([...tile.classList].includes('cT')) {
                confirmed = true;
            }
        });

        return confirmed;
    }

    getTilePositionOnBoard = (tile) => {
        // For each tile on the board, get the one that matches
        // the passed tile
        return [].indexOf.call(this.boardTiles, tile);
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
        let pieces = makeServerRequest({
            payload: {},
            requestType: 'get',
            url: `/bag/${amount}`
        });
        return pieces;
    }

    clearPlayedPieces = () => {
        // Clear the board of all played pieces.
        // Defined separately to allow for `recallPieces()` reuse
        let playedPieces = this.props.getPlayedPieces();
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
        // store each one in the above array.
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
            piece = `<div draggable="false" class='piece'><span draggable="false" class="letter">${alphabet.letter}</span><span draggable="false" class="value">${alphabet.value}</span></div>`;
            pieceContainer.innerHTML = piece;
            rack.appendChild(pieceContainer);
        }
    }

    toggleBag = () => {
        // Validate that the bag has been updated (happens once the draw is done)
        if (Object.keys(this.props.bagItems).length === 0) {
            toast.info("Kindly wait until the draw has been made.");
            return;
        }

        // Get the modal section and populate it with the bag items 
        // from the props
        let bagHome = document.getElementById('bagHome');
        // Reset the bag
        bagHome.innerHTML = ""
        bagHome.appendChild(this.updateBag(this.props.bagItems));

        // Actually show (toggle) modal
        document.getElementById('bagModal').classList.toggle('is-active');
    }

    updateBag = (pieces) => {
        // Create container element
        let piecesContainer = document.createElement('div');
        piecesContainer.setAttribute('class', 'bagPieceContainer');

        // Create the pieces and eventually append to the parent
        // container. State/props has them as an array
        for (const letter of pieces) {
            let piece;

            let pieceCont = document.createElement('div');
            pieceCont.setAttribute('class', 'bagPieceItem');

            piece = `<div><div class='piece'><span class="letter">${letter[0]}</span></div></div>
            <div class="numberLeft"><span>${letter[1]} left</span></div>`;

            pieceCont.innerHTML = piece;
            piecesContainer.appendChild(pieceCont);
        }
        return piecesContainer;
    }

    /* Features for Game save. Tbd
    beforeUnload = () => {
        let rack = this.getPiecesOnRack();
        let snapshot = this.takeBoardSnapshot();
        makeServerRequest({
            requestType: 'post',
            url: `/snapshot/${this.props.roomID}`,
            payload = {
                rack: rack,
                boardshot: boardshot,
                name: this.props.name
            },
        });
    }
    
    takeBoardSnapshot = () => { // to be tested
        let boardState = [];
        this.boardTiles.forEach((piece, index) => {
            if (piece.firstChild !== null) {
                if ([...piece.firstChild.classList].includes('vP')) {
                    boardState.push({
                        letter: piece.firstchild.textContent.slice(0, 1),
                        value: parseInt(piece.firstchild.textContent.slice(1)),
                        index: index
                    });
                }
            }
        });

        return boardState;
    }
    
    // window.addEventListener('beforeunload', this.beforeUnload);

    componentWillUnmount = () => {
        window.removeEventListener('beforeunload', this.beforeUnload);
    }
    */

    componentDidMount = () => {
        // Assign global variable
        this.boardTiles = document.querySelectorAll('.tile');

        // Register for event to effect a recall when a player does 
        // that. Effects reflection among all players
        this.props.socket.on('recallPieces', (data) => {
            if (data.name !== this.props.name) {
                this.clearPlayedPieces();
            }
        });

        // Get new pieces, update the state and populate the rack
        let newPieces = this.getFromBag(7 - this.state.currentPieces.length);
        newPieces.then((data) => {
            this.setState({ currentPieces: data.pieces },
                () => { this.populateRack(this.state.currentPieces) });
        });
    }

    render() {
        return (
            <div className="rack">
                <div id="bagModal" className="modal">
                    <div onClick={this.toggleBag} className="modal-background"></div>
                    <div className="modal-card bagItems">
                        <section id="bagHome" className="modal-card-body">
                        </section>
                    </div>
                </div>
                <div className="rackPieces">
                </div>
                <div className='rackButtons'>
                    <div onClick={this.toggleBag} className='bag'>
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