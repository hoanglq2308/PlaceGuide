import { useEffect, useMemo, useState } from "react";
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../services/reviewService";

const PRIMARY = "#b71422";

function StarSelector({ value, onChange, size = "text-[44px]" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="active:scale-95 transition-transform"
          aria-label={`Chọn ${star} sao`}
        >
          <span
            className={`material-symbols-outlined ${size} transition-colors ${
              star <= value ? "text-[#b71422]" : "text-[#d6cecc]"
            }`}
            style={{ fontVariationSettings: star <= value ? "'FILL' 1" : "'FILL' 0" }}
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
          style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
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

export default function ReviewsSection({ restaurant, restaurantId }) {
  const resolvedRestaurantId = restaurantId || restaurant?.id;

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");

  const [tasteRating, setTasteRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(4);
  const [spaceRating, setSpaceRating] = useState(4);
  const [priceRating, setPriceRating] = useState(4);

  const myReview = useMemo(
    () => reviews.find((review) => review.isMine),
    [reviews]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return restaurant?.rating || 0;
    }

    const total = reviews.reduce(
      (sum, review) => sum + (Number(review.rating) || 0),
      0
    );

    return total / reviews.length;
  }, [reviews, restaurant?.rating]);

  useEffect(() => {
    if (!resolvedRestaurantId) return;

    async function loadReviews() {
      try {
        setLoadingReviews(true);
        setErrorMessage("");

        const data = await getReviews(resolvedRestaurantId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(error.message || "Không tải được danh sách đánh giá.");
      } finally {
        setLoadingReviews(false);
      }
    }

    loadReviews();
  }, [resolvedRestaurantId]);

  useEffect(() => {
    if (!myReview) return;

    setRating(myReview.rating || 4);
    setComment(myReview.comment || "");
  }, [myReview]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!resolvedRestaurantId) {
      setErrorMessage("Thiếu thông tin quán ăn.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        rating,
        comment: comment.trim(),
      };

      const savedReview = myReview
        ? await updateReview(resolvedRestaurantId, myReview.id, payload)
        : await createReview(resolvedRestaurantId, payload);

      setReviews((currentReviews) => {
        if (myReview) {
          return currentReviews.map((review) =>
            review.id === savedReview.id ? savedReview : review
          );
        }

        return [savedReview, ...currentReviews];
      });

      setSuccessMessage(
        myReview ? "Đã cập nhật đánh giá." : "Đã gửi đánh giá."
      );
    } catch (error) {
      setErrorMessage(error.message || "Không gửi được đánh giá.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!myReview || !resolvedRestaurantId) return;

    const confirmed = window.confirm("Bạn muốn xóa đánh giá này?");
    if (!confirmed) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteReview(resolvedRestaurantId, myReview.id);

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== myReview.id)
      );
      setRating(4);
      setComment("");
      setSuccessMessage("Đã xóa đánh giá.");
    } catch (error) {
      setErrorMessage(error.message || "Không xóa được đánh giá.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 bg-[#fcf9f8] text-[#1b1c1c]">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-[#5b403e] mb-2">
          <span>Đánh giá</span>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
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
          <span className="font-bold text-lg">
            {Number(averageRating || 0).toFixed(1)}
          </span>
          <span className="text-[#5b403e]">
            • {reviews.length} đánh giá
          </span>
          {restaurant?.badge && (
            <span className="text-[#2c694e] font-medium px-2 py-1 bg-[#aeeecb]/40 rounded-lg text-xs">
              {restaurant.badge}
            </span>
          )}
        </div>

        {restaurant?.address && (
          <p className="text-[#5b403e] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            {restaurant.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-[#f6f3f2] p-6 rounded-xl border border-[#e4beba] shadow-sm"
          >
            <h3 className="text-xl md:text-2xl font-semibold mb-6">
              Trải nghiệm của bạn thế nào?
            </h3>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3 py-4 bg-white rounded-lg border border-[#e4beba]/60">
                <p className="text-sm font-semibold text-[#5b403e]">
                  Đánh giá chung
                </p>
                <StarSelector value={rating} onChange={setRating} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["Hương vị", tasteRating, setTasteRating],
                  ["Phục vụ", serviceRating, setServiceRating],
                  ["Không gian", spaceRating, setSpaceRating],
                  ["Giá cả", priceRating, setPriceRating],
                ].map(([label, value, setter]) => (
                  <div key={label} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold">{label}</label>
                      <span className="text-[#b71422] font-bold">
                        {Number(value).toFixed(1)}
                      </span>
                    </div>
                    <input
                      className="w-full h-2 bg-[#e4e2e1] rounded-lg appearance-none cursor-pointer accent-[#b71422]"
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={value}
                      onChange={(event) => setter(Number(event.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-[#5b403e]">
                  Viết nhận xét của bạn
                </label>
                <textarea
                  className="w-full p-6 border border-[#e4beba] rounded-lg focus:ring-2 focus:ring-[#b71422]/20 focus:border-[#b71422] outline-none transition-all min-h-[160px] bg-white placeholder:text-[#5b403e]/50"
                  placeholder="Chia sẻ cảm nhận về món ăn, không gian và phục vụ để giúp người khác lựa chọn tốt hơn..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 bg-[#f0eded] p-5 rounded-xl border border-[#e4beba]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Hình ảnh & Video</h4>
                <span className="text-xs text-[#5b403e]">Sẽ hỗ trợ sau</span>
              </div>

              <button
                type="button"
                disabled
                className="aspect-square w-36 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d6cecc] rounded-lg bg-white text-[#5b403e] opacity-70 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[32px]">
                  add_a_photo
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">
                  Thêm hình ảnh
                </span>
              </button>
            </div>

            {errorMessage && (
              <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="mt-4 text-sm text-[#2c694e]">{successMessage}</p>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-6">
              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="px-6 py-3 rounded-full border border-[#b71422] text-[#b71422] font-bold active:scale-95 transition-transform disabled:opacity-60"
                >
                  Xóa đánh giá
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#b71422] text-white px-8 py-3 rounded-full font-bold active:scale-95 transition-transform shadow-lg hover:brightness-110 flex items-center gap-2 disabled:opacity-60"
              >
                {submitting
                  ? "Đang gửi..."
                  : myReview
                    ? "Cập nhật đánh giá"
                    : "Gửi đánh giá"}
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>

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
                          {review.userFullName || "Người dùng"}
                          {review.isMine && (
                            <span className="ml-2 text-xs text-[#2c694e]">
                              Đánh giá của bạn
                            </span>
                          )}
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
                      <p className="mt-3 text-[#5b403e] leading-6">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-[#eae7e7]/70 p-6 rounded-xl border border-[#e4beba]">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#2c694e]">
                tips_and_updates
              </span>
              <h3 className="font-semibold uppercase tracking-wide">
                Mẹo đánh giá hay
              </h3>
            </div>

            <ul className="space-y-4 text-[#5b403e]">
              {[
                "Mô tả kỹ hương vị món ăn bạn đã thử.",
                "Chia sẻ về không gian, độ sạch sẽ và cảm giác tại quán.",
                "Nhận xét về tốc độ phục vụ và thái độ nhân viên.",
                "Ảnh món ăn sẽ được hỗ trợ ở bước sau.",
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
              <p className="text-xs text-[#5b403e]">
                {restaurant?.address || "Chưa có địa chỉ"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}