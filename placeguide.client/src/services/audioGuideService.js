import {
    clearActiveAudioPassCheckout,
    getActiveAudioPassCheckout,
    getAudioPassCheckoutStatus,
    saveActiveAudioPassCheckout,
} from './audioPassCheckoutService';

const API_URL = import.meta.env.VITE_API_URL?.replace (/\/$/, '');
const AUDIO_PASS_REQUIRED_EVENT = 'placeguide:audio-pass-required';
const AUDIO_PASS_TOKEN_KEY = 'placeGuideAudioPassToken';

function getApiUrl(path){
    if(!API_URL)
        throw new Error(' Thiếu Cấu HÌnh VITE_API_URL');
    return `${API_URL}${path}`;

}
function getStoreAudioPassToken(){
    return localStorage.getItem(AUDIO_PASS_TOKEN_KEY);
}
export function saveAudioPassToken(token){
    if(!token)
        return;
    localStorage.setItem(AUDIO_PASS_TOKEN_KEY,token);
}

function clearAudioPassToken(){
    localStorage.removeItem(AUDIO_PASS_TOKEN_KEY);
}

function getAuthHeaders(){
    const headers = {};
    const audioPassToken = getStoreAudioPassToken();
    const authToken = localStorage.getItem('token');
    if(audioPassToken){
        headers['X-Premium-Pass']= audioPassToken;
    }
    if(authToken){
        headers.Authorization = `Bearer ${authToken}`;}
    return headers;
}
function getErrorMessage(result) {
    if (typeof result === 'string' && result.trim()) {
        return result;
    }

    return (
        result?.message ||
        result?.Message ||
        result?.title ||
        'Không thể tải nội dung thuyết minh.'
    );
    
}
async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}
async function handleResponse(response) {
    const result = await parseResponse(response);

    if (!response.ok) {
        const error = new Error(getErrorMessage(result));
        error.status = response.status;
        error.code = result?.code || result?.status;
        throw error;
    }

    return result;
}
function isAudioPassRequiredError(error) {
    return (
        error?.status === 402 ||
        error?.code === 'AUDIO_PASS_REQUIRED' ||
        error?.code === 'unpaid'
    );
}
function requestAudioPassPurchasePrompt(message) {
    if (!window.__placeGuideAudioPassPromptReady) {
        return Promise.resolve(
            window.confirm(
                'Audio guide is a premium feature. Kích hoạt gói nghe thử 24 giờ để test flow thanh toán?'
            )
        );
    }

    return new Promise((resolve) => {
        window.dispatchEvent(
            new CustomEvent(AUDIO_PASS_REQUIRED_EVENT, {
                detail: {
                    message,
                    resolve,
                },
            })
        );
    });
}

async function requestPremiumAudio(path) {
    const response = await fetch(getApiUrl(path), {
        headers: getAuthHeaders(),
    });

    return handleResponse(response);
}

async function restoreAudioPassFromPaidCheckout() {
    const activeCheckout = getActiveAudioPassCheckout();

    if (!activeCheckout) {
        return false;
    }

    try {
        const checkoutStatus = await getAudioPassCheckoutStatus(
            activeCheckout.orderCode,
            activeCheckout.checkoutAccessToken
        );

        const updatedCheckout = {
            ...activeCheckout,
            ...checkoutStatus,
        };

        saveActiveAudioPassCheckout(updatedCheckout);

        if (updatedCheckout.audioPassToken) {
            saveAudioPassToken(updatedCheckout.audioPassToken);
            return true;
        }
    } catch (error) {
        if (error.code === 'CHECKOUT_NOT_FOUND') {
            clearActiveAudioPassCheckout();
        }
    }

    return false;
}

async function withGuestAudioPass(fetchAudio) {
  try {
    return await fetchAudio();
  } catch (error) {
    if (!isAudioPassRequiredError(error)) {
      throw error;
    }

    clearAudioPassToken();

    if (await restoreAudioPassFromPaidCheckout()) {
      return fetchAudio();
    }

    await requestAudioPassPurchasePrompt(error.message);

    throw error;
  }
}

export async function getRestaurantAudioWithPass(restaurantId) {
    if (!restaurantId) {
        throw new Error('Thiếu mã quán ăn!');
    }

    return withGuestAudioPass(() =>
        requestPremiumAudio(
            `/restaurants/${encodeURIComponent(restaurantId)}/audio`
        )
    );
}

export async function getDishAudioWithPass(restaurantId, dishId) {
    if (!restaurantId || !dishId) {
        throw new Error('Thiếu mã quán ăn hoặc món ăn!');
    }

    return withGuestAudioPass(() =>
        requestPremiumAudio(
            `/restaurants/${encodeURIComponent(
                restaurantId
            )}/dishes/${encodeURIComponent(dishId)}/audio`
        )
    );
}
