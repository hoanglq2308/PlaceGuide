import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEVICE_STORAGE_KEY = 'placeGuideVisitorDeviceId';
const TAB_STORAGE_KEY = 'placeGuideVisitorTabId';
const HEARTBEAT_INTERVAL_MS = 15_000;
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function createVisitorId() {
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

function getOrCreateId(storage, storageKey) {
  const existingId = storage.getItem(storageKey);

  if (existingId) {
    return existingId;
  }

  const id = createVisitorId();
  storage.setItem(storageKey, id);

  return id;
}

function isVisitorPage(pathname) {
  return !['/admin', '/merchant', '/login', '/register'].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function VisitorPresenceTracker() {
  const { pathname } = useLocation();
  const shouldTrackVisitor = isVisitorPage(pathname);

  useEffect(() => {
    if (!shouldTrackVisitor) {
      return undefined;
    }

    const deviceId = getOrCreateId(window.localStorage, DEVICE_STORAGE_KEY);
    const tabId = getOrCreateId(window.sessionStorage, TAB_STORAGE_KEY);
    let sessionId = createVisitorId();

    const createPresencePayload = () => ({ deviceId, tabId, sessionId });

    const sendPresence = (action, keepalive = false) => {
      return fetch(`${API_URL}/visitor-presence/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPresencePayload()),
        keepalive
      });
    };

    const connect = () => {
      void sendPresence('connect').catch(() => {
        // Presence is non-critical and must not interrupt the visitor experience.
      });
    };

    const disconnect = () => {
      const presencePayload = createPresencePayload();
      const payload = new Blob([JSON.stringify(presencePayload)], {
        type: 'application/json'
      });

      if (!navigator.sendBeacon(`${API_URL}/visitor-presence/disconnect`, payload)) {
        void sendPresence('disconnect', true).catch(() => {
          // Presence is non-critical and must not interrupt the visitor experience.
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sessionId = createVisitorId();
        connect();
      } else {
        disconnect();
      }
    };

    const sendHeartbeat = () => {
      if (document.visibilityState === 'visible') {
        void sendPresence('heartbeat').catch(() => {
          // Presence is non-critical and must not interrupt the visitor experience.
        });
      }
    };

    connect();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', disconnect);
    const intervalId = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', disconnect);
      disconnect();
    };
  }, [shouldTrackVisitor]);

  return null;
}

export default VisitorPresenceTracker;
