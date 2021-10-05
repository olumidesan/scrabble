// A scrabble piece

import React, { useState, useEffect, useRef, useContext } from 'react';
import { setDragData, dragCancelled } from '../utils';
import { ValidDragContext } from '../context';


const Piece = ({
    id,
    tileID,
    char,
    weight,
    onBoard,
    isPlayed,
    isStatic,
    isTransformed,
    dragEndHandler,
}) => {

    const thisPiece = useRef();

    const { validDrag, setValidDrag } = useContext(ValidDragContext);
    const [pieceData, setPieceData] = useState({ id, tileID, char, weight, onBoard, isTransformed, isStatic, isPlayed });

    // Event listeners handlers

    // Call handler function on drag end
    const handleDragEnd = (e) => {
        e.stopImmediatePropagation();
        if (dragEndHandler // Associated handling function
            && validDrag.current // Drag is valid
            && !dragCancelled(e)) //  Drag wasn't cancelled
            dragEndHandler(pieceData)
    };

    // Save piece metadata on drag start
    const handleDragStart = (e) => {
        // Prevent bubble
        e.stopPropagation();
        e.stopImmediatePropagation();

        setValidDrag(true) // Reset prev drag context
        setDragData(e, pieceData); // Save piece data
    };


    // Pieces should not be dropped on pieces
    const handleDragDrop = (e) => {
        // Prevent bubble
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setValidDrag(false); // Prevent drag end update
    }

    // [Naturally], prevent default
    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.preventDefault();


    // Effect Listeners
    useEffect(() => thisPiece.current.addEventListener("drop", handleDragDrop));
    useEffect(() => thisPiece.current.addEventListener("dragend", handleDragEnd));
    useEffect(() => thisPiece.current.addEventListener("dragover", handleDragOver));
    useEffect(() => thisPiece.current.addEventListener("dragleave", handleDragLeave));
    useEffect(() => thisPiece.current.addEventListener("dragstart", handleDragStart));
    useEffect(() => thisPiece.current.addEventListener("dragenter", handleDragEnter));


    // Custom class names depending on piece
    let weightClassNames = pieceData.weight < 10 ? "absolute relative right-0.5 bottom-0.5" : "absolute relative right-1.5 bottom-0.5"
    let classNames = `${isStatic ? "h-3/4" : "h-full"} ${isTransformed ? "bg-yellow-300" : ""} ${pieceData.char === " " ? "flex-col-reverse" : ""} cursor-pointer hover:text-gray-700 flex flex-col ${onBoard ? "w-full" : "w-14 border"} text-black bg-yellow-200 border-black`;

    return (
        <div ref={thisPiece} draggable={!isPlayed} className={classNames}>
            <div className="block self-center w-4/5 text-4xl font-bold">
                <span style={{ top: "0.4rem" }} className={`absolute ${isTransformed ? "italic pr-2" : ""} relative`}>
                    {pieceData.char}
                </span>
            </div>
            <div className="block self-end w-1/5 text-xs">
                <span className={weightClassNames}>
                    {pieceData.weight}
                </span>
            </div>
        </div>
    )
};

export default Piece;