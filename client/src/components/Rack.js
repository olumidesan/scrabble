import React, { useEffect, useState, useRef, useContext } from 'react';
import { SocketIOContext, ValidDragContext, GameContext, NotificationContext } from '../context';
import { excludeMeSioEvent, getDragData, inPlaceShuffle, secondsToMMSS } from '../utils';
import { useStateRef } from '../hooks';
import makeServerRequest from '../xhr';
import { Clock } from 'react-feather';
import SwapModal from './SwapModal';
import Controls from './Controls';
import Piece from './Piece';
import Bag from './Bag';
import { timeoutDelay } from '../constants';



const Rack = (props) => {

    const thisRack = useRef();
    const [pingIntervalID, setPingIntervalID] = useState();
    const [_c, setTryCount, tryCount] = useStateRef(0);
    const [_, setPieces, currPieces] = useStateRef([]);
    const [__, setStartSwap, startSwap] = useStateRef(false);
    const [__d, setCountDownID, countDownID] = useStateRef("");
    const [___, setPlayedPieces, currPlayedPieces] = useStateRef([]);

    const sio = useContext(SocketIOContext);
    const { setValidDrag } = useContext(ValidDragContext);
    const { notifications, setNotifications } = useContext(NotificationContext);
    const { player, gameResumed, boardState, rackState, setRackState, setPlayer, bag, setPlayedWords, setPlayFlag, gameStarted, timeToPlay, playedTiles, playedWords, usedTiles, gameEnded, setRecallFlag } = useContext(GameContext);
    const [_a_, setCountDown, countDown] = useStateRef(timeToPlay.current);


    // Get 7 pieces when game starts
    useEffect(() => {
        async function getPieces() {
            if (currPieces.current.length === 0) {
                setPieces(await getFromBag(7));
            }
        }

        // If game is resumed, use set pieces, 
        // else if new game, fetch pieces from server
        if (rackState.current.length !== 0) {
            setPieces(rackState.current);
            setTimeout(() => {
                sio.emit("resumeEvent", { roomID: player.current.roomID });
                setRackState([]);
            }, 1000);
        }
        else getPieces();
    }, []); // [] ensures only on first render


    // If game ends, recompute score and announce
    useEffect(async () => {
        if (gameEnded.current) {
            let score = player.current.score;

            // Decrement each piece's weight from score
            for (const piece of currPieces.current) score -= piece.weight

            let response = await makeServerRequest({
                requestType: "post",
                url: "/scores",
                payload: {
                    score: score,
                    name: player.current.name,
                    roomID: player.current.roomID,
                },
            });
            if (response.status === "success") setPlayer({ ...player.current, turn: false })
        }
    }, [gameEnded.current]);


    // Effect from Game board
    useEffect(async () => {
        if (playedWords.current.length > 0) {

            // Have three chances to play validly
            // After three, turn is auto skipped
            if (tryCount.current >= 3) {
                actualTurnSkip(); // Auto skip turn
                setTryCount(0); // Reset play chances
                return;
            }

            // Get the played words as a list of strings, instead of a list of object strings
            let playedWordsStr = playedWords.current.map(word => word.map(char => char.char).join(""));

            // Validate the played words from the Scrabble DB
            let response = await validatePlayedWords(playedWordsStr);

            if (response.status === "error") {
                // Increment play chances
                setTryCount(tryCount.current + 1);

                setNotifications([{
                    type: "error",
                    message: response.message,
                }]);
            }
            else {
                // Determine if bag is already empty when player played
                let bagIsEmpty = bag.current.length === 0;

                // Determine if rack is empty (all pieces were played)
                let rackIsEmpty = currPieces.current.length === 0;

                // Compute the score from played words and get the actual played word
                let playedWord = getPlayedWord(playedWordsStr, currPlayedPieces.current)
                let score = computeScore(playedWords.current, currPlayedPieces.current.length === 7)

                // Refill rack
                await refillRack(currPlayedPieces.current.length);

                // Reset played pieces
                setPlayedPieces([]);

                // Tell everybody
                sio.emit('playEvent', {
                    score: score,
                    word: playedWord,
                    bagIsEmpty: bagIsEmpty,
                    rackIsEmpty: rackIsEmpty,
                    name: player.current.name,
                    roomID: player.current.roomID,
                });

                // Remove timer when play happens
                clearInterval(countDownID.current);

                setPlayedWords([]); // Reset played words
                setTryCount(0); // Reset play chances
            }
        }
    }, [playedWords.current]);


    // Play timer implementation
    useEffect(() => {
        // Set the default countdown
        setCountDown(timeToPlay.current);

        // If there's a count down and it's the player's turn
        if (timeToPlay.current && player.current.turn) {
            let intervalID = setInterval(() => {
                // Countdown and auto skip turn
                if (countDown.current === 0) actualTurnSkip(); // Skip
                else setCountDown(countDown.current - 1); // Decrement 
            }, 1000);

            setCountDownID(intervalID); // Store intervalID
            return () => clearInterval(countDownID.current);
        }
    }, [player.current.turn]);


    // Get actual played word
    // Strategy is to weigh each played word by the
    // pieces played from the rack and choose highest
    const getPlayedWord = (playedWords, playedPieces) => {
        let playedWord, wordWeight = 0;

        for (const word of playedWords) {
            let weight = 0;
            for (const piece of playedPieces) {
                if (word.includes(piece.piece)) weight += 1
            }

            if (weight > wordWeight) {
                playedWord = word;
                wordWeight = weight;
            }
        }
        return playedWord;
    }


    // Compute total score of played words
    const computeScore = (playedWords, isBingo) => {

        let totalScore = 0;

        // For each played word
        for (const word of playedWords) {
            // Word score and multiiplier
            let score = 0, mul = 1;

            // For each character...
            for (const char of word) {
                let charWeight = 0;
                let charTileID = char.tileID;
                let charTileType = char.tileType;

                // Already cemented tiles? Skip special attrs
                if (usedTiles.current.includes(charTileID)) {
                    charWeight = char.weight;
                }
                else {
                    // Update score per tile type
                    if (charTileType === "doubleLetter") {
                        charWeight = char.weight * 2;
                    }
                    else if (charTileType === "doubleWord" || charTileType === "startTile") {
                        mul *= 2;
                        charWeight = char.weight;
                    }
                    else if (charTileType === "tripleWord") {
                        mul *= 3;
                        charWeight = char.weight;
                    }
                    else if (charTileType === "tripleLetter") {
                        charWeight = char.weight * 3;
                    }
                    // Normal tile
                    else charWeight = char.weight;
                }

                score += charWeight; // Score based on weight
            }

            score *= mul; // Update with multiplier

            // Update total score
            totalScore += score;
        }

        // If Bingo, add 50 points
        totalScore = isBingo ? totalScore + 50 : totalScore;

        return totalScore;
    }


    // Validate words from the server
    const validatePlayedWords = async (playedWordsStr) => {
        let response = await makeServerRequest({
            url: '/validate',
            requestType: 'post',
            payload: { words: playedWordsStr },
        });

        return response;
    }


    // Get passed amount from bag
    const getFromBag = async (amount) => {
        let response = await makeServerRequest({
            payload: {},
            requestType: 'get',
            url: `/bag/${amount}?roomID=${player.current.roomID}`,
        });
        let returnedPieces = response['pieces'];
        for (const [index, piece] of Object.entries(returnedPieces)) {
            piece["id"] = `${index}_${piece.id}`;
        }
        return returnedPieces
    }

    // Refill rack
    const refillRack = async (amount) => {
        let pieces = await getFromBag(amount);
        for (const piece of pieces) addToPieces(piece);
    }

    // After drag ends, get equivalent piece
    // on Rack. Done in case of removal
    const dragEndHandler = (pieceData) => {
        let playedPiece = findPiece(pieceData, currPieces.current);
        removePieceFromPieces(playedPiece);
        addToPlayedPieces(playedPiece);
    }

    const removePieceFromPieces = (playedPiece) => {
        let remainingPieces = currPieces.current.filter(piece => piece.id !== playedPiece.id);
        setPieces([...remainingPieces]);
    }

    const removePieceFromPlayedPieces = (playedPiece) => {
        let remainingPieces = [...currPlayedPieces.current].filter(piece => piece.id !== playedPiece.id);
        setPlayedPieces([...remainingPieces]);
    }


    // Turn off modal
    const swapCancelHandler = () => setStartSwap(false);

    const getTileRow = (tile) => {
        tile += 1;
        return Math.ceil(tile / 15);
    }

    const getTileColumn = (tile) => {
        tile += 1;
        return tile % 15;
    }

    const getPlayDirection = (playedTiles) => {

        // Sort the tiles in ascending order for use
        playedTiles = playedTiles.sort((a, b) => a - b);

        let playDirection;
        let firstTile = playedTiles[0];
        let firstTileRow = getTileRow(firstTile);
        const numPlayedTiles = playedTiles.length;

        // If all played tiles are on the same row, then horizontal
        if (playedTiles.every((t) => getTileRow(t) === firstTileRow)) {
            playDirection = "horizontal";
        }

        // If not, check if they're all on the same column. If yes, 
        // then it's a vertical play. If not, then it's an invalid play
        else {
            for (let i = 0; i < numPlayedTiles; i++) {
                if ((i + 1) < numPlayedTiles) {
                    let tt = playedTiles[i]; // this tile
                    let nt = playedTiles[i + 1]; // next tile

                    // Difference between each
                    // tile must be fifteen for
                    // the play to be vertical.
                    if ((nt - tt) % 15 !== 0) {
                        playDirection = "both";
                        break;
                    }

                    playDirection = "vertical";
                }
            }
        }

        return playDirection;
    }

    // If swap is confirmed, get pieces of checked boxes
    // and remove them from rack. Replace them after and
    // then disable the swap modal for later reswapping 
    const swapConfirmHandler = async (checkedIDs) => {
        if (checkedIDs.length > 0) {
            let piecesSwapped = [];

            // Remove associated ids from rack
            for (const id of checkedIDs) {
                let pieceToSwap = findPieceByID(id, currPieces.current);
                removePieceFromPieces(pieceToSwap);
                piecesSwapped.push(pieceToSwap);
            }

            // Remove timer when play happens
            clearInterval(countDownID.current);

            setStartSwap(false); // Turn off modal

            // Refill rack
            await refillRack(checkedIDs.length);

            // Announce to everybody
            sio.emit('playEvent', {
                piecesSwapped,
                isTurnSwapped: true,
                name: player.current.name,
                roomID: player.current.roomID,
            });
        }
    }

    // Get tiles played on a row or column within the
    // bounds of the first and last tile the player played
    const getNeigbouringTiles = (tile, playDirection, playedTiles) => {
        let tiles = [], allTiles = [];
        let source = playDirection === "horizontal" ? getTileRow(tile) : getTileColumn(tile);

        let loopLength = playDirection === "horizontal" ? 1 : 15;
        let startTile = playDirection === "horizontal" ? (source - 1) * 15 : source - 1;

        // Loop fifteen tiles, that is
        // all tiles in row or column
        for (let i = 0; i < 15; i++) {
            // Get played tiles
            if (playedTiles.includes(startTile)) tiles.push(startTile)

            // Push irregardless
            allTiles.push(startTile)
            startTile += loopLength;
        }

        let first = allTiles.indexOf(tiles[0]);
        let last = allTiles.indexOf(tiles[tiles.length - 1])

        // Return tile range between 
        // played/cemented tiles
        return allTiles.slice(first, last + 1);
    }


    // Validate that each played piece is linked
    // (left, right, top, bottom) to another piece
    const validateNeighbors = (playedTiles, boardIsEmpty, playDirection) => {
        let valid = true;
        let linkCount = 0;
        let lastTile = playedTiles[playedTiles.length - 1];

        let tiles = getNeigbouringTiles(lastTile, playDirection, playedTiles)

        // Ensure no blanks in between played/cemented tiles
        // AND logic heirarchy is cemented then played
        for (const tile of tiles) {
            if (!usedTiles.current.includes(tile) && !playedTiles.includes(tile)) {
                valid = false;
                return valid;
            }
        }

        // Ensure played tiles are linked to existing
        for (const tile of playedTiles) {
            let linkedTiles = [];
            let tileUp, tileDown, tileLeft, tileRight;

            tileUp = tile - 15;
            tileLeft = tile - 1;
            tileDown = tile + 15;
            tileRight = tile + 1;

            if (tileUp >= 0) linkedTiles.push(tileUp)
            if (tileLeft >= 0) linkedTiles.push(tileLeft)

            if (tileDown <= 224) linkedTiles.push(tileDown)
            if (tileRight <= 224) linkedTiles.push(tileRight)

            // Check all linked tiles
            linkedTiles.forEach((tileTC) => {
                // If game has started, at least one tile must be linked to existing tiles
                if (!boardIsEmpty && usedTiles.current.includes(tileTC)) linkCount += 1;
            });
        }

        // Must be linked to at least one existing tile
        if (!boardIsEmpty && linkCount < 1) valid = false

        return valid
    }


    // Start the play pipeline. Validate neighbors, played words, etc.
    const initiatePlayPipeline = (playedTiles, boardIsEmpty) => {
        let playDirection = getPlayDirection(playedTiles);
        let neighborsAreValid = validateNeighbors(playedTiles, boardIsEmpty, playDirection);

        // Must play in just one direction or weird play move
        if (playDirection === "both" || !neighborsAreValid) {
            setNotifications([{
                type: "error",
                message: "Sorry, that's an invalid move",
            }]);
        }
        // Switch to gameboard to 
        // validate played words
        else setPlayFlag(true);
    }


    // Play for turn
    const play = () => {
        if (gameEnded.current) {
            setNotifications([{
                type: "info",
                message: "The game has ended. No more actions are possible.",
            }]);
            return;
        }

        // If it's the player's turn and the game has started
        if (player.current.turn && (gameStarted.current || gameResumed.current)) {

            // If nothing was played. Warn player...
            if (currPlayedPieces.current.length === 0) {
                setNotifications([{
                    type: "warning",
                    message: "You haven't played anything. You can alternatively skip your turn",
                }]);
            }

            // If something was played
            else {
                let boardIsEmpty = isBoardEmpty();

                // If the board is empty (Game literally just started)
                if (boardIsEmpty) {

                    // Ensure star tile is played on, on first play
                    if (!playedTiles.current.includes(112)) {
                        setNotifications([{
                            type: "error",
                            message: "Invalid start move. You must play on the starred tile",
                        }]);

                        return; // Exit
                    }
                }

                // Star tile was played on. Continue play
                // Game has been ongoing. Star tile is already used
                initiatePlayPipeline(playedTiles.current, boardIsEmpty);
            }
        }
    }


    // Swap pieces for turn
    const swap = () => {
        if (gameEnded.current) {
            setNotifications([{
                type: "info",
                message: "The game has ended. No more actions are possible.",
            }]);
            return;
        }

        if (player.current.turn && (gameStarted.current || gameResumed.current)) {
            // Pieces in bag must be more than 7 to swap
            if (bag.current.length <= 7) {
                setNotifications([
                    {
                        message: `Swapping pieces is no longer possible, as the bag has ${bag.current.length} pieces left. `,
                        type: "info",
                    }
                ]);
            }
            else {
                recall();
                setStartSwap(true);
            }
        }
        else {
            setNotifications([
                {
                    message: `You can not swap pieces until it is your turn to play. Kindly wait your turn`,
                    overwrite: false,
                    type: "warning",
                    timeout: 5
                }
            ]);
        }

    }

    // Recall pieces from board
    const recall = () => {

        if (gameEnded.current) {
            setNotifications([{
                type: "info",
                message: "The game has ended. No more actions are possible.",
            }]);
            return;
        }

        if (player.current.turn && (gameStarted.current || gameResumed.current)) {
            // Merge back played pieces to current pieces on rack
            setPieces([...currPieces.current, ...currPlayedPieces.current]);

            // Reset played pieces
            setPlayedPieces([]);

            // Signal a recall happened to empty board
            setRecallFlag(true);

            // Tell everybody
            sio.emit('recallEvent', {
                roomID: player.current.roomID,
                name: player.current.name
            }
            );
        }
        else {
            setNotifications([
                ...notifications.current,
                {
                    message: `You can not recall pieces until it's your turn to play. Kindly wait your turn`,
                    overwrite: false,
                    type: "warning",
                    timeout: 5
                }
            ]);
        }
    }

    // Board is empty if there are no cemented tiles
    const isBoardEmpty = () => usedTiles.current.length === 0;

    // Shuffle pieces on Rack
    const shuffle = () => setPieces([...inPlaceShuffle(currPieces.current)]);

    // Make draw to determine player turns
    const draw = () => sio.emit("drawEvent", { roomID: player.current.roomID });

    // Implementation of a turn skip
    const actualTurnSkip = () => {
        recall(); // Recall pieces, if any

        // Tell everybody
        sio.emit('playEvent', {
            isTurnSkipped: true,
            name: player.current.name,
            roomID: player.current.roomID,
        });

        // Remove timer when play happens
        clearInterval(countDownID.current);
    }

    // Skip one's turn
    const skip = () => {
        if (gameEnded.current) {
            setNotifications([{
                type: "info",
                message: "The game has ended. No more actions are possible.",
            }]);
            return;
        }

        if (player.current.turn && (gameStarted.current || gameResumed.current)) {
            let shouldSkipTurn = window.confirm("Are you sure you want to skip your turn?");
            if (shouldSkipTurn) actualTurnSkip();
        }
        else {
            setNotifications([
                ...notifications.current,
                {
                    message: `You can not skip turn until it is your turn to play. Kindly wait your turn`,
                    overwrite: false,
                    type: "warning",
                    timeout: 5
                }
            ]);
        }
    }


    // Helper functions
    const addToPieces = (piece) => setPieces([...currPieces.current, piece])
    const findPieceByID = (pieceID, source) => source.find(piece => piece.id === pieceID);
    const findPiece = (pieceData, source) => source.find(piece => piece.id === pieceData.id);
    const addToPlayedPieces = (playedPiece) => setPlayedPieces([...currPlayedPieces.current, playedPiece]);


    // Event listeners
    const handleDragDrop = (e) => {
        if (player.current.turn) {
            // Prevent bubble
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Data of piece dragged on it          
            const pieceData = getDragData(e);

            // Don't allow drags of cemented tiles
            if (!usedTiles.current.includes(pieceData.tileID)) {
                // Get piece dragged back from the ones in rack state
                let piece = findPiece(pieceData, currPlayedPieces.current);

                // Tell other players
                sio.emit('inPlayEvent', {
                    roomID: player.current.roomID,
                    pieceData: { ...pieceData, toRackMove: true }
                });

                if (pieceData.onBoard) { // If board-to-rack drag
                    removePieceFromPlayedPieces(piece);
                    addToPieces(piece);
                }
                else setValidDrag(false); // Rack-to-rack drag. Do nothing.
            }
        }
    }

    // useEffect(() => {
    //     window.addEventListener('beforeunload', alertUser);
    //     window.addEventListener('unload', handleGameExit);
    //     return () => {
    //         window.removeEventListener('beforeunload', alertUser);
    //         window.removeEventListener('unload', handleGameExit);
    //     }
    // }, []);

    // const alertUser = e => {
    //     e.preventDefault()
    //     e.returnValue = ''
    // }

    // setGamedExited(true);


    // const handleGameExit = async () => {
    //     await saveGame(); // Save the game state
    //     alert("Note that you can still resume this game session using your name and the session ID.");

    //     setTimeout(() => {
    //         sio.emit("leave", { roomID: player.current.roomID, name: player.current.name })
    //     }, 700); 
    // }


    // Save rack state in interval (autosave)
    useEffect(() => {
        let iID = setInterval(() => {
            // Save the pieces on the rack
            if (currPieces.current.length > 0 || currPlayedPieces.current.length > 0) {
                setRackState([...currPieces.current, ...currPlayedPieces.current]);
            }
        }, timeoutDelay);

        setPingIntervalID(iID);
        return () => clearInterval(pingIntervalID);
    }, []); // [] Ensures only on first render


    // useEffect(async () => {
    //     if (gameExited.current) {
    //         await handleGameExit();
    //         window.location.reload(); // Refresh page (go to home page)                            
    //     }
    // }, [gameExited.current]);


    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.preventDefault();

    // Effects
    useEffect(() => thisRack.current.addEventListener("drop", handleDragDrop));
    useEffect(() => thisRack.current.addEventListener("dragover", handleDragOver));
    useEffect(() => thisRack.current.addEventListener("dragleave", handleDragLeave));
    useEffect(() => thisRack.current.addEventListener("dragenter", handleDragEnter));

    const classNames = (gameStarted.current || gameResumed.current) ? "flex justify-between items-end" : "flex justify-end items-end";

    // Render
    return (
        <div className="block">
            <div ref={thisRack} className="flex justify-end">
                <div style={{ width: "25rem" }} className="h-16 flex border-4 bg-gray-300 border-gray-500 rounded-md">
                    {currPieces.current ? currPieces.current.map((piece, index) => {
                        if (piece) return <Piece
                            id={piece.id}
                            key={`${piece.id}_${index}`}
                            onBoard={false}
                            char={piece.piece}
                            weight={piece.weight}
                            dragEndHandler={dragEndHandler}
                        />

                    }) : null}
                </div>
            </div>
            <div className="py-2"></div>
            <div className={classNames}>

                {/* Show bag only when game has started */}
                {gameStarted.current || gameResumed.current ? <Bag bag={bag.current} /> : null}

                <Controls
                    gameStarted={gameStarted}
                    shuffle={shuffle}
                    recall={recall}
                    skip={skip}
                    play={play}
                    draw={draw}
                    swap={swap}
                />
            </div>
            <div className="py-2"></div>
            {player.current.turn && timeToPlay.current
                ?
                <div title="Time left to play" className={`${countDown.current < 10 ? 'blink' : ""} cursor-help flex text-gray-400 justify-end items-center`}>
                    <Clock size={19} className="inline" />
                    <span className="pl-1">{secondsToMMSS(countDown.current)}</span>
                </div>
                :
                null}

            <SwapModal
                show={startSwap.current}
                pieces={currPieces.current}
                swapCancelHandler={swapCancelHandler}
                swapConfirmHandler={swapConfirmHandler}
            />
        </div>

    )
};

export default Rack;