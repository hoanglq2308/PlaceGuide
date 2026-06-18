import { useEffect, useState } from 'react';

const AUDIO_PASS_REQUIRED_EVENT = 'placeguide:audio-pass-required';

function AudioPassModalHost() {
    const [pendingRequest, setPendingRequest] = useState(null);

    useEffect(() => {
        window.__placeGuideAudioPassPromptReady = true;

        const handleAudioPassRequired = (event) => {
            setPendingRequest({
                message: event.detail?.message,
                resolve: event.detail?.resolve,
            });
        };

        window.addEventListener(
            AUDIO_PASS_REQUIRED_EVENT,
            handleAudioPassRequired
        );

        return () => {
            window.__placeGuideAudioPassPromptReady = false;
            window.removeEventListener(
                AUDIO_PASS_REQUIRED_EVENT,
                handleAudioPassRequired
            );
        };
    }, []);

    if (!pendingRequest) {
        return null;
    }

    const handleClose = (accepted) => {
        pendingRequest.resolve?.(accepted);
        setPendingRequest(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <section className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-100 overflow-hidden">
                <div className="bg-red-700 text-white px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center">
                            <span className="material-symbols-outlined">
                                headphones
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                                Premium Audio Guide
                            </p>
                            <h2 className="text-2xl font-extrabold">
                                Mở khóa thuyết minh
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <p className="text-sm leading-6 text-gray-700">
                        Tính năng nghe thuyết minh dành cho khách du lịch cần
                        gói premium. Trong bản demo này, bạn có thể kích hoạt
                        gói nghe thử 24 giờ để test flow trước khi nối payment
                        thật.
                    </p>

                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-700">
                                verified
                            </span>
                            <div>
                                <h3 className="font-bold text-green-900">
                                    1-Day Audio Pass
                                </h3>
                                <p className="text-sm text-green-900/75 mt-1">
                                    Nghe thuyết minh quán ăn và món ăn trong 24
                                    giờ trên thiết bị hiện tại.
                                </p>
                            </div>
                        </div>
                    </div>

                    {pendingRequest.message && (
                        <p className="text-xs text-gray-500">
                            {pendingRequest.message}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => handleClose(true)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                lock_open
                            </span>
                            Kích hoạt demo pass
                        </button>

                        <button
                            type="button"
                            onClick={() => handleClose(false)}
                            className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AudioPassModalHost;