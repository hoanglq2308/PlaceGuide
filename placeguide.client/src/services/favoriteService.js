const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

function getApiUrl(path) {
    if (!API_URL) {
        throw new Error('Thiếu cấu hình VITE_API_URL!');
    }

    return `${API_URL}${path}`;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

function flattenValidationErrors(errors) {
    if (!errors) return [];

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

function getErrorMessage(result) {
    if (typeof result === 'string' && result.trim()) {
        return result;
    }

    if (!result || typeof result !== 'object') {
        return 'Không thể cập nhật Bookmarks!';
    }

    const validationErrors = flattenValidationErrors(
        result.errors || result.Errors
    );

    return (
        result.message ||
        result.Message ||
        result.title ||
        validationErrors.join(', ') ||
        'Không thể cập nhật Bookmarks!'
    );
}

async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const result = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(getErrorMessage(result));
    }

    return result;
}

export async function getFavorites() {
    const response = await fetch(getApiUrl('/favorites'), {
        headers: getAuthHeaders(),
    });

    const favorites = await handleResponse(response);

    if (!Array.isArray(favorites)) {
        throw new Error('Dữ liệu Bookmarks từ server không hợp lệ!');
    }

    return favorites;
}

export async function addFavoriteRestaurant(restaurantId) {
    const response = await fetch(
        getApiUrl(`/favorites/${encodeURIComponent(restaurantId)}`),
        {
            method: 'POST',
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
}

export async function removeFavoriteRestaurant(restaurantId) {
    const response = await fetch(
        getApiUrl(`/favorites/${encodeURIComponent(restaurantId)}`),
        {
            method: 'DELETE',
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
}

export async function getFavoriteStatus(restaurantId) {
    const response = await fetch(
        getApiUrl(`/favorites/${encodeURIComponent(restaurantId)}/status`),
        {
            headers: getAuthHeaders(),
        }
    );

    const status = await handleResponse(response);

    return Boolean(status?.isFavorite ?? status?.IsFavorite);
}
