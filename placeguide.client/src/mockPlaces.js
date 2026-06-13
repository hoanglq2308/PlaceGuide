export const mockPlaces = [
  { 
    id: 1, name: "Dinh Độc Lập", type: "Di tích", lat: 10.7769, lng: 106.6953,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&q=80",
    distance: "0.5 km",
    description: { vi: "Chứng nhân lịch sử của Sài Gòn.", en: "A historic landmark." },
    // Cấu trúc mới (Prompt 4)
    audioUrl: { 
      vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
      en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
    },
    // Cấu trúc cũ phòng hờ bà chưa sửa file AudioPlayer.jsx
    audio_vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audio_en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  { 
    id: 2, name: "Cà phê Vợt Cheo Leo", type: "Quán xá", lat: 10.7655, lng: 106.6775,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=80",
    distance: "2.1 km",
    description: { vi: "Quán cà phê vợt tuổi đời hơn 80 năm.", en: "80-year-old traditional coffee shop." },
    audioUrl: { 
      vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", 
      en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" 
    },
    audio_vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    audio_en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  { 
    id: 3, name: "Phố đi bộ Nguyễn Huệ", type: "Phố đi bộ", lat: 10.7731, lng: 106.7024,
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&q=80",
    distance: "1.0 km",
    description: { vi: "Nơi tụ tập vui chơi nhộn nhịp nhất.", en: "The most bustling walking street." },
    audioUrl: { 
      vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", 
      en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" 
    },
    audio_vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    audio_en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  { 
    id: 4, name: "Nhà thờ Đức Bà", type: "Di tích", lat: 10.7797, lng: 106.6990,
    image: "https://images.unsplash.com/photo-1509030450978-4eb2e3fc1e23?w=500&q=80",
    distance: "1.2 km",
    description: { vi: "Kiến trúc Pháp cổ kính.", en: "Ancient French architecture." },
    audioUrl: { 
      vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", 
      en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
    },
    audio_vi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    audio_en: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];