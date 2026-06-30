import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import LanguageSelector from '../components/LanguageSelector';
import ToastMessage from '../components/ToastMessage';
import AudioStopButton from '../components/AudioStopButton';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../i18n/languageConfig';
import { getRestaurantAudioWithPass } from '../services/audioGuideService';
import { getRestaurants } from '../services/restaurantService';
import { getFavoriteRestaurantIds } from '../utils/favoriteStorage';
import { useSpeechNarration } from '../hooks/useSpeechNarration';

function Bookmarks() {
    const navigate = useNavigate();

    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { language } = useLanguage();
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });
    const { isSpeaking, speakNarration, stopNarration } = useSpeechNarration({
        language,
        onStatus: setToast,
    });

    useEffect(() => {
        let isActive = true;

        async function loadBookmarks() {
            setIsLoading(true);
            setError('');

            try {
                const [restaurants, favoriteIds] = await Promise.all([
                    getRestaurants(),
                    Promise.resolve(getFavoriteRestaurantIds()),
                ]);
                const favoriteIdSet = new Set(favoriteIds);
                const favorites = restaurants.filter((restaurant) =>
                    favoriteIdSet.has(String(restaurant.id))
                );

                if (isActive) {
                    setFavoriteRestaurants(favorites);
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
        };
    }, []);

    const speakText = (text, missingMessage) => {
        speakNarration(text, { missingMessage });
    };

    const handleSpeakRestaurant = async (restaurant) => {
        if (!restaurant?.id) {
            setToast({
                message: 'Thiếu mã quán ăn để tải thuyết minh.',
                type: 'warning',
            });
            return;
        }

        try {
            const audio = await getRestaurantAudioWithPass(restaurant.id, language);
            const text = getLocalizedText(audio?.narration, language);

            if (audio.passCreated) {
                setToast({
                    message: audio.audioPass?.message || 'Gói nghe đã được kích hoạt.',
                    type: 'success',
                });
            }

            speakText(text, 'Quán này chưa có nội dung thuyết minh.');
        } catch (error) {
            setToast({
                message: error.message,
                type: error.cancelled ? 'info' : 'warning',
            });
        }
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
            <AudioStopButton
                visible={isSpeaking}
                onStop={stopNarration}
            />

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-16 md:py-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-600 transition-colors hover:text-red-700"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                            <span className="hidden sm:inline">Quay lại Home</span>
                        </button>

                        <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>

                        <span className="truncate text-xl font-extrabold tracking-tight text-red-700 sm:text-2xl">
                            VinaFood
                        </span>
                    </div>

                    <LanguageSelector className="shrink-0" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-16 py-8 md:py-10 space-y-8 pb-24">
                <section className="space-y-3">
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">
                            bookmark
                        </span>
                        Bookmarks
                    </span>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-stone-900">
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
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-8 text-center">
                        <span className="material-symbols-outlined text-red-700 text-[40px] animate-pulse">
                            restaurant
                        </span>
                        <p className="text-base font-semibold mt-3">
                            Đang tải Bookmarks...
                        </p>
                    </section>
                )}

                {!isLoading && error && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-8 text-center space-y-4">
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
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-10 text-center space-y-4">
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
                                    onSpeak={handleSpeakRestaurant}
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
