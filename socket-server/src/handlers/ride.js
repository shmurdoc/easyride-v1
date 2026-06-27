const geoService = require('../services/geo');
const { dataClient } = require('../services/redis');
const config = require('../config');

const apiBaseUrl = config.appApiBaseUrl.replace(/\/$/, '');

async function callApi(method, path, token, body) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { ok: false, status: response.status, body: text };
    }
    return { ok: true, data: await response.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = function registerRideHandlers(socket, io) {
  const { userId, role } = socket.data;

  socket.on('rider:book-ride', async (data) => {
    try {
      const { rideId, pickup, destination, category, fare } = data;

      if (!rideId || !pickup || !destination) {
        return socket.emit('error', { message: 'Missing required fields' });
      }

      await dataClient.hset(`ride:pending:${rideId}`, {
        rider_id: userId,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_address: pickup.address || '',
        dropoff_lat: destination.lat,
        dropoff_lng: destination.lng,
        dropoff_address: destination.address || '',
        category: category || 'standard',
        fare: fare || '',
        created_at: Date.now().toString(),
      });

      await dataClient.expire(`ride:pending:${rideId}`, 300);

      const nearbyDrivers = await geoService.findNearbyDrivers(
        pickup.lat,
        pickup.lng,
      );

      let notified = 0;
      for (const driver of nearbyDrivers) {
        io.to(`driver:${driver.driverId}`).emit('ride:request', {
          rideId,
          pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address },
          destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
          category: category || 'standard',
          fare,
          riderId: userId,
          distance: driver.distance,
        });
        notified++;
      }

      socket.emit('ride:broadcast-complete', { rideId, driversNotified: notified });
    } catch (err) {
      console.error(`[Ride:${userId}] book-ride error:`, err.message);
      socket.emit('error', { message: 'Failed to broadcast ride request' });
    }
  });

  const CLAIM_RIDE_LUA = `
    if redis.call("SET", KEYS[1], ARGV[1], "NX", "EX", ARGV[2]) then
      return 1
    else
      return 0
    end
  `;

  socket.on('driver:accept-ride', async (data) => {
    try {
      const { rideId, riderId } = data;

      if (!rideId || !riderId) {
        return socket.emit('error', { message: 'Missing rideId or riderId' });
      }

      const claimKey = `ride:claim:${rideId}`;
      const claimed = await dataClient.eval(
        CLAIM_RIDE_LUA,
        1,
        claimKey,
        userId,
        30
      );

      if (claimed !== 1) {
        return socket.emit('error', {
          message: 'Ride already accepted by another driver',
          code: 'RIDE_ALREADY_CLAIMED',
        });
      }

      try {
        await dataClient.del(`ride:pending:${rideId}`);
      } catch (delErr) {
        console.error(`[Ride:${userId}] failed to clear pending key:`, delErr.message);
      }

      socket.join(`ride:${rideId}`);
      socket.data.currentRideId = rideId;

      io.to(`user:${riderId}`).emit('ride:accepted', {
        rideId,
        driverId: userId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'accepted',
        driverId: userId,
        riderId,
      });
    } catch (err) {
      console.error(`[Ride:${userId}] accept-ride error:`, err.message);
      socket.emit('error', { message: 'Failed to accept ride' });
    }
  });

  socket.on('driver:arrived', async (data) => {
    try {
      const { rideId, riderId } = data;

      const apiResult = await callApi('POST', `/api/v1/rides/${rideId}/driver-arrived`, socket.data.token);
      if (!apiResult.ok) {
        console.error(`[Ride:${userId}] arrived API error:`, apiResult.status || apiResult.error);
        socket.emit('error', { message: 'Failed to persist driver arrival' });
        return;
      }

      io.to(`user:${riderId}`).emit('ride:arrived', {
        rideId,
        driverId: userId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'arrived',
        driverId: userId,
        riderId,
      });
    } catch (err) {
      console.error(`[Ride:${userId}] arrived error:`, err.message);
      socket.emit('error', { message: 'Failed to notify arrival' });
    }
  });

  socket.on('ride:start', async (data) => {
    try {
      const { rideId, otherUserId } = data;

      const apiResult = await callApi('POST', `/api/v1/rides/${rideId}/start`, socket.data.token);
      if (!apiResult.ok) {
        console.error(`[Ride:${userId}] start API error:`, apiResult.status || apiResult.error);
        socket.emit('error', { message: 'Failed to persist ride start' });
        return;
      }

      io.to(`user:${otherUserId}`).emit('ride:started', {
        rideId,
        [role === 'driver' ? 'driverId' : 'riderId']: userId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'in_progress',
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Ride:${userId}] start error:`, err.message);
      socket.emit('error', { message: 'Failed to start ride' });
    }
  });

  socket.on('ride:complete', async (data) => {
    try {
      const { rideId, otherUserId, fare } = data;

      const apiResult = await callApi('POST', `/api/v1/rides/${rideId}/complete`, socket.data.token);
      if (!apiResult.ok) {
        console.error(`[Ride:${userId}] complete API error:`, apiResult.status || apiResult.error);
        socket.emit('error', { message: 'Failed to persist ride completion' });
        return;
      }

      io.to(`user:${otherUserId}`).emit('ride:completed', {
        rideId,
        [role === 'driver' ? 'driverId' : 'riderId']: userId,
        fare,
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'completed',
        fare,
        timestamp: Date.now(),
      });

      socket.leave(`ride:${rideId}`);
      socket.data.currentRideId = null;
    } catch (err) {
      console.error(`[Ride:${userId}] complete error:`, err.message);
      socket.emit('error', { message: 'Failed to complete ride' });
    }
  });

  socket.on('ride:cancel', async (data) => {
    try {
      const { rideId, otherUserId, reason } = data;

      const apiResult = await callApi('POST', `/api/v1/rides/${rideId}/cancel`, socket.data.token, {
        cancellation_reason: reason || 'Cancelled via app',
      });
      if (!apiResult.ok) {
        console.error(`[Ride:${userId}] cancel API error:`, apiResult.status || apiResult.error);
        socket.emit('error', { message: 'Failed to persist ride cancellation' });
        return;
      }

      await dataClient.del(`ride:pending:${rideId}`);

      io.to(`user:${otherUserId}`).emit('ride:cancelled', {
        rideId,
        cancelledBy: userId,
        reason: reason || '',
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'cancelled',
        cancelledBy: userId,
        reason,
        timestamp: Date.now(),
      });

      socket.leave(`ride:${rideId}`);
      socket.data.currentRideId = null;
    } catch (err) {
      console.error(`[Ride:${userId}] cancel error:`, err.message);
      socket.emit('error', { message: 'Failed to cancel ride' });
    }
  });

  socket.on('ride:send-location', async (data) => {
    try {
      const { rideId, latitude, longitude } = data;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return;
      }

      io.to(`ride:${rideId}`).emit('ride:location-update', {
        userId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Ride:${userId}] send-location error:`, err.message);
    }
  });

  socket.on('join:ride', async (rideId) => {
    try {
      socket.join(`ride:${rideId}`);

      const messages = await dataClient.lrange(`chat:${rideId}`, 0, 49);
      const parsed = messages.map((m) => JSON.parse(m)).reverse();
      socket.emit('chat:history', { rideId, messages: parsed });
    } catch (err) {
      console.error(`[Ride:${userId}] join-ride error:`, err.message);
    }
  });

  socket.on('leave:ride', (rideId) => {
    socket.leave(`ride:${rideId}`);
  });
};
