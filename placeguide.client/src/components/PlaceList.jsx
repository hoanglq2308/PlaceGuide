import React from 'react';

const PlaceList = ({ places, onSelect, lang }) => {
  return (
    <div className="pb-24"> {/* Thêm padding bottom để không bị AudioPlayer đè */}
      <h2 className="text-2xl font-black mb-5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
        {lang === 'vi' ? 'Khám phá điểm đến' : 'Explore Places'}
      </h2>
      
      <div className="grid gap-4">
        {places.map((place) => (
          <div 
            key={place.id}
            onClick={() => onSelect(place)}
            className="group relative flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 cursor-pointer transition-all duration-300 overflow-hidden"
          >
            {/* Hiệu ứng màu nền nhẹ khi hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 to-indigo-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl shadow-inner">
              <img 
                src={place.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt="" 
              />
            </div>
            
            <div className="relative flex flex-col justify-center flex-1">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                {place.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  {place.type}
                </span>
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  📍 {place.distance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaceList;