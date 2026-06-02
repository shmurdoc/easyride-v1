const Redis = require('ioredis');
const config = require('../config');

function createRedisClient(label) {
  const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  client.on('error', (err) => {
    console.error(`[Redis:${label}] Error:`, err.message);
  });

  client.on('connect', () => {
    console.log(`[Redis:${label}] Connected`);
  });

  return client;
}

const pubClient = createRedisClient('pub');
const subClient = createRedisClient('sub');
const dataClient = createRedisClient('data');

module.exports = { pubClient, subClient, dataClient };
