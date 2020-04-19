import React from 'react';
import './App.css';
import GameUser from '../containers/User/User';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <GameUser />
      </div>
    );
  }
}

export default App;
