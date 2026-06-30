import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText, getSpeechLocale } from '../i18n/languageConfig';
import { getDishAudioWithPass } from '../services/audioGuideService';
import { getRestaurantById } from '../services/restaurantService';
import { getDishesByRestaurantId } from '../services/dishService';
import { sendDistrictActivity } from '../services/publicDistrictAnalyticsService';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';

function getDescription(dish, language) {
    return getLocalizedText(dish?.description, language);
}

function formatDishPrice(price) {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
        return 'Chưa cập nhật';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(numericPrice);
}

function RestaurantMenu() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { language } = useLanguage();
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });

    useEffect(() => {
        let isActive = true;

        async function loadMenu() {
            setIsLoading(true);
            setError('');

            try {
                const [restaurantData, dishData] = await Promise.all([
                    getRestaurantById(id),
                    getDishesByRestaurantId(id),
                ]);

                if (isActive) {
                    setRestaurant(restaurantData);
                    setDishes(dishData);
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

        loadMenu();

        return () => {
            isActive = false;
            window.speechSynthesis?.cancel();
        };
    }, [id]);

    useEffect(() => {
        if (!restaurant?.districtName) {
            return;
        }

        void sendDistrictActivity({
            districtName: restaurant.districtName,
            sourceType: 'RestaurantView',
        }).catch(() => {
            // District analytics must not interrupt the menu experience.
        });
    }, [restaurant?.districtName, restaurant?.id]);

    const displayRestaurant = useMemo(
        () => ({
            name: restaurant?.name || 'Quán ăn',
            image: restaurant?.image || FALLBACK_IMAGE,
            address: restaurant?.address || 'Chưa có địa chỉ',
            reviewCount: Number(restaurant?.reviewCount) || 0,
            rating: Number.isFinite(Number(restaurant?.rating))
                ? Number(restaurant.rating)
                : null,
        }),
        [restaurant]
    );

    const speakText = (text, missingMessage) => {
        if (!window.speechSynthesis) {
            setToast({
                message: 'Trình duyệt không hỗ trợ đọc thuyết minh.',
                type: 'warning',
            });
            return;
        }

        if (!text) {
            setToast({
                message: missingMessage,
                type: 'warning',
            });
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLocale(language);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    const handleSpeakDish = async (dish) => {
        if (!id || !dish?.id) {
            setToast({
                message: 'Thiếu mã quán ăn hoặc món ăn để tải thuyết minh.',
                type: 'warning',
            });
            return;
        }

        try {
            const audio = await getDishAudioWithPass(id, dish.id, language);
            const text = getLocalizedText(audio?.narration, language);

            if (audio.passCreated) {
                setToast({
                    message: audio.audioPass?.message || 'Gói nghe đã được kích hoạt.',
                    type: 'success',
                });
            }

            speakText(text, 'Món này chưa có nội dung thuyết minh.');
        } catch (audioError) {
            setToast({
                message: audioError.message,
                type: audioError.cancelled ? 'info' : 'warning',
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

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-16 md:py-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/restaurants/${id}`)}
                            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-600 transition-colors hover:text-red-700"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                            <span className="hidden sm:inline">Chi tiết quán</span>
                        </button>

                        <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>

                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="truncate text-xl font-extrabold tracking-tight text-red-700 sm:text-2xl"
                        >
                            VinaFood
                        </button>
                    </div>

                    <LanguageSelector className="shrink-0" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-16 py-6 md:py-8 pb-24 space-y-8">
                {isLoading && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-8 text-center">
                        <span className="material-symbols-outlined text-red-700 text-[40px] animate-pulse">
                            restaurant_menu
                        </span>
                        <p className="text-base font-semibold mt-3">
                            Đang tải menu...
                        </p>
                    </section>
                )}

                {!isLoading && error && (
                    <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-8 text-center space-y-4">
                        <span className="material-symbols-outlined text-red-700 text-[44px]">
                            error
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Không tải được menu
                            </h1>
                            <p className="text-base text-gray-600 mt-2">
                                {error}
                            </p>
                        </div>
                    </section>
                )}

                {!isLoading && !error && (
                    <>
                        <section className="bg-white rounded-xl overflow-hidden border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)]">
                            <div className="h-56 md:h-80 relative">
                                <img
                                    className="w-full h-full object-cover"
                                    src={displayRestaurant.image}
                                    alt={displayRestaurant.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 md:p-8">
                                    <div className="text-white space-y-2">
                                        <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[16px]">
                                                restaurant_menu
                                            </span>
                                            Menu
                                        </span>
                                        <h1 className="break-words text-2xl font-extrabold leading-tight md:text-5xl">
                                            {displayRestaurant.name}
                                        </h1>
                                        <p className="text-sm md:text-base text-white/85">
                                            {displayRestaurant.address}
                                        </p>
                                        <p className="text-sm font-semibold text-white/90">
                                            {displayRestaurant.reviewCount > 0 &&
                                            displayRestaurant.rating !== null
                                                ? `${displayRestaurant.rating.toFixed(
                                                      1
                                                  )} sao • ${
                                                      displayRestaurant.reviewCount
                                                  } đánh giá`
                                                : 'Chưa có đánh giá'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {dishes.length === 0 ? (
                            <section className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-6 md:p-10 text-center">
                                <span className="material-symbols-outlined text-red-700 text-[44px]">
                                    menu_book
                                </span>
                                <h2 className="text-2xl font-bold mt-3">
                                    Quán chưa cập nhật menu.
                                </h2>
                            </section>
                        ) : (
                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {dishes.map((dish) => {
                                    const description = getDescription(
                                        dish,
                                        language
                                    );

                                    return (
                                        <article
                                            key={dish.id}
                                            className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(183,20,34,0.08)] overflow-hidden hover:border-red-200 hover:-translate-y-1 transition-all"
                                        >
                                            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                                <img
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                    src={
                                                        dish.image ||
                                                        displayRestaurant.image
                                                    }
                                                    alt={dish.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                                        <h2 className="text-xl font-bold text-stone-900 leading-tight">
                                                            {dish.name}
                                                        </h2>
                                                        <span className="text-sm font-extrabold text-red-700 sm:whitespace-nowrap">
                                                            {formatDishPrice(
                                                                dish.price
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                                        {description ||
                                                            'Chưa có mô tả cho món này.'}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {dish.isVegetarian && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            Món chay
                                                        </span>
                                                    )}

                                                    {dish.isSpicy && (
                                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            Cay
                                                        </span>
                                                    )}

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSpeakDish(dish)
                                                    }
                                                    className="w-full bg-green-50 text-green-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors text-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        volume_up
                                                    </span>
                                                    Nghe mô tả món
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default RestaurantMenu;
