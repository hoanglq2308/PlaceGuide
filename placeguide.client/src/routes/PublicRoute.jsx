import { Outlet } from 'react-router-dom';

function clearAuthSession() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
}

function PublicRoute() {
    clearAuthSession();
    return <Outlet />;
}

export default PublicRoute;
