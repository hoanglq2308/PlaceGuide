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
        return 'Có lỗi xảy ra!';
    }

    const validationErrors = flattenValidationErrors(
        result.errors || result.Errors
    );

    return (
        result.message ||
        result.Message ||
        result.title ||
        validationErrors.join(', ') ||
        'Có lỗi xảy ra!'
    );
}

function normalizeAuthResponse(result) {
    if (!result || typeof result !== 'object') {
        return result;
    }

    return {
        ...result,
        token: result.token || result.Token,
        expiration: result.expiration || result.Expiration,
        user: result.user || result.User,
        message: result.message || result.Message,
    };
}

async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    let result;

    if (response.status === 204) {
        result = null;
    } else if (contentType.includes('application/json')) {
        result = await response.json();
    } else {
        result = await response.text();
    }

    if (!response.ok) {
        throw new Error(getErrorMessage(result));
    }

    return normalizeAuthResponse(result);
}

export async function registerUser(data) {
    const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return handleResponse(response);
}

export async function loginUser(data) {
    const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return handleResponse(response);
}
