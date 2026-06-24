const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthHeaders() {
  const token = window.localStorage.getItem('token');

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.title || fallbackMessage);
  }

  return data;
}

export async function getRestaurantRegistrations({
  status,
  search,
  page = 1,
  pageSize = 10
} = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });

  if (status) {
    query.set('status', status);
  }

  if (search?.trim()) {
    query.set('search', search.trim());
  }

  const response = await fetch(
    `${API_URL}/admin/restaurant-registrations?${query.toString()}`,
    { headers: getAuthHeaders() }
  );

  return parseResponse(response, 'Không thể tải danh sách đăng ký đối tác.');
}

export async function getRestaurantRegistrationById(id) {
  const response = await fetch(`${API_URL}/admin/restaurant-registrations/${id}`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response, 'Không thể tải chi tiết đơn đăng ký.');
}

export async function approveRestaurantRegistration(id) {
  const response = await fetch(
    `${API_URL}/admin/restaurant-registrations/${id}/approve`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  );

  return parseResponse(response, 'Không thể duyệt đơn đăng ký.');
}

export async function rejectRestaurantRegistration(id, reason) {
  const response = await fetch(
    `${API_URL}/admin/restaurant-registrations/${id}/reject`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    }
  );

  return parseResponse(response, 'Không thể từ chối đơn đăng ký.');
}
