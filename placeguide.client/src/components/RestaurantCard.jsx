import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function RestaurantCard({ restaurant, language, onSpeak }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const reviewCount = Number(restaurant.reviewCount) || 0;
    const ratingValue = Number(restaurant.rating);
    const hasReviewRating = reviewCount > 0 && Number.isFinite(ratingValue);

    const handleViewDetails = () => {
        if (!restaurant.id) return;

        navigate(`/restaurants/${restaurant.id}`);
    };

    return (
        <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_20px_rgba(183,20,34,0.08)] transition-transform hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden sm:h-56">
                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={restaurant.image}
                    alt={restaurant.name}
                    loading="lazy"
                    decoding="async"
                />

                <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">
                        bolt
                    </span>
                    <span className="truncate">{restaurant.badge}</span>
                </div>
            </div>

            <div className="p-4 space-y-4 sm:p-5">
                <div className="space-y-1">
                    <h3 className="break-words text-xl font-bold leading-tight text-stone-900 sm:text-2xl">
                        {restaurant.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 text-xs font-medium">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                                distance
                            </span>
                            {restaurant.distance}
                        </span>

                        <span className="flex items-center gap-1 text-red-700">
                            <span className="material-symbols-outlined text-[16px]">
                                star
                            </span>
                            {hasReviewRating ? (
                                <>
                                    {ratingValue.toFixed(1)}
                                    <span className="text-gray-500">
                                        ({reviewCount})
                                    </span>
                                </>
                            ) : (
                                <span className="text-gray-500">
                                    {t('noReviews')}
                                </span>
                            )}
                        </span>

                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                                payments
                            </span>
                            {restaurant.priceRange}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-2 sm:text-base">
                        <span className="font-bold text-stone-900">
                            {t('highlights')}
                        </span>{' '}
                        {restaurant.highlightDishes.join(', ')}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {restaurant.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-green-100 text-green-800 text-[10px] rounded uppercase tracking-wider font-bold"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => onSpeak(restaurant)}
                        className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-red-700 py-3 text-sm font-bold text-white transition-all hover:bg-red-800"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            volume_up
                        </span>
                        <span className="truncate">{t('listen')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleViewDetails}
                        className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 px-4 text-gray-600 transition-all hover:bg-gray-100"
                    >
                        <span className="material-symbols-outlined">
                            visibility
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default RestaurantCard;
