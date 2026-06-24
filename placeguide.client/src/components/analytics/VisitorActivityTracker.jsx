import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendActiveVisitorPing } from '../../services/publicAnalyticsService';

const PING_INTERVAL_MS = 5 * 60 * 1000;

function isPublicVisitorPage(pathname) {
  return !['/admin', '/merchant', '/login', '/register'].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function VisitorActivityTracker() {
  const { pathname } = useLocation();
  const shouldTrackVisitor = isPublicVisitorPage(pathname);

  useEffect(() => {
    if (!shouldTrackVisitor) {
      return undefined;
    }

    const sendPing = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      void sendActiveVisitorPing(pathname).catch(() => {
        // Analytics must not interrupt the visitor experience.
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendPing();
      }
    };

    sendPing();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = window.setInterval(sendPing, PING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, shouldTrackVisitor]);

  return null;
}

export default VisitorActivityTracker;
