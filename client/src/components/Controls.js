import React, { useContext, useEffect } from 'react';
import ControlButton from './ControlButton';
import Audio from './Audio';
import { GameContext } from '../context';
import { useStateRef } from '../hooks';

const iconSize = 20;


const Controls = (props) => {
    const { player, gameStarted, allowAudio } = useContext(GameContext);
    const [_, setControlButtons, controlButtons] = useStateRef([]);

    useEffect(() => {
        let buttons = [];
        // Push global buttons
        for (const [index, type] of ["recall", "shuffle", "swap", "skip", "play"].entries()) {
            buttons.push(<ControlButton handler={props[type]} key={index} type={type} size={iconSize} />)
        }
        // If game hasn't started and player is host
        if (player.current.isHost && !gameStarted.current) {
            buttons.push(<ControlButton handler={props.draw} key={6} type={"draw"} size={iconSize} />)
        }
        setControlButtons(buttons);
    }, [gameStarted.current, player.current]);

    return (
        <div className="flex items-center justify-center space-x-0 bg-blue-600">
            {allowAudio.current ? <Audio /> : null}
            {controlButtons.current}
        </div>
    )
}

export default Controls;