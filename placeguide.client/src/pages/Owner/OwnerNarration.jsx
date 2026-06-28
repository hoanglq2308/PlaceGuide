// pages/owner/OwnerNarration.jsx
import { useEffect, useState } from 'react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getOwnerNarrations, saveNarrationText } from '../../services/ownerService';

const LANGUAGES = [
  { code: 'vi',    label: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'en',    label: 'English',    flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'ko',    label: '한국어',       flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'zh-CN', label: '中文 简体',   flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'zh-TW', label: '中文 繁體',   flag: '🇹🇼', speechCode: 'zh-TW' },
  { code: 'ja',    label: '日本語',       flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'th',    label: 'ภาษาไทย',     flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'fr',    label: 'Français',   flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'ru',    label: 'Русский',    flag: '🇷🇺', speechCode: 'ru-RU' },
];

const MAX = 3000;

function OwnerNarration() {
  const [selectedLang, setSelectedLang] = useState('vi');
  const [texts, setTexts] = useState({});
  const [storyFallback, setStoryFallback] = useState('');
  const [descriptionFallback, setDescriptionFallback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    getOwnerNarrations()
      .then((data) => {
        setStoryFallback(data.storyFallback ?? '');
        setDescriptionFallback(data.descriptionFallback ?? '');
        const map = {};
        for (const t of data.translations ?? []) map[t.languageCode] = t.narration;
        setTexts(map);
      })
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setIsLoading(false));

    return () => window.speechSynthesis?.cancel();
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang);
  const currentText = texts[selectedLang] ?? '';

  function handleLangChange(code) {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSelectedLang(code);
    setMessage({ text: '', type: '' });
  }

  function handleTextChange(value) {
    setTexts((prev) => ({ ...prev, [selectedLang]: value }));
    setMessage({ text: '', type: '' });
  }

  function fillFromStory() {
    const fallback = storyFallback || descriptionFallback;
    if (!fallback) {
      setMessage({ text: 'Quán chưa có nội dung Story hoặc Mô tả.', type: 'error' });
      return;
    }
    handleTextChange(fallback);
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await saveNarrationText(selectedLang, currentText.trim());
      setMessage({ text: `✅ Đã lưu thuyết minh [${currentLang?.label}].`, type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSpeak() {
    if (!currentText.trim() || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentText.trim());
    utterance.lang = currentLang?.speechCode ?? selectedLang;
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleStop() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] lg:flex">
      <OwnerSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
        <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">Thuyết minh</h1>
        <p className="mt-1 text-sm text-[#6e6a66]">
          Soạn nội dung thuyết minh giới thiệu quán theo từng ngôn ngữ cho khách nghe.
        </p>

        <section className="mt-6 max-w-2xl rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-6 shadow-sm">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#6e6a66]">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              Đang tải...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Hướng dẫn */}
              <div className="rounded-lg border border-[#ffdda3] bg-[#fff8eb] px-4 py-3 text-sm text-[#7a4b00]">
                <span className="material-symbols-outlined mr-1 align-middle text-[17px]">info</span>
                Nhập nội dung thuyết minh cho từng ngôn ngữ. Khách bấm{' '}
                <strong>"Nghe"</strong> trong app sẽ nghe máy đọc theo ngôn ngữ họ đang chọn.
              </div>

              {/* Chọn ngôn ngữ */}
              <div>
                <p className="mb-2 text-sm font-bold text-[#1a1c1a]">Chọn ngôn ngữ</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const done = !!(texts[lang.code]?.trim());
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLangChange(lang.code)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all ${
                          selectedLang === lang.code
                            ? 'border-[#b71422] bg-[#b71422] text-white shadow'
                            : done
                              ? 'border-[#b7e2bf] bg-[#e9f8ed] text-[#1b6d24]'
                              : 'border-[#e5e1da] bg-white text-[#6e6a66] hover:border-[#b71422] hover:text-[#b71422]'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {done && selectedLang !== lang.code && (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={currentText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  maxLength={MAX}
                  rows={7}
                  placeholder={`Nhập nội dung thuyết minh bằng ${currentLang?.label}...`}
                  className="w-full resize-none rounded-xl border border-[#e5e1da] bg-[#f4f3f1] px-4 py-3 text-sm text-[#1a1c1a] placeholder-[#a09d9a] outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                />
                <span className={`absolute bottom-3 right-3 text-xs ${currentText.length > MAX * 0.9 ? 'text-[#b71422]' : 'text-[#a09d9a]'}`}>
                  {currentText.length}/{MAX}
                </span>
              </div>

              {/* Lấy từ Story (chỉ hiện khi chọn tiếng Việt) */}
              {selectedLang === 'vi' && (storyFallback || descriptionFallback) && (
                <button
                  type="button"
                  onClick={fillFromStory}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm font-bold text-[#5b403e] hover:bg-[#f4f3f1]"
                >
                  <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                  Lấy từ Story / Mô tả của quán
                </button>
              )}

              {/* Thông báo */}
              {message.text && (
                <p className={`text-sm font-bold ${message.type === 'success' ? 'text-[#1b6d24]' : 'text-[#b42318]'}`}>
                  {message.text}
                </p>
              )}

              {/* Hành động */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={isSpeaking ? handleStop : handleSpeak}
                  disabled={!currentText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#b7e2bf] bg-[#f0fbf3] px-4 py-2.5 text-sm font-bold text-[#1b6d24] disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {isSpeaking ? 'stop_circle' : 'play_circle'}
                  </span>
                  {isSpeaking ? 'Dừng' : 'Nghe thử'}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !currentText.trim()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#b71422] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:flex-none"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[19px]">save</span>
                      Lưu [{currentLang?.label}]
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default OwnerNarration;