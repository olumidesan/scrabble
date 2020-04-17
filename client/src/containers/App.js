import React from 'react';
import './App.css';
import Board from '../components/Board/Board';
import User from '../containers/User/User';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Board />
        <User />
      </div>
    );
  }
}

export default App;
