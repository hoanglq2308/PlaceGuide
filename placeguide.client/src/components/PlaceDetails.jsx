import React from 'react';

const PlaceDetails = ({ place, onBack, lang }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
      {/* Nút Back phong cách tối giản */}
      <button 
        onClick={onBack} 
        className="mb-5 flex items-center gap-2 w-max px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm hover:shadow"
      >
        <span className="text-lg leading-none mb-0.5">←</span> {lang === 'vi' ? 'Quay lại' : 'Back'}
      </button>
      
      {/* Khung ảnh kiểu Hero Cover */}
      <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-6 shadow-lg group">
        <img 
          src={place.image} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt="" 
        />
        {/* Lớp gradient đen che mờ từ dưới lên để chữ hiển thị rõ */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex gap-2 mb-2">
            <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {place.type}
            </span>
            <span className="backdrop-blur-md bg-black/30 border border-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              {place.distance}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white drop-shadow-md">{place.name}</h2>
        </div>
      </div>
      
      {/* Nội dung mô tả */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          {lang === 'vi' ? 'Giới thiệu' : 'Overview'}
        </h3>
        <p className="text-gray-700 leading-relaxed text-[15px]">
          {place.description[lang]}
        </p>
      </div>
    </div>
  );
};

export default PlaceDetails;