/**
 * Scan keys matching a pattern without blocking Redis.
 * @param {import('ioredis').Redis} client
 * @param {string} pattern
 * @param {number} [count=100] - Approximate count per scan iteration
 * @returns {Promise<string[]>}
 */
async function scanKeys(client, pattern, count = 100) {
  const keys = [];
  let cursor = '0';
  do {
    const [newCursor, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    cursor = newCursor;
    keys.push(...batch);
  } while (cursor !== '0');
  return keys;
}

module.exports = { scanKeys };
