import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify';
import React from 'react';

const Toastify = () => {
    return (<ToastContainer
        autoClose={8000} // 8 seconds
        hideProgressBar
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover={true}/>)
}
export default Toastify;