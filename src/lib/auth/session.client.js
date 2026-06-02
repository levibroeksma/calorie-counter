const SESSION_LOGGED_IN_KEY = 'isLoggedIn';
const SESSION_WRITE_TOKEN_KEY = 'writeToken';

export function isLoggedIn() {
  return sessionStorage.getItem(SESSION_LOGGED_IN_KEY) === 'true';
}

export function getWriteToken() {
  return sessionStorage.getItem(SESSION_WRITE_TOKEN_KEY);
}

export function setSession({ writeToken }) {
  sessionStorage.setItem(SESSION_LOGGED_IN_KEY, 'true');
  sessionStorage.setItem(SESSION_WRITE_TOKEN_KEY, writeToken);
}
