import React, { useContext, useEffect, useRef } from 'react';
import { GameContext, SocketIOContext } from '../context';
import { excludeMeSioEvent } from '../utils';
import Legend from './Legend';
import Piece from './Piece';
import Tile from './Tile';
import Modal from './Modal';
import { useStateRef } from '../hooks';


// 15 tiles per row
const tilePerRow = 15;
const GameBoard = (props) => {

    let rows = [];
    const tileRefs = useRef([]);

    const sio = useContext(SocketIOContext);
    const [_, setRequestChoosePiece, requestChoosePiece] = useStateRef({ tileID: "", pieceID: "", status: false });
    const { player, playFlag, usedTiles, setPlayFlag, playedTiles, setPlayedWords, setPlayedTiles, recallFlag, setRecallFlag } = useContext(GameContext);


    // Register Event Listeners
    useEffect(() => {
        const dispatch = ({ pieceData }) => {
            let newPiece = <Piece
                isPlayed={false}
                id={pieceData.id}
                char={pieceData.char}
                weight={pieceData.weight}
                tileID={pieceData.tileID}
                onBoard={pieceData.onBoard}
                isTransformed={pieceData.isTransformed}
            />;

            // [Board/Rack]-Rack. Piece diasppears. Ensure other player's played tiles cannot be dragged to own rack
            if (pieceData.toRackMove) {
                if (pieceData.tileID && !usedTiles.current.includes(pieceData.tileID)) {
                    // Board-Rack. Remove from board
                    removePieceFromTile(pieceData.tileID);
                    setPlayedTiles(playedTiles.current.filter((tID) => tID !== pieceData.tileID));
                    // Rack-Rack. Do nothing.
                }
            }
            // [Rack/Board]-Board. Piece appears
            else {
                // If previous piece, remove it. (Board-Board)
                if (pieceData.prevTileID) {
                    removePieceFromTile(pieceData.prevTileID);
                    setPlayedTiles(playedTiles.current.filter((tID) => tID !== pieceData.prevTileID))
                }
                // Eventually add new piece ([Rack/Board]-Board)
                addPieceToTile(pieceData.tileID, newPiece);

                // Save played tiles if it's not me that played. Incase the player calls a recall
                if (!player.current.turn) setPlayedTiles([...playedTiles.current, pieceData.tileID]);
            }
        }

        // Add played piece to board for every player
        excludeMeSioEvent(sio, "inPlay", player.current.name, dispatch)
    }, [player.current]);


    // Register Event Listeners
    useEffect(() => {
        // Recall pieces for every player except me
        const dispatch = (data) => setRecallFlag(true);
        excludeMeSioEvent(sio, "recallPieces", player.current.name, dispatch)
    }, [player.current]);


    // Remove tile pieces if recall is pressed on Rack
    useEffect(() => {
        if (recallFlag.current) {
            for (const tileID of playedTiles.current) {
                removePieceFromTile(tileID);
            }
            setRecallFlag(false);
            setPlayedTiles([]);
        }
    }, [recallFlag.current]);


    // Remove tile pieces if recall is pressed on Rack
    useEffect(() => {
        if (playFlag.current) {
            setPlayedWords(getPlayedWords());
            setPlayFlag(false);
        }
    }, [playFlag.current]);


    // Create new ref to each tile until all tiles have been referenced
    useEffect(() => {
        tileRefs.current = Array(rows.length * tilePerRow)
            .fill().map((_, i) => tileRefs.current[i]);
    }, [rows.length]);


    // Create all tiles
    for (let index = 0; index < tilePerRow; index++) {
        let tileRows = [];
        let tileRow = (index * tilePerRow);

        if (index === 0 || index === 14) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 3 || i === 11) tileType = "doubleLetter";
                if (i === 0 || i === 7 || i === 14) tileType = "tripleWord";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 1 || index === 13) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 1 || i === 13) tileType = "doubleWord";
                if (i === 5 || i === 9) tileType = "tripleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 2 || index === 12) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 2 || i === 12) tileType = "doubleWord";
                if (i === 6 || i === 8) tileType = "doubleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 3 || index === 11) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 3 || i === 11) tileType = "doubleWord";
                if (i === 0 || i === 7 || i === 14) tileType = "doubleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 4 || index === 10) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 4 || i === 10) tileType = "doubleWord";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 5 || index === 9) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 5 || i === 9 || i === 1 || i === 13) tileType = "tripleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 6 || index === 8) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 2 || i === 6 || i === 8 || i === 12) tileType = "doubleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    key={tileRow + i}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }
        if (index === 7) {
            for (let i = 0; i < tilePerRow; i++) {
                let tileType = "normal";
                if (i === 7) tileType = "startTile";
                if (i === 0 || i === 14) tileType = "tripleWord";
                if (i === 3 || i === 11) tileType = "doubleLetter";
                let tile = <Tile
                    type={tileType}
                    id={tileRow + i}
                    key={tileRow + i}
                    setRequestChoosePiece={setRequestChoosePiece}
                    ref={el => tileRefs.current[tileRow + i] = el}
                />;
                tileRows.push(tile);
            }
        }

        // Push the entire tile row
        rows.push(<div className="flex border-opacity-100" key={index}> {tileRows} </div>);
    }


    const getTile = (refIndex) => tileRefs.current[refIndex];
    const removePieceFromTile = (refIndex) => getTile(refIndex).removePiece();
    const addPieceToTile = (refIndex, piece) => getTile(refIndex).addPiece(piece);


    // Returns if a passed in tile and position is at
    // the edge of the board in said position
    const isBoardEdge = (position, index) => {
        if (position === 'top') {
            return index >= 0 && index < 15;
        }
        else if (position === 'bottom') {
            return index > 209 && index < 225;
        }
        else if (position === 'left') {
            return (index % 15) === 0;
        }
        else { // Implicit right
            return (index % 15) === 14;
        }
    }


    // Get words that were played
    const getPlayedWords = () => {
        let wv, wh, words = [];

        for (const tileIndex of playedTiles.current) {
            let thisTile = getTile(tileIndex).getPiece();

            // Get words at the left, right, top, and bottom
            let wordsTop = getPiecesInPosition(tileIndex, "top");
            let wordsLeft = getPiecesInPosition(tileIndex, "left");
            let wordsDown = getPiecesInPosition(tileIndex, "bottom");
            let wordsRight = getPiecesInPosition(tileIndex, "right");

            // English words are read left-right/top-bottom. 
            // Extract in same manner
            wv = [...wordsTop, thisTile, ...wordsDown];
            wh = [...wordsLeft, thisTile, ...wordsRight];

            // Skip the empty and single words
            if (wv.length > 1) words.push(wv);
            if (wh.length > 1) words.push(wh);
        }

        // Return non-duplicates
        return words.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
    }


    // Returns the word(s) at the position of the piece at index
    const getPiecesInPosition = (index, position) => {
        let ind, loopLength, words = [];

        if (position === "right" || position === "left") loopLength = 1;
        else loopLength = 15; // Implicit top or down

        if (isBoardEdge(position, index)) return words;

        while (true) {
            // Go forward for right and down. Go backwards, otherwise
            if (position === "right" || position === "bottom") ind = index + loopLength
            else ind = index - loopLength;

            let tile = getTile(ind); // Get the tile at said index on board

            if (tile.hasPiece()) {
                // Right and below should be appended to the end of th word list.
                // Left and above should be prepended.
                if (position === "right" || position === "bottom") words.push(tile.getPiece())
                else words.unshift(tile.getPiece());

                if (position === "right" || position === "left") loopLength += 1
                else loopLength += 15;

                // After getting the piece, check if the piece is at
                // the edge of the board. If it is, then exit, as there
                // will be nothing in the next position.
                if (isBoardEdge(position, ind)) break;
            }
            else break;
        }

        return words
    }


    // Handle modal for choosing letter
    const modalHandler = (piece) => {

        // Create a transformed blank piece
        let transformedBlankPiece = <Piece
            // isPlayed={true}
            weight={0}
            char={piece}
            onBoard={true}
            isTransformed={true}
            id={requestChoosePiece.current.pieceID}
            tileID={requestChoosePiece.current.tileID}
        />;

        // Add piece to tile
        addPieceToTile(requestChoosePiece.current.tileID, transformedBlankPiece);

        // Tell parent for possible removal
        setPlayedTiles([...playedTiles.current, requestChoosePiece.current.tileID]);

        // Tell other players
        sio.emit('inPlayEvent', {
            roomID: player.current.roomID,
            pieceData: {
                weight: 0,
                char: piece,
                onBoard: true,
                isTransformed: true,
                id: requestChoosePiece.current.pieceID,
                tileID: requestChoosePiece.current.tileID,
            }
        });

        // Switch Off modal
        setRequestChoosePiece({ tileID: "", pieceID: "", status: false });
    }



    return (
        <div className="space-y-4 ">
            <div style={{ height: "fit-content" }} className="block border-8 border-black rounded-md"> {rows} </div>
            <Legend />
            <Modal modalHandler={modalHandler} mode="chooseLetter" show={requestChoosePiece.current.status} />
        </div>
    )
};

export default GameBoard;