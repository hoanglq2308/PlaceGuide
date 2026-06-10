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
        return 'Không thể tải danh sách món ăn!';
    }

    const validationErrors = flattenValidationErrors(
        result.errors || result.Errors
    );

    return (
        result.message ||
        result.Message ||
        result.title ||
        validationErrors.join(', ') ||
        'Không thể tải danh sách món ăn!'
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

export async function getDishesByRestaurantId(restaurantId) {
    if (!restaurantId) {
        throw new Error('Thiếu mã nhà hàng!');
    }

    const response = await fetch(
        getApiUrl(`/restaurants/${encodeURIComponent(restaurantId)}/dishes`),
        {
            headers: getAuthHeaders(),
        }
    );

    const dishes = await handleResponse(response);

    if (!Array.isArray(dishes)) {
        throw new Error('Dữ liệu món ăn từ server không hợp lệ!');
    }

    return dishes;
}
