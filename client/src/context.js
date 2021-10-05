import React from 'react';
import { io } from 'socket.io-client';
import { URL, IO_TRANSPORTS } from './constants';


const socket = io(URL, IO_TRANSPORTS);

const GameContext = React.createContext();
const SocketIOContext = React.createContext();
const ValidDragContext = React.createContext();
const NotificationContext = React.createContext();

export { socket };
export { GameContext };
export { SocketIOContext };
export { ValidDragContext };
export { NotificationContext };
