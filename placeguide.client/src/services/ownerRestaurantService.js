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

export async function getOwnerRestaurant() {
  const response = await fetch(`${API_URL}/owner/restaurant`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể tải thông tin quán.');
}

export async function updateOwnerRestaurantProfile(payload) {
  const response = await fetch(`${API_URL}/owner/restaurant/profile`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response, 'Không thể lưu thông tin quán.');
}

export async function updateOwnerRestaurantOpenStatus(isOpen) {
  const response = await fetch(`${API_URL}/owner/restaurant/open-status`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ isOpen })
  });

  return parseResponse(response, 'Không thể cập nhật trạng thái mở cửa.');
}

export async function uploadOwnerRestaurantImage(file, type) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  const response = await fetch(`${API_URL}/owner/restaurant/images`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });

  return parseResponse(response, 'Không thể tải ảnh lên.');
}
