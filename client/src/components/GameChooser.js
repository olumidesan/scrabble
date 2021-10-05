import React from 'react';
import { Plus, ChevronsRight, CornerUpRight } from 'react-feather';

const GameChooser = (props) => {

    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="block flex justify-center text-gray-800 text-bold text-3xl space-x-2">
                <div className="text-4xl">
                    Scrabble
                </div>
                <div className="bg-yellow-200 px-2 font-normal rounded-md text-black self-center text-sm border">
                    v2.4
                </div>
            </div>
            <div className="flex my-6 mb-2 space-x-6 block justify-center">
                <button title="Create a new game session" onClick={() => props.setGameChoice("new")} className="h-12 w-36 bg-green-600 hover:bg-green-700 text-white font-bold px-4 border border-green-700 rounded inline-flex justify-center items-center">
                    <Plus strokeWidth={3} size={26} />
                    <span className="pl-1 pr-2 text-md">Host</span>
                </button>
                <button onClick={() => props.setGameChoice("join")} className="h-12 w-36 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 border border-blue-700 rounded inline-flex justify-center items-center">
                    <ChevronsRight strokeWidth={3} size={26} />
                    <span title="Join a game session"  className="pl-1 pr-2 text-md">Join</span>
                </button>
                {/* <button onClick={() => props.setGameChoice("resume")} className="h-12 w-36 bg-red-600 hover:bg-red-700 text-white font-bold px-4 border border-red-700 rounded inline-flex justify-center items-center">
                    <CornerUpRight strokeWidth={3} size={22} />
                    <span title="Resume a game session"  className="pl-1 pr-1 text-md">Resume</span>
                </button> */}
            </div>
            <div className="flex my-4 mb-2 space-x-6 block justify-center">
                <div className="text-gray-400">Familiarize yourself with the <a className="text-blue-500" href="#">Game Notes</a> before you begin</div>
            </div>
        </div>
    )
};

export default GameChooser;