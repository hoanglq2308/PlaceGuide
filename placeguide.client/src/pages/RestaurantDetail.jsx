import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage';
import { getRestaurantById } from '../services/restaurantService';
import { getDishesByRestaurantId } from '../services/dishService';
import {
    addFavoriteRestaurant,
    getFavoriteStatus,
    removeFavoriteRestaurant,
} from '../services/favoriteService';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';
const CULTURE_IMAGE =
    'https://images.unsplash.com/photo-1551218808-94e220e084d2';

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function hasCoordinates(restaurant) {
    return (
        Number.isFinite(Number(restaurant?.latitude)) &&
        Number.isFinite(Number(restaurant?.longitude))
    );
}

function getNarration(restaurant, language) {
    return restaurant?.narration?.[language] || '';
}

function getDishDescription(dish, language) {
    return dish?.description?.[language] || dish?.description?.vi || '';
}

function getDishNarration(dish, language) {
    return dish?.narration?.[language] || dish?.narration?.vi || '';
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

function getDisplayRestaurant(restaurant) {
    return {
        id: restaurant?.id || '',
        name: restaurant?.name || 'Quán ăn',
        image: restaurant?.image || FALLBACK_IMAGE,
        address: restaurant?.address || 'Chưa có địa chỉ',
        badge: restaurant?.badge || 'Local food',
        distance: restaurant?.distance || 'Chưa xác định',
        rating: restaurant?.rating ?? 'N/A',
        priceRange: restaurant?.priceRange || 'Chưa cập nhật',
        highlightDishes: asArray(restaurant?.highlightDishes),
        tags: asArray(restaurant?.tags),
        narration: restaurant?.narration || {},
        latitude: restaurant?.latitude,
        longitude: restaurant?.longitude,
        isOpen: restaurant?.isOpen ?? false,
    };
}

function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('vi');
    const [dishes, setDishes] = useState([]);
    const [dishesError, setDishesError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSavingFavorite, setIsSavingFavorite] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });

    useEffect(() => {
        let isActive = true;

        async function loadRestaurant() {
            setIsLoading(true);
            setError('');

            try {
                const [data, favoriteStatus, dishResult] = await Promise.all([
                    getRestaurantById(id),
                    getFavoriteStatus(id).catch(() => false),
                    getDishesByRestaurantId(id)
                        .then((dishData) => ({
                            data: dishData,
                            error: '',
                        }))
                        .catch((dishError) => ({
                            data: [],
                            error: dishError.message,
                        })),
                ]);

                if (isActive) {
                    setRestaurant(data);
                    setIsFavorite(favoriteStatus);
                    setDishes(dishResult.data);
                    setDishesError(dishResult.error);
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

        loadRestaurant();

        return () => {
            isActive = false;
            window.speechSynthesis?.cancel();
        };
    }, [id]);

    const displayRestaurant = useMemo(
        () => getDisplayRestaurant(restaurant),
        [restaurant]
    );
    const narration = getNarration(displayRestaurant, language);
    const primaryDish = displayRestaurant.highlightDishes[0] || displayRestaurant.name;
    const secondaryDish =
        displayRestaurant.highlightDishes[1] || displayRestaurant.badge;
    const tertiaryDish =
        displayRestaurant.highlightDishes[2] || displayRestaurant.priceRange;

    const handleGoBack = () => {
        window.speechSynthesis?.cancel();
        navigate('/home');
    };

    const handleSpeak = () => {
        handleSpeakText(narration, 'Quán này chưa có nội dung thuyết minh.');
    };

    const handleSpeakText = (text, missingMessage) => {
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
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 0.95;

        window.speechSynthesis.speak(utterance);
    };

    const handleDirections = () => {
        if (!hasCoordinates(displayRestaurant)) {
            setToast({
                message: 'Quán này chưa có tọa độ để chỉ đường.',
                type: 'warning',
            });
            return;
        }

        const url = `https://www.google.com/maps/dir/?api=1&destination=${displayRestaurant.latitude},${displayRestaurant.longitude}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleSave = async () => {
        if (!displayRestaurant.id || isSavingFavorite) {
            return;
        }

        setIsSavingFavorite(true);

        try {
            if (isFavorite) {
                await removeFavoriteRestaurant(displayRestaurant.id);
                setIsFavorite(false);
                setToast({
                    message: 'Đã bỏ lưu quán.',
                    type: 'info',
                });
                return;
            }

            await addFavoriteRestaurant(displayRestaurant.id);
            setIsFavorite(true);
            setToast({
                message: 'Đã lưu quán vào Bookmarks.',
                type: 'success',
            });
        } catch (saveError) {
            setToast({
                message: saveError.message,
                type: 'warning',
            });
        } finally {
            setIsSavingFavorite(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center px-5 text-stone-900">
                <div className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-8 text-center space-y-3">
                    <span className="material-symbols-outlined text-red-700 text-[40px] animate-pulse">
                        restaurant
                    </span>
                    <p className="text-base font-semibold">
                        Đang tải thông tin quán...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center px-5 text-stone-900">
                <div className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-8 max-w-md text-center space-y-5">
                    <span className="material-symbols-outlined text-red-700 text-[44px]">
                        error
                    </span>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">
                            Không tải được quán ăn
                        </h1>
                        <p className="text-base text-gray-600">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-6 py-3 rounded-full font-bold hover:bg-red-800 transition-all"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                        Quay lại Home
                    </button>
                </div>
            </div>
        );
    }

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
                            onClick={handleGoBack}
                            className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                            <span>Quay lại</span>
                        </button>

                        <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>

                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="text-2xl font-extrabold text-red-700 tracking-tight"
                        >
                            VinaFood
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setLanguage(language === 'vi' ? 'en' : 'vi')
                            }
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-red-700 hover:border-red-200 bg-white transition-all text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                language
                            </span>
                            <span>{language === 'vi' ? 'VN' : 'EN'}</span>
                        </button>

                        <span className="material-symbols-outlined hidden md:inline text-gray-500 text-[28px]">
                            account_circle
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-16 py-4 md:py-8">
                <section className="relative w-full h-[400px] md:h-[520px] rounded-xl overflow-hidden mb-8 shadow-[0_4px_20px_rgba(183,20,34,0.08)]">
                    <img
                        className="w-full h-full object-cover"
                        src={displayRestaurant.image}
                        alt={displayRestaurant.name}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                    displayRestaurant.isOpen
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        displayRestaurant.isOpen
                                            ? 'bg-green-700'
                                            : 'bg-red-700'
                                    }`}
                                ></span>
                                {displayRestaurant.isOpen
                                    ? 'Đang mở cửa'
                                    : 'Đang đóng cửa'}
                            </span>

                            {displayRestaurant.tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-sm font-semibold"
                                >
                                    {tag}
                                </span>
                            ))}

                            <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">
                                    bolt
                                </span>
                                {displayRestaurant.badge}
                            </span>
                        </div>

                        <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
                            {displayRestaurant.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-5 text-white/90 text-sm font-semibold">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-red-300">
                                    star
                                </span>
                                {displayRestaurant.rating}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined">
                                    distance
                                </span>
                                {displayRestaurant.distance}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined">
                                    payments
                                </span>
                                {displayRestaurant.priceRange}
                            </span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={handleSpeak}
                                className="flex flex-col items-center justify-center p-5 bg-red-100 text-red-950 rounded-xl shadow-[0_4px_20px_rgba(183,20,34,0.08)] hover:scale-[0.98] transition-transform"
                            >
                                <span className="material-symbols-outlined mb-1">
                                    volume_up
                                </span>
                                <span className="text-sm font-semibold text-center">
                                    Nghe thuyết minh
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDirections}
                                disabled={!hasCoordinates(displayRestaurant)}
                                className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 text-stone-900 rounded-xl hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                <span className="material-symbols-outlined mb-1">
                                    directions
                                </span>
                                <span className="text-sm font-semibold text-center">
                                    Chỉ đường
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSavingFavorite}
                                className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-colors ${
                                    isFavorite
                                        ? 'bg-green-50 border-green-100 text-green-800'
                                        : 'bg-white border-gray-200 text-stone-900 hover:bg-gray-50'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <span className="material-symbols-outlined mb-1">
                                    {isFavorite ? 'bookmark_added' : 'bookmark'}
                                </span>
                                <span className="text-sm font-semibold text-center">
                                    {isSavingFavorite
                                        ? 'Đang lưu...'
                                        : isFavorite
                                            ? 'Đã lưu'
                                            : 'Lưu quán'}
                                </span>
                            </button>
                        </div>

                        <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(183,20,34,0.08)] border border-red-100/60">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-700">
                                    info
                                </span>
                                Thông tin chi tiết
                            </h2>

                            <div className="space-y-5">
                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-gray-500 mt-1">
                                        location_on
                                    </span>
                                    <div>
                                        <p className="text-base text-stone-900 font-semibold">
                                            {displayRestaurant.address}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Cách vị trí của bạn{' '}
                                            {displayRestaurant.distance}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <span className="material-symbols-outlined text-gray-500">
                                        schedule
                                    </span>
                                    <p className="text-base text-stone-900">
                                        {displayRestaurant.isOpen
                                            ? 'Đang mở cửa'
                                            : 'Hiện không mở cửa'}
                                    </p>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-gray-500 mt-1">
                                        restaurant_menu
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {displayRestaurant.tags.length ? (
                                            displayRestaurant.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-100"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                Chưa có tag
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-red-50 p-6 md:p-8 rounded-xl border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-700"></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold">
                                    Thuyết minh về quán
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleSpeak}
                                    className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-[32px]">
                                        play_arrow
                                    </span>
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                        Tiếng Việt
                                    </span>
                                    <p className="text-base text-gray-700 leading-relaxed">
                                        {displayRestaurant.narration.vi ||
                                            'Chưa có thuyết minh tiếng Việt.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        English
                                    </span>
                                    <p className="text-base text-gray-700 leading-relaxed italic">
                                        {displayRestaurant.narration.en ||
                                            'English narration is not available yet.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-white/70 rounded-lg flex items-center gap-2 border border-red-100">
                                <span className="material-symbols-outlined text-red-700 text-[20px]">
                                    lightbulb
                                </span>
                                <p className="text-xs text-gray-600">
                                    Nội dung giúp khách du lịch hiểu nhanh về
                                    quán, món nên thử và bối cảnh ẩm thực địa
                                    phương.
                                </p>
                            </div>
                        </section>

                        {(dishes.length > 0 || dishesError) && (
                            <section>
                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Món nên thử
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Thực đơn gợi ý từ quán, có mô tả và
                                            thuyết minh theo ngôn ngữ bạn chọn.
                                        </p>
                                    </div>

                                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                                        <span className="material-symbols-outlined text-[16px]">
                                            restaurant_menu
                                        </span>
                                        Menu
                                    </span>
                                </div>

                                {dishesError ? (
                                    <div className="bg-white rounded-xl border border-red-100 shadow-[0_4px_20px_rgba(183,20,34,0.08)] p-5 text-sm font-semibold text-gray-600">
                                        Chưa tải được danh sách món ăn. Bạn vẫn
                                        có thể xem thông tin quán bình thường.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {dishes.map((dish) => {
                                            const dishDescription =
                                                getDishDescription(
                                                    dish,
                                                    language
                                                );
                                            const dishNarration =
                                                getDishNarration(dish, language);

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

                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-3">
                                                                <h3 className="text-lg font-bold text-stone-900 leading-tight">
                                                                    {dish.name}
                                                                </h3>
                                                                <span className="text-sm font-extrabold text-red-700 whitespace-nowrap">
                                                                    {formatDishPrice(
                                                                        dish.price
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                                                {dishDescription ||
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

                                                            {dish.allergyInfo && (
                                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                    Dị ứng
                                                                </span>
                                                            )}
                                                        </div>

                                                        {dish.allergyInfo && (
                                                            <p className="text-xs text-gray-500">
                                                                {dish.allergyInfo}
                                                            </p>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSpeakText(
                                                                    dishNarration,
                                                                    'Món này chưa có nội dung thuyết minh.'
                                                                )
                                                            }
                                                            className="w-full bg-green-50 text-green-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors text-sm"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                volume_up
                                                            </span>
                                                            Nghe thuyết minh món
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <section className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2 mb-3 text-green-800">
                                <span className="material-symbols-outlined">
                                    menu_book
                                </span>
                                <h3 className="text-lg font-bold">
                                    Góc văn hóa ẩm thực
                                </h3>
                            </div>

                            <p className="text-base text-green-950/80 leading-relaxed mb-5">
                                Những quán ăn địa phương thường không chỉ là nơi
                                dùng bữa, mà còn là cách nhanh nhất để cảm nhận
                                nhịp sống của thành phố. Hãy thử quan sát cách
                                người địa phương gọi món, ăn kèm rau thơm và
                                dùng nước chấm.
                            </p>

                            <div className="h-40 rounded-lg overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                <img
                                    className="w-full h-full object-cover"
                                    src={CULTURE_IMAGE}
                                    alt="Vietnamese food culture"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </section>

                        <section className="bg-red-700 p-6 rounded-xl text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded mb-3 inline-block">
                                Lời khuyên của Local
                            </span>
                            <h4 className="text-xl font-bold mb-2">
                                Nên thử {primaryDish}
                            </h4>
                            <p className="text-base text-white/85 leading-snug">
                                Hãy hỏi nhân viên món bán chạy nhất trong ngày
                                và thử dùng kèm rau thơm hoặc nước chấm đặc
                                trưng để cảm nhận đúng vị địa phương.
                            </p>

                            <div className="mt-5 flex -space-x-2 items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-red-700 bg-red-200"></div>
                                <div className="w-8 h-8 rounded-full border-2 border-red-700 bg-green-200"></div>
                                <div className="w-8 h-8 rounded-full border-2 border-red-700 bg-white/70"></div>
                                <span className="ml-4 text-xs">
                                    Lưu quán để quay lại sau
                                </span>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(183,20,34,0.08)] border border-red-100/60">
                            <h3 className="text-lg font-bold mb-3">
                                Vị trí quán
                            </h3>
                            <div className="h-48 bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-700 text-[56px]">
                                    location_on
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleDirections}
                                disabled={!hasCoordinates(displayRestaurant)}
                                className="w-full mt-5 py-3 text-red-700 font-bold text-sm border-2 border-red-100 rounded-xl hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                Mở bản đồ đầy đủ
                            </button>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default RestaurantDetail;
