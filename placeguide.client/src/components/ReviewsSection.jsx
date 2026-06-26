import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  createReview,
  getReviews,
} from "../services/reviewService";
import ToastMessage from "./ToastMessage";

const MAX_MEDIA_FILES = 10;
const MAX_MEDIA_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const AUDIO_PASS_TOKEN_KEY = "placeGuideAudioPassToken";

function hasValidAudioPass() {
  return !!localStorage.getItem(AUDIO_PASS_TOKEN_KEY);
}

function StarSelector({ value, onChange, size = "text-[36px] sm:text-[44px]", disabled = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className="active:scale-95 transition-transform disabled:cursor-not-allowed"
          aria-label={`Chọn ${star} sao`}
        >
          <span
            className={`material-symbols-outlined ${size} transition-colors ${
              star <= value ? "text-[#b71422]" : "text-[#d6cecc]"
            }`}
            style={{
              fontVariationSettings: star <= value ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function ReadOnlyStars({ value }) {
  const rating = Number(value) || 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[18px] ${
            star <= rating ? "text-[#b71422]" : "text-[#d6cecc]"
          }`}
          style={{
            fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMediaItems(review) {
  return Array.isArray(review?.mediaItems) ? review.mediaItems : [];
}

function getMediaTypeFromFile(file) {
  return file.type.startsWith("video/") ? "video" : "image";
}

function revokePreviewUrl(media) {
  if (media?.previewUrl) {
    URL.revokeObjectURL(media.previewUrl);
  }
}

function createClientId(file) {
  const randomId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${file.name}-${file.lastModified}-${randomId}`;
}

export default function ReviewsSection({
  restaurant,
  restaurantId,
  onRatingSummaryChange,
}) {
  const resolvedRestaurantId = restaurantId || restaurant?.id;
  const mediaInputRef = useRef(null);
  const selectedMediaRef = useRef([]);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);

  // Kiểm tra AudioPass ngay khi render (reactive: mỗi khi component mount hoặc cần)
  const [audioPassAvailable, setAudioPassAvailable] = useState(() => hasValidAudioPass());

  const totalMediaCount = selectedMedia.length;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  useEffect(() => {
    if (!onRatingSummaryChange) return;

    onRatingSummaryChange({
      rating:
        reviews.length > 0 && averageRating !== null
          ? Number(averageRating.toFixed(1))
          : null,
      reviewCount: reviews.length,
    });
  }, [averageRating, onRatingSummaryChange, reviews.length]);

  useEffect(() => {
    selectedMediaRef.current = selectedMedia;
  }, [selectedMedia]);

  useEffect(() => {
    return () => {
      selectedMediaRef.current.forEach(revokePreviewUrl);
    };
  }, []);

  useEffect(() => {
    if (!resolvedRestaurantId) return;

    async function loadReviews() {
      try {
        setLoadingReviews(true);
        setErrorMessage("");

        const data = await getReviews(resolvedRestaurantId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        const message = error.message || "Không tải được danh sách đánh giá.";
        setErrorMessage(message);
        setToast({ message, type: "error" });
      } finally {
        setLoadingReviews(false);
      }
    }

    loadReviews();
  }, [resolvedRestaurantId]);

  // Refresh AudioPass state khi user focus lại tab (ví dụ sau khi mua pass)
  useEffect(() => {
    function onFocus() {
      setAudioPassAvailable(hasValidAudioPass());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function clearSelectedMedia() {
    selectedMediaRef.current.forEach(revokePreviewUrl);
    selectedMediaRef.current = [];
    setSelectedMedia([]);
  }

  function handleChooseMedia() {
    mediaInputRef.current?.click();
  }

  function handleMediaFilesChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    const availableSlots = MAX_MEDIA_FILES - totalMediaCount;

    if (availableSlots <= 0) {
      setToast({
        message: `Mỗi đánh giá chỉ được tối đa ${MAX_MEDIA_FILES} ảnh/video.`,
        type: "warning",
      });
      return;
    }

    const acceptedFiles = [];
    const skippedMessages = [];

    files.slice(0, availableSlots).forEach((file) => {
      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
        skippedMessages.push(`${file.name}: định dạng chưa hỗ trợ`);
        return;
      }

      if (file.size > MAX_MEDIA_FILE_SIZE) {
        skippedMessages.push(`${file.name}: vượt quá 25MB`);
        return;
      }

      acceptedFiles.push({
        id: createClientId(file),
        file,
        name: file.name,
        mediaType: getMediaTypeFromFile(file),
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (files.length > availableSlots) {
      skippedMessages.push(
        `Chỉ thêm được ${availableSlots} file vì giới hạn tối đa là ${MAX_MEDIA_FILES}.`
      );
    }

    if (acceptedFiles.length > 0) {
      setSelectedMedia((current) => [...current, ...acceptedFiles]);
    }

    if (skippedMessages.length > 0) {
      setToast({ message: skippedMessages[0], type: "warning" });
    }
  }

  function handleRemoveSelectedMedia(mediaId) {
    setSelectedMedia((current) => {
      const mediaToRemove = current.find((m) => m.id === mediaId);
      revokePreviewUrl(mediaToRemove);
      return current.filter((m) => m.id !== mediaId);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!resolvedRestaurantId) {
      setErrorMessage("Thiếu thông tin quán ăn.");
      return;
    }

    if (!comment.trim()) {
      setToast({ message: "Vui lòng nhập nội dung đánh giá.", type: "warning" });
      setErrorMessage("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const payload = {
        rating,
        comment: comment.trim(),
        mediaFiles: selectedMedia.map((m) => m.file),
      };

      const savedReview = await createReview(resolvedRestaurantId, payload);

      setReviews((current) => [savedReview, ...current]);
      clearSelectedMedia();
      setRating(4);
      setComment("");
      setToast({ message: "Đã gửi đánh giá. Cảm ơn bạn!", type: "success" });
    } catch (error) {
      if (error.status === 402 || error.code === "AUDIO_PASS_REQUIRED") {
        setAudioPassAvailable(false);
        setToast({ message: "Bạn cần AudioPass hợp lệ để gửi đánh giá.", type: "warning" });
        setErrorMessage("Bạn cần AudioPass hợp lệ để gửi đánh giá.");
      } else if (error.status === 409) {
        setToast({ message: "Bạn đã đánh giá nhà hàng này rồi.", type: "info" });
        setErrorMessage("Bạn đã đánh giá nhà hàng này rồi.");
      } else {
        const message = error.message || "Không gửi được đánh giá.";
        setErrorMessage(message);
        setToast({ message, type: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderMediaPreview(media, onRemove) {
    const source = media.previewUrl || media.url;
    const mediaType = media.mediaType === "video" ? "video" : "image";

    return (
      <div
        key={media.id}
        className="relative aspect-square rounded-lg overflow-hidden group bg-white border border-[#e4beba]/70"
      >
        {mediaType === "video" ? (
          <video
            className="w-full h-full object-cover"
            src={source}
            muted
            controls
          />
        ) : (
          <img
            className="w-full h-full object-cover"
            src={source}
            alt={media.fileName || media.name || "Review media"}
          />
        )}

        <button
          type="button"
          onClick={() => onRemove(media.id)}
          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          aria-label="Xóa ảnh/video"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    );
  }

  function renderReviewMediaGrid(mediaItems) {
    if (mediaItems.length === 0) return null;

    return (
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {mediaItems.map((media) => (
          <div
            key={media.id}
            className="aspect-square rounded-lg overflow-hidden bg-[#f0eded] border border-[#e4beba]/70"
          >
            {media.mediaType === "video" ? (
              <video
                className="w-full h-full object-cover"
                src={media.url}
                controls
              />
            ) : (
              <img
                className="w-full h-full object-cover"
                src={media.url}
                alt={media.fileName || "Review media"}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // ─── Audio Pass Gate ──────────────────────────────────────────────────────────
  function renderReviewForm() {
    if (!audioPassAvailable) {
      return (
        <div className="bg-[#f6f3f2] p-5 md:p-6 rounded-xl border border-[#e4beba] shadow-sm">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">
            Trải nghiệm của bạn thế nào?
          </h3>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span
              className="material-symbols-outlined text-[48px] text-[#b71422]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              headphones
            </span>
            <div>
              <p className="font-semibold text-[#1b1c1c] text-lg mb-1">
                Cần AudioPass để gửi đánh giá
              </p>
              <p className="text-[#5b403e] text-sm max-w-xs mx-auto">
                Chỉ khách có AudioPass hợp lệ mới được chia sẻ trải nghiệm về quán này.
              </p>
            </div>
            <Link
              to="/audio-pass/checkout"
              className="inline-flex items-center gap-2 bg-[#b71422] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">headphones</span>
              Mua AudioPass
            </Link>
            <p className="text-xs text-[#5b403e]/70">
              AudioPass 24 giờ — nghe thuyết minh + gửi đánh giá không giới hạn nhà hàng
            </p>
          </div>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="bg-[#f6f3f2] p-5 md:p-6 rounded-xl border border-[#e4beba] shadow-sm"
      >
        <h3 className="text-xl md:text-2xl font-semibold mb-6">
          Trải nghiệm của bạn thế nào?
        </h3>

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col items-center gap-3 py-4 bg-white rounded-lg border border-[#e4beba]/60">
            <p className="text-sm font-semibold text-[#5b403e]">Đánh giá chung</p>
            <StarSelector value={rating} onChange={setRating} />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-[#5b403e]">
              Viết nhận xét của bạn
            </label>
            <textarea
              className="w-full p-4 md:p-6 border border-[#e4beba] rounded-lg focus:ring-2 focus:ring-[#b71422]/20 focus:border-[#b71422] outline-none transition-all min-h-[150px] md:min-h-[160px] bg-white placeholder:text-[#5b403e]/50"
              placeholder="Chia sẻ cảm nhận về món ăn, không gian và phục vụ để giúp người khác lựa chọn tốt hơn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 bg-[#f0eded] p-4 md:p-5 rounded-xl border border-[#e4beba]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Hình ảnh & Video</h4>
            <span className="text-xs text-[#5b403e]">
              {totalMediaCount}/{MAX_MEDIA_FILES} tệp
            </span>
          </div>

          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={handleMediaFilesChange}
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <button
              type="button"
              onClick={handleChooseMedia}
              disabled={totalMediaCount >= MAX_MEDIA_FILES || submitting}
              className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d6cecc] rounded-lg bg-white text-[#5b403e] hover:bg-[#fcf9f8] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
              <span className="text-xs font-bold uppercase tracking-wide text-center">
                Thêm ảnh/video
              </span>
            </button>

            {selectedMedia.map((media) =>
              renderMediaPreview(media, handleRemoveSelectedMedia)
            )}
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="flex flex-col justify-end gap-3 pt-6 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 bg-[#b71422] text-white px-8 py-3 rounded-full font-bold active:scale-95 transition-transform shadow-lg hover:brightness-110 disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="mt-10 bg-[#fcf9f8] text-[#1b1c1c]">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="mb-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5b403e] mb-2">
          <span>Đánh giá</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>{restaurant?.name || "Quán ăn"}</span>
        </nav>

        <h2 className="text-2xl md:text-3xl font-bold text-[#b71422] mb-2">
          Đánh giá trải nghiệm
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="material-symbols-outlined text-[#b71422]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          {reviews.length > 0 && averageRating !== null ? (
            <>
              <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              <span className="text-[#5b403e]">• {reviews.length} đánh giá</span>
            </>
          ) : (
            <span className="text-[#5b403e]">Chưa có đánh giá</span>
          )}
          {restaurant?.badge && (
            <span className="text-[#2c694e] font-medium px-2 py-1 bg-[#aeeecb]/40 rounded-lg text-xs">
              {restaurant.badge}
            </span>
          )}
        </div>

        {restaurant?.address && (
          <p className="text-[#5b403e] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            {restaurant.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {renderReviewForm()}

          <div className="bg-white p-6 rounded-xl border border-[#e4beba] shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Đánh giá gần đây</h3>

            {loadingReviews ? (
              <p className="text-[#5b403e]">Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="text-[#5b403e]">
                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá quán này.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-lg border border-[#e4beba]/70 p-4 bg-[#fcf9f8]"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {review.userFullName || "Du khách"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <ReadOnlyStars value={review.rating} />
                          <span className="text-xs text-[#5b403e]">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-[#5b403e] leading-6">{review.comment}</p>
                    )}

                    {renderReviewMediaGrid(getMediaItems(review))}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-[#eae7e7]/70 p-6 rounded-xl border border-[#e4beba]">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#2c694e]">tips_and_updates</span>
              <h3 className="font-semibold uppercase tracking-wide">Mẹo đánh giá hay</h3>
            </div>

            <ul className="space-y-4 text-[#5b403e]">
              {[
                "Mô tả kỹ hương vị món ăn bạn đã thử.",
                "Chia sẻ về không gian, độ sạch sẽ và cảm giác tại quán.",
                "Nhận xét về tốc độ phục vụ và thái độ nhân viên.",
                "Ảnh hoặc video ngắn giúp đánh giá đáng tin hơn.",
              ].map((tip) => (
                <li key={tip} className="flex gap-3">
                  <span className="material-symbols-outlined text-[#b71422] text-[20px]">
                    check_circle
                  </span>
                  <p>{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#e4beba] shadow-sm h-64 relative">
            {restaurant?.image ? (
              <img
                src={restaurant.image}
                alt={restaurant?.name || "Restaurant"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#f0eded]" />
            )}

            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg">
              <p className="font-semibold mb-1">Vị trí quán</p>
              <p className="text-xs text-[#5b403e]">{restaurant?.address || "Chưa có địa chỉ"}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
