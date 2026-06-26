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

export async function getAdminRestaurants({
  search,
  status,
  district,
  page = 1,
  pageSize = 10
} = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });

  if (search?.trim()) {
    query.set('search', search.trim());
  }

  if (status && status !== 'all') {
    query.set('status', status);
  }

  if (district && district !== 'all') {
    query.set('district', district);
  }

  const response = await fetch(
    `${API_URL}/admin/restaurants?${query.toString()}`,
    { headers: getAuthHeaders() }
  );

  return parseResponse(response, 'Không thể tải danh sách nhà hàng.');
}

export async function getAdminRestaurantById(id) {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể tải chi tiết nhà hàng.');
}

export async function updateRestaurantPublishStatus(id, isPublished) {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ isPublished })
  });

  return parseResponse(response, 'Không thể cập nhật trạng thái công khai.');
}

export async function updateRestaurantOpenStatus(id, isOpen) {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}/open-status`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ isOpen })
  });

  return parseResponse(response, 'Không thể cập nhật trạng thái mở cửa.');
}

export async function disableRestaurant(id) {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}/disable`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể ẩn nhà hàng.');
}

export async function banRestaurant(id, reason) {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}/ban`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ reason })
  });

  return parseResponse(response, 'Không thể khóa nhà hàng.');
}

export async function unbanRestaurant(id, note = '') {
  const response = await fetch(`${API_URL}/admin/restaurants/${id}/unban`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ note })
  });

  return parseResponse(response, 'Không thể mở khóa nhà hàng.');
}
