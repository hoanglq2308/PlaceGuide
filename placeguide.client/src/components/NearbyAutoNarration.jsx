import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToastMessage from './ToastMessage';
import AudioStopButton from './AudioStopButton';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../i18n/languageConfig';
import {
    getRestaurantAudioWithPass,
    hasStoredAudioPassToken,
    AUDIO_PASS_TOKEN_CHANGED_EVENT,
} from '../services/audioGuideService';
import { getRestaurants } from '../services/restaurantService';
import { calculateDistanceInMeters } from '../utils/distance';
import { useSpeechNarration } from '../hooks/useSpeechNarration';

const AUTO_PLAY_RADIUS_METERS = 20;
const LEAVE_RADIUS_METERS = 35;
const MAX_ACCEPTED_ACCURACY_METERS = 80;

function isCustomerAudioRoute(pathname) {
    return (
        pathname === '/' ||
        pathname === '/home' ||
        pathname === '/map' ||
        pathname === '/bookmarks' ||
        pathname.startsWith('/restaurants/')
    );
}

function hasCoordinates(restaurant) {
    return (
        Number.isFinite(Number(restaurant?.latitude)) &&
        Number.isFinite(Number(restaurant?.longitude))
    );
}

function getNearestRestaurant(userLocation, restaurants) {
    return restaurants.reduce(
        (nearest, restaurant) => {
            if (!hasCoordinates(restaurant)) {
                return nearest;
            }

            const distance = calculateDistanceInMeters(userLocation, restaurant);

            if (!Number.isFinite(distance)) {
                return nearest;
            }

            if (!nearest || distance < nearest.distance) {
                return {
                    restaurant,
                    distance,
                };
            }

            return nearest;
        },
        null
    );
}

function NearbyAutoNarration() {
    const { language } = useLanguage();
    const location = useLocation();
    const shouldTrackNearbyRestaurants = isCustomerAudioRoute(
        location.pathname
    );
    const [hasAudioPass, setHasAudioPass] = useState(hasStoredAudioPassToken);
    const [restaurants, setRestaurants] = useState([]);
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const playedInRangeRef = useRef(new Set());
    const isFetchingAudioRef = useRef(false);

    const { isSpeaking, speakNarration, stopNarration } = useSpeechNarration({
        language,
        onStatus: setToast,
    });

    useEffect(() => {
        if (shouldTrackNearbyRestaurants) {
            return;
        }

        stopNarration();
        playedInRangeRef.current.clear();
    }, [shouldTrackNearbyRestaurants, stopNarration]);

    useEffect(() => {
        const syncAudioPassState = () => {
            setHasAudioPass(hasStoredAudioPassToken());
        };

        window.addEventListener(
            AUDIO_PASS_TOKEN_CHANGED_EVENT,
            syncAudioPassState
        );
        window.addEventListener('storage', syncAudioPassState);

        const intervalId = window.setInterval(syncAudioPassState, 5000);

        return () => {
            window.removeEventListener(
                AUDIO_PASS_TOKEN_CHANGED_EVENT,
                syncAudioPassState
            );
            window.removeEventListener('storage', syncAudioPassState);
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (!hasAudioPass || !shouldTrackNearbyRestaurants) {
            setRestaurants([]);
            return;
        }

        let isActive = true;

        getRestaurants()
            .then((data) => {
                if (isActive) {
                    setRestaurants(data);
                }
            })
            .catch(() => {
                if (isActive) {
                    setRestaurants([]);
                }
            });

        return () => {
            isActive = false;
        };
    }, [hasAudioPass, shouldTrackNearbyRestaurants]);

    useEffect(() => {
        if (
            !shouldTrackNearbyRestaurants ||
            !hasAudioPass ||
            restaurants.length === 0 ||
            !navigator.geolocation
        ) {
            return undefined;
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                const accuracy = Number(position.coords.accuracy);

                if (
                    Number.isFinite(accuracy) &&
                    accuracy > MAX_ACCEPTED_ACCURACY_METERS
                ) {
                    return;
                }

                const nearest = getNearestRestaurant(
                    userLocation,
                    restaurants
                );

                if (!nearest) {
                    return;
                }

                if (nearest.distance > LEAVE_RADIUS_METERS) {
                    playedInRangeRef.current.delete(nearest.restaurant.id);
                    return;
                }

                if (
                    nearest.distance > AUTO_PLAY_RADIUS_METERS ||
                    playedInRangeRef.current.has(nearest.restaurant.id) ||
                    isFetchingAudioRef.current
                ) {
                    return;
                }

                playedInRangeRef.current.add(nearest.restaurant.id);
                isFetchingAudioRef.current = true;

                try {
                    const audio = await getRestaurantAudioWithPass(
                        nearest.restaurant.id,
                        language,
                        { promptOnRequired: false }
                    );
                    const text = getLocalizedText(audio?.narration, language);

                    if (!text) {
                        return;
                    }

                    setToast({
                        message: `Bạn đang ở gần ${nearest.restaurant.name}. Tự phát thuyết minh.`,
                        type: 'info',
                    });
                    speakNarration(text, {
                        missingMessage:
                            'Quán này chưa có nội dung thuyết minh.',
                    });
                } catch {
                    // Auto-play must stay silent when the pass is expired,
                    // missing, or the restaurant narration cannot be loaded.
                } finally {
                    isFetchingAudioRef.current = false;
                }
            },
            () => undefined,
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [
        hasAudioPass,
        language,
        restaurants,
        shouldTrackNearbyRestaurants,
        speakNarration,
    ]);

    return (
        <>
            <ToastMessage
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'info' })}
            />
            <AudioStopButton
                visible={isSpeaking}
                onStop={stopNarration}
                label="Dừng nghe tự động"
            />
        </>
    );
}

export default NearbyAutoNarration;
