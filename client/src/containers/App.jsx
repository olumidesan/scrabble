import React from 'react';
import ToastContainer from '../helpers/toastify';
import GameUser from './User/User';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <GameUser />
        <ToastContainer />
      </div>
    );
  }
}

export default App;
