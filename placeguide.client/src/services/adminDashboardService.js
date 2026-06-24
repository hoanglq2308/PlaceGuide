const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function getAdminDashboardSummary() {
  const token = window.localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/dashboard/summary`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || 'Không thể tải dữ liệu dashboard.'
    );
  }

  return data;
}

export async function getActiveVisitorsByHour(date) {
  const token = window.localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/admin/statistics/active-visitors-by-hour?date=${encodeURIComponent(date)}`,
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
      data?.message || data?.title || 'Không thể tải thống kê du khách theo giờ.'
    );
  }

  return Array.isArray(data) ? data : [];
}

export async function getVisitorsByDistrict(
  date,
  sourceType = 'RestaurantView'
) {
  const token = window.localStorage.getItem('token');
  const query = new URLSearchParams({ date, sourceType });
  const response = await fetch(
    `${API_URL}/admin/statistics/visitors-by-district?${query.toString()}`,
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
      data?.message || data?.title || 'Không thể tải phân bổ du khách theo quận/huyện.'
    );
  }

  return Array.isArray(data) ? data : [];
}
