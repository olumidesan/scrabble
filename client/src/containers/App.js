import React from 'react';
import './App.css';
import Board from '../components/Board/Board';
import User from '../containers/User/User';
import Extras from './Extras/Extras';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Board />
        <User />
        {/* <Extras /> */}
      </div>
    );
  }
}

export default App;
