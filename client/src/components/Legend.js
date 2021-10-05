import React from 'react';
import { tileColors } from '../constants';


const Legend = () => {

    return (
        <div className="block">
            <div className="flex">
                <div title="A piece must be played on this tile at the beginning of the game" className="flex-1"><span className={`${tileColors["startTile"]} pr-5 h-6 w-8 border-2 border-black`}></span><span className="pl-2">Start Point</span></div>
                <div title="The total score of the letter on this tile is doubled" className="flex-1"><span className={`${tileColors["doubleLetter"]} pr-5 h-6 w-8 border-2 border-black`}></span><span className="pl-2">Double Letter</span></div>
                <div title="The total score of the letter on this tile is tripled" className="flex-1"><span className={`${tileColors["tripleLetter"]} pr-5 h-6 w-8 border-2 border-black`}></span><span className="pl-2">Triple Letter</span></div>
                <div title="The total score of the word played is doubled when a piece is on this tile" className="flex-1"><span className={`${tileColors["doubleWord"]} pr-5 h-6 w-8 border-2 border-black`}></span><span className="pl-2">Double Word</span></div>
                <div title="The total score of the word played is tripled when a piece is on this tile" className="flex-1"><span className={`${tileColors["tripleWord"]} pr-5 h-6 w-8 border-2 border-black`}></span><span className="pl-2">Triple Word</span></div>
            </div>
        </div>
    )
};

export default Legend;