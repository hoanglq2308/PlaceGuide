import React, { useState } from 'react';
import PlaceList from './PlaceList';
import PlaceDetails from './PlaceDetails';
import AudioPlayer from './AudioPlayer';

const Sidebar = ({ places, selectedPlace, setSelectedPlace, lang, setLang, filterType, setFilterType, onLogout, currentUser }) => {
  const tabs = ['Tất cả', 'Di tích', 'Quán xá', 'Phố đi bộ'];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="h-full flex flex-col relative bg-white">
      <div className="p-4 pb-0 relative z-[60]">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm">
          
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLang('vi')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-400 hover:text-gray-600'}`}>VI</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-400 hover:text-gray-600'}`}>EN</button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-200/50 rounded-xl transition-all"
            >
              {/* Lấy tên user gắn vào seed để ảnh tự động random theo tên */}
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.name || 'Wind'}&backgroundColor=e0e7ff`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-indigo-200 bg-white object-cover"
              />
              <span className="text-sm font-bold text-slate-700 hidden sm:block truncate max-w-[100px]">
                {currentUser?.name || 'Khách'}
              </span>
              <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 z-[100] overflow-hidden">
                
                {/* HIỂN THỊ THÔNG TIN LẤY TỪ LÚC ĐĂNG KÝ */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-sm font-black text-slate-800 truncate">{currentUser?.name}</p>
                  <p className="text-xs font-medium text-slate-500 truncate">{currentUser?.email}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2" onClick={() => setShowMenu(false)}>
                  <span>⚙️</span> {lang === 'vi' ? 'Cài đặt tài khoản' : 'Account Settings'}
                </button>
                
                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-50">
                  <span>🚪</span> {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-4">
        {/* Phần ruột cũ giữ nguyên */}
        {!selectedPlace && (
          <div className="mb-6">
            <input type="text" placeholder={lang === 'vi' ? "Tìm kiếm..." : "Search..."} className="w-full p-2.5 mb-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm" />
            <div className="flex flex-wrap gap-1.5">
              {tabs.map(tab => (
                <button key={tab} onClick={() => { setFilterType(tab); setSelectedPlace(null); }} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${filterType === tab ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 ring-offset-1' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>{tab}</button>
              ))}
            </div>
          </div>
        )}

        {selectedPlace ? <PlaceDetails place={selectedPlace} onBack={() => setSelectedPlace(null)} lang={lang} /> : <PlaceList places={places} onSelect={setSelectedPlace} lang={lang} />}
      </div>

      <AudioPlayer place={selectedPlace} lang={lang} />
    </div>
  );
};

export default Sidebar;