import { useState } from 'react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { uploadNarrationAudio } from '../../services/ownerService';

function OwnerNarration() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  function handleFileChange(event) {
    setFile(event.target.files?.[0] || null);
    setMessage({ text: '', type: '' });
  }

  async function handleUpload() {
    if (!file) {
      setMessage({ text: 'Vui lòng chọn file audio (.mp3, .wav).', type: 'error' });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setMessage({ text: '', type: '' });

    try {
      await uploadNarrationAudio(file, (event) => {
        setProgress(Math.round((event.loaded * 100) / event.total));
      });
      setMessage({ text: 'Tải file thuyết minh thành công.', type: 'success' });
      setFile(null);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] lg:flex">
      <OwnerSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
        <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">Thuyết minh</h1>
        <p className="mt-1 text-sm text-[#6e6a66]">Tải lên file audio thuyết minh cho quán.</p>

        <section className="mt-6 max-w-xl rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-6 shadow-sm">
          <label className="grid h-40 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#e5e1da] bg-[#f4f3f1] text-center hover:border-[#b71422]">
            {file ? (
              <span className="px-4 text-sm font-bold text-[#1a1c1a]">{file.name}</span>
            ) : (
              <span className="px-4 text-sm font-bold text-[#b71422]">
                <span className="material-symbols-outlined mb-2 block text-[34px]">mic</span>
                Chọn file MP3/WAV
              </span>
            )}
            <input type="file" accept="audio/mpeg,audio/wav,.mp3,.wav" className="hidden" onChange={handleFileChange} />
          </label>

          {isUploading && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e3e2e0]">
              <div className="h-full bg-[#b71422] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {message.text && (
            <p className={`mt-4 text-sm font-bold ${message.type === 'success' ? 'text-[#1b6d24]' : 'text-[#b42318]'}`}>
              {message.text}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-5 w-full rounded-lg bg-[#b71422] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isUploading ? `Đang tải lên... ${progress}%` : 'Tải lên'}
          </button>
        </section>
      </main>
    </div>
  );
}

export default OwnerNarration;