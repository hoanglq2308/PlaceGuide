// src/services/ownerDishService.js
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

export async function fetchOwnerDishes() {
  const response = await fetch(`${API_URL}/owner/dishes`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể tải danh sách món ăn.');
}

export async function createNewDish(payload) {
  const response = await fetch(`${API_URL}/owner/dishes`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response, 'Không thể tạo món ăn mới.');
}

export async function updateDishInfo(dishId, payload) {
  const response = await fetch(`${API_URL}/owner/dishes/${dishId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response, 'Không thể cập nhật món ăn.');
}

export async function removeDish(dishId) {
  const response = await fetch(`${API_URL}/owner/dishes/${dishId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || data?.Message || 'Không thể xóa món ăn.');
  }

  return dishId;
}

export async function uploadDishImage(dishId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_URL}/owner/dishes/${dishId}/image`, {
    method: 'POST',
    headers: getAuthHeaders(), // KHÔNG thêm Content-Type, để browser tự set multipart
    body: formData
  });

  return parseResponse(response, 'Không thể tải ảnh món ăn.');
}