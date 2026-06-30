import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ToastMessage from '../../components/ToastMessage';
import {
  autoTranslateNarration,
  getAdminNarrationDetail,
  getAdminNarrations,
  updateAdminNarration
} from '../../services/adminNarrationService';
import {
  getLanguageDisplayName,
  LANGUAGE_OPTIONS
} from '../../i18n/languageConfig';

const PAGE_SIZE = 10;
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';

const LANGUAGES = LANGUAGE_OPTIONS.map((language) => ({
  code: language.code,
  label: getLanguageDisplayName(language.code, 'vi'),
  shortLabel: language.shortLabel,
  speechCode: language.speechLocale
}));

// Đây là nhóm ngôn ngữ LibreTranslate có mã hỗ trợ phổ biến.
// Server local vẫn cần tải model tương ứng thì mới dịch tự động được.
const AUTO_TRANSLATE_LANGUAGE_CODES = [
  'en',
  'zh-CN',
  'zh-TW',
  'ko',
  'ja',
  'th',
  'id',
  'ms',
  'tl',
  'de',
  'es',
  'hi',
  'fr',
  'ru'
];
const AUTO_TRANSLATE_LANGUAGE_SET = new Set(AUTO_TRANSLATE_LANGUAGE_CODES);
const AUTO_TRANSLATE_LANGUAGES = LANGUAGES.filter((language) =>
  AUTO_TRANSLATE_LANGUAGE_SET.has(language.code)
);

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'complete', label: 'Đầy đủ' },
  { value: 'missing', label: 'Thiếu nội dung' },
  { value: 'needsUpdate', label: 'Cần cập nhật' }
];

function getStoredUserName() {
  try {
    return (
      JSON.parse(window.localStorage.getItem('user') || '{}').fullName ||
      'Quản trị viên'
    );
  } catch {
    return 'Quản trị viên';
  }
}

function formatDate(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function languageLabel(languageCode) {
  return (
    LANGUAGES.find((language) => language.code === languageCode)?.shortLabel ||
    languageCode.toUpperCase()
  );
}

function createDraft(translation) {
  return {
    narration: translation?.narration || '',
    name: translation?.name || '',
    description: translation?.description || '',
    tags: translation?.tags || '',
    highlightDishes: translation?.highlightDishes || ''
  };
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`rounded-xl border border-[#e5e1da] bg-white p-5 shadow-sm ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#6e6a66]">
          {label}
        </p>
        <span className="material-symbols-outlined text-[22px] text-[#8f6f6d]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-[#1a1c1a]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const presentations = {
    complete: {
      icon: 'check_circle',
      label: 'Đầy đủ',
      className: 'border-[#b7e2bf] bg-[#e9f8ed] text-[#1b6d24]'
    },
    needsUpdate: {
      icon: 'update',
      label: 'Cần cập nhật',
      className: 'border-[#ffdda3] bg-[#fff4e0] text-[#8a5100]'
    },
    missing: {
      icon: 'error',
      label: 'Thiếu nội dung',
      className: 'border-[#fecaca] bg-[#fff0f0] text-[#b42318]'
    }
  };
  const presentation = presentations[status] || presentations.missing;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold ${presentation.className}`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {presentation.icon}
      </span>
      {presentation.label}
    </span>
  );
}

