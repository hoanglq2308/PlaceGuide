const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5229/api'
).replace(/\/$/, '');

const ACTIVE_CHECKOUT_STORAGE_KEY = 'placeGuideActiveAudioPassCheckout';

function getApiUrl(path) {
  return `${API_URL}${path}`;
}

function createRequestError(response, data, fallbackMessage) {
  const error = new Error(
    data?.detail || data?.title || fallbackMessage
  );

  error.status = response.status;

  if (response.status === 404) {
    error.code = 'CHECKOUT_NOT_FOUND';
  }

  return error;
}

function isValidCheckout(checkout) {
  return Boolean(
    checkout &&
      typeof checkout.orderCode === 'string' &&
      typeof checkout.checkoutAccessToken === 'string' &&
      checkout.orderCode &&
      checkout.checkoutAccessToken
  );
}

export function getActiveAudioPassCheckout() {
  try {
    const storedCheckout = window.localStorage.getItem(
      ACTIVE_CHECKOUT_STORAGE_KEY
    );

    if (!storedCheckout) {
      return null;
    }

    const checkout = JSON.parse(storedCheckout);

    if (!isValidCheckout(checkout)) {
      clearActiveAudioPassCheckout();
      return null;
    }

    return checkout;
  } catch {
    clearActiveAudioPassCheckout();
    return null;
  }
}

export function saveActiveAudioPassCheckout(checkout) {
  if (!isValidCheckout(checkout)) {
    return;
  }

  window.localStorage.setItem(
    ACTIVE_CHECKOUT_STORAGE_KEY,
    JSON.stringify(checkout)
  );
}

export function clearActiveAudioPassCheckout() {
  window.localStorage.removeItem(ACTIVE_CHECKOUT_STORAGE_KEY);
}

export async function createAudioPassCheckout() {
  const response = await fetch(getApiUrl('/audio-passes/checkout'), {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createRequestError(
      response,
      data,
      'Không thể tạo đơn thanh toán AudioPass.'
    );
  }

  saveActiveAudioPassCheckout(data);

  return data;
}

export async function getAudioPassCheckoutStatus(
  orderCode,
  checkoutAccessToken
) {
  if (!orderCode || !checkoutAccessToken) {
    throw new Error('Thiếu thông tin bảo mật của đơn thanh toán.');
  }

  const response = await fetch(
    getApiUrl(`/audio-passes/checkout/${encodeURIComponent(orderCode)}`),
    {
      headers: {
        Accept: 'application/json',
        'X-Checkout-Access-Token': checkoutAccessToken
      }
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createRequestError(
      response,
      data,
      'Không thể kiểm tra trạng thái thanh toán.'
    );
  }

  return data;
}
