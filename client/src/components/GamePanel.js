import React from 'react';
import Connection from './Connection';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';

import Rack from './Rack';
import GameLog from './GameLog';

const GamePanel = (props) => {
    return (
        <div className="flex flex-col pt-4 pb-10 justify-around w-450">
            <div className="block">
                <Notification />
            </div>
            <div className="block py-8">
                <Connection status="off" />
            </div>
            <div className="block py-8">
                <ScoreBoard />
            </div>
            <div className="block py-8">
                <div className="flex justify-end">
                    <Rack />
                </div>
            </div>
            <div className="block">
                <div className="pt-1">
                    <GameLog />
                </div>
            </div>
        </div>
    )
};

export default GamePanel;