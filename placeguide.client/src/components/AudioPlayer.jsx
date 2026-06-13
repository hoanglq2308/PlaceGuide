import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ place, lang }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.load();
  }, [place, lang]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current?.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  if (!place) return null;

  return (
    // Hiệu ứng kính mờ (glassmorphism) lơ lửng ở đáy Sidebar
    <div className="absolute bottom-4 left-4 right-4 z-50 backdrop-blur-xl bg-indigo-900/85 border border-white/20 text-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.3)] transform transition-all animate-in slide-in-from-bottom-8">
      
      <div className="flex items-center gap-3 mb-2">
        {/* Đĩa than xoay tít thò lò khi phát nhạc */}
        <div className={`w-10 h-10 rounded-full border-2 border-indigo-400 overflow-hidden shrink-0 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
          <img src={place.image} className="w-full h-full object-cover" alt="" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-0.5">
            {lang === 'vi' ? 'Đang thuyết minh' : 'Narrating'}
          </div>
          <div className="text-sm font-bold truncate">{place.name}</div>
        </div>
        
        {/* Cụm nút Play/Pause */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => audioRef.current.currentTime -= 10} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-xs font-bold transition-colors">
            -10s
          </button>
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 bg-white text-indigo-900 rounded-full flex items-center justify-center hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all"
          >
            {isPlaying ? <span className="font-black text-lg">II</span> : <span className="ml-1 font-black text-lg">▶</span>}
          </button>
        </div>
      </div>

      {/* Thanh Progress */}
      <audio 
        ref={audioRef} 
        src={place.audioUrl[lang]} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="relative w-full h-1.5 bg-black/30 rounded-full mt-3 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
        <input 
          type="range" value={progress} 
          onChange={(e) => {
            const time = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = time;
            setProgress(e.target.value);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;