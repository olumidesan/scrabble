import React, { useEffect, useContext } from 'react';
import { Trash2, Users, Share2 } from 'react-feather';
import { GameContext, NotificationContext, SocketIOContext } from '../context';
import { useStateRef } from '../hooks';
import { countUp } from '../utils';


const WaitingRoom = (props) => {
    const sio = useContext(SocketIOContext);
    const { setNotifications } = useContext(NotificationContext);
    const [_, setConnectedPlayers, connectedPlayers] = useStateRef([]);
    const [_s, setPrepText, prepText] = useStateRef("Preparing game room...");
    const { player, setRackState, setGameStarted, setGameResumed, setGameCreated, setAllowAudio, setPlayers, setUsedTiles, setTimeToPlay } = useContext(GameContext);


    useEffect(() => {
        // Set self as connected. ??? Network issue
        setConnectedPlayers([player.current]);

        // Register socket io listeners
        sio.on("joinedRoom", (data) => {

            // Set up audio chat and timer
            setTimeToPlay(data.timeToPlay);
            setAllowAudio(data.enableAudio);

            // Overwrite my list of connected players
            // with what the server sent, as it's updated
            setConnectedPlayers(data.connectedPlayers);

            // If it's not my connection event
            // if (data.player.name !== player.current.name) {
                // Game should start if the required number of players is reached and I'm the host
                if (connectedPlayers.current.length === props.numPlayers && player.current.isHost) {
                    sio.emit(data.mode === 'create' ? "gameCreateEvent" : "gameResumeEvent", { roomID: props.roomID });
                }
            // }
        });


        // When game is created, overwrite 
        // players with what host sent
        // and signal that game has started
        sio.on("gameCreate", (data) => {

            let welcomeMessage = player.current.isHost
                ? "Make a draw using the yellow button on your button rack. You'll"
                : "The host will make a draw, and you'll";

            setNotifications([
                {
                    message: `Welcome, ${player.current.name}! ${welcomeMessage} be notified (just like this) of who gets to play first. Good luck! 🍀`,
                    overwrite: false,
                    type: "info",
                }
            ]);

            setPlayers(data.allPlayers);

            // Dilly-dally for effect
            setTimeout(() => {
                setPrepText("Fetching game bag...")
            }, 1500);

            setTimeout(() => {
                setGameCreated(true);
            }, 3500);

        }, []);

        // When game is resumed, overwrite 
        // players with what host sent
        // and signal that game has started
        sio.on("gameResume", (data) => {

            setNotifications([
                {
                    message: `Welcome back, ${player.current.name}. Again, Good luck! 🍀`,
                    overwrite: false,
                    type: "info",
                }
            ]);

            setPlayers(data.allPlayers);

            // Replace already played tiles on board
            setUsedTiles(data.usedTiles);

            // Replace rack
            setRackState(data.rack[player.current.name])

            // Dilly-dally for effect
            setTimeout(() => {
                setPrepText("Fetching your pieces...")
            }, 1500);

            // Dilly-dally for effect
            setTimeout(() => {
                setPrepText("Resuming board state...")
            }, 3500);

            setTimeout(() => {
                setGameStarted(true);
                setGameResumed(true);
            }, 5500);

        }, []);
    }, []);


    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="max-w-sm pt-4 w-96 rounded overflow-hidden shadow-2xl">
                <div className="px-8 flex justify-between items-center w-full py-4">

                    <div className="font-bold text-left text-2xl">Waiting Room
                    </div>
                    <div title="Share this ID with players you want to join your game session" className="cursor-help font-bold pt-2 text-sm text-gray-400"><Share2 size={23} className="inline pb-1 pr-1" />{props.roomID}
                    </div>

                </div>
                <div className="py-8 px-6 border-t border">
                    <Users size={22} className="inline" /> Connected players: {countUp(connectedPlayers.current.length)}/<span className="font-bold">{props.numPlayers}</span>
                </div>
                {connectedPlayers.current.length === props.numPlayers
                    ?
                    <div className="py-4 border-t border">
                        <div className="text-sm italic text-gray-500">{prepText.current}</div>
                    </div>
                    :
                    null}
                <div className="py-4 border-t border">
                    {connectedPlayers.current.map((p, index) => {
                        return <div key={index} className="text-sm text-gray-500">{p.name === player.current.name ? `You (${p.name})` : p.name} joined the game room</div>
                    })
                    }
                </div>
                {player.current.isHost
                    ?
                    <div className="h-14 border-t border">
                        <button onClick={props.handleDestroyGameSession} className="h-full w-full bg-red-600 hover:bg-red-700 text-white font-bold border border-red-700 inline-flex justify-center items-center">
                            <Trash2 size={22} />
                            <span className="pl-1 pr-2 text-md">Delete Session</span>
                        </button>
                    </div>
                    :
                    null
                }
            </div>
        </div>
    )
};

export default WaitingRoom;