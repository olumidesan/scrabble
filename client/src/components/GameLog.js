import React, { useContext, useEffect } from 'react';
import { FileText, Share2 } from 'react-feather';
import { GameContext } from '../context';
import { useStateRef } from '../hooks';
import makeServerRequest from '../xhr';

import GameLogModal from './GameLogModal';

const GameLog = (props) => {
    const [_, setShowModal, showModal] = useStateRef(false);
    const [__, setLogs, logs] = useStateRef([]);
    const { player } = useContext(GameContext);

    // Close modal
    const closeModal = () => setShowModal(false);

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
            </div>
            <GameLogModal logs={logs.current} close={closeModal} show={showModal} />
        </>

    );
};

export default GameLog;