export default function AdminNarrations() {
  const adminName = useMemo(getStoredUserName, []);
  const [contentType, setContentType] = useState('restaurant');
  const [languageCode, setLanguageCode] = useState('vi');
  const [status, setStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    summary: {
      totalItems: 0,
      vietnameseReady: 0,
      englishMissing: 0,
      missingNarration: 0,
      needsUpdate: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLanguageCode, setDetailLanguageCode] = useState('vi');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [draft, setDraft] = useState(createDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoTranslateOpen, setIsAutoTranslateOpen] = useState(false);
  const [autoTranslateTargets, setAutoTranslateTargets] = useState([]);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [contentType, languageCode, status, debouncedSearch]);

  const loadNarrations = useCallback(async ({ keepLoading = false } = {}) => {
    if (!keepLoading) {
      setIsLoading(true);
    }

    try {
      const response = await getAdminNarrations({
        contentType,
        languageCode,
        status,
        search: debouncedSearch,
        page,
        pageSize: PAGE_SIZE
      });
      setData(response);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, debouncedSearch, languageCode, page, status]);

  useEffect(() => {
    void loadNarrations();
  }, [loadNarrations]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const currentTranslation = useMemo(
    () =>
      detail?.translations?.find(
        (translation) => translation.languageCode === detailLanguageCode
      ) || null,
    [detail, detailLanguageCode]
  );

  useEffect(() => {
    setDraft(createDraft(currentTranslation));
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [currentTranslation]);

  const openDetail = async (item) => {
    setIsPanelOpen(true);
    setIsDetailLoading(true);
    setDetailError('');
    setDetailLanguageCode(languageCode);
    setDetail(null);

    try {
      const response = await getAdminNarrationDetail(
        item.contentType,
        item.id,
        languageCode
      );
      setDetail(response);
    } catch (requestError) {
      setDetailError(requestError.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closePanel = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPanelOpen(false);
    setIsAutoTranslateOpen(false);
    setDetail(null);
    setDetailError('');
  };

  const updateDraftField = (field, value) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handleSpeak = () => {
    if (!draft.narration.trim()) {
      return;
    }

    if (!('speechSynthesis' in window)) {
      setToast({
        message: 'Trình duyệt này không hỗ trợ nghe thử thuyết minh.',
        type: 'warning'
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(draft.narration.trim());
    const language = LANGUAGES.find(
      (item) => item.code === detailLanguageCode
    );
    utterance.lang = language?.speechCode || detailLanguageCode;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleCopyVietnamese = () => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      narration: detail?.sourceVietnameseNarration || ''
    }));
    setToast({
      message: 'Đã sao chép nội dung tiếng Việt. Vui lòng chỉnh sửa bản dịch rồi lưu.',
      type: 'info'
    });
  };

  const handleSave = async () => {
    if (!detail || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedDetail = await updateAdminNarration(
        detail.contentType,
        detail.id,
        detailLanguageCode,
        draft
      );
      setDetail(updatedDetail);
      setToast({
        message:
          detailLanguageCode === 'vi'
            ? 'Đã lưu tiếng Việt. Các bản dịch khác đã được đánh dấu cần cập nhật.'
            : 'Đã lưu bản dịch và đánh dấu là đã cập nhật.',
        type: 'success'
      });
      await loadNarrations({ keepLoading: true });
    } catch (requestError) {
      setToast({ message: requestError.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const openAutoTranslateDialog = () => {
    if (!detail?.sourceVietnameseNarration || isAutoTranslating) {
      return;
    }

    const isTranslateAll = detailLanguageCode === 'vi';

    if (!isTranslateAll && !AUTO_TRANSLATE_LANGUAGE_SET.has(detailLanguageCode)) {
      setToast({
        message:
          'Provider dịch hiện tại chưa hỗ trợ tự động dịch ngôn ngữ này. Bạn có thể nhập thủ công hoặc đổi provider sang Gemini/Azure.',
        type: 'warning'
      });
      return;
    }

    setAutoTranslateTargets(
      isTranslateAll
        ? AUTO_TRANSLATE_LANGUAGES.map((language) => language.code)
        : [detailLanguageCode]
    );
    setOverwriteExisting(!isTranslateAll);
    setIsAutoTranslateOpen(true);
  };

  const handleAutoTranslate = async () => {
    if (!detail || autoTranslateTargets.length === 0 || isAutoTranslating) {
      return;
    }

    setIsAutoTranslating(true);

    try {
      const result = await autoTranslateNarration(
        detail.contentType,
        detail.id,
        {
          sourceLanguageCode: 'vi',
          targetLanguageCodes: autoTranslateTargets,
          overwriteExisting
        }
      );
      const refreshedDetail = await getAdminNarrationDetail(
        detail.contentType,
        detail.id,
        detailLanguageCode
      );
      setDetail(refreshedDetail);
      await loadNarrations({ keepLoading: true });
      setIsAutoTranslateOpen(false);
      const providerSuffix =
        result.providerName && result.providerName !== 'NotConfigured'
          ? ` Provider: ${result.providerName}.`
          : '';

      setToast({
        message:
          `${
            result.message ||
            (result.failedCount > 0
              ? `Đã dịch ${result.successCount}/${result.totalTargets} ngôn ngữ. Một số ngôn ngữ dịch thất bại.`
              : `Đã dịch thành công ${result.successCount}/${result.totalTargets} ngôn ngữ.`)
          }${providerSuffix}`,
        type: result.failedCount > 0 ? 'warning' : 'success'
      });
    } catch (requestError) {
      setToast({
        message: requestError.message,
        type: 'error'
      });
    } finally {
      setIsAutoTranslating(false);
    }
  };

  const totalPages = Math.max(1, data.totalPages || 1);
  const firstItem =
    data.totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, data.totalItems);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-['Be_Vietnam_Pro'] text-[#1a1c1a] lg:flex">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
      <AdminSidebar adminName={adminName} />

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-[#b71422] sm:text-2xl">
                Quản lý Thuyết minh
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6e6a66]">
                Kiểm tra, chỉnh sửa và nghe thử nội dung thuyết minh đa ngôn ngữ.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-5 lg:p-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="library_books"
              label="Tổng nội dung"
              value={data.summary?.totalItems ?? 0}
            />
            <StatCard
              icon="translate"
              label="Đã có tiếng Việt"
              value={data.summary?.vietnameseReady ?? 0}
              accent="border-l-4 border-l-[#006e2f]"
            />
            <StatCard
              icon="language"
              label="Thiếu tiếng Anh"
              value={data.summary?.englishMissing ?? 0}
              accent="border-l-4 border-l-[#c47120]"
            />
            <StatCard
              icon="record_voice_over"
              label="Thiếu thuyết minh"
              value={data.summary?.missingNarration ?? 0}
              accent="border-l-4 border-l-[#b71422]"
            />
          </section>

          <section className="overflow-hidden rounded-xl border border-[#e5e1da] bg-white shadow-sm">
            <div className="flex border-b border-[#e5e1da] px-4 pt-3 sm:px-6">
              {[
                { value: 'restaurant', label: 'Nhà hàng', icon: 'restaurant' },
                { value: 'dish', label: 'Món ăn', icon: 'ramen_dining' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setContentType(tab.value)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                    contentType === tab.value
                      ? 'border-[#b71422] text-[#b71422]'
                      : 'border-transparent text-[#6e6a66] hover:text-[#1a1c1a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-b border-[#e5e1da] bg-[#f4f3f1]/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:min-w-[320px] xl:w-[460px]">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#6e6a66]">
                  search
                </span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm theo tên quán, tên món hoặc nội dung..."
                  aria-label="Tìm kiếm thuyết minh"
                  className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#6e6a66] transition-colors hover:bg-[#efeeeb] hover:text-[#b71422]"
                    aria-label="Xóa từ khóa tìm kiếm thuyết minh"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              <select
                value={languageCode}
                onChange={(event) => setLanguageCode(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] sm:w-auto"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label} ({language.shortLabel})
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] sm:w-auto"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void loadNarrations()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e1da] bg-white px-4 text-sm font-bold text-[#5b403e] hover:bg-[#efeeeb]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  refresh
                </span>
                Làm mới
              </button>

              <button
                type="button"
                disabled
                title="Chức năng xuất dữ liệu sẽ được bổ sung sau"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e4beba] bg-white px-4 text-sm font-bold text-[#b71422] opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Xuất
              </button>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="grid min-h-72 place-items-center text-sm text-[#6e6a66]">
                  <div className="text-center">
                    <span className="material-symbols-outlined animate-spin text-[36px]">
                      progress_activity
                    </span>
                    <p className="mt-2">Đang tải nội dung thuyết minh...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="grid min-h-72 place-items-center p-5 text-center">
                  <div>
                    <span className="material-symbols-outlined text-[38px] text-[#b42318]">
                      error
                    </span>
                    <p className="mt-2 font-bold text-[#b42318]">
                      Không thể tải danh sách thuyết minh.
                    </p>
                    <p className="mt-1 text-sm text-[#6e6a66]">{error}</p>
                    <button
                      type="button"
                      onClick={() => void loadNarrations()}
                      className="mt-4 rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : data.items.length === 0 ? (
                <div className="grid min-h-72 place-items-center text-center text-[#6e6a66]">
                  <div>
                    <span className="material-symbols-outlined text-[40px]">
                      voice_selection
                    </span>
                    <p className="mt-2">Chưa có nội dung thuyết minh nào.</p>
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead className="bg-[#f4f3f1]">
                    <tr className="text-xs uppercase tracking-wide text-[#6e6a66]">
                      <th className="px-4 py-3 font-bold">Nội dung</th>
                      <th className="px-4 py-3 font-bold">Loại</th>
                      <th className="px-4 py-3 font-bold">Ngôn ngữ hiện có</th>
                      <th className="px-4 py-3 font-bold">Trạng thái</th>
                      <th className="px-4 py-3 font-bold">Cập nhật</th>
                      <th className="px-4 py-3 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e1da]">
                    {data.items.map((item) => (
                      <tr
                        key={`${item.contentType}-${item.id}`}
                        onClick={() => void openDetail(item)}
                        className="cursor-pointer transition-colors hover:bg-[#fdfcfb]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={item.imageUrl || FALLBACK_IMAGE}
                              alt={item.title}
                              className="h-12 w-12 shrink-0 rounded-lg border border-[#e5e1da] object-cover"
                            />
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate text-sm font-bold">
                                {item.title}
                              </p>
                              <p className="mt-1 max-w-[260px] truncate text-xs text-[#6e6a66]">
                                {item.subtitle || 'Chưa có thông tin phụ'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-[#efeeeb] px-2 py-1 text-xs font-bold text-[#5b403e]">
                            {item.contentType === 'restaurant'
                              ? 'Nhà hàng'
                              : 'Món ăn'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex max-w-[230px] flex-wrap gap-1">
                            {item.availableLanguages.length > 0 ? (
                              item.availableLanguages.map((code) => {
                                const needsUpdate =
                                  item.needsUpdateLanguages?.includes(code);

                                return (
                                  <span
                                    key={code}
                                    className={`rounded border px-1.5 py-1 text-[10px] font-bold ${
                                      needsUpdate
                                        ? 'border-[#ffdda3] bg-[#fff4e0] text-[#8a5100]'
                                        : 'border-[#b7e2bf] bg-[#e9f8ed] text-[#1b6d24]'
                                    }`}
                                  >
                                    {languageLabel(code)}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-[#8f6f6d]">
                                Chưa có
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6e6a66]">
                          {formatDate(item.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void openDetail(item);
                              }}
                              className="rounded-md p-2 text-[#6e6a66] hover:bg-[#efeeeb] hover:text-[#b71422]"
                              title="Xem và chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[19px]">
                                edit
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!isLoading && !error && data.totalItems > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e1da] bg-[#f4f3f1] px-4 py-3 text-xs text-[#6e6a66]">
                <span>
                  Hiển thị {firstItem}-{lastItem} trong số {data.totalItems} nội dung
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-[#e5e1da] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="font-bold">
                    {page}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page >= totalPages}
                    className="rounded-lg border border-[#e5e1da] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <div
        className={`fixed inset-0 z-[70] transition ${
          isPanelOpen
            ? 'pointer-events-auto bg-black/25 opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          aria-label="Đóng panel"
          onClick={closePanel}
          className="absolute inset-0 h-full w-full cursor-default"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-[620px] flex-col border-l border-[#e5e1da] bg-[#faf9f6] shadow-2xl transition-transform duration-300 ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <header className="flex items-start justify-between gap-4 border-b border-[#e5e1da] bg-white p-4 sm:p-5">
            {detail ? (
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={detail.imageUrl || FALLBACK_IMAGE}
                  alt={detail.title}
                  className="h-14 w-14 shrink-0 rounded-lg border border-[#e5e1da] object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold sm:text-lg">
                    {detail.title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-[#6e6a66]">
                    {detail.contentType === 'restaurant'
                      ? 'Nhà hàng'
                      : `Món ăn tại ${detail.restaurantName}`}
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="font-extrabold">Chi tiết thuyết minh</h2>
            )}
            <button
              type="button"
              onClick={closePanel}
              className="rounded-full p-1 text-[#6e6a66] hover:bg-[#efeeeb]"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {isDetailLoading ? (
              <div className="grid min-h-72 place-items-center text-[#6e6a66]">
                <span className="material-symbols-outlined animate-spin text-[36px]">
                  progress_activity
                </span>
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
                {detailError}
              </div>
            ) : detail ? (
              <div className="space-y-5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {LANGUAGES.map((language) => {
                    const translation = detail.translations?.find(
                      (item) => item.languageCode === language.code
                    );

                    return (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => {
                          setDetailLanguageCode(language.code);
                          setLanguageCode(language.code);
                        }}
                        className={`flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold ${
                          translation?.isMissing
                            ? 'border-[#fecaca] bg-[#fff0f0] text-[#b42318]'
                            : translation?.needsUpdate
                              ? 'border-[#ffdda3] bg-[#fff4e0] text-[#8a5100]'
                              : detailLanguageCode === language.code
                                ? 'border-[#b71422] bg-[#fff0f0] text-[#b71422]'
                                : 'border-[#b7e2bf] bg-[#e9f8ed] text-[#1b6d24]'
                        } ${
                          detailLanguageCode === language.code
                            ? 'ring-2 ring-[#b71422]/20'
                            : ''
                        }`}
                      >
                        {language.shortLabel}
                        <span
                          className={`h-2 w-2 rounded-full ${
                            translation?.isMissing
                              ? 'bg-[#b42318]'
                              : translation?.needsUpdate
                                ? 'bg-[#c47120]'
                                : 'bg-[#22c55e]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {currentTranslation?.isMissing && (
                  <div className="flex items-start gap-2 rounded-lg border border-[#ffdda3] bg-[#fff4e0] p-3 text-sm text-[#8a5100]">
                    <span className="material-symbols-outlined text-[19px]">
                      warning
                    </span>
                    Ngôn ngữ này chưa có nội dung thuyết minh.
                  </div>
                )}

                {currentTranslation?.needsUpdate && (
                  <div className="flex items-start gap-2 rounded-lg border border-[#ffdda3] bg-[#fff4e0] p-3 text-sm text-[#8a5100]">
                    <span className="material-symbols-outlined text-[19px]">
                      update
                    </span>
                    Bản dịch này cần cập nhật lại theo nội dung tiếng Việt mới.
                  </div>
                )}

                {!currentTranslation?.isMissing &&
                  !currentTranslation?.needsUpdate &&
                  detailLanguageCode !== 'vi' && (
                    <div className="flex items-start gap-2 rounded-lg border border-[#b7e2bf] bg-[#f0fbf3] p-3 text-sm text-[#1b6d24]">
                      <span className="material-symbols-outlined text-[19px]">
                        check_circle
                      </span>
                      Bản dịch đang được cập nhật.
                    </div>
                  )}

                {currentTranslation?.isAutoTranslated && (
                  <div className="flex items-start gap-2 rounded-lg border border-[#d5e3f8] bg-[#f3f7fd] p-3 text-xs text-[#315c91]">
                    <span className="material-symbols-outlined text-[18px]">
                      translate
                    </span>
                    Nội dung được dịch tự động từ{' '}
                    {(currentTranslation.autoTranslatedFrom || 'vi').toUpperCase()}
                    {currentTranslation.autoTranslatedAt
                      ? ` lúc ${formatDate(currentTranslation.autoTranslatedAt)}`
                      : ''}
                    .
                  </div>
                )}

                {detailLanguageCode === 'vi' && (
                  <div className="flex items-start gap-2 rounded-lg border border-[#d5e3f8] bg-[#f3f7fd] p-3 text-sm text-[#315c91]">
                    <span className="material-symbols-outlined text-[19px]">
                      info
                    </span>
                    Tiếng Việt là nội dung gốc. Khi lưu, các bản dịch khác sẽ
                    được đánh dấu cần cập nhật.
                  </div>
                )}

                {detailLanguageCode !== 'vi' && (
                  <section className="rounded-lg border border-[#d5e3f8] bg-[#f3f7fd] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[#315c91]">
                        Bản gốc tiếng Việt
                      </h3>
                      <button
                        type="button"
                        onClick={handleCopyVietnamese}
                        disabled={!detail.sourceVietnameseNarration}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#315c91] disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          content_copy
                        </span>
                        Sao chép
                      </button>
                    </div>
                    {detail.sourceVietnameseNarration ? (
                      <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-[#334155]">
                        {detail.sourceVietnameseNarration}
                      </p>
                    ) : (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#ffdda3] bg-[#fff4e0] p-3 text-sm text-[#8a5100]">
                        <span className="material-symbols-outlined text-[18px]">
                          warning
                        </span>
                        Chưa có nội dung tiếng Việt để tham chiếu.
                      </div>
                    )}
                  </section>
                )}

                <label className="block">
                  <span className="text-sm font-bold text-[#5b403e]">
                    Nội dung thuyết minh
                  </span>
                  <textarea
                    value={draft.narration}
                    onChange={(event) =>
                      updateDraftField('narration', event.target.value)
                    }
                    rows={10}
                    placeholder="Nhập nội dung thuyết minh cho ngôn ngữ này..."
                    className="mt-2 w-full resize-y rounded-lg border border-[#e5e1da] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                  />
                  <span className="mt-1 block text-right text-xs text-[#8f6f6d]">
                    {draft.narration.length} ký tự
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#5b403e]">
                    Tên theo ngôn ngữ
                  </span>
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      updateDraftField('name', event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#5b403e]">
                    Mô tả
                  </span>
                  <textarea
                    value={draft.description}
                    onChange={(event) =>
                      updateDraftField('description', event.target.value)
                    }
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422]"
                  />
                </label>

                {detail.contentType === 'restaurant' && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-bold text-[#5b403e]">
                          Tags
                        </span>
                        <textarea
                          value={draft.tags}
                          onChange={(event) =>
                            updateDraftField('tags', event.target.value)
                          }
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-[#5b403e]">
                          Món nổi bật
                        </span>
                        <textarea
                          value={draft.highlightDishes}
                          onChange={(event) =>
                            updateDraftField(
                              'highlightDishes',
                              event.target.value
                            )
                          }
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422]"
                        />
                      </label>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={isSpeaking ? handleStop : handleSpeak}
                    disabled={!draft.narration.trim()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#b7e2bf] bg-[#f0fbf3] px-4 py-2.5 text-sm font-bold text-[#1b6d24] disabled:opacity-40 sm:flex-none"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {isSpeaking ? 'stop_circle' : 'play_circle'}
                    </span>
                    {isSpeaking ? 'Dừng' : 'Nghe thử'}
                  </button>
                  <button
                    type="button"
                    onClick={openAutoTranslateDialog}
                    disabled={
                      !detail.sourceVietnameseNarration ||
                      isAutoTranslating ||
                      (detailLanguageCode !== 'vi' &&
                        !AUTO_TRANSLATE_LANGUAGE_SET.has(detailLanguageCode))
                    }
                    title={
                      !detail.sourceVietnameseNarration
                        ? 'Chưa có nội dung tiếng Việt để dịch'
                        : detailLanguageCode !== 'vi' &&
                            !AUTO_TRANSLATE_LANGUAGE_SET.has(detailLanguageCode)
                          ? 'Provider hiện tại chưa hỗ trợ tự động dịch ngôn ngữ này'
                          : ''
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e1da] bg-[#efeeeb] px-4 py-2.5 text-sm font-bold text-[#5b403e] hover:bg-[#e3e2e0] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] ${
                        isAutoTranslating ? 'animate-spin' : ''
                      }`}
                    >
                      {isAutoTranslating ? 'progress_activity' : 'translate'}
                    </span>
                    {isAutoTranslating
                      ? 'Đang dịch nội dung...'
                      : detailLanguageCode === 'vi'
                        ? 'Tự động dịch tất cả ngôn ngữ'
                        : 'Dịch lại từ tiếng Việt'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {detail && (
            <footer className="flex flex-col-reverse gap-3 border-t border-[#e5e1da] bg-white p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDraft(createDraft(currentTranslation))}
                disabled={isSaving}
                className="rounded-lg border border-[#e5e1da] bg-white px-4 py-2.5 text-sm font-bold text-[#5b403e] hover:bg-[#efeeeb]"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#b71422] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9f1020] disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </footer>
          )}
        </aside>
      </div>

      {isAutoTranslateOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleAutoTranslate();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auto-translate-title"
            className="w-full max-w-md rounded-xl border border-[#e5e1da] bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff4e0] text-[#8a5100]">
                <span className="material-symbols-outlined">translate</span>
              </span>
              <div>
                <h2
                  id="auto-translate-title"
                  className="text-lg font-extrabold text-[#1a1c1a]"
                >
                  Tự động dịch từ tiếng Việt?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6e6a66]">
                  Hệ thống sẽ dùng nội dung tiếng Việt hiện tại để cập nhật{' '}
                  {autoTranslateTargets.length === 1
                    ? `bản dịch ${languageLabel(autoTranslateTargets[0])}.`
                    : `${autoTranslateTargets.length} ngôn ngữ provider hiện hỗ trợ.`}
                </p>
                {detailLanguageCode === 'vi' && (
                  <p className="mt-2 text-xs leading-5 text-[#8a5100]">
                    Nếu LibreTranslate local chưa tải model cho một ngôn ngữ,
                    hệ thống sẽ báo ngôn ngữ đó chưa được server dịch hiện tại
                    hỗ trợ.
                  </p>
                )}
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e1da] bg-[#faf9f6] p-3">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={(event) =>
                  setOverwriteExisting(event.target.checked)
                }
                disabled={isAutoTranslating}
                className="mt-0.5 h-4 w-4 accent-[#b71422]"
              />
              <span>
                <span className="block text-sm font-bold text-[#1a1c1a]">
                  Ghi đè bản dịch hiện có
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6e6a66]">
                  Nếu tắt, hệ thống chỉ dịch ngôn ngữ đang thiếu hoặc cần cập
                  nhật.
                </span>
              </span>
            </label>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAutoTranslateOpen(false)}
                disabled={isAutoTranslating}
                className="rounded-lg border border-[#e5e1da] bg-white px-4 py-2.5 text-sm font-bold text-[#5b403e] hover:bg-[#efeeeb] disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isAutoTranslating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#b71422] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#9f1020] disabled:opacity-60"
              >
                {isAutoTranslating && (
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                )}
                {isAutoTranslating ? 'Đang dịch nội dung...' : 'Bắt đầu dịch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
