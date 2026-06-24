import { getOrCreateVisitorSessionId } from '../utils/visitorSession';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function sendDistrictActivity({ districtName, sourceType }) {
  const normalizedDistrictName = districtName?.trim();

  if (!normalizedDistrictName) {
    return;
  }

  const response = await fetch(`${API_URL}/public/analytics/district-activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: getOrCreateVisitorSessionId(),
      districtName: normalizedDistrictName,
      sourceType
    })
  });

  if (!response.ok) {
    throw new Error('Không thể ghi nhận lượt quan tâm theo quận/huyện.');
  }
}
