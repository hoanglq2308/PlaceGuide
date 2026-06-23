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

// IMPORT THÊM 3 TRANG MERCHANT MỚI VÀO ĐÂY
import MerchantRegister from './pages/Merchant/MerchantRegister';
import MerchantWaiting from './pages/Merchant/MerchantWaiting';
import MenuManagement from './pages/Merchant/MenuManagement';

function App() {
    return (
        <BrowserRouter>
            <AudioPassModalHost />
            <Routes>
                {/* Các tuyến đường dành cho Khách hàng (Client) */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/audio-pass/checkout" element={<AudioPassCheckout />} />

                {/* CẤU HÌNH CÁC TUYẾN ĐƯỜNG MỚI CHO CỬA HÀNG (MERCHANT) */}
                <Route path="/merchant/register" element={<MerchantRegister />} />
                <Route path="/merchant/waiting" element={<MerchantWaiting />} />
                <Route path="/merchant/menu" element={<MenuManagement />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;