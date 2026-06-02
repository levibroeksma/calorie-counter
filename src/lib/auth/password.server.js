/**
 * Server-only auth secrets. Import only from other `*.server.js` modules (e.g. actions).
 * Never import from client code, Alpine, `.astro` client scripts, or `public/`.
 */

export const APP_PASSWORD = 'Fl@pdr0l';

export const WRITE_TOKEN = 'ct-wt-8f4e2a1b9c7d6e5f3a0b8c7d6e5f4a3b';

export function isAppPasswordValid(password) {
  return password === APP_PASSWORD;
}

export function isWriteTokenValid(token) {
  return token === WRITE_TOKEN;
}
