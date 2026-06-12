import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import ToastMessage from '../components/ToastMessage';
import { getRestaurants } from '../services/restaurantService';
import { addDistanceToRestaurants } from '../utils/distance';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [21.0278, 105.8342];
const DEFAULT_ZOOM = 13;
const PRIMARY = '#b71422';
const SECONDARY = '#2c694e';
const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';

function toCoordinate(value) {
    const coordinate = Number(value);

    return Number.isFinite(coordinate) ? coordinate : null;
}

function getMappableRestaurant(restaurant) {
    const latitude = toCoordinate(restaurant?.latitude);
    const longitude = toCoordinate(restaurant?.longitude);

    if (latitude === null || longitude === null) {
        return null;
    }

    return {
        ...restaurant,
        image: restaurant?.image || FALLBACK_IMAGE,
        latitude,
        longitude,
    };
}

function createRestaurantIcon(restaurant, isSelected) {
    const borderColor = isSelected ? SECONDARY : PRIMARY;
    const image = restaurant.image || FALLBACK_IMAGE;

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width: 54px;
                height: 54px;
                border-radius: 9999px;
                background: #ffffff;
                border: 3px solid ${borderColor};
                box-shadow: 0 10px 24px rgba(0,0,0,0.22);
                padding: 3px;
                transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'};
                transition: transform 160ms ease, border-color 160ms ease;
            ">
                <img
                    src="${image}"
                    alt=""
                    style="
                        width: 100%;
                        height: 100%;
                        display: block;
                        object-fit: cover;
                        border-radius: 9999px;
                    "
                />
            </div>
        `,
        iconSize: [54, 54],
        iconAnchor: [27, 54],
        popupAnchor: [0, -50],
    });
}

const userLocationIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            position: relative;
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
        ">
            <span style="
                position: absolute;
                inset: 2px;
                background: rgba(44,105,78,0.22);
                border-radius: 9999px;
                animation: pg-map-pulse 1.8s ease-in-out infinite;
            "></span>
            <span style="
                width: 16px;
                height: 16px;
                background: ${SECONDARY};
                border: 3px solid #ffffff;
                border-radius: 9999px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.26);
                position: relative;
                z-index: 1;
            "></span>
        </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});

function InvalidateMapSize() {
    const map = useMap();

    useEffect(() => {
        const resizeMap = () => {
            map.invalidateSize();
        };

        const animationFrameId = window.requestAnimationFrame(resizeMap);
        const timeoutId = window.setTimeout(resizeMap, 250);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.clearTimeout(timeoutId);
        };
    }, [map]);

    return null;
}

function MapRecenter({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(center, zoom, {
            duration: 0.6,
        });
    }, [center, map, zoom]);

    return null;
}

function MapZoomControls() {
    const map = useMap();

    return (
        <div className="absolute bottom-6 right-5 z-[500] flex flex-col overflow-hidden rounded-2xl border border-[#e4beba]/40 bg-white shadow-xl">
            <button
                type="button"
                onClick={() => map.zoomIn()}
                className="flex h-11 w-11 items-center justify-center text-stone-900 hover:bg-[#f0eded] transition-colors"
                aria-label="Phóng to bản đồ"
            >
                <span className="material-symbols-outlined">add</span>
            </button>
            <div className="h-px bg-[#e4beba]/40" />
            <button
                type="button"
                onClick={() => map.zoomOut()}
                className="flex h-11 w-11 items-center justify-center text-stone-900 hover:bg-[#f0eded] transition-colors"
                aria-label="Thu nhỏ bản đồ"
            >
                <span className="material-symbols-outlined">remove</span>
            </button>
        </div>
    );
}

function RestaurantPopup({ restaurant, onDirections, onViewDetails }) {
    const reviewCount = Number(restaurant.reviewCount) || 0;
    const ratingValue = Number(restaurant.rating);
    const hasReviewRating = reviewCount > 0 && Number.isFinite(ratingValue);

    return (
        <div className="min-w-[210px] space-y-3 font-sans">
            <div className="flex gap-3">
                <img
                    src={restaurant.image}
                    alt={restaurant.name || 'Quán ăn'}
                    className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-stone-900">
                        {restaurant.name || 'Quán ăn'}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#5b403e]">
                        <span className="flex items-center gap-1 text-[#b71422]">
                            <span className="material-symbols-outlined text-[14px]">
                                star
                            </span>
                            {hasReviewRating ? (
                                <>
                                    {ratingValue.toFixed(1)}
                                    <span className="text-[#5b403e]">
                                        ({reviewCount})
                                    </span>
                                </>
                            ) : (
                                <span className="text-[#5b403e]">
                                    Chưa có đánh giá
                                </span>
                            )}
                        </span>
                        <span>{restaurant.priceRange || 'Chưa cập nhật'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={onViewDetails}
                    className="rounded-xl bg-[#f0eded] px-3 py-2 text-xs font-bold text-stone-900 hover:bg-[#e4e2e1] transition-colors"
                >
                    Xem chi tiết
                </button>
                <button
                    type="button"
                    onClick={onDirections}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#b71422] px-3 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        directions
                    </span>
                    Chỉ đường
                </button>
            </div>
        </div>
    );
}

function RestaurantListCard({
    restaurant,
    isSelected,
    onDirections,
    onSelect,
    onViewDetails,
}) {
    const reviewCount = Number(restaurant.reviewCount) || 0;
    const ratingValue = Number(restaurant.rating);
    const hasReviewRating = reviewCount > 0 && Number.isFinite(ratingValue);

    return (
        <article
            className={`group cursor-pointer rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                isSelected
                    ? 'border-[#b71422]/30 ring-2 ring-[#b71422]/10'
                    : 'border-[#e4beba]/25 hover:border-[#b71422]/25'
            }`}
            onClick={onSelect}
        >
            <div className="flex gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f0eded]">
                    <img
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={restaurant.image}
                        alt={restaurant.name || 'Quán ăn'}
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-stone-900 group-hover:text-[#b71422] transition-colors">
                                {restaurant.name || 'Quán ăn'}
                            </h3>

                            <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#aeeecb] px-2 py-0.5">
                                <span className="material-symbols-outlined text-[14px] text-[#316e52]">
                                    star
                                </span>
                                <span className="text-xs font-bold text-[#316e52]">
                                    {hasReviewRating
                                        ? `${ratingValue.toFixed(1)} (${reviewCount})`
                                        : 'Mới'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[#5b403e]">
                            <span>{restaurant.distance || 'Gần bạn'}</span>
                            <span className="h-1 w-1 rounded-full bg-[#8f6f6d]" />
                            <span className="text-[#2c694e]">
                                {restaurant.isOpen ? 'Đang mở cửa' : 'Xem giờ mở'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-2 text-sm font-bold text-[#b71422]">
                        {restaurant.priceRange || 'Chưa cập nhật'}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onViewDetails();
                    }}
                    className="rounded-xl bg-[#eae7e7] py-2 text-sm font-bold text-stone-900 hover:bg-[#e4e2e1] transition-colors"
                >
                    Chi tiết
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDirections();
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#b71422] py-2 text-sm font-bold text-white hover:bg-red-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        directions
                    </span>
                    Chỉ đường
                </button>
            </div>
        </article>
    );
}

function FilterChips() {
    const chips = ['Gần nhất', 'Đang mở cửa', 'Giá rẻ', 'Món chay', 'Không cay'];

    return (
        <div className="pointer-events-none absolute left-0 top-4 z-[500] flex w-full justify-center px-4">
            <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-full border border-white/60 bg-white/75 p-2 shadow-sm backdrop-blur-xl [scrollbar-width:none]">
                {chips.map((chip, index) => (
                    <button
                        key={chip}
                        type="button"
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                            index === 0
                                ? 'bg-[#b71422] text-white shadow-md'
                                : 'border border-[#e4beba]/35 bg-white/70 text-[#5b403e] hover:bg-white'
                        }`}
                    >
                        {chip}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MapView() {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
    });

    useEffect(() => {
        let isActive = true;

        async function loadRestaurants() {
            setIsLoading(true);

            try {
                const data = await getRestaurants();

                if (isActive) {
                    setRestaurants(data);
                }
            } catch (error) {
                if (isActive) {
                    setToast({
                        message: error.message,
                        type: 'warning',
                    });
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
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

    const mappedRestaurants = useMemo(
        () =>
            restaurantsWithDistance
                .map(getMappableRestaurant)
                .filter((restaurant) => restaurant !== null),
        [restaurantsWithDistance]
    );

    const selectedRestaurant = useMemo(
        () =>
            mappedRestaurants.find(
                (restaurant) => restaurant.id === selectedRestaurantId
            ) || mappedRestaurants[0],
        [mappedRestaurants, selectedRestaurantId]
    );

    const mapCenter = useMemo(() => {
        if (selectedRestaurant) {
            return [selectedRestaurant.latitude, selectedRestaurant.longitude];
        }

        if (userLocation) {
            return [userLocation.latitude, userLocation.longitude];
        }

        return DEFAULT_CENTER;
    }, [selectedRestaurant, userLocation]);

    const openDirections = (restaurant) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const viewDetails = (restaurant) => {
        navigate(`/restaurants/${restaurant.id}`);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setToast({
                message: 'Trình duyệt không hỗ trợ lấy vị trí.',
                type: 'warning',
            });
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setUserLocation({
                    latitude,
                    longitude,
                });
                setIsGettingLocation(false);
                setToast({
                    message: 'Đã cập nhật vị trí của bạn trên bản đồ.',
                    type: 'success',
                });
            },
            () => {
                setIsGettingLocation(false);
                setToast({
                    message: 'Bạn chưa cấp quyền vị trí.',
                    type: 'warning',
                });
            }
        );
    };

    return (
        <div className="h-screen overflow-hidden bg-[#fcf9f8] text-stone-900 font-sans">
            <style>
                {`
                    @keyframes pg-map-pulse {
                        0% { transform: scale(0.75); opacity: 0.65; }
                        50% { transform: scale(1.1); opacity: 0.28; }
                        100% { transform: scale(0.75); opacity: 0.65; }
                    }
                    .leaflet-popup-content-wrapper {
                        border-radius: 18px;
                        box-shadow: 0 16px 38px rgba(0,0,0,0.16);
                    }
                    .leaflet-popup-content {
                        margin: 12px;
                    }
                `}
            </style>

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

            <header className="fixed top-0 z-[1000] flex h-16 w-full items-center justify-between bg-[#fcf9f8]/85 px-5 shadow-sm backdrop-blur-xl md:px-16">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b403e] active:scale-95 md:w-auto md:gap-2"
                        aria-label="Quay lại Home"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                        <span className="hidden text-sm font-bold md:inline">
                            Quay lại
                        </span>
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-[#b71422] md:text-2xl">
                            Bản đồ ẩm thực
                        </h1>
                        <p className="hidden text-xs font-medium text-[#5b403e] md:block">
                            Khám phá quán ăn gần bạn
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b403e] hover:bg-[#e4e2e1]/50 transition-colors"
                        aria-label="Ngôn ngữ"
                    >
                        <span className="material-symbols-outlined">
                            language
                        </span>
                    </button>
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b403e] hover:bg-[#e4e2e1]/50 transition-colors"
                        aria-label="Tài khoản"
                    >
                        <span className="material-symbols-outlined">
                            account_circle
                        </span>
                    </button>
                </div>
            </header>

            <main className="flex h-screen flex-col bg-[#fcf9f8] pt-16 md:flex-row">
                <section className="relative h-[58vh] min-h-[430px] flex-1 p-4 md:h-full md:min-h-[600px] md:p-6">
                    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-[#e4beba]/30 bg-[#e5e7eb] shadow-[0_4px_20px_rgba(255,77,77,0.08)]">
                        <MapContainer
                            center={mapCenter}
                            zoom={DEFAULT_ZOOM}
                            zoomControl={false}
                            scrollWheelZoom
                            className="h-full min-h-[430px] w-full md:min-h-[600px]"
                        >
                            <InvalidateMapSize />
                            <MapRecenter center={mapCenter} zoom={DEFAULT_ZOOM} />

                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {mappedRestaurants.map((restaurant) => (
                                <Marker
                                    key={restaurant.id}
                                    icon={createRestaurantIcon(
                                        restaurant,
                                        restaurant.id === selectedRestaurant?.id
                                    )}
                                    position={[
                                        restaurant.latitude,
                                        restaurant.longitude,
                                    ]}
                                    eventHandlers={{
                                        click: () =>
                                            setSelectedRestaurantId(
                                                restaurant.id
                                            ),
                                    }}
                                >
                                    <Popup>
                                        <RestaurantPopup
                                            restaurant={restaurant}
                                            onDirections={() =>
                                                openDirections(restaurant)
                                            }
                                            onViewDetails={() =>
                                                viewDetails(restaurant)
                                            }
                                        />
                                    </Popup>
                                </Marker>
                            ))}

                            {userLocation && (
                                <Marker
                                    icon={userLocationIcon}
                                    position={[
                                        userLocation.latitude,
                                        userLocation.longitude,
                                    ]}
                                >
                                    <Popup>Vị trí của bạn</Popup>
                                </Marker>
                            )}

                            <MapZoomControls />
                        </MapContainer>

                        <FilterChips />

                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className="absolute bottom-6 left-5 z-[500] inline-flex items-center gap-2 rounded-full bg-[#b71422] px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95 hover:bg-red-800 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                near_me
                            </span>
                            <span>
                                {isGettingLocation
                                    ? 'Đang lấy vị trí...'
                                    : 'Dùng vị trí của tôi'}
                            </span>
                        </button>
                    </div>
                </section>

                <aside className="hidden h-full w-[400px] flex-col border-l border-[#e4beba]/20 bg-[#fcf9f8] shadow-[-4px_0_20px_rgba(0,0,0,0.03)] md:flex">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-stone-900">
                                Quán gần bạn
                            </h2>
                            <p className="text-base text-[#5b403e]">
                                {mappedRestaurants.length} địa điểm được tìm thấy
                            </p>
                        </div>
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b403e] hover:bg-[#e4e2e1]/50 transition-colors"
                            aria-label="Lọc danh sách"
                        >
                            <span className="material-symbols-outlined">
                                filter_list
                            </span>
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-8 [scrollbar-width:thin]">
                        {isLoading ? (
                            <div className="rounded-3xl bg-white p-5 text-sm font-bold text-[#b71422] shadow-sm">
                                Đang tải danh sách quán...
                            </div>
                        ) : mappedRestaurants.length ? (
                            mappedRestaurants.map((restaurant) => (
                                <RestaurantListCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    isSelected={
                                        restaurant.id === selectedRestaurant?.id
                                    }
                                    onSelect={() =>
                                        setSelectedRestaurantId(restaurant.id)
                                    }
                                    onViewDetails={() => viewDetails(restaurant)}
                                    onDirections={() =>
                                        openDirections(restaurant)
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                                <span className="material-symbols-outlined text-[40px] text-[#b71422]">
                                    wrong_location
                                </span>
                                <p className="mt-2 text-sm font-semibold text-[#5b403e]">
                                    Chưa có quán nào có tọa độ hợp lệ.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>

                <section className="relative z-20 -mt-20 flex-1 bg-gradient-to-t from-[#fcf9f8] via-[#fcf9f8]/95 to-transparent pt-6 md:hidden">
                    <div className="mb-2 flex items-center justify-between px-5">
                        <div>
                            <h2 className="text-lg font-semibold text-stone-900">
                                Phổ biến gần đây
                            </h2>
                            <p className="text-xs font-medium text-[#5b403e]">
                                {mappedRestaurants.length} địa điểm có tọa độ
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="text-sm font-bold text-[#b71422]"
                        >
                            Home
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto px-5 pb-24 [scrollbar-width:none]">
                        {isLoading ? (
                            <div className="min-w-[280px] rounded-xl border border-[#e4e2e1] bg-white p-5 font-bold text-[#b71422] shadow-[0_4px_20px_rgba(255,77,77,0.08)]">
                                Đang tải danh sách quán...
                            </div>
                        ) : mappedRestaurants.length ? (
                            mappedRestaurants.map((restaurant) => (
                                <div
                                    key={restaurant.id}
                                    className="min-w-[280px]"
                                >
                                    <RestaurantListCard
                                        restaurant={restaurant}
                                        isSelected={
                                            restaurant.id ===
                                            selectedRestaurant?.id
                                        }
                                        onSelect={() =>
                                            setSelectedRestaurantId(
                                                restaurant.id
                                            )
                                        }
                                        onViewDetails={() =>
                                            viewDetails(restaurant)
                                        }
                                        onDirections={() =>
                                            openDirections(restaurant)
                                        }
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="min-w-[280px] rounded-xl border border-[#e4e2e1] bg-white p-5 text-sm font-semibold text-[#5b403e] shadow-[0_4px_20px_rgba(255,77,77,0.08)]">
                                Chưa có quán nào có tọa độ hợp lệ.
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around bg-[#fcf9f8]/90 px-4 shadow-[0_-4px_20px_rgba(255,77,77,0.08)] backdrop-blur-lg md:hidden">
                <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-full bg-[#db3237] px-4 py-1 text-white active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined">map</span>
                    <span className="text-sm font-bold">Bản đồ</span>
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="flex flex-col items-center justify-center text-[#5b403e] active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-sm font-bold">Tìm kiếm</span>
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/bookmarks')}
                    className="flex flex-col items-center justify-center text-[#5b403e] active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined">bookmark</span>
                    <span className="text-sm font-bold">Đã lưu</span>
                </button>
                <button
                    type="button"
                    className="flex flex-col items-center justify-center text-[#5b403e] active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-sm font-bold">Cá nhân</span>
                </button>
            </nav>
        </div>
    );
}

export default MapView;
