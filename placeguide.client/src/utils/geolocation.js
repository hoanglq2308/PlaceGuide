/**
 * Geolocation Utility Helper
 */

/**
 * Check if the browser supports the Geolocation API.
 * @returns {boolean}
 */
export function isGeolocationSupported() {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Check if the current context is secure (HTTPS or localhost).
 * Mobile browsers require a secure context to use the Geolocation API.
 * @returns {boolean}
 */
export function isSecureGeolocationContext() {
    // localhost/127.0.0.1 is usually considered secure by browsers,
    // but http://192.168.x.x is considered insecure.
    return typeof window !== 'undefined' && window.isSecureContext === true;
}

/**
 * Query the Permissions API for geolocation status if available.
 * NOTE: Not supported in all browsers (e.g., older Safari).
 * @returns {Promise<PermissionStatus|null>}
 */
export async function queryGeolocationPermission() {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        try {
            return await navigator.permissions.query({ name: 'geolocation' });
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Permissions API query failed:', e);
            }
        }
    }
    return null;
}

/**
 * Safely get the user's current location with custom option parameters.
 * Proactively checks for secure contexts to provide detailed developer feedback.
 * 
 * @param {PositionOptions} options
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: number}>}
 */
export function getCurrentUserLocation(options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
}) {
    return new Promise((resolve, reject) => {
        // 1. Proactively check if context is secure
        if (!isSecureGeolocationContext()) {
            reject({
                code: 'INSECURE_CONTEXT',
                message: 'Trình duyệt chỉ cho phép lấy vị trí trên HTTPS hoặc localhost. Khi test bằng điện thoại qua IP LAN, hãy dùng HTTPS tunnel như ngrok/cloudflared hoặc cấu hình HTTPS cho Vite.'
            });
            return;
        }

        // 2. Check if geolocation is supported
        if (!isGeolocationSupported()) {
            reject({
                code: 'GEOLOCATION_UNSUPPORTED',
                message: 'Trình duyệt này không hỗ trợ lấy vị trí.'
            });
            return;
        }

        // 3. Request location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            async (error) => {
                let code = 'UNKNOWN_ERROR';
                let message = error.message;

                // Query permission status to provide more context if possible
                let permissionState = null;
                try {
                    const permission = await queryGeolocationPermission();
                    if (permission) {
                        permissionState = permission.state;
                    }
                } catch (e) {
                    // Ignore permission query error
                }

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        code = 'PERMISSION_DENIED';
                        message = 'Bạn đã từ chối quyền vị trí. Hãy bật quyền vị trí cho trình duyệt rồi thử lại.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        code = 'POSITION_UNAVAILABLE';
                        message = 'Thiết bị chưa cung cấp được vị trí hiện tại. Vui lòng bật GPS hoặc thử lại.';
                        break;
                    case error.TIMEOUT:
                        code = 'TIMEOUT';
                        message = 'Không lấy được vị trí trong thời gian cho phép. Vui lòng thử lại hoặc kiểm tra GPS.';
                        break;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Geolocation Debug]', {
                        href: window.location.href,
                        isSecureContext: window.isSecureContext,
                        errorCode: error.code,
                        errorMsg: error.message,
                        mappedCode: code,
                        permissionState
                    });
                }

                reject({
                    code,
                    message,
                    originalError: error,
                    permissionState
                });
            },
            options
        );
    });
}
