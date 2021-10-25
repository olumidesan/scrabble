import React, { useEffect, useContext } from 'react';
import GameBoard from '../components/GameBoard';
import GamePanel from '../components/GamePanel';
import { useStateRef } from '../hooks';
import { ValidDragContext, GameContext, SocketIOContext, NotificationContext } from '../context';
import LandingPage from '../components/LandingPage';
import WinnerModal from '../components/WinnerModal';


// [TODO] Definitely need to revamp this

// Game has two played pieces store
// The rack's own for its own use,
// and the Game's own for use with
// the board for clearing or comm.
const Game = () => {

    const [e________, setGameEnded, gameEnded] = useStateRef(false);
    const [g_______, setGameCreated, gameCreated] = useStateRef(false);
    const [gd_______, setGameExited, gameExited] = useStateRef(false);
    const [r_______, setGameResumed, gameResumed] = useStateRef(false);
    const [________, setGameStarted, gameStarted] = useStateRef(false);
    const [_sp, setPlayFlag, playFlag] = useStateRef(false);
    const [_, setRecallFlag, recallFlag] = useStateRef(false);
    const [_a, setAllowAudio, allowAudio] = useStateRef(false);
    const [_s, setTimeToPlay, timeToPlay] = useStateRef(null);
    const [__, setPlayedTiles, playedTiles] = useStateRef([]);
    const [_b_, setBoardState, boardState] = useStateRef([]);
    const [_r_, setRackState, rackState] = useStateRef([]);
    const [__pw, setPlayedWords, playedWords] = useStateRef([]);
    const [__f, setUsedTiles, usedTiles] = useStateRef([]);
    const [___, setValidDrag, validDrag] = useStateRef(true);
    const [____, setPlayers, players] = useStateRef([]);
    const [_____, setPlayer, player] = useStateRef({});
    const [______, setBag, bag] = useStateRef({ length: 0, pieces: {} });
    const [_______, setNotifications, notifications] = useStateRef([]);

    const sio = useContext(SocketIOContext);
    const gameContext = {
        bag, setBag,
        player, setPlayer,
        players, setPlayers,
        playFlag, setPlayFlag,
        gameEnded, setGameEnded,
        usedTiles, setUsedTiles,
        rackState, setRackState,
        boardState, setBoardState,
        allowAudio, setAllowAudio,
        recallFlag, setRecallFlag,
        gameExited, setGameExited,
        timeToPlay, setTimeToPlay,
        gameStarted, setGameStarted,
        gameCreated, setGameCreated,
        gameResumed, setGameResumed,
        playedTiles, setPlayedTiles,
        playedWords, setPlayedWords,
    }


    // Register listeners
    useEffect(() => {
        sio.on("ResumeDone", (data) => {
            // Save bag
            setBag(data.bag);
            setGameResumed(true);
            setGameStarted(true);


            const updatedPlayers = [];
            const playerToPlay = data.playerToPlay;
            let playerToPlayMessage = "";

            // Set turn for each player
            for (const p of players.current) {
                if (p.name === playerToPlay) {
                    p['turn'] = true;
                }
                updatedPlayers.push(p);
            }

            // Update player's players
            setPlayers(updatedPlayers);

            // Say who gets to play first
            if (playerToPlay === player.current.name) {
                playerToPlayMessage = `You were to play before the game was paused`;
                setPlayer({ ...player.current, turn: true })
            } else {
                playerToPlayMessage = `${playerToPlay} was to play before the play was paused`;
            }

            // Notify everyone
            setNotifications([
                {
                    message: `${playerToPlayMessage}. The game has resumed.`,
                    overwrite: false,
                    type: "info",
                    timeout: 5
                }
            ]);
        });

        sio.on("drawDone", (data) => {
            // Save bag
            setBag(data.bag);
            setGameStarted(true);

            const updatedPlayers = [];
            const playerToPlay = data.players[0];
            let playerToPlayMessage, playOrderMessage = "";

            // Set turn for each player
            for (const p of players.current) {
                if (p.name === playerToPlay) {
                    p['turn'] = true;
                }
                updatedPlayers.push(p);
            }

            // Update player's players
            setPlayers(updatedPlayers);

            // Say who gets to play first
            if (playerToPlay === player.current.name) {
                playerToPlayMessage = `You get to play first`;
                setPlayer({ ...player.current, turn: true })
            } else {
                playerToPlayMessage = `${playerToPlay} gets to play first`;
            }

            // Set turn order of players
            data.players.forEach((p, index) => {
                if (p === player.current.name) {
                    p = `${p} (You)`;
                }
                if (index + 1 === data.players.length) {
                    playOrderMessage += p;
                } else {
                    playOrderMessage += `${p}, then `;
                }
            });

            // Notify everyone
            setNotifications([
                {
                    message: `${playerToPlayMessage}. Also note that the turn order is, ${playOrderMessage}`,
                    overwrite: false,
                    type: "info",
                    timeout: 5
                }
            ]);
        });


        sio.on("validPlay", (data) => {

            // Update the players' turns
            updatedPlayerTurns(data.playerToPlay.name)

            if (data.name === player.current.name) {
                setPlayer({ ...player.current, score: data.updatedScore });
            }

            // Update state of all players
            setPlayers(getUpdatedPlayers(data));

            // Announce type of play
            announcePlayResult(data)

            // Cement used tiles
            setUsedTiles([...new Set([...usedTiles.current, ...playedTiles.current])]);

            // Update bag
            setBag(data.bag);

            // Give a bag length heads up
            announceBagState(data.bag.length)

            // Reset played tiles
            setPlayedTiles([]);

            // Game ends after six consecutive turn skips or empty bag and player's empty rack
            if (data.turnSkips === 6 || (data.bagIsEmpty && data.rackIsEmpty)) setGameEnded(true);
        });
    }, []);


    // Update player turns
    const updatedPlayerTurns = (playerToPlay) => {
        if (playerToPlay === player.current.name)
            setPlayer({ ...player.current, turn: true })
        else setPlayer({ ...player.current, turn: false });
    }

    // Update every players' turn on table and [poosibly] scores
    const getUpdatedPlayers = (data) => {
        let updatedPlayers = [];
        for (const p of players.current) {
            if (p.name === data.playerToPlay.name) p.turn = true;
            else p.turn = false;

            // Update all scores on scoreboard
            if (p.name === data.name) p.score = data.updatedScore;
            updatedPlayers.push(p);
        }

        return updatedPlayers;
    }

    // Give a heads up if bag is almost empty
    const announceBagState = (bagLength) => {
        if (bagLength <= 7) {
            let emptyMessage;

            if (bagLength === 0) {
                emptyMessage = "No pieces are left in the bag";
            } else if (bagLength === 1) {
                emptyMessage = "Only one piece is left in the bag";
            } else {
                emptyMessage = `Only ${bagLength} pieces are left in the bag.`;
            }

            setTimeout(() => {
                setNotifications([
                    {
                        message: `Heads up! ${emptyMessage}`,
                        type: "warning",
                    }
                ]);
            }, 7000);
        }
    }


    // Announce type of play
    const announcePlayResult = (data) => {
        let message;
        let turnPlayer = `It's ${data.playerToPlay.name === player.current.name ? "your" : `${data.playerToPlay.name}'s`}`;

        // If turn is skipped, announce
        if (data.isTurnSkipped) {
            message = data.name === player.current.name
                ? "You skipped your turn."
                : `Turn skipped by ${data.name}.`;
            message += ` ${turnPlayer} turn to play`;
        }

        // If turn is swapped, announce
        else if (data.isTurnSwapped) {
            message = data.name === player.current.name
                ? "You swapped pieces for your turn."
                : `${data.name} swapped pieces for turn.`;
            message += ` ${turnPlayer} turn to play`;
        }

        // If a word was played, announce
        else {
            message = data.name === player.current.name
                ? `You played '${data.word}' worth ${data.score} points.`
                : `${data.name} played '${data.word}' worth ${data.score} points.`;
            message += ` ${turnPlayer} turn to play`;
        }

        setNotifications([{ type: "success", message }]);
    }


    const gameSpace =
        <div className="flex space-x-10">
            <GameBoard />
            <div className="px-10"></div>
            <GamePanel />
        </div>

    return (
        <div className="container mx-auto p-10 flex h-screen justify-center">
            <NotificationContext.Provider value={{ notifications, setNotifications }}>
                <GameContext.Provider value={gameContext}>
                    <ValidDragContext.Provider value={{ validDrag, setValidDrag }}>
                        {gameCreated.current || gameResumed.current ? gameSpace : <LandingPage />}
                        <WinnerModal />
                    </ValidDragContext.Provider>
                </GameContext.Provider>
            </NotificationContext.Provider>
        </div>
    )
};

export default Game;