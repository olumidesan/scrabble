import React, { useContext, useState } from 'react';
import { Plus, ChevronDown, X, AlertOctagon } from 'react-feather';
import { GameContext, SocketIOContext } from '../context';
import { generateRandomID, isAlphanumeric } from '../utils';
import WaitingRoom from './WaitingRoom';


// Create a random room ID initially
let roomID = `${generateRandomID(5)}-${generateRandomID(5)}`;

const NewGame = (props) => {

    const [numPlayers, setNumPlayers] = useState(2);
    const [timeToPlay, setTimeToPlay] = useState(null);
    const [gameCreated, setGameCreated] = useState(false);
    const [enableAudio, setEnableAudio] = useState(false);
    const [sessionName, setSessionName] = useState({ valid: true, message: "", name: "" });

    const sio = useContext(SocketIOContext);
    const { setPlayer } = useContext(GameContext);

    const handleNameChange = (e) => {
        setSessionName({ ...sessionName, valid: true, name: e.target.value.trim() });
    }

    const handleNumPlayersChange = (e) => {
        setNumPlayers(parseInt(e.target.value))
    }

    const handleTimeToPlayChange = (e) => {
        if (e.target.value !== "Disabled") setTimeToPlay(parseInt(e.target.value))
        else setTimeToPlay(null)
    }

    const handleEnableAudioChange = (e) => {
        setEnableAudio(e.target.checked)
    }

    const handleDestroyGameSession = () => {
        if (window.confirm("Are you sure you want to delete this game session?")) {
            setNumPlayers(2);
            setEnableAudio(false);
            setGameCreated(false);
            props.setGameChoice("cancel");
            setSessionName({ message: "", valid: true, name: "" });

            // Remove the room from server
            sio.emit("leave", { roomID });

            // If room is killed, regenerate ID
            roomID = `${generateRandomID(5)}-${generateRandomID(5)}`;
        }
    }

    const handleCreateGameSession = () => {
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

        let currentPlayer = {
            roomID,
            score: 0,
            turn: false,
            isHost: true,
            isSpeaking: false,
            name: sessionName.name.capitalize(),
        };

        sio.emit("join", { roomID, enableAudio, timeToPlay, player: currentPlayer, limit: numPlayers });
        setPlayer(currentPlayer);
        setGameCreated(true);
    }

    let classNames = `${sessionName.valid ? "mb-4" : "mb-0"} w-80 appearance-none block bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500`;

    return (
        gameCreated
            ?
            <WaitingRoom
                roomID={roomID}
                numPlayers={numPlayers}
                handleDestroyGameSession={handleDestroyGameSession}
            />
            :
            <div className="h-full w-full flex flex-col items-center justify-center">
                <div className="font-medium text-xl pb-3">Host a Game Session</div>

                <div className="justify-center flex flex-col pt-4 w-96 rounded overflow-hidden shadow-2xl">
                    <div className="flex self-center pt-6 mx-3 mb-2">
                        <div className="px-3">
                            <label className="block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Your Session ID
                            </label>
                            <input title="Automatically-generated session ID" disabled value={roomID} className="w-80 cursor-not-allowed appearance-none block bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="E.g. Joey" />
                        </div>
                    </div>
                    <div className="flex self-center mx-3 mb-1">
                        <div className="px-3">
                            <label className="block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-1">
                                Your Name
                            </label>
                            <input minLength={3} maxLength={10} onChange={handleNameChange} title="Your name" className={classNames} type="text" placeholder="E.g. Phoebe" />
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
                    <div className="flex self-center flex-wrap -mx-3 mt-1 mb-4">
                        <div className="w-full px-3">
                            <label className="block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Number of Players
                            </label>
                            <div className="relative">
                                <select onChange={handleNumPlayersChange} className="block cursor-pointer appearance-none w-80 bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                    <option defaultValue value={2}>Two</option>
                                    <option value={3}>Three</option>
                                    <option value={4}>Four</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown size={20} />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="flex self-center flex-wrap -mx-3 mt-1 mb-6">
                        <div className="w-full px-3">
                            <label title="Required time to play before turn is automatically skipped" className="cursor-help block uppercase text-left tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Time to Play
                            </label>
                            <div className="relative">
                                <select onChange={handleTimeToPlayChange} className="block cursor-pointer appearance-none w-80 bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                    <option defaultValue value={null}>Disabled</option>
                                    <option value={300}>Five minutes</option>
                                    <option value={240}>Four minutes</option>
                                    <option value={180}>Three minutes</option>
                                    <option value={120}>Two minutes</option>
                                    <option value={60}>One minute</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown size={20} />
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Audio chat is only available locally or when deployed on an SSL-enabled server */}
                    {window.location.protocol === 'https' || window.location.hostname === 'localhost'
                        ?
                        <div className="flex self-center wrap mx-3 mb-4">
                            <div className="w-full px-3">
                                <div title="If checked, push-to-talk audio between players will be allowed. That is, of course, if the player allows it" className="w-80 cursor-help md:flex md:items-center mb-2">
                                    <label className="pb-1 block text-gray-500 font-bold">
                                        <input onChange={handleEnableAudioChange} className="mr-2 leading-tight h-5 w-5" type="checkbox" />
                                    </label>
                                    <span className="text-sm pb-2">
                                        Enable Audio Chat (Push-To-Talk)
                                    </span>
                                </div>
                            </div>
                        </div>
                        :
                        null
                    }
                    <div className="h-14 border-t flex border">
                        <div className="block w-1/2">
                            <button onClick={() => props.setGameChoice("cancel")} className="h-full w-full bg-red-600 hover:bg-red-700 text-white font-bold border border-red-700 inline-flex justify-center items-center">
                                <X size={26} />
                                <span className="pl-1 pr-2 text-md">Cancel</span>
                            </button>
                        </div>
                        <div className="block w-1/2">
                            <button onClick={handleCreateGameSession} className="h-full w-full bg-green-600 hover:bg-green-700 text-white font-bold border border-green-700 inline-flex justify-center items-center">
                                <Plus className="pb" strokeWidth={3} size={26} />
                                <span className="pl-1 pr-2 text-md">Host</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    )
};

export default NewGame;