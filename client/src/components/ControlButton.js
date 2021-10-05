import React from 'react';
import { RotateCcw, Play, Shuffle, Repeat, SkipForward, Loader } from 'react-feather';

const descriptions = {
    "play": "Play as turn",
    "shuffle": "Shuffle pieces on Rack",
    "recall": "Recall played pieces",
    "swap": "Swap pieces in place of turn",
    "skip": "Skip turn",
    "draw": "Start the game",
}

const ControlButton = ({ type, size, handler }) => {
    let icon, className;

    // Set css class
    if (type === "play") {
        className = "flex justify-center items-center hover:border-l-2 hover:border-green-600 bg-green-500 hover:bg-green-700 text-white font-bold w-12 h-12 border-green-600 hover:border-green-500";
    }
    else if (type === "draw") {
        className = "flex justify-center items-center hover:border-l-2 hover:border-yellow-300 bg-yellow-200 hover:bg-yellow-300 text-black font-normal px-10 w-12 h-12 border-2 border-yellow-300 hover:border-yellow-300";
    }
    else {
        className = "flex justify-center items-center bg-blue-600 border-r-2 border-blue-700  hover:bg-blue-700 text-white font-bold w-12 h-12 border-blue-600 hover:border-blue-700";
    }

    // Set button icon
    if (type === "recall") icon = <RotateCcw strokeWidth="2.5" size={size} />
    else if (type === "play") icon = <Play fill="white" strokeWidth="2.5" size={size} />
    else if (type === "shuffle") icon = <Shuffle strokeWidth="2.5" size={size} />
    else if (type === "swap") icon = <Repeat strokeWidth="2.5" size={size} />
    else if (type === "skip") icon = <SkipForward strokeWidth="2.5" size={size} />
    else if (type === "draw") icon = "Draw"

    const loader = <button className={`${className}`}>
        <Loader strokeWidth={3} size={22} className="animate-spin" />
    </button>

    return (
        <button title={descriptions[type]} className={`${className}`} onClick={handler}>
            {icon}
        </button>
    )
}

export default ControlButton;