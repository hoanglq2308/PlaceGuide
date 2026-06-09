import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import ToastMessage from '../components/ToastMessage';
import { getRestaurants } from '../services/restaurantService';
import { getFavoriteRestaurantIds } from '../utils/favoriteStorage';

function Bookmarks() {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('vi');
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });

    useEffect(() => {
        let isActive = true;

        async function loadBookmarks() {
            setIsLoading(true);
            setError('');

            try {
                const [restaurantData, favoriteRestaurantIds] = await Promise.all([
                    getRestaurants(),
                    Promise.resolve(getFavoriteRestaurantIds()),
                ]);

                if (isActive) {
                    setRestaurants(restaurantData);
                    setFavoriteIds(favoriteRestaurantIds);
                }
            } catch (loadError) {
                if (isActive) {
                    setError(loadError.message);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadBookmarks();

        return () => {
            isActive = false;
            window.speechSynthesis?.cancel();
        };
    }, []);

    const favoriteRestaurants = useMemo(() => {
        const favoriteIdSet = new Set(favoriteIds);

        return restaurants.filter((restaurant) =>
            favoriteIdSet.has(String(restaurant.id))
        );
    }, [favoriteIds, restaurants]);

    const handleSpeak = (text) => {
        if (!window.speechSynthesis) {
            setToast({
                message: 'Trình duyệt không hỗ trợ đọc thuyết minh.',
                type: 'warning',
            });
            return;
        }

        if (!text) {
            setToast({
                message: 'Quán này chưa có nội dung thuyết minh.',
                type: 'warning',
            });
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 0.95;

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-[#fcf9f8] text-stone-900 font-sans">
            <ToastMessage
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: '',
                        type: 'info',
                    })
                }
            />

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-5 md:px-16 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                            <span>Quay lại Home</span>
                        </button>

                        <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>

                        <span className="text-2xl font-extrabold text-red-700 tracking-tight">
                            VinaFood
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-red-700 hover:border-red-200 bg-white transition-all text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            language
                        </span>
                        <span>{language === 'vi' ? 'VN' : 'EN'}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-16 py-10 space-y-8 pb-24">
                <section className="space-y-3">
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">
                            bookmark
                        </span>
                        Bookmarks
                    </span>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900">
                                Quán đã lưu
                            </h1>
                            <p className="text-base text-gray-600 mt-2">
                                Những địa điểm bạn muốn quay lại hoặc thử sau.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-red-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                explore
                            </span>
                            Khám phá thêm
                        </button>
                    </div>
                </section>

                {isLoading && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-8 text-center">
                        <span className="material-symbols-outlined text-red-700 text-[40px] animate-pulse">
                            restaurant
                        </span>
                        <p className="text-base font-semibold mt-3">
                            Đang tải Bookmarks...
                        </p>
                    </section>
                )}

                {!isLoading && error && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-8 text-center space-y-4">
                        <span className="material-symbols-outlined text-red-700 text-[44px]">
                            error
                        </span>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Không tải được Bookmarks
                            </h2>
                            <p className="text-base text-gray-600 mt-2">
                                {error}
                            </p>
                        </div>
                    </section>
                )}

                {!isLoading && !error && favoriteRestaurants.length === 0 && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-10 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[34px]">
                                bookmark
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Bạn chưa lưu quán nào.
                            </h2>
                            <p className="text-base text-gray-600 mt-2">
                                Mở chi tiết một quán và bấm “Lưu quán” để thêm
                                vào danh sách này.
                            </p>
                        </div>
                    </section>
                )}

                {!isLoading && !error && favoriteRestaurants.length > 0 && (
                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                {favoriteRestaurants.length} quán yêu thích
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {favoriteRestaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    language={language}
                                    onSpeak={handleSpeak}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Bookmarks;
