import React, { useContext, useState } from 'react';
import { ChevronsRight, X } from 'react-feather';
import WaitingRoom from './WaitingRoom';
import makeServerRequest from '../xhr';
import { GameContext, SocketIOContext } from '../context';
import { isAlphanumeric } from '../utils';

const JoinGame = (props) => {

    const [numPlayers, setNumPlayers] = useState(0);
    const [gameJoined, setGameJoined] = useState(false);
    const [sessionID, setSessionID] = useState({ valid: true, message: "", roomID: "" });
    const [sessionName, setSessionName] = useState({ valid: true, message: "", name: "" });

    const sio = useContext(SocketIOContext);
    const { setPlayer } = useContext(GameContext);


    const handleNameChange = (e) => {
        setSessionName({ ...sessionName, valid: true, name: e.target.value.trim() });
    }

    const handleRoomIDChange = (e) => {
        setSessionID({ ...sessionID, valid: true, roomID: e.target.value.trim() });
    }

    const getGameRoomData = async (gameRoomID, mode) => await makeServerRequest({ requestType: 'get', url: `/room/${gameRoomID}?name=${sessionName.name}&mode=${mode}`, payload: {} });

    const handleJoinGameSession = async () => {

        // Validate length
        if (sessionName.name.length < 2 || sessionName.name.length > 10) {
            setSessionName({ ...sessionName, valid: false, message: "Name must be between 2 and 10 characters" });
            return;
        }

        // Validate alphanumerism
        if (!isAlphanumeric(sessionName.name)) {
            setSessionName({ ...sessionName, valid: false, message: "Name must be alphanumeric" });
            return;
        }

        // Validate game room length
        if (sessionID.roomID.length < 11) {
            setSessionID({ ...sessionID, valid: false, message: "Session ID must be 11 characters" });
            return;
        }

        const gameRoomData = await getGameRoomData(sessionID.roomID, 'join');

        // If no game is created with that room/session ID
        if (gameRoomData.status === "error") {
            setSessionID({ ...sessionID, valid: false, message: gameRoomData.message });
        }
        // If chosen name is already being used
        else if (gameRoomData.status === "nameError") {
            setSessionName({ ...sessionName, valid: false, message: gameRoomData.message });
        }

        else {
            if (gameRoomData.room.joinable) {
                const currentPlayer = {
                    score: 0,
                    turn: false,
                    isHost: false,
                    isSpeaking: false,
                    roomID: sessionID.roomID,
                    name: sessionName.name.capitalize(),
                };

                sio.emit("join", { roomID: sessionID.roomID, player: currentPlayer });
                setNumPlayers(gameRoomData.room.limit);
                setPlayer(currentPlayer);
                setGameJoined(true);
            }
            else {
                setSessionID({ valid: false, message: "Game session has started and cannot be joined" });
            }
        }
    }

    let classNames = `${sessionName.valid ? "mb-4" : "mb-0"} w-80 appearance-none block bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500`

    return (
        gameJoined
            ?
            <WaitingRoom roomID={sessionID.roomID} numPlayers={numPlayers} />
            :
            <div className="h-full w-full flex flex-col items-center justify-center">
                <div className="font-medium text-xl pb-3">Join a Game Session</div>

                <div className="justify-center flex flex-col pt-4 w-96 rounded overflow-hidden shadow-2xl">
                    <div className="flex self-center pt-6 mx-3 mb-1">
                        <div className="px-3">
                            <label className="block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-1">
                                Your Name
                            </label>
                            <input minLength={3} maxLength={10} onChange={handleNameChange} title="Your name" className={classNames} type="text" placeholder="E.g. Joey" />
                        </div>
                    </div>
                    <div className="flex self-center wrap mx-3">
                        {!sessionName.valid
                            ?
                            <div className="w-full px-3">
                                <div className="w-80 md:flex md:items-center">
                                    <span className="text-sm text-red-600 mb-4">
                                        {sessionName.message}
                                    </span>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className="flex self-center mx-3 mb-0">
                        <div className="px-3">
                            <label className="block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Session ID
                            </label>
                            <input onChange={handleRoomIDChange} maxLength={11} className="w-80 appearance-none block bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="E.g. 41828-11860" />
                        </div>
                    </div>
                    <div className="flex self-center wrap mx-3 mb-6">
                        {!sessionID.valid
                            ?
                            <div className="w-full px-3">
                                <div className="w-80  md:flex md:items-center">
                                    <span className="text-sm text-red-600 pb-2">
                                        {sessionID.message}
                                    </span>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className="h-14 border-t flex border">
                        <div className="block w-1/2">
                            <button onClick={() => props.setGameChoice("cancel")} className="h-full w-full bg-red-600 hover:bg-red-700 text-white font-bold border border-red-700 inline-flex justify-center items-center">
                                <X size={26} />
                                <span className="pl-1 pr-2 text-md">Cancel</span>
                            </button>
                        </div>
                        <div className="block w-1/2">
                            <button onClick={handleJoinGameSession} className="h-full w-full bg-green-600 hover:bg-green-700 text-white font-bold border border-green-700 inline-flex justify-center items-center">
                                <ChevronsRight className="pb" strokeWidth={3} size={26} />
                                <span className="pl-1 pr-2 text-md">Join</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    )
};

export default JoinGame;