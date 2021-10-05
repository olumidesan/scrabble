import { useEffect, useRef, useState, useCallback } from 'react';
import makeServerRequest from './xhr';


function useFetch(requestParams) {
    const [data, setData] = useState();

    useEffect(() => {
        const goGet = async () => {
            const response = await makeServerRequest(requestParams);
            setData(response);
        }
        goGet();
    }, [requestParams.url]);
    return data;
}


function useStateRef(defaultValue) {
    let [state, setState] = useState(defaultValue)
    let ref = useRef(state)

    let dispatch = useCallback(function (val) {
        ref.current = typeof val === "function" ?
            val(ref.current) : val

        setState(ref.current)
    }, []);

    return [state, dispatch, ref]
}

const reducer = (state, action) => {
    switch (action.type) {
      case true: return true 
      default: return false
     }
  }

function useEventListener(eventName, handler, element = window) {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(
        () => {
            // Make sure element supports addEventListener
            const isSupported = element && element.addEventListener;
            if (!isSupported) return;
            // Create event listener that calls handler function stored in ref
            const eventListener = (event) => savedHandler.current(event);
            // Add event listener
            element.addEventListener(eventName, eventListener);
            // Remove event listener on cleanup
            return () => {
                element.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, element] // Re-run if eventName or element changes
    );
}

export { reducer };
export { useFetch };
export { useStateRef };
export { useEventListener };