import { io } from 'socket.io-client';
import { getApiBaseUrl } from './api';

let socket = null;

export const socketService = {
  /**
   * Connect to Socket.IO backend server
   */
  connect(token) {
    if (socket && socket.connected) return socket;

    const serverUrl = getApiBaseUrl().replace('/api', '');

    socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      // connected
    });

    socket.on('disconnect', () => {
      // disconnected
    });

    return socket;
  },

  /**
   * Disconnect socket
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Join a specific conversation room
   */
  joinConversation(conversationId) {
    if (socket && socket.connected) {
      socket.emit('join:conversation', { conversationId });
    }
  },

  /**
   * Listen for incoming messages
   */
  onMessage(callback) {
    if (socket) {
      socket.on('message:new', callback);
    }
  },

  /**
   * Listen for incoming notifications
   */
  onNotification(callback) {
    if (socket) {
      socket.on('notification:new', callback);
    }
  },
};
