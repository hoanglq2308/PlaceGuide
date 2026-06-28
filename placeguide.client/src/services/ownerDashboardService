const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthHeaders(extraHeaders = {}) {
  const token = window.localStorage.getItem('token');

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

async function parseResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.Message || data?.title || fallbackMessage);
  }

  return data;
}

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/owner/dashboard-stats`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể tải dữ liệu tổng quan.');
}