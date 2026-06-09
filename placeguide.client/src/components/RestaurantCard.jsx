import { useNavigate } from 'react-router-dom';

function RestaurantCard({ restaurant, language, onSpeak }) {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        if (!restaurant.id) return;

        navigate(`/restaurants/${restaurant.id}`);
    };

    return (
        <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_20px_rgba(183,20,34,0.08)] transition-transform hover:-translate-y-1">
            <div className="relative h-56 overflow-hidden">
                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={restaurant.image}
                    alt={restaurant.name}
                    loading="lazy"
                    decoding="async"
                />

                <div className="absolute top-4 right-4 bg-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">
                        bolt
                    </span>
                    {restaurant.badge}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-stone-900">
                        {restaurant.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-gray-600 text-xs font-medium">
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
                            {restaurant.rating}
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
                    <p className="text-base text-gray-600 line-clamp-1">
                        <span className="font-bold text-stone-900">
                            Món nổi bật:
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
                        onClick={() => onSpeak(restaurant.narration[language])}
                        className="flex-1 bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            volume_up
                        </span>
                        Nghe thuyết minh
                    </button>

                    <button
                        type="button"
                        onClick={handleViewDetails}
                        className="px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
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
