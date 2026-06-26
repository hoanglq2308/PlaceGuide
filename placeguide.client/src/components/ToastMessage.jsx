import { useEffect } from 'react';

function ToastMessage({
    message = '',
    type = 'success',
    onClose = () => { },
    duration = 3000,
}) {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const toastStyles = {
        success: 'bg-green-100 text-green-700 border-green-300',
        error: 'bg-red-100 text-red-700 border-red-300',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        info: 'bg-blue-100 text-blue-700 border-blue-300',
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };

    return (
        <div className="fixed right-4 top-4 z-[9999] max-w-[calc(100vw-2rem)] sm:right-6 sm:top-6">
            <div
                className={`w-full min-w-0 max-w-sm border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 animate-slide-in sm:min-w-[280px] ${toastStyles[type] || toastStyles.info
                    }`}
            >
                <span className="material-symbols-outlined text-[22px]">
                    {icons[type] || icons.info}
                </span>

                <p className="text-sm font-semibold flex-1">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-lg leading-none font-bold opacity-70 hover:opacity-100"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export default ToastMessage;
