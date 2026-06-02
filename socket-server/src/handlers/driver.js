const geoService = require('../services/geo');

module.exports = function registerDriverHandlers(socket, io) {
  const { userId } = socket.data;

  socket.on('driver:location-update', async (data) => {
    try {
      const { rideId, latitude, longitude } = data;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return socket.emit('error', { message: 'Invalid coordinates' });
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return socket.emit('error', { message: 'Coordinates out of range' });
      }

      await geoService.updateDriverLocation(userId, latitude, longitude);

      if (rideId) {
        io.to(`ride:${rideId}`).emit('driver:location', {
          driverId: userId,
          latitude,
          longitude,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error(`[Driver:${userId}] location-update error:`, err.message);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  socket.on('driver:toggle-online', async (data) => {
    try {
      const { isOnline } = data;

      if (isOnline) {
        const loc = await geoService.getDriverLocation(userId);
        if (loc) {
          await geoService.updateDriverLocation(userId, loc.latitude, loc.longitude);
        }
        socket.data.isOnline = true;
      } else {
        await geoService.removeDriverLocation(userId);
        socket.data.isOnline = false;
      }

      socket.emit('driver:online-status', { isOnline: !!isOnline });
    } catch (err) {
      console.error(`[Driver:${userId}] toggle-online error:`, err.message);
      socket.emit('error', { message: 'Failed to toggle online status' });
    }
  });

  socket.on('driver:nearby-requests', async () => {
    try {
      const loc = await geoService.getDriverLocation(userId);
      if (!loc) {
        return socket.emit('driver:nearby-requests:result', { rides: [] });
      }

      const { dataClient } = require('../services/redis');
      const rideKeys = await dataClient.keys('ride:pending:*');
      const rides = [];

      for (const key of rideKeys.slice(0, 20)) {
        try {
          const rideData = await dataClient.hgetall(key);
          if (rideData && rideData.pickup_lat && rideData.pickup_lng) {
            rides.push({
              rideId: key.replace('ride:pending:', ''),
              pickup_lat: parseFloat(rideData.pickup_lat),
              pickup_lng: parseFloat(rideData.pickup_lng),
              category: rideData.category || 'standard',
              rider_id: rideData.rider_id,
            });
          }
        } catch (_) {}
      }

      socket.emit('driver:nearby-requests:result', { rides });
    } catch (err) {
      console.error(`[Driver:${userId}] nearby-requests error:`, err.message);
      socket.emit('error', { message: 'Failed to fetch nearby requests' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      if (socket.data.isOnline) {
        await geoService.removeDriverLocation(userId);
      }
    } catch (err) {
      console.error(`[Driver:${userId}] disconnect cleanup error:`, err.message);
    }
  });
};
