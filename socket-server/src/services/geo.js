const { dataClient } = require('./redis');
const config = require('../config');

const DRIVER_GEO_KEY = 'drivers:geo';
const DRIVER_LOC_PREFIX = 'driver:location:';

module.exports = {
  async updateDriverLocation(driverId, lat, lng) {
    await dataClient.geoadd(DRIVER_GEO_KEY, lng, lat, String(driverId));

    await dataClient.hset(`${DRIVER_LOC_PREFIX}${driverId}`, {
      latitude: lat,
      longitude: lng,
      updatedAt: Date.now().toString(),
    });

    await dataClient.expire(`${DRIVER_LOC_PREFIX}${driverId}`, config.location.staleTtlSeconds);
  },

  async removeDriverLocation(driverId) {
    await dataClient.zrem(DRIVER_GEO_KEY, String(driverId));
    await dataClient.del(`${DRIVER_LOC_PREFIX}${driverId}`);
  },

  async findNearbyDrivers(lat, lng, radiusKm = null) {
    const radius = radiusKm || config.location.driverRadiusKm;

    const results = await dataClient.geosearch(
      DRIVER_GEO_KEY,
      'FROMLONLAT',
      lng,
      lat,
      'BYRADIUS',
      radius,
      'km',
      'ASC',
      'COUNT',
      50,
      'WITHCOORD',
      'WITHDIST',
    );

    return results.map((r) => ({
      driverId: r.value,
      distance: parseFloat(r.distance),
      longitude: parseFloat(r.coordinates[0]),
      latitude: parseFloat(r.coordinates[1]),
    }));
  },

  async getDriverLocation(driverId) {
    const data = await dataClient.hgetall(`${DRIVER_LOC_PREFIX}${driverId}`);
    if (!data || !data.latitude) return null;

    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      updatedAt: parseInt(data.updatedAt),
    };
  },

  async getOnlineDriverCount() {
    return dataClient.zcard(DRIVER_GEO_KEY);
  },

  async cleanupStaleLocations() {
    const { scanKeys } = require('../utils/scanKeys');
    const keys = await scanKeys(dataClient, `${DRIVER_LOC_PREFIX}*`);
    const now = Date.now();
    let cleaned = 0;

    for (const key of keys) {
      try {
        const data = await dataClient.hgetall(key);
        if (data.updatedAt && (now - parseInt(data.updatedAt)) / 1000 > config.location.staleTtlSeconds) {
          const driverId = key.replace(DRIVER_LOC_PREFIX, '');
          await dataClient.zrem(DRIVER_GEO_KEY, driverId);
          await dataClient.del(key);
          cleaned++;
        }
      } catch (err) {
        console.error(`[Geo] Cleanup error for ${key}:`, err.message);
      }
    }

    return cleaned;
  },
};
