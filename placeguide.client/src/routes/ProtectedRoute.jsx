import { Navigate, useLocation } from 'react-router-dom';

function decodeJwtPayload(token) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
    );

    return JSON.parse(window.atob(paddedBase64));
}

function getTokenPayload(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    if (token.split('.').length !== 3) {
        return false;
    }

    try {
        return decodeJwtPayload(token);
    } catch {
        return null;
    }
}

function isTokenValid(token) {
    const payload = getTokenPayload(token);

    if (!payload || typeof payload.exp !== 'number') {
        return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
}

function getTokenRoles(token) {
    const payload = getTokenPayload(token);

    if (!payload) {
        return [];
    }

    const roleValues = [
        payload.role,
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']
    ];

    return roleValues.flatMap((roles) =>
        Array.isArray(roles) ? roles : roles ? [roles] : []
    );
}

function ProtectedRoute({ children, requiredRole }) {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: {
                        pathname: location.pathname,
                        search: location.search,
                        hash: location.hash
                    }
                }}
            />
        );
    }

    if (requiredRole && !getTokenRoles(token).includes(requiredRole)) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default ProtectedRoute;
