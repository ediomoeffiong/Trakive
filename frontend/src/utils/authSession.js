import { STORAGE_KEYS } from '../constants';

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isRealBackendToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  if (token.startsWith('mock-')) return false;
  return token.split('.').length === 3;
};

export const isTokenExpired = (token, bufferSeconds = 10) => {
  if (!isRealBackendToken(token)) return false;
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
};

const isProductionMockAuthDisabled =
  import.meta.env.PROD && import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true';

export const isUsableAccessToken = (token) => {
  if (!token) return false;
  if (isProductionMockAuthDisabled) {
    return isRealBackendToken(token);
  }
  if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
    return true;
  }
  return isRealBackendToken(token);
};

export const getPersistedAuthState = () => {
  if (typeof localStorage === 'undefined') return null;
  return safeParse(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN), null);
};

export const getAccessToken = () => {
  if (typeof localStorage === 'undefined') return null;
  const direct = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (isUsableAccessToken(direct)) return direct;

  const persisted = getPersistedAuthState();
  const token = persisted?.state?.user?.accessToken || persisted?.state?.user?.token || null;
  return isUsableAccessToken(token) ? token : null;
};

export const getRefreshToken = () => {
  if (typeof localStorage === 'undefined') return null;
  const direct = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (direct) return direct;
  return getPersistedAuthState()?.state?.user?.refreshToken || null;
};

export const hasAuthTokens = () => {
  const access = getAccessToken();
  if (!access) return false;

  // In production or when communicating with real backend, check if access or refresh token is still viable
  if (isRealBackendToken(access)) {
    if (!isTokenExpired(access)) {
      return true;
    }
    // Access token is expired; check if refresh token exists and is not expired
    const refresh = getRefreshToken();
    if (isRealBackendToken(refresh) && !isTokenExpired(refresh, 0)) {
      return true;
    }
    // Both expired
    return false;
  }

  return isUsableAccessToken(access);
};

export const persistAuthTokens = ({ accessToken, refreshToken } = {}) => {
  if (typeof localStorage === 'undefined') return;
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const clearAuthTokens = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        parsed.state.user = null;
        parsed.state.isAuthenticated = false;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(parsed));
      }
    }
  } catch {}
};

export const persistTokenPairInStore = ({ accessToken, refreshToken } = {}) => {
  persistAuthTokens({ accessToken, refreshToken });

  const parsed = getPersistedAuthState();
  const user = parsed?.state?.user;
  if (!parsed?.state || !user || !accessToken) return;

  parsed.state.user = {
    ...user,
    token: accessToken,
    accessToken,
    refreshToken: refreshToken || user.refreshToken,
  };
  parsed.state.isAuthenticated = true;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(parsed));
};
