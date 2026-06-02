const { dataClient } = require('../services/redis');

module.exports = function registerFoodOrderHandlers(socket, io) {
  const { userId, role } = socket.data;

  socket.on('food-order:join', async (orderId) => {
    try {
      socket.join(`food-order:${orderId}`);
    } catch (err) {
      console.error(`[FoodOrder:${userId}] join error:`, err.message);
    }
  });

  socket.on('food-order:leave', (orderId) => {
    socket.leave(`food-order:${orderId}`);
  });

  socket.on('restaurant:new-order', async (data) => {
    try {
      const { orderId, restaurantId } = data;

      io.to(`restaurant:${restaurantId}`).emit('food-order:new', {
        orderId,
        restaurantId,
        timestamp: Date.now(),
      });

      io.to('admin').emit('food-order:new', {
        orderId,
        restaurantId,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[FoodOrder:${userId}] restaurant:new-order error:`, err.message);
    }
  });

  socket.on('food-order:status-update', async (data) => {
    try {
      const { orderId, status, customerId, driverId } = data;

      io.to(`food-order:${orderId}`).emit('food-order:status', {
        orderId,
        status,
        timestamp: Date.now(),
      });

      if (customerId) {
        io.to(`user:${customerId}`).emit('food-order:status', {
          orderId,
          status,
          timestamp: Date.now(),
        });
      }

      if (driverId) {
        io.to(`user:${driverId}`).emit('food-order:status', {
          orderId,
          status,
          timestamp: Date.now(),
        });
      }

      io.to('admin').emit('food-order:status', {
        orderId,
        status,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[FoodOrder:${userId}] status-update error:`, err.message);
    }
  });

  socket.on('food-order:driver-location', async (data) => {
    try {
      const { orderId, latitude, longitude } = data;

      io.to(`food-order:${orderId}`).emit('food-order:location', {
        driverId: userId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[FoodOrder:${userId}] driver-location error:`, err.message);
    }
  });

  socket.on('food-order:driver-assigned', async (data) => {
    try {
      const { orderId, customerId, driverId } = data;

      io.to(`user:${customerId}`).emit('food-order:driver-coming', {
        orderId,
        driverId,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[FoodOrder:${userId}] driver-assigned error:`, err.message);
    }
  });
};
