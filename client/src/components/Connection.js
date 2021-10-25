import React, { useState, useEffect, useContext } from 'react';
import { Wifi, WifiOff, Save } from 'react-feather';
import makeServerRequest from '../xhr';
import { GameContext } from '../context';
import { timeoutDelay } from '../constants';

const iconSize = 26;

const Connection = (props) => {
    let icon, iconStatus;

    // State
    const [ping, setPing] = useState(1);
    const [status, setStatus] = useState("on");
    const [showSave, setShowSave] = useState(false);
    const [pingIntervalID, setPingIntervalID] = useState();
    const { player, boardState, rackState } = useContext(GameContext);


    // Server ping
    useEffect(() => {
        let iID = setInterval(() => {
            pingServer();
            saveGame();
        }, timeoutDelay);

        setPingIntervalID(iID);
        return () => clearInterval(pingIntervalID);

    }, []); // [] ensures only on first render


    // Server ping duration
    const pingServer = async () => {
        let startTime = new Date(); // Record start time

        // Make request
        let response = await makeServerRequest({ requestType: 'get', url: `/ping`, payload: {} });

        // If successful
        if (response && response.status === "pingSuccess") {
            let endTime = new Date(); // Record end time

            let pingDuration = endTime.getTime() - startTime.getTime();
            setPing(pingDuration); // Save difference

            // Set Icon
            if (pingDuration < 120) setStatus("on");
            else if (pingDuration < 500) setStatus("warning");
            else setStatus("off");
        }
        else setStatus("off");
    }


    // Save board and player rack
    const saveGame = async () => {
        setShowSave(true);

        let payload = {
            player: player.current,
            rack: rackState.current,
            board: boardState.current,
            roomID: player.current.roomID,
        }

        let response = await makeServerRequest({ requestType: 'post', url: `/cache`, payload: payload });

        // If successful
        if (response && response.status === "success") {
            // Nice
        }

        setTimeout(() => {
            setShowSave(false);
        }, 2000);
    }


    // Determine icon
    if (status === "on") {
        iconStatus = "Connection is good";
        icon = <Wifi size={iconSize} color="#1fe03d" />;
    }
    else if (status === "off") {
        iconStatus = "Server disconnected. Trying to reconnect";
        icon = <WifiOff size={iconSize} color="#f32b0c" />;
    }
    else {
        icon = <Wifi size={iconSize} color="#ffd100" />
        iconStatus = "Connection is poor. Delays may occur";
    }

    return (
        <div className="flex justify-between items-center">
            <div className="flex space-x-1 flex-none text-gray-400">
                {showSave ? <>
                    <div className="cursor-help flex-none"><Save size={23} /></div>
                    <div>Saving...</div></>
                    : null}
            </div>
            <div className="flex space-x-1">
                <div title={iconStatus} className="cursor-help flex-none">{icon}</div>
                <div title="Server ping" className="cursor-help flex-none text-gray-500">{ping}ms</div>
            </div>
        </div>

    );
};

export default Connection;