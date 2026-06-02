require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(
      `[config] ${name} is required and must be at least 32 characters. ` +
      `Refusing to boot with a weak or missing ${name}.`
    );
  }
  return value;
}

module.exports = {
  port: parseInt(process.env.PORT || '3001'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:8000',
  jwtSecret: requireEnv('JWT_SECRET'),
  appApiBaseUrl: process.env.APP_API_BASE_URL || 'http://nginx:8080',
  appApiToken: process.env.APP_API_TOKEN || null,

  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  location: {
    staleTtlSeconds: parseInt(process.env.STALE_LOCATION_TTL || '300'),
    cleanupIntervalMs: parseInt(process.env.CLEANUP_INTERVAL_MS || '60000'),
    driverRadiusKm: parseFloat(process.env.DRIVER_RADIUS_KM || '10'),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxEvents: parseInt(process.env.RATE_LIMIT_MAX || '60'),
  },

  health: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    path: process.env.HEALTH_CHECK_PATH || '/health',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
