import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/roboto.css';
import './assets/styles/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.css';
import App from './containers/App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
