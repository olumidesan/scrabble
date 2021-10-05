import { Volume2, Radio, Mic, User } from 'react-feather';
import React, { useContext, useEffect } from 'react';
import { GameContext } from '../context';
import { useStateRef } from '../hooks';
import { countUp } from '../utils';


const ScoreBoard = () => {

    const [_, setBoard, board] = useStateRef([]);
    const { player, players } = useContext(GameContext);
    
    useEffect(() => {
        let tableRows = [];
        for (const [index, p] of players.current.entries()) {
            let tableRow = <tr key={index}>
                <td className={`text-left capitalize border ${p.turn ? "font-bold" : ""} border-gray-300 px-4 py-2 text-black-600 font-medium`}>
                    {p.name}
                    <span className="inline pl-1">{player.current.name === p.name ? <span title={`This is You${p.turn ? ". It's also your turn to play" : ""}`}><User title="You" size={22} className="inline pb-1" fill="black" strokeWidth={1} /> </span> : null}</span>
                    <span className="inline">{p.isSpeaking ? <span title="This person is currently recording"> <Radio size={22} className="inline pb-1" /></span> : null}</span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-black-600 font-medium">{countUp(p.score)}</td>
            </tr>
            tableRows.push(tableRow);
        }
        setBoard(tableRows);
    }, [player.current, players.current]);

    return (
        <div className="flex justify-end">
            <table className="table-auto w-80">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left border border-gray-300 px-4 py-2 text-black-600">Player</th>
                        <th className="border border-gray-300 px-4 py-2 text-black-600">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {board.current}
                </tbody>
            </table>
        </div>
    )
};

export default ScoreBoard;