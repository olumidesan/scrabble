import React, { useContext, useEffect, useState } from "react";
import { SocketIOContext } from "../context";
import { GameContext } from "../context";
import { ThumbsUp } from "react-feather";
import { useStateRef } from "../hooks";

export default function WinnerModal(props) {
    const [_, setShow, show] = useStateRef(false);
    const [endMessage, setEndMessage] = useState("");

    const sio = useContext(SocketIOContext);
    const { player, setPlayers } = useContext(GameContext);

    useEffect(() => {
        // When the game ends. Show a modal with the winner
        sio.on("gameEnd", (data) => {
            let finalMessage;
            let winner = { name: "", score: 0 };

            // Compare scores to get winner
            for (const p of data) {
                if (p.score > winner.score) {
                    winner.name = p.name;
                    winner.score = p.score;
                }
            }

            // Construct final message
            if (player.current.name === winner.name) {
                finalMessage = `Congratulations, ${winner.name}! You are the winner with ${winner.score} points. You've earned the trophy!`;
            } else {
                finalMessage = `${winner.name} is the winner with ${winner.score} points. Good game, ${player.current.name}. You still earn a medal 🏅`;
            }

            // Update medals on score board
            for (const p of data) {
                if (p.name === winner.name) {
                    p.name = `${p.name} 🏆`;
                }
                else p.name = `${p.name} 🏅`;
            }

            setEndMessage(finalMessage);
            setPlayers(data);
            setShow(true);
        });
    }, []);


    let modal = <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-screen my-6 mx-auto max-w-3xl">
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    <div className="flex justify-center flex-col pt-7 p-3 border-b border-solid border-blueGray-200 rounded-t">
                        <h3 className="text-2xl font-semibold">
                            🏆 The Game Has Ended 🏆
                        </h3>
                    </div>
                    <div className="flex-col relative text-lg pt-5 pb-7 flex justify-center flex-wrap">
                        <div className="pb-6">{endMessage}</div>
                        <button onClick={() => { setShow(false) }} className="self-center bg-green-600 hover:bg-green-700 text-white inline py-2 px-4 border border-green-700 rounded">
                            <ThumbsUp className="inline pb-1" strokeWidth={2} size={24} />
                            <span className="pl-1">Cool, Thanks</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
    </>

    return (show.current ? modal : null);
}