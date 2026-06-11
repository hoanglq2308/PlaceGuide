const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

function getApiUrl(path) {
  if (!API_URL) {
    throw new Error("Thiếu cấu hình VITE_API_URL!");
  }

  return `${API_URL}${path}`;
}

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

function getAuthHeaders() {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
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

    throw new Error(message);
  }

  return data;
}

export async function getReviews(restaurantId) {
  const response = await fetch(getApiUrl(`/restaurants/${restaurantId}/reviews`), {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
}

export async function createReview(restaurantId, reviewData) {
  const response = await fetch(getApiUrl(`/restaurants/${restaurantId}/reviews`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      rating: reviewData.rating,
      comment: reviewData.comment,
    }),
  });

  return handleResponse(response);
}

export async function updateReview(restaurantId, reviewId, reviewData) {
  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
    }
  );

  return handleResponse(response);
}

export async function deleteReview(restaurantId, reviewId) {
  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse(response);
}
