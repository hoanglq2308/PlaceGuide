const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const AUDIO_PASS_TOKEN_KEY = "placeGuideAudioPassToken";

function getApiUrl(path) {
  if (!API_URL) {
    throw new Error("Thiếu cấu hình VITE_API_URL!");
  }
  return `${API_URL}${path}`;
}

function getAudioPassToken() {
  return localStorage.getItem(AUDIO_PASS_TOKEN_KEY) || null;
}

function buildReviewFormData(reviewData) {
  const formData = new FormData();

  formData.append("rating", String(reviewData.rating));
  formData.append("comment", reviewData.comment || "");

  (reviewData.mediaFiles || []).forEach((file) => {
    formData.append("mediaFiles", file);
  });

  (reviewData.keepMediaIds || []).forEach((id) => {
    formData.append("keepMediaIds", id);
  });

  return formData;
}

async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      "Có lỗi xảy ra khi xử lý đánh giá.";

    const error = new Error(message);
    error.status = response.status;
    error.code = data?.code || data?.Code;
    throw error;
  }

  return data;
}

export async function getReviews(restaurantId) {
  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews`),
    { method: "GET" }
  );

  return handleResponse(response);
}

export async function createReview(restaurantId, reviewData) {
  const passToken = getAudioPassToken();

  const headers = {};
  if (passToken) {
    headers["X-Premium-Pass"] = passToken;
  }

  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews`),
    {
      method: "POST",
      headers,
      body: buildReviewFormData(reviewData),
    }
  );

  return handleResponse(response);
}

export async function updateReview(restaurantId, reviewId, reviewData) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "PUT",
      headers,
      body: buildReviewFormData(reviewData),
    }
  );

  return handleResponse(response);
}

export async function deleteReview(restaurantId, reviewId) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "DELETE",
      headers,
    }
  );

  return handleResponse(response);
}
