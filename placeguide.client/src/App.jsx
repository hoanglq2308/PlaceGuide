import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import RestaurantMenu from './pages/RestaurantMenu';
import Bookmarks from './pages/Bookmarks';
import MapView from './pages/MapView';
import AudioPassModalHost from './components/AudioPassModalHost';
function App() {
    return (
        <BrowserRouter>
            <AudioPassModalHost />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/map" element={<MapView />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
