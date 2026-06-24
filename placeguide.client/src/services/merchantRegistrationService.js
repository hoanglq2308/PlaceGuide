const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function submitMerchantRegistration(formData) {
  const token = window.localStorage.getItem('token');
  const response = await fetch(`${API_URL}/merchant/MerchantAuth/register`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Không thể nộp hồ sơ đối tác.');
  }

  return data;
}
