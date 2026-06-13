import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
// KHÔNG CÓ DÒNG NÀY LÀ MAP NÁT, NHỚ KỸ!
import 'leaflet/dist/leaflet.css'; 

import L from 'leaflet';

// --- ĐOẠN FIX TÀ ĐẠO (PHIÊN BẢN ÉP DÙNG ẢNH MẠNG) ---
// Gõ đầu thằng leaflet, bắt nó quên cái đường dẫn nội bộ bị lỗi đi
delete L.Icon.Default.prototype._getIconUrl;

// Ép nó load ảnh marker thẳng từ CDN
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// ----------------------------------------------------

const MapContainer = ({ places }) => {
  // Tâm bản đồ, set đại đâu đó ngay Sài Gòn
  const centerPosition = [10.7769, 106.7009];

  return (
    // Dùng Tailwind h-screen (100vh) và w-full. 
    <div className="h-screen w-full relative">
      <LeafletMap
        center={centerPosition}
        zoom={14}
        // Thằng react-leaflet nó cực đoan ở chỗ container bọc nó phải có chiều cao tĩnh.
        style={{ height: '100%', width: '100%', zIndex: 0 }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Lặp qua cục data ném từ App.jsx xuống để render Marker. */}
        {places && places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <div className="text-center">
                <strong className="text-indigo-600 block text-lg mb-1">{place.name}</strong>
                <span className="text-gray-500 text-sm">Nơi an nghỉ của 1000 dòng code lỗi.</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;