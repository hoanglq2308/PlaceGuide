import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Bookmarks from './pages/Bookmarks';
import MapView from './pages/MapView';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/restaurants/:id" element={
                    <ProtectedRoute>
                        <RestaurantDetail />
                    </ProtectedRoute>
                } />
                <Route path="/bookmarks" element={
                    <ProtectedRoute>
                        <Bookmarks />
                    </ProtectedRoute>
                } />
                <Route path="/map" element={
                    <ProtectedRoute>
                        <MapView />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
