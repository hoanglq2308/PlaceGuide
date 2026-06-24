const VISITOR_SESSION_STORAGE_KEY = 'placeGuideVisitorSessionId';

function createUuid() {
  if (typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  const values = new Uint8Array(16);

  if (typeof window.crypto?.getRandomValues === 'function') {
    window.crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < values.length; index += 1) {
      values[index] = Math.floor(Math.random() * 256);
    }
  }

  values[6] = (values[6] & 0x0f) | 0x40;
  values[8] = (values[8] & 0x3f) | 0x80;

  const hex = Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getVisitorSessionId() {
  return window.localStorage.getItem(VISITOR_SESSION_STORAGE_KEY);
}

export function getOrCreateVisitorSessionId() {
  const existingSessionId = getVisitorSessionId();

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createUuid();
  window.localStorage.setItem(VISITOR_SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}
