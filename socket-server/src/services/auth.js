const { dataClient } = require('./redis');

const CACHE_TTL_SECONDS = 60;
const CACHE_PREFIX = 'auth:token:';

async function validateToken(token) {
  if (!token || typeof token !== 'string' || token.length < 10) {
    return { valid: false, reason: 'malformed' };
  }

  if (token.split('|').length !== 2) {
    return { valid: false, reason: 'not_sanctum' };
  }

  const cacheKey = CACHE_PREFIX + token;
  try {
    const cached = await dataClient.get(cacheKey);
    if (cached) {
      if (cached === 'INVALID') {
        return { valid: false, reason: 'cached_invalid' };
      }
      const parsed = JSON.parse(cached);
      if (parsed.expires_at && parsed.expires_at < Date.now()) {
        return { valid: false, reason: 'expired' };
      }
      return { valid: true, user: parsed, fromCache: true };
    }
  } catch (err) {
    console.warn('[Auth] cache read failed:', err.message);
  }

  const apiBaseUrl = (process.env.APP_API_BASE_URL || 'http://nginx:8080').replace(/\/$/, '');
  const url = `${apiBaseUrl}/api/v1/auth/me`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 401) {
      await cacheInvalid(token);
      return { valid: false, reason: 'unauthorized' };
    }

    if (!response.ok) {
      return { valid: false, reason: `http_${response.status}` };
    }

    const body = await response.json();
    const user = body.user || body.data?.user || body;
    if (!user || !user.id) {
      return { valid: false, reason: 'no_user' };
    }

    const result = {
      userId: user.id,
      role: user.role || 'rider',
      tenantId: user.tenant_id || null,
      name: user.name,
      email: user.email,
      expires_at: Date.now() + (CACHE_TTL_SECONDS * 1000),
    };

    await cacheValid(token, result);
    return { valid: true, user: result, fromCache: false };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { valid: false, reason: 'timeout' };
    }
    console.error('[Auth] token validation failed:', err.message);
    return { valid: false, reason: 'network_error' };
  }
}

async function cacheValid(token, payload) {
  try {
    await dataClient.set(
      CACHE_PREFIX + token,
      JSON.stringify(payload),
      'EX',
      CACHE_TTL_SECONDS
    );
  } catch (err) {
    console.warn('[Auth] cache write failed:', err.message);
  }
}

async function cacheInvalid(token) {
  try {
    await dataClient.set(CACHE_PREFIX + token, 'INVALID', 'EX', 30);
  } catch (err) {
    console.warn('[Auth] invalid cache write failed:', err.message);
  }
}

async function invalidateToken(token) {
  try {
    await dataClient.del(CACHE_PREFIX + token);
  } catch (err) {
    console.warn('[Auth] cache invalidate failed:', err.message);
  }
}

module.exports = {
  validateToken,
  invalidateToken,
};
