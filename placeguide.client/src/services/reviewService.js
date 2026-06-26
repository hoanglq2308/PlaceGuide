const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

function getApiUrl(path) {
  if (!API_URL) {
    throw new Error("Thiếu cấu hình VITE_API_URL!");
  }

  return `${API_URL}${path}`;
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

    throw new Error(message);
  }

  return data;
}

export async function getReviews(restaurantId) {
  const response = await fetch(getApiUrl(`/restaurants/${restaurantId}/reviews`), {
    method: "GET",
  });

  return handleResponse(response);
}

export async function createReview(restaurantId, reviewData) {
  const response = await fetch(getApiUrl(`/restaurants/${restaurantId}/reviews`), {
    method: "POST",
    body: buildReviewFormData(reviewData),
  });

  return handleResponse(response);
}

export async function updateReview(restaurantId, reviewId, reviewData) {
  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "PUT",
      body: buildReviewFormData(reviewData),
    }
  );

  return handleResponse(response);
}

export async function deleteReview(restaurantId, reviewId) {
  const response = await fetch(
    getApiUrl(`/restaurants/${restaurantId}/reviews/${reviewId}`),
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}
