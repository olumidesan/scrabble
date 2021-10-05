import React, { useRef, useEffect } from "react";
import { useStateRef } from "../hooks";
import Piece from "./Piece";
import { Check, X } from "react-feather";

export default function SwapModal(props) {

    const checkBoxRefs = useRef([]);
    const [_, setShowConfirm, showConfirm] = useStateRef(false);

    // Create new ref to each tile until all tiles have been referenced
    useEffect(() => {
        checkBoxRefs.current = Array(props.pieces.length)
            .fill().map((_, i) => checkBoxRefs.current[i]);
    }, [props.pieces.length]);


    const handleOnChange = (e) => {
        let checkedBoxes = checkBoxRefs.current.filter((checkBox) => checkBox.checked === true);
        if (checkedBoxes.length > 0) setShowConfirm(true)
        else setShowConfirm(false);
    }

    // Only need the IDs to swap pieces
    const getCheckedBoxesIDs = () => {
        let checkedBoxes = [];
        for (const checkBox of checkBoxRefs.current) {
            if (checkBox.checked === true) checkedBoxes.push(checkBox.id);
        }
        return checkedBoxes;
    }

    return props.show ? <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    <div className="flex justify-center flex-col pt-7 p-3 border-b border-solid border-blueGray-200 rounded-t">
                        <h3 className="text-2xl font-semibold">
                            Exchange Pieces for a Turn
                        </h3>
                        <div className="text-md pt-1 text-gray-500">Use the checkboxes to select the pieces to swap</div>
                    </div>
                    <div className="relative flex flex-col p-10 pb-9 pt-8 flex justify-center flex-wrap">
                        <div className="flex justify-center block">{
                            props.pieces.map((piece, index) => {
                                return (
                                    <div key={index} className="mx-4 my-4 mt-2">
                                        <Piece isStatic={true} char={piece.piece} weight={piece.weight} />
                                        <div className="self-center mt-1 text-xs text-gray-900">
                                            <label className="inline-flex items-center">
                                                <input onChange={handleOnChange} id={piece.id} ref={el => checkBoxRefs.current[index] = el} type="checkbox" />
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        </div>
                        <div className="my-4 mb-2 space-x-6 block">
                            <button onClick={() => { setShowConfirm(false); props.swapCancelHandler() }} className="w-32 bg-red-600 hover:bg-red-700 text-white inline font-bold py-2 px-4 border border-red-700 rounded">
                                <X className="inline" strokeWidth={3} size={22} />
                                <span className="pl-1 pr-2 text-md">Cancel</span>
                            </button>
                            {showConfirm.current ? <button onClick={() => { props.swapConfirmHandler(getCheckedBoxesIDs()) }} className="w-36 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 border border-green-700 rounded">
                                <Check className="inline" strokeWidth={3} size={22} />
                                <span className="pl-1 pr-2 text-md">Confirm</span>
                            </button> : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
    </> : null
}