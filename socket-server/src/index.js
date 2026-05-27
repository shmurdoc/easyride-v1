const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'easyryde-jwt-secret';
const PORT = parseInt(process.env.PORT || '3001');

const STALE_LOCATION_TTL = 300;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] }
});

const redisPub = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const redisSub = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

redisPub.on('error', (err) => console.error('Redis pub error:', err.message));
redisSub.on('error', (err) => console.error('Redis sub error:', err.message));
redisClient.on('error', (err) => console.error('Redis client error:', err.message));

io.adapter(createAdapter(redisPub, redisSub));

redisSub.psubscribe('laravel_database_*', (err) => {
  if (err) console.error('Redis psubscribe error:', err.message);
});

redisSub.on('pmessage', (_pattern, channel, message) => {
  try {
    const parsed = JSON.parse(message);
    const eventName = parsed.event || null;
    const eventData = parsed.data || {};

    let room = null;
    if (channel.includes('user:')) {
      const match = channel.match(/user:(\d+)/);
      if (match) room = `user:${match[1]}`;
    } else if (channel.includes('driver:')) {
      const match = channel.match(/driver:(\d+)/);
      if (match) room = `driver:${match[1]}`;
    } else if (channel.includes('admin')) {
      room = 'admin';
    } else if (channel.includes('ride:')) {
      const match = channel.match(/ride:(\d+)/);
      if (match) room = `ride:${match[1]}`;
    } else if (channel.includes('delivery:')) {
      const match = channel.match(/delivery:(\d+)/);
      if (match) room = `delivery:${match[1]}`;
    }

    if (room && eventName) {
      io.to(room).emit(eventName, eventData);
    }
  } catch (err) {
    console.error('Error processing Laravel broadcast:', err.message);
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.userId = decoded.user_id || decoded.sub || decoded.id;
    socket.data.role = decoded.role || 'rider';
    socket.data.tenantId = decoded.tenant_id || null;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId, role, tenantId } = socket.data;
  console.log(`User connected: ${userId} (${role})`);

  socket.join(`user:${userId}`);

  if (role === 'driver') {
    socket.join(`driver:${userId}`);
  }

  if (role === 'admin') {
    socket.join('admin');
  }

  socket.on('driver:location-update', async (data) => {
    try {
      const { rideId, latitude, longitude } = data;
      if (rideId) {
        socket.to(`ride:${rideId}`).emit('driver:location', { driverId: userId, latitude, longitude });
      }
      await redisClient.hset(
        `driver:location:${userId}`,
        'latitude', latitude,
        'longitude', longitude,
        'updatedAt', Date.now().toString()
      );
      await redisClient.expire(`driver:location:${userId}`, STALE_LOCATION_TTL);
    } catch (err) {
      console.error('driver:location-update error:', err.message);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  socket.on('rider:book-ride', async (data) => {
    try {
      const { pickup, destination, rideType, rideId } = data;
      const ioRef = io;
      const driverKeys = await redisClient.keys('driver:location:*');
      const driverIds = driverKeys.map((k) => k.replace('driver:location:', ''));
      for (const driverId of driverIds) {
        ioRef.to(`driver:${driverId}`).emit('ride:request', {
          rideId,
          pickup,
          destination,
          rideType,
          riderId: userId
        });
      }
    } catch (err) {
      console.error('rider:book-ride error:', err.message);
      socket.emit('error', { message: 'Failed to broadcast ride request' });
    }
  });

  socket.on('driver:accept-ride', async (data) => {
    try {
      const { rideId, riderId } = data;
      socket.join(`ride:${rideId}`);
      io.to(`user:${riderId}`).emit('ride:accepted', { rideId, driverId: userId });
    } catch (err) {
      console.error('driver:accept-ride error:', err.message);
      socket.emit('error', { message: 'Failed to accept ride' });
    }
  });

  socket.on('driver:arrived', async (data) => {
    try {
      const { rideId, riderId } = data;
      io.to(`user:${riderId}`).emit('ride:arrived', { rideId, driverId: userId });
    } catch (err) {
      console.error('driver:arrived error:', err.message);
      socket.emit('error', { message: 'Failed to notify arrival' });
    }
  });

  socket.on('rider:ride-start', async (data) => {
    try {
      const { rideId, driverId } = data;
      io.to(`driver:${driverId}`).emit('ride:started', { rideId, riderId: userId });
    } catch (err) {
      console.error('rider:ride-start error:', err.message);
      socket.emit('error', { message: 'Failed to start ride' });
    }
  });

  socket.on('driver:ride-complete', async (data) => {
    try {
      const { rideId, riderId } = data;
      io.to(`user:${riderId}`).emit('ride:completed', { rideId, driverId: userId });
    } catch (err) {
      console.error('driver:ride-complete error:', err.message);
      socket.emit('error', { message: 'Failed to complete ride' });
    }
  });

  socket.on('rider:cancel-ride', async (data) => {
    try {
      const { rideId, driverId } = data;
      io.to(`driver:${driverId}`).emit('ride:cancelled', { rideId, riderId: userId, reason: data.reason || '' });
    } catch (err) {
      console.error('rider:cancel-ride error:', err.message);
      socket.emit('error', { message: 'Failed to cancel ride' });
    }
  });

  socket.on('chat:send', async (data) => {
    try {
      const { rideId, message, receiverId } = data;
      const msg = { rideId, senderId: userId, receiverId, message, timestamp: new Date().toISOString() };
      await redisClient.lpush(`chat:${rideId}`, JSON.stringify(msg));
      await redisClient.ltrim(`chat:${rideId}`, 0, 49);
      io.to(`ride:${rideId}`).emit('chat:message', msg);
    } catch (err) {
      console.error('chat:send error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('rider:request-delivery', async (data) => {
    try {
      const { deliveryId, pickup, destination, description } = data;
      const driverKeys = await redisClient.keys('driver:location:*');
      const driverIds = driverKeys.map((k) => k.replace('driver:location:', ''));
      for (const driverId of driverIds) {
        io.to(`driver:${driverId}`).emit('delivery:request', {
          deliveryId,
          pickup,
          destination,
          description,
          riderId: userId
        });
      }
    } catch (err) {
      console.error('rider:request-delivery error:', err.message);
      socket.emit('error', { message: 'Failed to request delivery' });
    }
  });

  socket.on('driver:delivery-status', async (data) => {
    try {
      const { deliveryId, riderId, status } = data;
      io.to(`user:${riderId}`).emit('delivery:status', { deliveryId, status, driverId: userId });
    } catch (err) {
      console.error('driver:delivery-status error:', err.message);
      socket.emit('error', { message: 'Failed to update delivery status' });
    }
  });

  socket.on('join:ride', async (rideId) => {
    try {
      socket.join(`ride:${rideId}`);
      const messages = await redisClient.lrange(`chat:${rideId}`, 0, 49);
      const parsed = messages.map((m) => JSON.parse(m)).reverse();
      socket.emit('chat:history', { rideId, messages: parsed });
    } catch (err) {
      console.error('join:ride error:', err.message);
    }
  });

  socket.on('leave:ride', (rideId) => {
    socket.leave(`ride:${rideId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

setInterval(async () => {
  try {
    const keys = await redisClient.keys('driver:location:*');
    const now = Date.now();
    for (const key of keys) {
      try {
        const data = await redisClient.hgetall(key);
        if (data.updatedAt && (now - parseInt(data.updatedAt)) / 1000 > STALE_LOCATION_TTL) {
          await redisClient.del(key);
        }
      } catch (err) {
        console.error('Cleanup error for key', key, err.message);
      }
    }
  } catch (err) {
    console.error('Periodic location cleanup error:', err.message);
  }
}, 300000);

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});

module.exports = { server, io };
