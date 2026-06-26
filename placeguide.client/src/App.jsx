import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import RestaurantMenu from './pages/RestaurantMenu';
import Bookmarks from './pages/Bookmarks';
import MapView from './pages/MapView';
import AudioPassModalHost from './components/AudioPassModalHost';
import AudioPassCheckout from './pages/AudioPassCheckout';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './routes/ProtectedRoute';
import VisitorPresenceTracker from './components/VisitorPresenceTracker';
import VisitorActivityTracker from './components/analytics/VisitorActivityTracker';
import MerchantHome from './pages/Merchant/MerchantHome';
import MerchantRegister from './pages/Merchant/MerchantRegister';
import MerchantWaiting from './pages/Merchant/MerchantWaiting';
import MenuManagement from './pages/Merchant/MenuManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MerchantRegistrations from './pages/Admin/MerchantRegistrations';
import AdminRestaurants from './pages/Admin/AdminRestaurants';
import OwnerRestaurantProfile from './pages/Owner/OwnerRestaurantProfile';

function App() {
    return (
        <BrowserRouter>
            <LanguageProvider>
                <AudioPassModalHost />
                <VisitorPresenceTracker />
                <VisitorActivityTracker />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                    <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/audio-pass/checkout" element={<AudioPassCheckout />} />
                    <Route path="/merchart" element={<Navigate to="/merchant" replace />} />
                    <Route
                        path="/merchant"
                        element={
                            <ProtectedRoute requiredRole="Owner">
                                <MerchantHome />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/merchant/register"
                        element={
                            <ProtectedRoute requiredRole="Owner">
                                <MerchantRegister />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/merchant/waiting"
                        element={
                            <ProtectedRoute requiredRole="Owner">
                                <MerchantWaiting />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/merchant/menu"
                        element={
                            <ProtectedRoute requiredRole="Owner">
                                <MenuManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/restaurant"
                        element={
                            <ProtectedRoute requiredRole="Owner">
                                <OwnerRestaurantProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <Navigate to="/admin/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/merchant-registrations"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <MerchantRegistrations />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/restaurants"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <AdminRestaurants />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </LanguageProvider>
        </BrowserRouter>
    );
}

export default App;
