import './App.css';
import Game from './containers/Game';
import { SocketIOContext } from './context';

import { socket } from './context';

function App() {
  return (
    <SocketIOContext.Provider value={socket}>
      <div className="App">
        <Game />
      </div>
    </SocketIOContext.Provider>
  );
}

export default App;
