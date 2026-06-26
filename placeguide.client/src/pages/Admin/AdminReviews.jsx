import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import ToastMessage from "../../components/ToastMessage";
import {
  getAdminReviews,
  getAdminReviewById,
  hideAdminReview,
  restoreAdminReview,
} from "../../services/adminReviewService";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "visible", label: "Đang hiển thị" },
  { value: "hidden", label: "Đã ẩn" },
  { value: "needsReview", label: "Cần kiểm tra" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Tất cả sao" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "3", label: "3 sao" },
  { value: "2", label: "2 sao" },
  { value: "1", label: "1 sao" },
];

const HIDE_REASONS = [
  "Spam",
  "Nội dung xúc phạm",
  "Thông tin sai sự thật",
  "Hình ảnh/video không phù hợp",
  "Khác",
];

function getStoredUserName() {
  try {
    return JSON.parse(window.localStorage.getItem("user") || "{}").fullName || "Quản trị viên";
  } catch {
    return "Quản trị viên";
  }
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateShort(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(value));
}

function ReviewStatusBadge({ review }) {
  if (review.isHidden) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-[#fff0f0] text-[#b42318] border border-[#fecaca]">
        <span className="material-symbols-outlined text-[12px]">visibility_off</span>
        Đã ẩn
      </span>
    );
  }

  if (review.rating <= 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E5] text-[#E65100] border border-[#FFE0B2]">
        <span className="material-symbols-outlined text-[12px]">warning</span>
        Cần kiểm tra
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-[#e9f8ed] text-[#1b6d24] border border-[#b7e2bf]">
      <span className="material-symbols-outlined text-[12px]">visibility</span>
      Đang hiển thị
    </span>
  );
}

