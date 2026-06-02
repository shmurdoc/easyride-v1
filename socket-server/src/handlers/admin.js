const geoService = require('../services/geo');
const { dataClient } = require('../services/redis');

module.exports = function registerAdminHandlers(socket, io) {
  const { userId, role } = socket.data;

  if (role !== 'admin' && role !== 'super-admin') return;

  socket.join('admin');

  socket.on('admin:broadcast-message', async (data) => {
    try {
      const { target, event, payload } = data;

      if (!target || !event || !payload) {
        return socket.emit('error', { message: 'Missing target, event, or payload' });
      }

      io.to(target).emit(event, {
        ...payload,
        fromAdmin: true,
        timestamp: Date.now(),
      });

      socket.emit('admin:broadcast-sent', { target, event });
    } catch (err) {
      console.error(`[Admin:${userId}] broadcast error:`, err.message);
      socket.emit('error', { message: 'Failed to broadcast message' });
    }
  });

  socket.on('admin:driver-location', async (data) => {
    try {
      const { driverId } = data;
      const loc = await geoService.getDriverLocation(driverId);
      socket.emit('admin:driver-location:result', { driverId, location: loc });
    } catch (err) {
      console.error(`[Admin:${userId}] driver-location error:`, err.message);
      socket.emit('error', { message: 'Failed to get driver location' });
    }
  });

  socket.on('admin:online-drivers', async () => {
    try {
      const count = await geoService.getOnlineDriverCount();
      socket.emit('admin:online-drivers:result', { count });
    } catch (err) {
      console.error(`[Admin:${userId}] online-drivers error:`, err.message);
      socket.emit('error', { message: 'Failed to get online drivers' });
    }
  });

  socket.on('admin:active-rides', async () => {
    try {
      const rideKeys = await dataClient.keys('ride:pending:*');
      const rides = [];

      for (const key of rideKeys) {
        try {
          const rideData = await dataClient.hgetall(key);
          if (rideData) {
            rides.push({
              rideId: key.replace('ride:pending:', ''),
              ...rideData,
            });
          }
        } catch (_) {}
      }

      socket.emit('admin:active-rides:result', { rides });
    } catch (err) {
      console.error(`[Admin:${userId}] active-rides error:`, err.message);
      socket.emit('error', { message: 'Failed to get active rides' });
    }
  });

  socket.on('admin:force-disconnect', async (data) => {
    try {
      const { targetUserId } = data;
      const sockets = await io.in(`user:${targetUserId}`).fetchSockets();
      for (const s of sockets) {
        s.emit('admin:force-disconnect', { reason: 'Disconnected by admin' });
        s.disconnect(true);
      }
      socket.emit('admin:disconnected-user', { targetUserId, count: sockets.length });
    } catch (err) {
      console.error(`[Admin:${userId}] force-disconnect error:`, err.message);
      socket.emit('error', { message: 'Failed to disconnect user' });
    }
  });
};
