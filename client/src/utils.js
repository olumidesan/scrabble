// Helper functions
import CountUp from 'react-countup';


const inPlaceShuffle = (arr) => {

    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
}

const secondsToMMSS = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5);

const generateRandomID = (size) => {
    return window.crypto
        .getRandomValues(new Uint32Array(1))[0]
        .toString()
        .slice(0, size);
}

const isAlphanumeric = (str) => str.match(/^[0-9a-zA-Z]+$/);

const countUp = (number) => {
    return <CountUp start={number} end={number} duration={1.5} />
}

const countDown = (number) => {
    return <CountUp start={number + 7} end={number} duration={1.5} />
}

const excludeMeSioEvent = (sio, eventName, myName, dispatch) => {
    sio.on(eventName, (data) => {
        if (data.name !== myName) dispatch(data);
    });
};

const dragCancelled = (e) => e.dataTransfer.dropEffect === "none";
const getDragData = (e) => JSON.parse(e.dataTransfer.getData("draggedPiece"));
const setDragData = (e, data) => e.dataTransfer.setData("draggedPiece", JSON.stringify(data));

export { countUp };
export { countDown };
export { setDragData };
export { getDragData };
export { dragCancelled };
export { secondsToMMSS };
export { inPlaceShuffle };
export { isAlphanumeric };
export { generateRandomID };
export { excludeMeSioEvent };