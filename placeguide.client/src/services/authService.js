const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
    const contentType = response.headers.get('content-type');

    let result;

    if (contentType && contentType.includes('application/json')) {
        result = await response.json();
    } else {
        result = await response.text();
    }

    if (!response.ok) {
        let message = 'Có lỗi xảy ra!';

        if (typeof result === 'string') {
            message = result;
        } else {
            message =
                result.message ||
                result.Message ||
                result.title ||
                result.errors?.join(', ') ||
                result.Errors?.join(', ') ||
                'Có lỗi xảy ra!';
        }

        throw new Error(message);
    }

    return result;
}

export async function registerUser(data) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return handleResponse(response);
}

export async function loginUser(data) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return handleResponse(response);
}