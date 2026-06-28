import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function authHeader() {
  const token = window.localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapError(error, fallback) {
  const message =
    error.response?.data?.message ||
    error.response?.data?.Message ||
    fallback;
  return new Error(message);
}

export async function uploadNarrationAudio(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('audio', file);

  try {
    const response = await axios.post(`${API_URL}/owner/narration`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  } catch (error) {
    throw unwrapError(error, 'Không thể tải file thuyết minh.');
  }
}

export async function getOwnerReviews(pageIndex = 0, pageSize = 10) {
  try {
    const response = await axios.get(`${API_URL}/owner/reviews`, {
      headers: authHeader(),
      params: { pageIndex, pageSize }
    });
    return response.data;
  } catch (error) {
    throw unwrapError(error, 'Không thể tải danh sách đánh giá.');
  }
}

export async function updateOwnerSettings(payload) {
  try {
    const response = await axios.put(`${API_URL}/owner/settings`, payload, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw unwrapError(error, 'Không thể cập nhật cài đặt.');
  }
}