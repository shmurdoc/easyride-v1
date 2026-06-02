const geoService = require('../services/geo');

module.exports = function registerDeliveryHandlers(socket, io) {
  const { userId } = socket.data;

  socket.on('rider:request-delivery', async (data) => {
    try {
      const { deliveryId, pickup, destination, description } = data;

      if (!deliveryId || !pickup || !destination) {
        return socket.emit('error', { message: 'Missing required fields' });
      }

      const nearbyDrivers = await geoService.findNearbyDrivers(
        pickup.lat,
        pickup.lng,
      );

      let notified = 0;
      for (const driver of nearbyDrivers) {
        io.to(`driver:${driver.driverId}`).emit('delivery:request', {
          deliveryId,
          pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address },
          destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
          description: description || '',
          senderId: userId,
          distance: driver.distance,
        });
        notified++;
      }

      socket.emit('delivery:broadcast-complete', { deliveryId, driversNotified: notified });
    } catch (err) {
      console.error(`[Delivery:${userId}] request error:`, err.message);
      socket.emit('error', { message: 'Failed to broadcast delivery request' });
    }
  });

  socket.on('driver:accept-delivery', async (data) => {
    try {
      const { deliveryId, senderId } = data;

      socket.join(`delivery:${deliveryId}`);

      io.to(`user:${senderId}`).emit('delivery:accepted', {
        deliveryId,
        driverId: userId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('delivery:status-change', {
        deliveryId,
        status: 'accepted',
        driverId: userId,
        senderId,
      });
    } catch (err) {
      console.error(`[Delivery:${userId}] accept error:`, err.message);
      socket.emit('error', { message: 'Failed to accept delivery' });
    }
  });

  socket.on('driver:delivery-status', async (data) => {
    try {
      const { deliveryId, senderId, status } = data;

      if (!deliveryId || !status) {
        return socket.emit('error', { message: 'Missing deliveryId or status' });
      }

      io.to(`user:${senderId}`).emit('delivery:status', {
        deliveryId,
        status,
        driverId: userId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('delivery:status-change', {
        deliveryId,
        status,
        driverId: userId,
        senderId,
        timestamp: Date.now(),
      });

      if (status === 'delivered') {
        socket.leave(`delivery:${deliveryId}`);
      }
    } catch (err) {
      console.error(`[Delivery:${userId}] status error:`, err.message);
      socket.emit('error', { message: 'Failed to update delivery status' });
    }
  });

  socket.on('driver:delivery-location', async (data) => {
    try {
      const { deliveryId, latitude, longitude } = data;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

      io.to(`delivery:${deliveryId}`).emit('delivery:location', {
        driverId: userId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Delivery:${userId}] location error:`, err.message);
    }
  });
};
