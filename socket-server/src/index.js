const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const config = require('./config');
const { pubClient, subClient } = require('./services/redis');
const geoService = require('./services/geo');
const laravelRelay = require('./services/laravel');
const authService = require('./services/auth');
const rateLimit = require('./middleware/rateLimit');

const registerDriverHandlers = require('./handlers/driver');
const registerRideHandlers = require('./handlers/ride');
const registerChatHandlers = require('./handlers/chat');
const registerDeliveryHandlers = require('./handlers/delivery');
const registerAdminHandlers = require('./handlers/admin');
const registerFoodOrderHandlers = require('./handlers/foodOrder');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6,
  connectTimeout: 10000,
});

let connectionCount = 0;

io.adapter(createAdapter(pubClient, subClient));

laravelRelay.init(io);

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const result = await authService.validateToken(token);
    if (!result.valid) {
      const msg = {
        malformed: 'Invalid token format',
        not_sanctum: 'Token is not a Sanctum token',
        cached_invalid: 'Token previously rejected',
        unauthorized: 'Token unauthorized',
        expired: 'Token expired',
        timeout: 'Auth backend timeout',
        network_error: 'Auth backend unreachable',
        no_user: 'Token has no associated user',
      }[result.reason] || 'Invalid token';
      return next(new Error(msg));
    }

    const u = result.user;
    socket.data.userId = u.userId;
    socket.data.role = u.role;
    socket.data.tenantId = u.tenantId;
    socket.data.userName = u.name;
    socket.data.userEmail = u.email;
    socket.data.token = token;
    socket.data.authFromCache = !!result.fromCache;

    next();
  } catch (err) {
    console.error('[Auth] unexpected error:', err);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  connectionCount++;
  const { userId, role, tenantId } = socket.data;

  socket.use((packet, next) => rateLimit(socket, packet[0], next));


  console.log(`[Connect] User ${userId} (${role}) connected. Total: ${connectionCount}`);

  socket.join(`user:${userId}`);

  if (role === 'driver') {
    socket.join(`driver:${userId}`);
    socket.data.isOnline = false;
  }

  if (role === 'admin' || role === 'super-admin') {
    socket.join('admin');
  }

  registerDriverHandlers(socket, io);
  registerRideHandlers(socket, io);
  registerChatHandlers(socket, io);
  registerDeliveryHandlers(socket, io);
  registerAdminHandlers(socket, io);
  registerFoodOrderHandlers(socket, io);

  socket.on('error', (err) => {
    console.error(`[Error] User ${userId}:`, err.message);
  });

  socket.on('disconnect', (reason) => {
    connectionCount--;
    console.log(`[Disconnect] User ${userId} (${role}). Reason: ${reason}. Total: ${connectionCount}`);
  });
});

if (config.health.enabled) {
  app.get(config.health.path, async (_req, res) => {
    try {
      const onlineDrivers = await geoService.getOnlineDriverCount();
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        connections: connectionCount,
        onlineDrivers,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        message: err.message,
      });
    }
  });

  app.get('/metrics', async (_req, res) => {
    try {
      const onlineDrivers = await geoService.getOnlineDriverCount();
      res.json({
        connections: connectionCount,
        onlineDrivers,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
      });
    } catch (err) {
      res.status(503).json({ error: err.message });
    }
  });
}

const cleanupInterval = setInterval(async () => {
  try {
    const cleaned = await geoService.cleanupStaleLocations();
    if (cleaned > 0) {
      console.log(`[Cleanup] Removed ${cleaned} stale driver locations`);
    }
  } catch (err) {
    console.error('[Cleanup] Error:', err.message);
  }
}, config.location.cleanupIntervalMs);

function gracefulShutdown(signal) {
  console.log(`[Shutdown] Received ${signal}. Shutting down gracefully...`);

  clearInterval(cleanupInterval);

  io.emit('server:shutdown', { message: 'Server is restarting. Please reconnect.' });

  io.close(() => {
    console.log('[Shutdown] Socket.io closed');
    pubClient.quit().catch(() => {});
    subClient.quit().catch(() => {});
    server.close(() => {
      console.log('[Shutdown] HTTP server closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('[Shutdown] Forced exit after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

server.listen(config.port, () => {
  console.log(`[Server] EasyRyde Socket server running on port ${config.port}`);
  console.log(`[Server] Health check: ${config.health.path}`);
  console.log(`[Server] Metrics: /metrics`);
});

module.exports = { server, io };
