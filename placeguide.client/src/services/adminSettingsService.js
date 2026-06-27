const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthHeaders(extraHeaders = {}) {
  const token = window.localStorage.getItem('token');

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

function flattenErrors(errors) {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    return errors;
  }

  if (typeof errors === 'object') {
    return Object.values(errors).flatMap((value) =>
      Array.isArray(value) ? value : [String(value)]
    );
  }

  return [String(errors)];
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errors = flattenErrors(data?.errors || data?.Errors);
    throw new Error(data?.message || data?.Message || data?.title || errors.join(', ') || fallbackMessage);
  }

  return data;
}

export async function createAdminAccount(payload) {
  const response = await fetch(`${API_URL}/admin/settings/admin-accounts`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response, 'Không thể tạo tài khoản admin.');
}
