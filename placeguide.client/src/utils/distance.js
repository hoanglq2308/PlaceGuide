function toCoordinate(value) {
    const coordinate = Number(value);

    return Number.isFinite(coordinate) ? coordinate : null;
}

function hasValidCoordinates(location) {
    if (!location) return false;

    const latitude = toCoordinate(location.latitude);
    const longitude = toCoordinate(location.longitude);

    return latitude !== null && longitude !== null;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function calculateDistanceInMeters(fromLocation, toLocation) {
    if (!hasValidCoordinates(fromLocation) || !hasValidCoordinates(toLocation)) {
        return null;
    }

    const fromLatitude = toCoordinate(fromLocation.latitude);
    const fromLongitude = toCoordinate(fromLocation.longitude);
    const toLatitude = toCoordinate(toLocation.latitude);
    const toLongitude = toCoordinate(toLocation.longitude);

    const earthRadiusInMeters = 6371000;
    const latitudeDelta = toRadians(toLatitude - fromLatitude);
    const longitudeDelta = toRadians(toLongitude - fromLongitude);

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(toRadians(fromLatitude)) *
            Math.cos(toRadians(toLatitude)) *
            Math.sin(longitudeDelta / 2) ** 2;

    return earthRadiusInMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(distanceInMeters) {
    if (!Number.isFinite(distanceInMeters)) {
        return null;
    }

    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)}m`;
    }

    return `${(distanceInMeters / 1000).toFixed(1)}km`;
}

function addDistanceMetadata(restaurants, userLocation) {
    return restaurants.map((restaurant, index) => {
        const distanceInMeters = calculateDistanceInMeters(
            userLocation,
            restaurant
        );

        return {
            ...restaurant,
            distance: formatDistance(distanceInMeters) || restaurant.distance,
            distanceInMeters,
            originalIndex: index,
        };
    });
}

function removeDistanceMetadata(restaurant) {
    const cleanedRestaurant = { ...restaurant };

    delete cleanedRestaurant.distanceInMeters;
    delete cleanedRestaurant.originalIndex;

    return cleanedRestaurant;
}

export function addDistanceToRestaurants(restaurants, userLocation) {
    return addDistanceMetadata(restaurants, userLocation).map(
        removeDistanceMetadata
    );
}

export function sortRestaurantsByDistance(restaurants, userLocation) {
    return addDistanceMetadata(restaurants, userLocation)
        .sort((left, right) => {
            const leftHasDistance = Number.isFinite(left.distanceInMeters);
            const rightHasDistance = Number.isFinite(right.distanceInMeters);

            if (leftHasDistance && rightHasDistance) {
                return left.distanceInMeters - right.distanceInMeters;
            }

            if (leftHasDistance) return -1;
            if (rightHasDistance) return 1;

            return left.originalIndex - right.originalIndex;
        })
        .map(removeDistanceMetadata);
}
