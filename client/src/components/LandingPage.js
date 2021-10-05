import React, { useState, useEffect } from 'react';
import GameChooser from './GameChooser';
import ResumeGame from './ResumeGame';
import JoinGame from './JoinGame';
import NewGame from './NewGame';

const LandingPage = (props) => {

    // State
    const [newGame, setNewGame] = useState(false);
    const [joinGame, setJoinGame] = useState(false);
    const [resumeGame, setResumeGame] = useState(false);

    const setGameChoice = (choice) => {
        if (choice === "new") {
            setNewGame(true);
            setJoinGame(false);
            setResumeGame(false);
        }
        else if (choice === "join") {
            setJoinGame(true);
            setNewGame(false);
            setResumeGame(false);
        }
        else if (choice === "resume") {
            setNewGame(false);
            setJoinGame(false);
            setResumeGame(true);
        }
        else {
            setNewGame(false);
            setJoinGame(false);
            setResumeGame(false);
        }
    }


    let page;

    if (newGame) {
        page = <NewGame setGameChoice={setGameChoice} />
    }
    else if (joinGame) {
        page = <JoinGame setGameChoice={setGameChoice} />
    }
    else if (resumeGame) {
        page = <ResumeGame setGameChoice={setGameChoice} />
    }
    else {
        page = <GameChooser setGameChoice={setGameChoice} />;
    }

    return page;
};

export default LandingPage;