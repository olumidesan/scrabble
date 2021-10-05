import React, { useContext } from "react";
import { GameContext } from "../context";
import Piece from "./Piece";

export default function Modal(props) {
    const { bag } = useContext(GameContext);

    let modal =
        props.mode === "chooseLetter" // Choose a letter
            ? <>
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                            <div className="flex justify-center flex-col pt-7 p-3 border-b border-solid border-blueGray-200 rounded-t">
                                <h3 className="text-2xl font-semibold">
                                    Wildcard Transformation
                                </h3>
                                <div className="text-md pt-1 text-gray-500">Choose a piece to replace the wildcard with</div>
                            </div>
                            <div className="relative pt-7 p-10 flex justify-center flex-wrap">
                                {
                                    Object.values(bag.current.pieces).filter((piece) => piece.piece !== " ").map((piece, index) => {
                                        return (
                                            <div key={index} onClick={() => props.modalHandler(piece.piece)} className="mx-4 my-4">
                                                <Piece char={piece.piece} weight={0} />
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
            </>
            : // Normal showing on bag click
            <>
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                            <div className="flex items-start justify-center pt-5 p-4 border-b border-solid border-blueGray-200 rounded-t">
                                <h3 className="text-2xl font-semibold">
                                    Contents of the Scrabble Bag
                                </h3>
                            </div>
                            <div className="relative pt-7 p-10 flex justify-center flex-wrap">
                                {
                                    Object.values(bag.current.pieces).map((piece, index) => {
                                        return (
                                            <div key={index} className="mx-4 my-4">
                                                <Piece isStatic={true} char={piece.piece} weight={piece.weight} />
                                                <div className="self-center mt-1 text-xs text-gray-900">
                                                    {piece.number} left
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
            </>

    return (props.show ? modal : null);
}