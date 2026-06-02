const { subClient } = require('./redis');

let ioRef = null;

function parseChannelName(channel) {
  const stripped = channel.replace(/^laravel_database_/, '');

  if (stripped.includes('user:')) {
    const match = stripped.match(/user:(.+)/);
    return match ? { type: 'user', id: match[1] } : null;
  }
  if (stripped.includes('driver:')) {
    const match = stripped.match(/driver:(.+)/);
    return match ? { type: 'driver', id: match[1] } : null;
  }
  if (stripped.includes('ride:')) {
    const match = stripped.match(/ride:(.+)/);
    return match ? { type: 'ride', id: match[1] } : null;
  }
  if (stripped.includes('delivery:')) {
    const match = stripped.match(/delivery:(.+)/);
    return match ? { type: 'delivery', id: match[1] } : null;
  }
  if (stripped.includes('admin')) {
    return { type: 'admin', id: null };
  }

  return null;
}

function resolveRoom(parsed) {
  if (!parsed) return null;
  switch (parsed.type) {
    case 'user':
    case 'driver':
    case 'ride':
    case 'delivery':
      return `${parsed.type}:${parsed.id}`;
    case 'admin':
      return 'admin';
    default:
      return null;
  }
}

module.exports = {
  init(io) {
    ioRef = io;

    subClient.psubscribe('laravel_database_*', (err) => {
      if (err) {
        console.error('[LaravelRelay] psubscribe error:', err.message);
      } else {
        console.log('[LaravelRelay] Subscribed to Laravel broadcasts');
      }
    });

    subClient.on('pmessage', (_pattern, channel, message) => {
      try {
        const parsed = JSON.parse(message);
        const eventName = parsed.event;
        const eventData = parsed.data;

        if (!eventName || !ioRef) return;

        const channelInfo = parseChannelName(channel);
        const room = resolveRoom(channelInfo);

        if (room) {
          ioRef.to(room).emit(eventName, eventData);
        }
      } catch (err) {
        console.error('[LaravelRelay] Parse error:', err.message);
      }
    });
  },
};
