import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import MerchantRegister from './pages/Merchant/MerchantRegister';
import MerchantWaiting from './pages/Merchant/MerchantWaiting';
import MenuManagement from './pages/Merchant/MenuManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MerchantRegistrations from './pages/Admin/MerchantRegistrations';

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
                    <Route
                        path="/merchant/register"
                        element={
                            <ProtectedRoute>
                                <MerchantRegister />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/merchant/waiting" element={<MerchantWaiting />} />
                    <Route path="/merchant/menu" element={<MenuManagement />} />
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
                </Routes>
            </LanguageProvider>
        </BrowserRouter>
    );
}

export default App;
