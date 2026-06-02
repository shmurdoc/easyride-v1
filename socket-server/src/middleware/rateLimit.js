const config = require('../config');

const windows = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of windows) {
    if (now - data.start > config.rateLimit.windowMs * 2) {
      windows.delete(key);
    }
  }
}, config.rateLimit.windowMs * 2);

module.exports = function rateLimit(socket, event, next) {
  const key = socket.data.userId || socket.id;
  const now = Date.now();

  let entry = windows.get(key);
  if (!entry || now - entry.start > config.rateLimit.windowMs) {
    entry = { start: now, count: 0 };
    windows.set(key, entry);
  }

  entry.count++;

  if (entry.count > config.rateLimit.maxEvents) {
    console.warn(`[RateLimit] User ${key} exceeded limit (${entry.count} events)`);
    socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
    return;
  }

  next();
};
