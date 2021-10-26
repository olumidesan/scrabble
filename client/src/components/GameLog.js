import React, { useContext, useEffect } from 'react';
import { FileText, Share2, LogOut } from 'react-feather';
import { GameContext, SocketIOContext } from '../context';
import { useStateRef } from '../hooks';
import { excludeMeSioEvent } from '../utils';
import makeServerRequest from '../xhr';

import GameLogModal from './GameLogModal';


const GameLog = (props) => {
    const sio = useContext(SocketIOContext);
    const [_, setShowModal, showModal] = useStateRef(false);
    const [__, setLogs, logs] = useStateRef([]);
    const { player, rackState, boardState } = useContext(GameContext);

    // Close modal
    const closeModal = () => setShowModal(false);

    const leaveHandler = async () => {
        let confirmed = window.confirm("Are you sure you want to leave the game?");
        if (confirmed) {
            await saveGame(); // Save the game state
            alert("Note that you can still resume this game session using your name and the session ID.");

            setTimeout(() => {
                sio.emit("leave", { roomID: player.current.roomID, name: player.current.name })
                window.location.reload(); // Refresh page (go to home page)                            
            }, 700);
        }
    }


    // Save board and player rack
    const saveGame = async () => {
        let payload = {
            player: player.current,
            rack: rackState.current,
            board: boardState.current,
            roomID: player.current.roomID,
        }

        await makeServerRequest({ requestType: 'post', url: `/cache`, payload: payload });
    }


    // If game is exited by any player, then let me know
    // Also save the game first
    useEffect(() => {
        const dispatch = async (data) => {
            await saveGame();
            alert(`${data.name} has left the game session. Note that you can still resume this game session using your name and the session ID.`);
            window.location.reload(); // Refresh page (go to home page)                            
        }

        excludeMeSioEvent(sio, "leftRoom", player.current.name, dispatch);
    }, []);


    // Get logs from the server when div is pressed
    useEffect(async () => {
        if (showModal.current) {
            let response = await makeServerRequest({
                requestType: "get",
                url: `/logs/${player.current.roomID}`,
            });

            if (response.status === "success") setLogs([...response.logs])
        }
    }, [showModal.current]);

    return (
        <>
            <div className="flex justify-between items-center">
                <div onClick={() => setShowModal(true)} className="cursor-pointer flex justify-end items-end space-x-1 text-gray-500">
                    <div className="flex-none">{<FileText size={22} />}</div>
                    <div className="flex-none text-sm">Game Logs</div>
                </div>
                <div className="flex justify-end items-end space-x-1">
                    <div className="font-bold pt-2 text-sm text-gray-500"><Share2 size={22} className="inline pb-1 pr-1" />{player.current.roomID}
                    </div>
                </div>
                <div onClick={leaveHandler} className="flex cursor-pointer justify-end items-end space-x-1">
                    <div className="font-bold pt-2 text-sm text-red-500"><LogOut size={22} className="inline pb-1 pr-1" />Leave
                    </div>
                </div>
            </div>
            <GameLogModal logs={logs.current} close={closeModal} show={showModal} />
        </>
    );
};

export default GameLog;