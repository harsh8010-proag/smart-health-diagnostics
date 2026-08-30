import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin);

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinBookingRoom = (bookingId) => {
  const s = getSocket();
  s.emit('JOIN_ROOM', { bookingId });
};

export const leaveBookingRoom = (bookingId) => {
  const s = getSocket();
  s.emit('LEAVE_ROOM', { bookingId });
};

export const sendLocation = (bookingId, lat, lng) => {
  const s = getSocket();
  s.emit('PHLEBOTOMIST_LOCATION', { bookingId, lat, lng });
};
