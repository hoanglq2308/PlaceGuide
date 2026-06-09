const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

function getApiUrl(path) {
    if (!API_URL) {
        throw new Error('Thiếu cấu hình VITE_API_URL!');
    }

    return `${API_URL}${path}`;
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
        return 'Không thể tải danh sách quán ăn!';
    }

    const validationErrors = flattenValidationErrors(
        result.errors || result.Errors
    );

    return (
        result.message ||
        result.Message ||
        result.title ||
        validationErrors.join(', ') ||
        'Không thể tải danh sách quán ăn!'
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

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function getRestaurants() {
    const response = await fetch(getApiUrl('/restaurants'), {
        headers: getAuthHeaders(),
    });

    const restaurants = await handleResponse(response);

    if (!Array.isArray(restaurants)) {
        throw new Error('Dữ liệu quán ăn từ server không hợp lệ!');
    }

    return restaurants;
}

export async function getRestaurantById(id) {
    if (!id) {
        throw new Error('Thiếu mã quán ăn!');
    }

    const response = await fetch(
        getApiUrl(`/restaurants/${encodeURIComponent(id)}`),
        {
            headers: getAuthHeaders(),
        }
    );

    const restaurant = await handleResponse(response);

    if (!restaurant || typeof restaurant !== 'object') {
        throw new Error('Dữ liệu chi tiết quán ăn từ server không hợp lệ!');
    }

    return restaurant;
}
