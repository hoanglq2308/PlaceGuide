function AudioStopButton({
    visible,
    onStop,
    label = 'Dừng nghe',
    className = '',
}) {
    if (!visible) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onStop}
            className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-[9999] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(183,20,34,0.35)] transition-transform hover:scale-[0.98] sm:left-auto sm:right-5 sm:translate-x-0 ${className}`}
            aria-label={label}
        >
            <span className="material-symbols-outlined text-[22px]">
                stop_circle
            </span>
            {label}
        </button>
    );
}

export default AudioStopButton;
