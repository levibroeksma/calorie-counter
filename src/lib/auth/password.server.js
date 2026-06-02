/**
 * Server-only auth secrets. Import only from other `*.server.js` modules (e.g. actions).
 * Never import from client code, Alpine, `.astro` client scripts, or `public/`.
 */
import { APP_PASSWORD, WRITE_TOKEN } from 'astro:env/server';

export { APP_PASSWORD, WRITE_TOKEN };

export function isAppPasswordValid(password) {
  return password === APP_PASSWORD;
}

export function isWriteTokenValid(token) {
  return token === WRITE_TOKEN;
}