function StarDisplay({ value, size = "text-[14px]" }) {
  const n = Number(value) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined ${size} ${s <= n ? "text-[#ffb95f]" : "text-[#dbdad7]"}`}
          style={{ fontVariationSettings: s <= n ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function MediaGrid({ mediaItems, onClickMedia }) {
  if (!mediaItems || mediaItems.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {mediaItems.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onClickMedia(m)}
          className="aspect-square rounded-lg overflow-hidden bg-[#f0eded] border border-[#e4beba]/70 hover:opacity-80 transition-opacity"
        >
          {m.mediaType === "video" ? (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1c1a]/10">
              <span className="material-symbols-outlined text-[32px] text-[#5b403e]">play_circle</span>
            </div>
          ) : (
            <img
              src={m.url}
              alt={m.fileName || "media"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const adminName = getStoredUserName();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // ── List state ────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── Detail panel ──────────────────────────────────────────────────────────
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [hideModal, setHideModal] = useState(false);
  const [restoreModal, setRestoreModal] = useState(false);
  const [hideReasonPreset, setHideReasonPreset] = useState(HIDE_REASONS[0]);
  const [hideNote, setHideNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Media viewer ──────────────────────────────────────────────────────────
  const [mediaViewer, setMediaViewer] = useState(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ message: "", type: "success" });

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadReviews = useCallback(
    async (overridePage = page) => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminReviews({
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: overridePage,
          pageSize: PAGE_SIZE,
        });

        setItems(data.items || []);
        setSummary(data.summary || null);
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
        setPage(overridePage);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, ratingFilter, fromDate, toDate, page]
  );

  useEffect(() => {
    loadReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, ratingFilter, fromDate, toDate]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadReviews(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleSelectRow(review) {
    setSelectedReview(review);
    try {
      setDetailLoading(true);
      const detail = await getAdminReviewById(review.id);
      setSelectedReview(detail);
    } catch {
      // Use list data if detail fails
    } finally {
      setDetailLoading(false);
    }
  }

  // ── Hide ────────────────────────────────────────────────────────────────
  async function handleConfirmHide() {
    if (!selectedReview) return;
    const reason = hideNote.trim()
      ? `${hideReasonPreset}: ${hideNote.trim()}`
      : hideReasonPreset;

    try {
      setActionLoading(true);
      const updated = await hideAdminReview(selectedReview.id, reason);
      setSelectedReview(updated);
      setItems((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, isHidden: true, hiddenReason: reason } : r))
      );
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              visibleReviews: prev.visibleReviews - 1,
              hiddenReviews: prev.hiddenReviews + 1,
            }
          : prev
      );
      setHideModal(false);
      setHideNote("");
      setToast({ message: "Đã ẩn đánh giá thành công.", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Không thể ẩn đánh giá.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  // ── Restore ─────────────────────────────────────────────────────────────
  async function handleConfirmRestore() {
    if (!selectedReview) return;

    try {
      setActionLoading(true);
      const updated = await restoreAdminReview(selectedReview.id);
      setSelectedReview(updated);
      setItems((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, isHidden: false } : r))
      );
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              visibleReviews: prev.visibleReviews + 1,
              hiddenReviews: prev.hiddenReviews - 1,
            }
          : prev
      );
      setRestoreModal(false);
      setToast({ message: "Đã khôi phục đánh giá.", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Không thể khôi phục đánh giá.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  const showFrom = (page - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="flex min-h-screen bg-[#faf9f6]">
      <AdminSidebar adminName={adminName} />

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* Media Viewer Modal */}
      {mediaViewer && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setMediaViewer(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white hover:text-[#ffb3ae] transition-colors"
              onClick={() => setMediaViewer(null)}
            >
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
            {mediaViewer.mediaType === "video" ? (
              <video src={mediaViewer.url} controls className="w-full rounded-xl" />
            ) : (
              <img
                src={mediaViewer.url}
                alt={mediaViewer.fileName}
                className="w-full rounded-xl object-contain max-h-[85vh]"
              />
            )}
          </div>
        </div>
      )}

      {/* Hide Modal */}
      {hideModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#1a1c1a] mb-4">Ẩn đánh giá</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#5b403e] mb-2">
                  Lý do ẩn
                </label>
                <select
                  value={hideReasonPreset}
                  onChange={(e) => setHideReasonPreset(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e4beba] rounded-lg text-sm outline-none focus:border-[#b71422]"
                >
                  {HIDE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5b403e] mb-2">
                  Ghi chú thêm (tuỳ chọn)
                </label>
                <textarea
                  value={hideNote}
                  onChange={(e) => setHideNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e4beba] rounded-lg text-sm outline-none focus:border-[#b71422] resize-none"
                  placeholder="Mô tả rõ hơn lý do ẩn..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setHideModal(false); setHideNote(""); }}
                className="flex-1 px-4 py-2 border border-[#e4beba] rounded-lg text-sm font-semibold text-[#5b403e] hover:bg-[#f4f3f1] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmHide}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-[#b71422] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận ẩn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <span
              className="material-symbols-outlined text-[48px] text-[#1b6d24] mb-3 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restore
            </span>
            <h3 className="text-lg font-bold text-[#1a1c1a] mb-2">Khôi phục đánh giá?</h3>
            <p className="text-sm text-[#5b403e] mb-6">
              Đánh giá này sẽ được hiển thị lại trên trang công khai của nhà hàng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestoreModal(false)}
                className="flex-1 px-4 py-2 border border-[#e4beba] rounded-lg text-sm font-semibold text-[#5b403e] hover:bg-[#f4f3f1] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-[#1b6d24] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
              >
                {actionLoading ? "Đang xử lý..." : "Khôi phục"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-[#FDFCFB] border-b border-[#E5E1DA] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-[#1a1c1a]">Quản lý Đánh giá</h1>
            <p className="text-sm text-[#6E6A66] hidden md:block">
              Theo dõi, kiểm duyệt và xử lý các đánh giá của khách hàng.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#6E6A66]">
            <button
              onClick={() => loadReviews(page)}
              className="p-2 rounded-full hover:bg-[#efeeeb] hover:text-[#b71422] transition-colors"
              title="Làm mới"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6">
          {/* Stats */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#f4f3f1] flex items-center justify-center text-[#b71422]">
                  <span className="material-symbols-outlined">rate_review</span>
                </div>
                <div>
                  <p className="text-xs text-[#6E6A66] mb-1">Tổng đánh giá</p>
                  <p className="text-2xl font-bold text-[#1a1c1a]">{summary.totalReviews}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#f4f3f1] flex items-center justify-center text-[#ffb95f]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <div>
                  <p className="text-xs text-[#6E6A66] mb-1">Đánh giá trung bình</p>
                  <p className="text-2xl font-bold text-[#1a1c1a]">
                    {summary.averageRating != null ? summary.averageRating.toFixed(1) : "—"}
                    <span className="text-sm font-normal text-[#6E6A66]">/5</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF4E5] rounded-xl border border-[#FFE0B2] p-5 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#FFE0B2] flex items-center justify-center text-[#E65100]">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <p className="text-xs text-[#E65100]/80 mb-1">Cần kiểm tra</p>
                  <p className="text-2xl font-bold text-[#E65100]">{summary.needsReviewReviews}</p>
                  <p className="text-[10px] text-[#E65100]/70 mt-1">Đánh giá ≤ 2 sao</p>
                </div>
              </div>

              <div className="bg-[#fff0f0] rounded-xl border border-[#fecaca] p-5 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#fecaca]/50 flex items-center justify-center text-[#b42318]">
                  <span className="material-symbols-outlined">visibility_off</span>
                </div>
                <div>
                  <p className="text-xs text-[#b42318]/80 mb-1">Đã ẩn</p>
                  <p className="text-2xl font-bold text-[#b42318]">{summary.hiddenReviews}</p>
                  <p className="text-[10px] text-[#b42318]/70 mt-1">Vi phạm chính sách</p>
                </div>
              </div>
            </div>
          )}

          {/* Main content area: table + side panel */}
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Table section */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden min-w-0">
              {/* Toolbar */}
              <div className="p-4 border-b border-[#E5E1DA] flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A66] text-[20px]">search</span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên quán, nội dung hoặc người đánh giá..."
                    className="w-full pl-10 pr-4 py-2 bg-[#faf9f6] border border-[#E5E1DA] rounded-lg text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]/20 transition-all"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#faf9f6] border border-[#E5E1DA] rounded-lg text-sm outline-none focus:border-[#b71422] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 bg-[#faf9f6] border border-[#E5E1DA] rounded-lg text-sm outline-none focus:border-[#b71422] cursor-pointer"
                >
                  {RATING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 bg-[#faf9f6] border border-[#E5E1DA] rounded-lg text-sm outline-none focus:border-[#b71422] cursor-pointer"
                  title="Từ ngày"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 bg-[#faf9f6] border border-[#E5E1DA] rounded-lg text-sm outline-none focus:border-[#b71422] cursor-pointer"
                  title="Đến ngày"
                />

                <button
                  onClick={() => loadReviews(page)}
                  className="px-3 py-2 border border-[#E5E1DA] rounded-lg text-sm font-semibold text-[#6E6A66] hover:bg-[#f4f3f1] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Làm mới
                </button>

                <button
                  disabled
                  className="px-3 py-2 border border-[#e4beba] text-[#b71422] rounded-lg text-sm font-semibold flex items-center gap-1 opacity-50 cursor-not-allowed"
                  title="Chức năng đang phát triển"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Xuất
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#6E6A66]">
                    <span className="material-symbols-outlined text-[40px] animate-spin mb-3">progress_activity</span>
                    <p>Đang tải đánh giá...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <span className="material-symbols-outlined text-[40px] text-[#b42318]">error</span>
                    <p className="text-[#b42318] font-semibold">{error}</p>
                    <button
                      onClick={() => loadReviews(page)}
                      className="px-4 py-2 bg-[#b71422] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#6E6A66]">
                    <span className="material-symbols-outlined text-[40px] mb-3">rate_review</span>
                    <p>Chưa có đánh giá nào.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-[#f4f3f1] border-b border-[#E5E1DA] sticky top-0">
                      <tr>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide">Đánh giá</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide">Nhà hàng</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide">Người đánh giá</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide text-center">Media</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide">Trạng thái</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide">Ngày tạo</th>
                        <th className="text-xs font-semibold text-[#6E6A66] py-3 px-4 uppercase tracking-wide text-right">Xem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E1DA]">
                      {items.map((r) => {
                        const isSelected = selectedReview?.id === r.id;
                        const rowBg = r.isHidden
                          ? "bg-[#fff0f0] hover:bg-[#fde8e8]"
                          : r.rating <= 2
                          ? "bg-[#FFF4E5] hover:bg-[#FFE0B2]/50"
                          : "hover:bg-[#f4f3f1]";

                        return (
                          <tr
                            key={r.id}
                            className={`${rowBg} ${isSelected ? "ring-2 ring-inset ring-[#b71422]" : ""} cursor-pointer transition-colors`}
                            onClick={() => handleSelectRow(r)}
                          >
                            <td className="py-3 px-4 max-w-[240px]">
                              <StarDisplay value={r.rating} />
                              <p className="text-sm text-[#1a1c1a] truncate mt-1">
                                {r.comment || <span className="text-[#6E6A66] italic">Không có nội dung</span>}
                              </p>
                              {r.mediaCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#6E6A66] mt-1">
                                  <span className="material-symbols-outlined text-[13px]">image</span>
                                  {r.mediaCount} file
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-semibold text-[#1a1c1a] truncate max-w-[140px]">{r.restaurantName}</p>
                              <p className="text-xs text-[#6E6A66] truncate max-w-[140px]">{r.restaurantAddress}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-[#1a1c1a]">{r.userFullName || "Du khách"}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {r.mediaCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#5b403e]">
                                  <span className="material-symbols-outlined text-[16px]">perm_media</span>
                                  {r.mediaCount}
                                </span>
                              ) : (
                                <span className="text-[#d6cecc] text-sm">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <ReviewStatusBadge review={r} />
                            </td>
                            <td className="py-3 px-4 text-sm text-[#6E6A66]">
                              {formatDateShort(r.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSelectRow(r); }}
                                className="p-1 text-[#6E6A66] hover:text-[#b71422] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!loading && totalItems > 0 && (
                <div className="p-4 border-t border-[#E5E1DA] flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-[#6E6A66]">
                    Hiển thị <span className="font-semibold text-[#1a1c1a]">{showFrom}–{showTo}</span> trong số{" "}
                    <span className="font-semibold text-[#1a1c1a]">{totalItems}</span> đánh giá
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadReviews(page - 1)}
                      disabled={page <= 1 || loading}
                      className="px-3 py-1.5 border border-[#E5E1DA] rounded-lg text-sm font-semibold text-[#5b403e] hover:bg-[#f4f3f1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Trước
                    </button>
                    <span className="text-sm text-[#6E6A66]">
                      {page}/{totalPages}
                    </span>
                    <button
                      onClick={() => loadReviews(page + 1)}
                      disabled={page >= totalPages || loading}
                      className="px-3 py-1.5 border border-[#E5E1DA] rounded-lg text-sm font-semibold text-[#5b403e] hover:bg-[#f4f3f1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detail Side Panel */}
            {selectedReview && (
              <aside className="w-[380px] flex-shrink-0 bg-white rounded-xl border border-[#E5E1DA] shadow-sm flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
                  <h2 className="font-bold text-[#1a1c1a]">Chi tiết đánh giá</h2>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-1 text-[#6E6A66] hover:text-[#b71422] transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {detailLoading ? (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <span className="material-symbols-outlined text-[32px] animate-spin text-[#6E6A66]">progress_activity</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <StarDisplay value={selectedReview.rating} size="text-[20px]" />
                      <span className="text-2xl font-bold text-[#1a1c1a]">{selectedReview.rating}/5</span>
                      <ReviewStatusBadge review={selectedReview} />
                    </div>

                    {/* Comment */}
                    {selectedReview.comment && (
                      <div>
                        <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-1">Nội dung</p>
                        <p className="text-sm text-[#1a1c1a] leading-relaxed">{selectedReview.comment}</p>
                      </div>
                    )}

                    {/* Restaurant */}
                    <div>
                      <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-1">Nhà hàng</p>
                      <p className="text-sm font-semibold text-[#1a1c1a]">{selectedReview.restaurantName}</p>
                      <p className="text-xs text-[#6E6A66]">{selectedReview.restaurantAddress}</p>
                      <a
                        href={`/restaurants/${selectedReview.restaurantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#b71422] hover:underline mt-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Xem trang nhà hàng
                      </a>
                    </div>

                    {/* Reviewer */}
                    <div>
                      <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-1">Người đánh giá</p>
                      <p className="text-sm text-[#1a1c1a]">{selectedReview.userFullName || "Du khách"}</p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-1">Ngày tạo</p>
                        <p className="text-xs text-[#1a1c1a]">{formatDate(selectedReview.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-1">Cập nhật</p>
                        <p className="text-xs text-[#1a1c1a]">{formatDate(selectedReview.updatedAt)}</p>
                      </div>
                    </div>

                    {/* Hidden info */}
                    {selectedReview.isHidden && (
                      <div className="bg-[#fff0f0] rounded-lg border border-[#fecaca] p-3">
                        <p className="text-xs font-semibold text-[#b42318] mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                          Đã ẩn
                        </p>
                        {selectedReview.hiddenReason && (
                          <p className="text-xs text-[#b42318]/80 mb-1">{selectedReview.hiddenReason}</p>
                        )}
                        {selectedReview.hiddenAt && (
                          <p className="text-[11px] text-[#b42318]/60">Lúc: {formatDate(selectedReview.hiddenAt)}</p>
                        )}
                      </div>
                    )}

                    {/* Media */}
                    {selectedReview.mediaItems && selectedReview.mediaItems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#6E6A66] uppercase tracking-wide mb-2">
                          Media ({selectedReview.mediaItems.length} file)
                        </p>
                        <MediaGrid
                          mediaItems={selectedReview.mediaItems}
                          onClickMedia={setMediaViewer}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="p-4 border-t border-[#E5E1DA] flex flex-col gap-2">
                  {selectedReview.isHidden ? (
                    <button
                      onClick={() => setRestoreModal(true)}
                      className="w-full px-4 py-2.5 bg-[#1b6d24] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">restore</span>
                      Khôi phục đánh giá
                    </button>
                  ) : (
                    <button
                      onClick={() => setHideModal(true)}
                      className="w-full px-4 py-2.5 bg-[#b71422] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                      Ẩn đánh giá
                    </button>
                  )}
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
