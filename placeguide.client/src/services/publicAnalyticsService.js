import { getOrCreateVisitorSessionId } from '../utils/visitorSession';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function sendActiveVisitorPing(page) {
  const response = await fetch(`${API_URL}/public/analytics/active`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: getOrCreateVisitorSessionId(),
      page
    })
  });

  if (!response.ok) {
    throw new Error('Không thể ghi nhận hoạt động du khách.');
  }
}
