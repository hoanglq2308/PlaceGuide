import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage';
import RestaurantCard from '../components/RestaurantCard';
import { mockRestaurants } from '../data/mockRestaurants';
import { getRestaurants } from '../services/restaurantService';
import {
    addDistanceToRestaurants,
    sortRestaurantsByDistance,
} from '../utils/distance';
import { filterRestaurants, PRICE_FILTERS } from '../utils/restaurantFilters';

const RESTAURANTS_PER_PAGE = 9;
const FILTER_BUTTON_BASE_CLASS =
    'px-5 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap';
const FILTER_BUTTON_INACTIVE_CLASS =
    'border-gray-300 bg-white hover:border-red-700 hover:text-red-700';
const FILTER_BUTTON_ACTIVE_CLASS = 'border-green-200 bg-green-100 text-green-800';

function clearAuthSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function decodeJwtPayload(token) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
    );

    return JSON.parse(window.atob(paddedBase64));
}

function isTokenValid(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    if (token.split('.').length !== 3) {
        return false;
    }

    try {
        const payload = decodeJwtPayload(token);

        if (typeof payload.exp !== 'number') {
            return false;
        }

        return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

function Home() {
    const navigate = useNavigate();

    const [language, setLanguage] = useState('vi');
    const [searchText, setSearchText] = useState('');
    const [locationText, setLocationText] = useState('Chưa lấy vị trí');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [openOnly, setOpenOnly] = useState(false);
    const [vegetarianOnly, setVegetarianOnly] = useState(false);
    const [nonSpicyOnly, setNonSpicyOnly] = useState(false);
    const [priceFilter, setPriceFilter] = useState(PRICE_FILTERS.ALL);
    const [distanceSortEnabled, setDistanceSortEnabled] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });

    useEffect(() => {
        const ensureValidSession = () => {
            const token = localStorage.getItem('token');

            if (!isTokenValid(token)) {
                clearAuthSession();
                navigate('/', { replace: true });
            }
        };

        ensureValidSession();

        window.addEventListener('focus', ensureValidSession);
        window.addEventListener('storage', ensureValidSession);

        return () => {
            window.removeEventListener('focus', ensureValidSession);
            window.removeEventListener('storage', ensureValidSession);
        };
    }, [navigate]);

    useEffect(() => {
        let isActive = true;

        async function loadRestaurants() {
            try {
                const data = await getRestaurants();

                if (isActive) {
                    setRestaurants(data);
                    setCurrentPage(1);
                }
            } catch (error) {
                if (isActive) {
                    setRestaurants(mockRestaurants);
                    setCurrentPage(1);
                    setToast({
                        message: `${error.message} Đang hiển thị dữ liệu mẫu.`,
                        type: 'warning',
                    });
                }
            }
        }

        loadRestaurants();

        return () => {
            isActive = false;
        };
    }, []);

    const restaurantsWithDistance = useMemo(
        () =>
            userLocation
                ? addDistanceToRestaurants(restaurants, userLocation)
                : restaurants,
        [restaurants, userLocation]
    );

    const filteredRestaurants = useMemo(() => {
        const filtered = filterRestaurants(restaurantsWithDistance, {
            searchText,
            openOnly,
            vegetarianOnly,
            nonSpicyOnly,
            priceFilter,
        });

        if (distanceSortEnabled && userLocation) {
            return sortRestaurantsByDistance(filtered, userLocation);
        }

        return filtered;
    }, [
        restaurantsWithDistance,
        searchText,
        openOnly,
        vegetarianOnly,
        nonSpicyOnly,
        priceFilter,
        distanceSortEnabled,
        userLocation,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRestaurants.length / RESTAURANTS_PER_PAGE)
    );
    const activePage = Math.min(currentPage, totalPages);
    const paginatedRestaurants = useMemo(() => {
        const startIndex = (activePage - 1) * RESTAURANTS_PER_PAGE;

        return filteredRestaurants.slice(
            startIndex,
            startIndex + RESTAURANTS_PER_PAGE
        );
    }, [activePage, filteredRestaurants]);
    const resultStart = filteredRestaurants.length
        ? (activePage - 1) * RESTAURANTS_PER_PAGE + 1
        : 0;
    const resultEnd = Math.min(
        activePage * RESTAURANTS_PER_PAGE,
        filteredRestaurants.length
    );
    const getFilterButtonClass = (isActive) =>
        `${FILTER_BUTTON_BASE_CLASS} ${
            isActive ? FILTER_BUTTON_ACTIVE_CLASS : FILTER_BUTTON_INACTIVE_CLASS
        }`;
    const handleLogout = () => {
        window.speechSynthesis?.cancel();
        clearAuthSession();
        navigate('/', { replace: true });
    };

    const handleToggleDistanceSort = () => {
        if (!userLocation) {
            setToast({
                message: 'Hãy bấm “Dùng vị trí của tôi” trước để sắp xếp theo khoảng cách.',
                type: 'info',
            });
            return;
        }

        setDistanceSortEnabled((currentValue) => !currentValue);
        setCurrentPage(1);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationText('Trình duyệt không hỗ trợ lấy vị trí');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { latitude, longitude };

                setUserLocation(currentLocation);
                setCurrentPage(1);
                setLocationText(
                    `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                );

                setIsGettingLocation(false);
            },
            () => {
                setLocationText('Bạn chưa cấp quyền vị trí');
                setIsGettingLocation(false);
            }
        );
    };

    const handleSpeak = (text) => {
        if (!window.speechSynthesis) {
            alert('Trình duyệt không hỗ trợ đọc thuyết minh');
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

            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm sticky top-0 z-50">
                <div className="flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <button
                            type="button"
                            className="text-2xl font-extrabold text-red-700 tracking-tight"
                        >
                            VinaFood
                        </button>

                        <nav className="hidden md:flex gap-6">
                            <button className="text-red-700 font-bold border-b-2 border-red-700 text-sm">
                                Explore
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/map')}
                                className="text-gray-600 font-medium hover:text-red-700 transition-colors text-sm"
                            >
                                Map
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/bookmarks')}
                                className="text-gray-600 font-medium hover:text-red-700 transition-colors text-sm"
                            >
                                Bookmarks
                            </button>
                            <button className="text-gray-600 font-medium hover:text-red-700 transition-colors text-sm">
                                History
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() =>
                                setLanguage(language === 'vi' ? 'en' : 'vi')
                            }
                            className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-all text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                language
                            </span>
                            <span>{language === 'vi' ? 'VN' : 'EN'}</span>
                        </button>

                        <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-red-700 font-semibold hover:opacity-80 transition-all"
                        >
                            <span className="material-symbols-outlined text-[28px]">
                                logout
                            </span>
                            <span className="hidden md:inline">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-16 py-12 space-y-12 pb-32">
                {/* Hero Section */}
                <section
                    className="relative rounded-xl overflow-hidden min-h-[400px] flex items-end p-8 shadow-[0_4px_20px_rgba(183,20,34,0.08)] bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "linear-gradient(to top, rgba(0,0,0,0.8), transparent), url('https://lh3.googleusercontent.com/aida-public/AB6AXuByjIfEYdslsm-OiE_ozY8C_2zqY0_1oRkcNkir91gy8A9a-sMyYDKG-br3yx1JXHpXglt1wSlt6hf6q1zORbecsNQVHiDK_Dwf2W5MquXIZkxmB5aL7QaDO5xWE7kmBjCWzXmhJxmwBp59ykLCSS8YdAeklNw_uso-roW_eJdS_G1yT7_H2zXBuNcmsWKQolKvMkZR5Jwmb4kXjp2GvFUkKfIBfIUhPlHoCJGUvAj-xib_XVwfQxa1wSTuD58dbrLhgGm2X0kMxtGq')",
                    }}
                >
                    <div className="w-full max-w-2xl space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                                Khám Phá Hương Vị{' '}
                                <span className="text-red-300">
                                    Việt Nam
                                </span>
                            </h1>

                            <p className="text-lg text-white/90">
                                Tìm quán ăn gần bạn và nghe thuyết minh bằng
                                ngôn ngữ phù hợp.
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 shadow-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="material-symbols-outlined text-red-700">
                                    location_on
                                </span>

                                <p className="text-base font-semibold">
                                    Vị trí hiện tại:{' '}
                                    <span className="text-red-700">
                                        {locationText}
                                    </span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-700 text-white px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    my_location
                                </span>

                                <span>
                                    {isGettingLocation
                                        ? 'Đang lấy vị trí...'
                                        : 'Dùng vị trí của tôi'}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Search & Filter */}
                <section className="sticky top-[72px] z-40 bg-[#fcf9f8]/90 backdrop-blur-md py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-700 transition-colors">
                                search
                            </span>

                            <input
                                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none text-base shadow-[0_4px_20px_rgba(183,20,34,0.08)] bg-white transition-all"
                                placeholder="Tìm món hoặc quán ăn..."
                                type="text"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/map')}
                            className="hidden md:flex items-center gap-2 bg-green-700 text-white px-6 py-4 rounded-full font-bold hover:bg-green-800 transition-all"
                        >
                            <span className="material-symbols-outlined">
                                map
                            </span>
                            <span>Xem bản đồ</span>
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2">
                        <button
                            type="button"
                            onClick={handleToggleDistanceSort}
                            className={getFilterButtonClass(distanceSortEnabled)}
                        >
                            Khoảng cách
                        </button>

                        <label
                            className={`${FILTER_BUTTON_BASE_CLASS} ${
                                priceFilter !== PRICE_FILTERS.ALL
                                    ? FILTER_BUTTON_ACTIVE_CLASS
                                    : FILTER_BUTTON_INACTIVE_CLASS
                            } flex items-center gap-2`}
                        >
                            <span>Giá:</span>
                            <select
                                value={priceFilter}
                                onChange={(event) => {
                                    setPriceFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-transparent text-sm font-semibold outline-none"
                            >
                                <option value={PRICE_FILTERS.ALL}>Tất cả</option>
                                <option value={PRICE_FILTERS.CHEAP}>Giá rẻ</option>
                                <option value={PRICE_FILTERS.MEDIUM}>
                                    Trung bình
                                </option>
                                <option value={PRICE_FILTERS.HIGH}>Cao</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setOpenOnly((value) => !value);
                                setCurrentPage(1);
                            }}
                            className={`${getFilterButtonClass(openOnly)} flex items-center gap-2`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                timer
                            </span>
                            Đang mở cửa
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setVegetarianOnly((value) => !value);
                                setCurrentPage(1);
                            }}
                            className={getFilterButtonClass(vegetarianOnly)}
                        >
                            Món chay
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setNonSpicyOnly((value) => !value);
                                setCurrentPage(1);
                            }}
                            className={getFilterButtonClass(nonSpicyOnly)}
                        >
                            Không cay
                        </button>

                        <button className="px-5 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold hover:border-red-700 hover:text-red-700 transition-all">
                            Dị ứng
                        </button>
                    </div>
                </section>

                {/* Nearby Restaurants */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-stone-900">
                            Quán ăn nổi bật gần bạn
                        </h2>

                        <button className="text-red-700 font-bold text-sm hover:underline">
                            Xem tất cả
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paginatedRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                language={language}
                                onSpeak={handleSpeak}
                            />
                        ))}
                    </div>

                    {filteredRestaurants.length > 0 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                            <p className="text-sm font-medium text-gray-600">
                                Hiển thị {resultStart}-{resultEnd} /{' '}
                                {filteredRestaurants.length} quán
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(Math.max(1, activePage - 1))
                                    }
                                    disabled={activePage === 1}
                                    className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all"
                                >
                                    Trước
                                </button>

                                <span className="px-4 py-2 rounded-full bg-red-700 text-white text-sm font-bold">
                                    {activePage} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(totalPages, activePage + 1)
                                        )
                                    }
                                    disabled={activePage === totalPages}
                                    className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Story & Culture */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
                    <div className="md:col-span-2 bg-green-700 rounded-xl p-8 text-white relative overflow-hidden shadow-[0_4px_20px_rgba(183,20,34,0.08)]">
                        <div className="relative z-10 space-y-4">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs uppercase tracking-widest font-bold">
                                Podcast Ẩm Thực
                            </span>

                            <h3 className="text-3xl font-bold">
                                Chuyện Cũ Hà Nội:
                                <br />
                                Hương Phở Qua Từng Thế Hệ
                            </h3>

                            <p className="text-base text-white/80 max-w-md">
                                Lắng nghe những câu chuyện về gánh phở xưa và
                                văn hóa ẩm thực địa phương.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    handleSpeak(
                                        language === 'vi'
                                            ? 'Hà Nội có nhiều câu chuyện gắn liền với phở. Từ những gánh hàng rong xưa đến các quán ăn hiện đại, phở vẫn là biểu tượng quen thuộc của ẩm thực Việt Nam.'
                                            : 'Hanoi has many stories connected to pho. From old street vendors to modern restaurants, pho remains a familiar symbol of Vietnamese cuisine.'
                                    )
                                }
                                className="bg-white text-green-700 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all"
                            >
                                <span className="material-symbols-outlined">
                                    play_circle
                                </span>
                                Nghe ngay
                            </button>
                        </div>

                        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[220px] opacity-10 rotate-12">
                            restaurant
                        </span>
                    </div>

                    <div className="bg-white rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-4 border border-gray-200 shadow-[0_4px_20px_rgba(183,20,34,0.08)]">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-700 text-[32px]">
                                map
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold">
                            Bản Đồ Ẩm Thực
                        </h3>

                        <p className="text-base text-gray-600">
                            Xem các điểm ăn uống xung quanh theo thời gian thực.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/map')}
                            className="text-red-700 font-bold hover:underline"
                        >
                            Mở bản đồ full-screen
                        </button>
                    </div>
                </section>
            </main>

            {/* Mobile Map Button */}
            <button
                type="button"
                onClick={() => navigate('/map')}
                className="md:hidden fixed bottom-24 right-6 bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-50 hover:scale-110 active:scale-90 transition-all"
            >
                <span className="material-symbols-outlined">map</span>
            </button>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white shadow-lg md:hidden rounded-t-xl">
                <button className="flex flex-col items-center justify-center bg-red-100 text-red-700 rounded-xl px-4 py-1 scale-90">
                    <span className="material-symbols-outlined">explore</span>
                    <span className="text-xs font-semibold">Explore</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/map')}
                    className="flex flex-col items-center justify-center text-gray-500"
                >
                    <span className="material-symbols-outlined">map</span>
                    <span className="text-xs font-semibold">Map</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/bookmarks')}
                    className="flex flex-col items-center justify-center text-gray-500"
                >
                    <span className="material-symbols-outlined">
                        bookmark
                    </span>
                    <span className="text-xs font-semibold">Bookmarks</span>
                </button>

                <button className="flex flex-col items-center justify-center text-gray-500">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-xs font-semibold">Profile</span>
                </button>
            </nav>
        </div>
    );
}

export default Home;
