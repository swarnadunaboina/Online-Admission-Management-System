const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
const AUTH_STORE_STORAGE_KEY = 'auth-storage';

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function persistAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearClientAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem('auth_user');
  localStorage.removeItem(AUTH_STORE_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
