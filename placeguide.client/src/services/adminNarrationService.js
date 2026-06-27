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
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.title || fallbackMessage);
  }

  return data;
}

export async function getAdminNarrations({
  contentType = 'restaurant',
  languageCode = 'vi',
  status = 'all',
  search,
  page = 1,
  pageSize = 10
} = {}) {
  const query = new URLSearchParams({
    contentType,
    languageCode,
    status,
    page: String(page),
    pageSize: String(pageSize)
  });

  if (search?.trim()) {
    query.set('search', search.trim());
  }

  const response = await fetch(
    `${API_URL}/admin/narrations?${query.toString()}`,
    { headers: getAuthHeaders() }
  );

  return parseResponse(response, 'Không thể tải danh sách thuyết minh.');
}

export async function getAdminNarrationDetail(
  contentType,
  id,
  languageCode = 'vi'
) {
  const query = new URLSearchParams({ languageCode });
  const response = await fetch(
    `${API_URL}/admin/narrations/${contentType}/${id}?${query.toString()}`,
    { headers: getAuthHeaders() }
  );

  return parseResponse(response, 'Không thể tải chi tiết thuyết minh.');
}

export async function updateAdminNarration(
  contentType,
  id,
  languageCode,
  payload
) {
  const response = await fetch(
    `${API_URL}/admin/narrations/${contentType}/${id}/${languageCode}`,
    {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    }
  );

  return parseResponse(response, 'Không thể cập nhật nội dung thuyết minh.');
}

export async function autoTranslateNarration(contentType, id, payload) {
  const response = await fetch(
    `${API_URL}/admin/narrations/${contentType}/${id}/auto-translate`,
    {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    }
  );

  return parseResponse(response, 'Không thể tự động dịch nội dung thuyết minh.');
}

export async function markNarrationNeedsUpdate(contentType, id, languageCode) {
  const response = await fetch(
    `${API_URL}/admin/narrations/${contentType}/${id}/${languageCode}/mark-needs-update`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  );

  return parseResponse(response, 'Không thể đánh dấu bản dịch cần cập nhật.');
}
