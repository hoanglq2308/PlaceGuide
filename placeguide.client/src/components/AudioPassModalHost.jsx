import { useEffect, useState } from 'react';

const AUDIO_PASS_REQUIRED_EVENT = 'placeguide:audio-pass-required';

function AudioPassModalHost() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    window.__placeGuideAudioPassPromptReady = true;

    function handleAudioPassRequired(event) {
      setPrompt({
        message:
          event.detail?.message ||
          'Thuyết minh âm thanh yêu cầu AudioPass.',
        resolve: event.detail?.resolve
      });
    }

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

  function handleDismiss() {
    prompt?.resolve?.(false);
    setPrompt(null);
  }

  function handleBuyAudioPass() {
    setPrompt(null);

    window.location.assign('/audio-pass/checkout');
  }

  if (!prompt) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-pass-modal-title"
    >
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <p className="text-sm font-bold uppercase text-emerald-700">
          AudioPass
        </p>

        <h2
          id="audio-pass-modal-title"
          className="mt-2 text-xl font-bold text-red-800"
        >
          Mở thuyết minh âm thanh
        </h2>

        <p className="mt-3 leading-6 text-slate-600">{prompt.message}</p>

        <p className="mt-3 text-sm leading-5 text-slate-500">
          AudioPass cho phép nghe thuyết minh ẩm thực trong 24 giờ trên thiết
          bị này.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Để sau
          </button>

          <button
            type="button"
            onClick={handleBuyAudioPass}
            className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
          >
            Mua AudioPass
          </button>
        </div>
      </section>
    </div>
  );
}

export default AudioPassModalHost;