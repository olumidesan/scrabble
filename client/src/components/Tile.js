import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useContext } from 'react';
import { GameContext, SocketIOContext } from '../context';
import { tileColors } from '../constants';
import { getDragData } from '../utils';
import { Star } from 'react-feather';
import Piece from './Piece';

const Tile = forwardRef((props, ref) => {

    // The component instance will be extended
    // with whatever you return from the callback passed
    // as the second argument
    useImperativeHandle(ref, () => ({

        addPiece(piece) {
            setPlayedPiece(piece);
        },

        removePiece() {
            setPlayedPiece(null);
        },

        hasPiece() {
            return playedPiece !== null && playedPiece !== undefined;
        },

        getPiece() {
            return { ...playedPiece.props, tileType: props.type };
        },

    }));

    let prevTileID = "";
    const type = props.type;
    const tileID = props.id;

    const thisTile = useRef();
    const sio = useContext(SocketIOContext);
    const [playedPiece, setPlayedPiece] = useState(props.playedPiece);
    const { player, playedTiles, usedTiles, setPlayedTiles } = useContext(GameContext);


    // Helper functions 

    // On drag end, remove piece if necessary
    // New tile will have newly-created piece
    const dragEndHandler = (pieceData) => {
        // If it isn't a cemented tile
        if (!usedTiles.current.includes(pieceData.tileID)) {
            if (prevTileID !== tileID) {
                setPlayedPiece(null);
            }
        }
    }

    // Event listeners
    const handleDragDrop = (e) => {
        // Data of piece dragged on this tile      
        const pieceData = getDragData(e);

        // If it isn't a cemented tile
        if (!usedTiles.current.includes(pieceData.tileID)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            let id = pieceData['id'];
            let char = pieceData['char'];
            let weight = pieceData['weight'];
            let isTransformed = pieceData['isTransformed'];

            // Keep the previous tile id
            prevTileID = pieceData['tileID'];

            if (char === " ") {
                // Initiate Show modal. Also save the original pieceID and this tileID
                props.setRequestChoosePiece({ tileID: tileID, pieceID: id, status: true });
            }
            else {
                // Off modal/Reset modal pipeline
                props.setRequestChoosePiece({ tileID: "", pieceID: id, status: false });

                let newPiece = <Piece
                    id={id}
                    char={char}
                    onBoard={true}
                    weight={weight}
                    tileID={tileID}
                    isTransformed={isTransformed}
                    dragEndHandler={dragEndHandler}
                />;

                // Tell other players
                sio.emit('inPlayEvent', {
                    roomID: player.current.roomID,
                    pieceData: {
                        id,
                        char,
                        weight,
                        tileID,
                        prevTileID,
                        isTransformed,
                        onBoard: true,
                    }
                });
                // Update parent with new tile-piece association
                setPlayedTiles([...playedTiles.current, tileID]);
                setPlayedPiece(newPiece); // Associate piece with Tile
            }
        }
    }

    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.preventDefault();


    // Effects
    // Use turn of player to register and unregister event handlers
    // Essentially, turn off tile-listening ability if it's not player's
    // turn; and, of course, turn it back on if it's his/her turn?
    useEffect(() => {
        if (player.current.turn) thisTile.current.addEventListener("drop", handleDragDrop);
        else thisTile.current.removeEventListener("drop", handleDragDrop);
        return () => thisTile.current.removeEventListener("drop", handleDragDrop);
    }, [player.current.turn]);

    useEffect(() => {
        if (player.current.turn) thisTile.current.addEventListener("dragover", handleDragOver);
        else thisTile.current.removeEventListener("dragover", handleDragOver);
        return () => thisTile.current.removeEventListener("dragover", handleDragOver);
    }, [player.current.turn]);

    useEffect(() => {
        if (player.current.turn) thisTile.current.addEventListener("dragleave", handleDragLeave);
        else thisTile.current.removeEventListener("dragleave", handleDragLeave);
        return () => thisTile.current.removeEventListener("dragleave", handleDragLeave);
    }, [player.current.turn]);

    useEffect(() => {
        if (player.current.turn) thisTile.current.addEventListener("dragenter", handleDragEnter);
        else thisTile.current.removeEventListener("dragenter", handleDragEnter);
        return () => thisTile.current.removeEventListener("dragenter", handleDragEnter)
    }, [player.current.turn]);


    return (
        <div id={tileID} ref={thisTile} className={`${tileColors[type]} flex flex-col justify-around items-center h-14 w-14 border border-black border-opacity-70`}>
            {(props.type === "startTile") && !playedPiece ?
                <div className="justify-center items-center">
                    <Star fill="white" strokeWidth="0" size={24} />
                </div> : null}
            {playedPiece}
        </div>
    )
});

export default Tile;