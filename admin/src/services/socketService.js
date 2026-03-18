import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
    if (socket) return socket;
    
    if (!token) return null;

    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
    });

    socket.on('connect_error', (err) => {
        console.error('📡 Global Socket error:', err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
