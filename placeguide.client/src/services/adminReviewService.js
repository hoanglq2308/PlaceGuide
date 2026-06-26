const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function getAuthHeaders(extraHeaders = {}) {
  const token = window.localStorage.getItem("token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.Message || data?.title || fallbackMessage);
  }

  return data;
}

/**
 * @param {{ search?, restaurantId?, rating?, status?, page?, pageSize?, fromDate?, toDate? }} params
 */
export async function getAdminReviews({
  search,
  restaurantId,
  rating,
  status,
  page = 1,
  pageSize = 10,
  fromDate,
  toDate,
} = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search?.trim()) query.set("search", search.trim());
  if (restaurantId) query.set("restaurantId", restaurantId);
  if (rating && rating !== "all") query.set("rating", String(rating));
  if (status && status !== "all") query.set("status", status);
  if (fromDate) query.set("fromDate", fromDate);
  if (toDate) query.set("toDate", toDate);

  const response = await fetch(
    `${API_URL}/admin/reviews?${query.toString()}`,
    { headers: getAuthHeaders() }
  );

  return parseResponse(response, "Không thể tải danh sách đánh giá.");
}

export async function getAdminReviewById(id) {
  const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Không thể tải chi tiết đánh giá.");
}

export async function hideAdminReview(id, reason) {
  const response = await fetch(`${API_URL}/admin/reviews/${id}/hide`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reason }),
  });

  return parseResponse(response, "Không thể ẩn đánh giá.");
}

export async function restoreAdminReview(id, note = "") {
  const response = await fetch(`${API_URL}/admin/reviews/${id}/restore`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ note }),
  });

  return parseResponse(response, "Không thể khôi phục đánh giá.");
}
