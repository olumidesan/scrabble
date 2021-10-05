import { useContext, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { GameContext, SocketIOContext } from "../context";
import { Mic, MicOff } from "react-feather";
import { useStateRef } from "../hooks";



const Audio = () => {
    const {
        mediaBlobUrl,
        clearBlobUrl,
        stopRecording,
        startRecording,
    } = useReactMediaRecorder({ audio: { type: "audio/ogg" }, askPermissionOnMount: true });


    const sio = useContext(SocketIOContext);
    const [_, setIsMuted, isMuted] = useStateRef(true);
    const [__, setAudioBlob, audioBlob] = useStateRef(null);
    const [___, setSpeakerName, speakerName] = useStateRef("");
    const { player, setPlayer, players, setPlayers } = useContext(GameContext);


    const toggleAudioMute = () => {
        isMuted.current === false ? setIsMuted(true) : setIsMuted(false);
    }

    const transmitAudio = () => {
        clearBlobUrl(); // Clear any blob
        startRecording(); // Start audio
        stopRecording(); // Stop audio
    }

    useEffect(() => {
        if (!isMuted.current) {
            transmitAudio();
            setPlayer({ ...player.current, isSpeaking: true });
        }
        else {
            stopRecording();
            setPlayer({ ...player.current, isSpeaking: false });
        }

        sio.emit("radioEvent", {
            audioBlob: mediaBlobUrl,
            roomID: player.current.roomID,
            speakerName: player.current.name,
            isSpeaking: player.current.isSpeaking,
        });

    }, [mediaBlobUrl, isMuted.current]);


    useEffect(() => {
        sio.on("audioTransmission", (data) => {
            // Update other players
            let updatedPlayers = [];
            for (const p of players.current) {
                if (data.speakerName === p.name) {
                    if (data.isSpeaking) p['isSpeaking'] = true;
                    else p['isSpeaking'] = false;
                }
                updatedPlayers.push(p);
            }

            setAudioBlob(null);
            setPlayers(updatedPlayers);
            setAudioBlob(data.audioBlob);
            setSpeakerName(data.speakerName);
        });
    }, []);


    return (
        <div>
            <button
                title={isMuted.current ? "Audio off. Click to record" : "Audio is recording. Click to stop"}
                onClick={toggleAudioMute}
                className="flex justify-center items-center hover:border bg-yellow-200 hover:bg-yellow-300 text-white font-bold w-12 h-12 border border-yellow-400 hover:border-yellow-200">
                {isMuted.current ? <MicOff color="black" strokeWidth="2.5" size={20} /> : <Mic color="black" strokeWidth="2.5" size={20} />}
            </button>

            {/* Only play audio that doesn't originate from me */}
            {!player.current.isSpeaking // I'm not speaking
                && audioBlob.current    // Theres' audio to play
                && speakerName.current !== player.current.name // Audio isn't mine
                ? <audio className="hidden" src={audioBlob.current} autoPlay />  // Create element and play
                : null
            }
        </div>
    );
};

export default Audio;