import { STORAGE_KEYS } from '../constants';

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const isProductionMockAuthDisabled =
  import.meta.env.PROD && import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true';

const isUsableAccessToken = (token) => {
  if (!token) return false;
  if (!isProductionMockAuthDisabled) return true;
  return !String(token).startsWith('mock-jwt-token') && String(token).split('.').length === 3;
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
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || getPersistedAuthState()?.state?.user?.refreshToken || null;
};

export const hasAuthTokens = () => Boolean(getAccessToken());

export const persistAuthTokens = ({ accessToken, refreshToken } = {}) => {
  if (typeof localStorage === 'undefined') return;
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const clearAuthTokens = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(parsed));
};
