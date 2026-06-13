import React, { useState } from 'react';
import Sidebar from "./components/Sidebar.jsx"; 
import MapContainer from "./components/MapContainer.jsx"; 
import AuthModal from "./components/AuthModal.jsx"; 
import { mockPlaces } from "./mockPlaces.js";

function App() {
  const [places] = useState(mockPlaces);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [lang, setLang] = useState('vi');
  const [filterType, setFilterType] = useState('Tất cả');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // STATE MỚI: Cất giữ thông tin người dùng đang đăng nhập
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100 relative">
      
      {!isLoggedIn && (
        <AuthModal onLogin={(userData) => {
          setCurrentUser(userData); // Hứng dữ liệu (name, email) từ Modal
          setIsLoggedIn(true);      // Mở cổng cho vào app
        }} />
      )}

      <div className="w-[30%] h-full bg-white shadow-2xl z-10">
        <Sidebar 
          places={places.filter(p => filterType === 'Tất cả' ? true : p.type === filterType)} 
          selectedPlace={selectedPlace} 
          setSelectedPlace={setSelectedPlace}
          lang={lang}
          setLang={setLang}
          filterType={filterType}
          setFilterType={setFilterType}
          onLogout={() => {
            setIsLoggedIn(false);
            setCurrentUser(null); // Đăng xuất thì xóa luôn thông tin cho sạch
          }}
          currentUser={currentUser} // CHUYỀN XUỐNG CHO SIDEBAR HIỂN THỊ
        />
      </div>

      <div className="w-[70%] h-full relative z-0">
        <MapContainer places={places.filter(p => filterType === 'Tất cả' ? true : p.type === filterType)} setSelectedPlace={setSelectedPlace} lang={lang} />
      </div>
    </div>
  );
}

export default App;