const FAVORITE_RESTAURANTS_KEY = 'favoriteRestaurantIds';

function normalizeId(id) {
    return typeof id === 'string' ? id.trim() : String(id || '').trim();
}

function saveFavoriteRestaurantIds(ids) {
    localStorage.setItem(FAVORITE_RESTAURANTS_KEY, JSON.stringify(ids));
}

export function getFavoriteRestaurantIds() {
    try {
        const rawValue = localStorage.getItem(FAVORITE_RESTAURANTS_KEY);
        const parsedValue = rawValue ? JSON.parse(rawValue) : [];

        if (!Array.isArray(parsedValue)) {
            return [];
        }

        return parsedValue
            .map(normalizeId)
            .filter(Boolean)
            .filter((id, index, ids) => ids.indexOf(id) === index);
    } catch {
        return [];
    }
}

export function isFavoriteRestaurant(id) {
    const restaurantId = normalizeId(id);

    if (!restaurantId) {
        return false;
    }

    return getFavoriteRestaurantIds().includes(restaurantId);
}

export function addFavoriteRestaurant(id) {
    const restaurantId = normalizeId(id);

    if (!restaurantId) {
        return getFavoriteRestaurantIds();
    }

    const favoriteIds = getFavoriteRestaurantIds();

    if (favoriteIds.includes(restaurantId)) {
        return favoriteIds;
    }

    const nextFavoriteIds = [...favoriteIds, restaurantId];
    saveFavoriteRestaurantIds(nextFavoriteIds);

    return nextFavoriteIds;
}

export function removeFavoriteRestaurant(id) {
    const restaurantId = normalizeId(id);
    const nextFavoriteIds = getFavoriteRestaurantIds().filter(
        (favoriteId) => favoriteId !== restaurantId
    );

    saveFavoriteRestaurantIds(nextFavoriteIds);

    return nextFavoriteIds;
}

export function toggleFavoriteRestaurant(id) {
    const restaurantId = normalizeId(id);

    if (!restaurantId) {
        return {
            isFavorite: false,
            favoriteIds: getFavoriteRestaurantIds(),
        };
    }

    if (isFavoriteRestaurant(restaurantId)) {
        return {
            isFavorite: false,
            favoriteIds: removeFavoriteRestaurant(restaurantId),
        };
    }

    return {
        isFavorite: true,
        favoriteIds: addFavoriteRestaurant(restaurantId),
    };
}
