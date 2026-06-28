const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function buildQuery(parameters) {
  const query = new URLSearchParams();

  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const value = query.toString();
  return value ? `?${value}` : '';
}

async function getAnalyticsResource(path, parameters = {}) {
  const token = window.localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/admin/analytics/${path}${buildQuery(parameters)}`,
    {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || 'Không thể tải dữ liệu phân tích.'
    );
  }

  return data;
}

export function getAnalyticsSummary({ fromDate, toDate }) {
  return getAnalyticsResource('summary', { fromDate, toDate });
}

export function getAudioPassAnalytics({ fromDate, toDate, groupBy = 'day' }) {
  return getAnalyticsResource('audiopass', { fromDate, toDate, groupBy });
}

export function getAudioListenAnalytics({
  fromDate,
  toDate,
  groupBy = 'day',
  languageCode,
  audioType
}) {
  return getAnalyticsResource('audio-listens', {
    fromDate,
    toDate,
    groupBy,
    languageCode,
    audioType
  });
}

export function getRestaurantAnalytics({ fromDate, toDate }) {
  return getAnalyticsResource('restaurants', { fromDate, toDate });
}

export function getReviewAnalytics({ fromDate, toDate }) {
  return getAnalyticsResource('reviews', { fromDate, toDate });
}

export function getVisitorAnalytics({ fromDate, toDate, date }) {
  return getAnalyticsResource('visitors', { fromDate, toDate, date });
}
