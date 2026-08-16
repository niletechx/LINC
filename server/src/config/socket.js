const { Server } = require('socket.io');
const registerChatSocket = require('../sockets/chat.socket');
const registerNotificationSocket = require('../sockets/notification.socket');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    registerChatSocket(io, socket);
    registerNotificationSocket(io, socket);
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

module.exports = { initSocket, getIO };
