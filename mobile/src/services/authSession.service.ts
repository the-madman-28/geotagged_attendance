// mobile/src/services/authSession.service.ts

type SessionExpiredHandler = () => void;

let handler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(
  callback: SessionExpiredHandler
) {
  handler = callback;
}

export function clearSessionExpiredHandler() {
  handler = null;
}

export function notifySessionExpired() {
  handler?.();
}