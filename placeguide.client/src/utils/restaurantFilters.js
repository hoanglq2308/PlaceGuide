const PRICE_FILTERS = {
    ALL: 'all',
    CHEAP: 'cheap',
    MEDIUM: 'medium',
    HIGH: 'high',
};

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function getTextList(value) {
    return Array.isArray(value) ? value.map((item) => String(item || '')) : [];
}

function getSearchableText(restaurant) {
    return [
        restaurant?.name,
        ...getTextList(restaurant?.highlightDishes),
        ...getTextList(restaurant?.tags),
    ]
        .map(normalizeText)
        .join(' ');
}

function hasAnyKeyword(restaurant, keywords) {
    const searchableText = getSearchableText(restaurant);

    return keywords.some((keyword) => searchableText.includes(keyword));
}

function parsePriceValue(value) {
    const normalizedValue = normalizeText(value).replace(',', '.');
    const match = normalizedValue.match(/(\d+(?:\.\d+)?)\s*k?/);

    if (!match) {
        return null;
    }

    return Number(match[1]);
}

export function parsePriceRange(priceRange) {
    const matches = String(priceRange || '').match(/\d+(?:[.,]\d+)?\s*k?/gi);

    if (!matches?.length) {
        return null;
    }

    const values = matches
        .map(parsePriceValue)
        .filter((value) => Number.isFinite(value));

    if (!values.length) {
        return null;
    }

    return {
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
    };
}

export function matchesSearch(restaurant, searchText) {
    const normalizedSearchText = normalizeText(searchText);

    if (!normalizedSearchText) {
        return true;
    }

    return getSearchableText(restaurant).includes(normalizedSearchText);
}

export function matchesOpenOnly(restaurant, openOnly) {
    return !openOnly || restaurant?.isOpen === true;
}

export function matchesVegetarian(restaurant, vegetarianOnly) {
    if (!vegetarianOnly) {
        return true;
    }

    return hasAnyKeyword(restaurant, [
        'vegetarian',
        'vegan',
        'mon chay',
        'do chay',
        'chay',
    ]);
}

export function matchesSpicy(restaurant, spicyOnly) {
    if (!spicyOnly) {
        return true;
    }

    const searchableText = getSearchableText(restaurant);
    const nonSpicyKeywords = [
        'khong cay',
        'khong spicy',
        'non spicy',
        'non-spicy',
        'not spicy',
        'it cay',
    ];

    if (nonSpicyKeywords.some((keyword) => searchableText.includes(keyword))) {
        return false;
    }

    return [
        'cay',
        'spicy',
        'hot',
        'chili',
        'sate',
        'sa te',
        'ot',
    ].some((keyword) => searchableText.includes(keyword));
}

export function matchesPriceFilter(restaurant, priceFilter) {
    if (!priceFilter || priceFilter === PRICE_FILTERS.ALL) {
        return true;
    }

    const parsedPrice = parsePriceRange(restaurant?.priceRange);

    if (!parsedPrice) {
        return true;
    }

    if (priceFilter === PRICE_FILTERS.CHEAP) {
        return parsedPrice.average <= 80;
    }

    if (priceFilter === PRICE_FILTERS.MEDIUM) {
        return parsedPrice.average > 80 && parsedPrice.average <= 180;
    }

    if (priceFilter === PRICE_FILTERS.HIGH) {
        return parsedPrice.average > 180;
    }

    return true;
}

export function filterRestaurants(restaurants, filters) {
    return restaurants.filter(
        (restaurant) =>
            matchesSearch(restaurant, filters.searchText) &&
            matchesOpenOnly(restaurant, filters.openOnly) &&
            matchesVegetarian(restaurant, filters.vegetarianOnly) &&
            matchesSpicy(restaurant, filters.spicyOnly) &&
            matchesPriceFilter(restaurant, filters.priceFilter)
    );
}

export { PRICE_FILTERS };
