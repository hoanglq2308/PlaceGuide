import { Navigate } from 'react-router-dom';

function decodeJwtPayload(token) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
    );

    return JSON.parse(window.atob(paddedBase64));
}

function isTokenValid(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    if (token.split('.').length !== 3) {
        return false;
    }

    try {
        const payload = decodeJwtPayload(token);

        if (typeof payload.exp !== 'number') {
            return false;
        }

        return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
