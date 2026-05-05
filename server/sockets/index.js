const { Server } = require('socket.io');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        const token = socket.handshake.auth?.token;
        
        if (!token) {
            console.log(`📡 Socket connection rejected [ID: ${socket.id}] [Reason: No Token]`);
            return socket.disconnect();
        }

        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(`📡 Socket connection rejected [ID: ${socket.id}] [Reason: Invalid Token]`);
                return socket.disconnect();
            }
            console.log(`📡 Socket connected [ID: ${socket.id}] [User: ${decoded.id}]`);
        });
        
        socket.on('disconnect', (reason) => {
            console.log(`📡 Socket disconnected [ID: ${socket.id}] [Reason: ${reason}]`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { init, getIO };
