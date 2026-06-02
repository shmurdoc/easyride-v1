const { dataClient } = require('../services/redis');

const CHAT_MAX_LENGTH = 100;
const CHAT_MAX_LENGTH_MS = 24 * 60 * 60 * 1000;

module.exports = function registerChatHandlers(socket, io) {
  const { userId } = socket.data;

  socket.on('chat:send', async (data) => {
    try {
      const { rideId, message, receiverId } = data;

      if (!rideId || !message || !receiverId) {
        return socket.emit('error', { message: 'Missing rideId, message, or receiverId' });
      }

      if (typeof message !== 'string' || message.trim().length === 0 || message.length > 1000) {
        return socket.emit('error', { message: 'Invalid message content' });
      }

      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        rideId,
        senderId: userId,
        receiverId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      await dataClient.lpush(`chat:${rideId}`, JSON.stringify(msg));
      await dataClient.ltrim(`chat:${rideId}`, 0, CHAT_MAX_LENGTH - 1);
      await dataClient.expire(`chat:${rideId}`, Math.floor(CHAT_MAX_LENGTH_MS / 1000));

      io.to(`ride:${rideId}`).emit('chat:message', msg);
    } catch (err) {
      console.error(`[Chat:${userId}] send error:`, err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('chat:typing', (data) => {
    try {
      const { rideId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('chat:typing', {
        rideId,
        userId,
        isTyping: true,
      });
    } catch (err) {
      console.error(`[Chat:${userId}] typing error:`, err.message);
    }
  });

  socket.on('chat:stop-typing', (data) => {
    try {
      const { rideId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('chat:typing', {
        rideId,
        userId,
        isTyping: false,
      });
    } catch (err) {
      console.error(`[Chat:${userId}] stop-typing error:`, err.message);
    }
  });
};
