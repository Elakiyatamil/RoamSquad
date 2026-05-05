import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
    if (socket) return socket;
    
    if (!token) return null;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api$/, '');
    socket = io(socketUrl, {
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
