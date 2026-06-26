import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerSidebar from '../../components/OwnerSidebar';
import ToastMessage from '../../components/ToastMessage';
import {
  getOwnerRestaurant,
  updateOwnerRestaurantOpenStatus,
  updateOwnerRestaurantProfile,
  uploadOwnerRestaurantImage
} from '../../services/ownerRestaurantService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';

function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) {
    return 'Chưa có';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function toFormState(restaurant) {
  return {
    name: restaurant?.name || '',
    phoneNumber: restaurant?.phoneNumber || '',
    address: restaurant?.address || '',
    districtName: restaurant?.districtName || '',
    openingTime: restaurant?.openingTime || '',
    closingTime: restaurant?.closingTime || '',
    priceRange: restaurant?.priceRange || '',
    description: restaurant?.description || '',
    story: restaurant?.story || '',
    tagsText: restaurant?.tagsText || (restaurant?.tags || []).join(', '),
    imageUrl: restaurant?.imageUrl || '',
    coverImageUrl: restaurant?.coverImageUrl || '',
    latitude: restaurant?.latitude ?? 0,
    longitude: restaurant?.longitude ?? 0
  };
}

function parseTags(tagsText) {
  return tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getStatusPresentation(restaurant) {
  if (restaurant?.isBanned) {
    return {
      label: 'Bị khóa',
      className: 'border-[#fecaca] bg-[#fff0f0] text-[#b42318]',
      icon: 'gpp_bad'
    };
  }

  if (restaurant?.isPublished) {
    return {
      label: 'Đang công khai',
      className: 'border-[#b7e2bf] bg-[#e9f8ed] text-[#1b6d24]',
      icon: 'public'
    };
  }

  return {
    label: 'Chờ hoàn thiện',
    className: 'border-[#ffdda3] bg-[#fff4e0] text-[#9a5b00]',
    icon: 'pending_actions'
  };
}

function ToggleSwitch({ checked, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={checked}
      className={`relative h-6 w-12 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-[#006e2f]' : 'bg-[#c9c4bd]'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function StatCard({ label, value, tone = 'text-[#1a1c1a]' }) {
  return (
    <div className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6e6a66]">{label}</p>
      <p className={`mt-1 text-xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function OwnerRestaurantProfile() {
  const navigate = useNavigate();
  const storedUser = useMemo(getStoredUser, []);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState(toFormState(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadRestaurant = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getOwnerRestaurant();
      setRestaurant(data);
      setForm(toFormState(data));
    } catch (loadError) {
      setError(loadError.message);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  const completionPercent = restaurant
    ? Math.round((restaurant.profileCompletionCount / restaurant.profileCompletionTotal) * 100)
    : 0;
  const statusPresentation = getStatusPresentation(restaurant);
  const canOpenPublicPage = restaurant?.isPublished && !restaurant?.isBanned;
  const previewTags = parseTags(form.tagsText).slice(0, 3);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    setIsSaving(true);

    try {
      const updatedRestaurant = await updateOwnerRestaurantProfile({
        name: form.name,
        phoneNumber: form.phoneNumber,
        address: form.address,
        districtName: form.districtName,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        priceRange: form.priceRange,
        description: form.description,
        story: form.story,
        tags: parseTags(form.tagsText),
        imageUrl: form.imageUrl,
        coverImageUrl: form.coverImageUrl,
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0
      });

      setRestaurant(updatedRestaurant);
      setForm(toFormState(updatedRestaurant));
      setToast({ message: 'Đã lưu thông tin quán.', type: 'success' });
    } catch (saveError) {
      setToast({ message: saveError.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleOpenStatus() {
    if (!restaurant || isSaving) {
      return;
    }

    if (restaurant.isBanned && !restaurant.isOpen) {
      setToast({
        message: 'Nhà hàng đang bị khóa nên không thể bật trạng thái mở cửa.',
        type: 'warning'
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedRestaurant = await updateOwnerRestaurantOpenStatus(!restaurant.isOpen);
      setRestaurant(updatedRestaurant);
      setForm(toFormState(updatedRestaurant));
      setToast({
        message: updatedRestaurant.isOpen ? 'Quán đã chuyển sang đang mở.' : 'Quán đã chuyển sang đang đóng.',
        type: 'success'
      });
    } catch (statusError) {
      setToast({ message: statusError.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUploadImage(event, type) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setUploadingType(type);

    try {
      const result = await uploadOwnerRestaurantImage(file, type);
      setRestaurant(result.restaurant);
      setForm(toFormState(result.restaurant));
      setToast({
        message: type === 'avatar' ? 'Đã cập nhật ảnh đại diện.' : 'Đã cập nhật ảnh bìa.',
        type: 'success'
      });
    } catch (uploadError) {
      setToast({ message: uploadError.message, type: 'error' });
    } finally {
      setUploadingType('');
      input.value = '';
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] font-['Be_Vietnam_Pro'] text-[#1a1c1a] lg:flex">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <OwnerSidebar
        ownerName={storedUser.fullName || 'Chủ quán'}
        ownerContact={storedUser.email || storedUser.phoneNumber || 'Owner Portal'}
      />

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">
                Quản lý thông tin quán
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6e6a66]">
                Hoàn thiện hồ sơ quán để khách hàng dễ dàng tìm thấy và nghe thuyết minh.
              </p>
            </div>

            {restaurant && (
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${statusPresentation.className}`}>
                  <span className="material-symbols-outlined text-[18px]">{statusPresentation.icon}</span>
                  {statusPresentation.label}
                </span>
                <button
                  type="button"
                  onClick={() => window.open(`/restaurants/${restaurant.id}`, '_blank', 'noopener,noreferrer')}
                  disabled={!canOpenPublicPage}
                  title={canOpenPublicPage ? 'Xem trang khách' : 'Quán chưa công khai hoặc đang bị khóa'}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#b71422] bg-white px-4 py-2 text-sm font-bold text-[#b71422] transition-colors hover:bg-[#fff5f4] disabled:cursor-not-allowed disabled:border-[#d9d1ce] disabled:text-[#8f6f6d] sm:flex-none"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Xem trang khách
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-5 lg:p-8">
          {isLoading ? (
            <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-10 text-center shadow-sm">
              <span className="material-symbols-outlined animate-pulse text-[44px] text-[#b71422]">
                storefront
              </span>
              <p className="mt-3 text-sm font-bold text-[#5b403e]">
                Đang tải thông tin quán...
              </p>
            </section>
          ) : error ? (
            <section className="rounded-xl border border-[#fecaca] bg-[#fff5f5] p-10 text-center shadow-sm">
              <span className="material-symbols-outlined text-[44px] text-[#b42318]">error</span>
              <h2 className="mt-3 text-2xl font-extrabold text-[#1a1c1a]">
                Không thể tải thông tin quán.
              </h2>
              <p className="mt-2 text-sm text-[#6e6a66]">{error}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void loadRestaurant()}
                  className="rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white"
                >
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/merchant/register')}
                  className="rounded-lg border border-[#e5e1da] bg-white px-4 py-2 text-sm font-bold text-[#5b403e]"
                >
                  Đăng ký đối tác
                </button>
              </div>
            </section>
          ) : restaurant ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                {restaurant.isBanned ? (
                  <section className="rounded-xl border border-[#fecaca] bg-[#fff5f5] p-5 text-[#991b1b] shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                      <div>
                        <h2 className="font-extrabold">Nhà hàng đang bị khóa do vi phạm chính sách.</h2>
                        <p className="mt-1 text-sm">
                          {restaurant.banReason || 'Admin chưa nhập lý do cụ thể.'}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : restaurant.profileCompletionCount < restaurant.profileCompletionTotal ? (
                  <section className="rounded-xl border border-[#ffdda3] bg-[#fff8eb] p-5 text-[#7a4b00] shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[24px]">assignment_late</span>
                      <div>
                        <h2 className="font-extrabold">Quán của bạn đang chờ hoàn thiện.</h2>
                        <p className="mt-1 text-sm">
                          Hãy bổ sung ảnh, menu và nội dung thuyết minh để tăng khả năng hiển thị.
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#5b403e]">
                        Độ hoàn thiện hồ sơ: {restaurant.profileCompletionCount}/{restaurant.profileCompletionTotal}
                      </h2>
                      <p className="mt-1 text-sm text-[#6e6a66]">
                        Càng đủ thông tin, quán càng dễ được duyệt và hiển thị đẹp trên trang khách.
                      </p>
                    </div>
                    <span className="text-2xl font-extrabold text-[#c47120]">{completionPercent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e3e2e0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#a36700] to-[#ffb95f]"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(restaurant.checklist || []).map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                          item.isComplete
                            ? 'border-[#d9e8dd] bg-[#f0fbf3] text-[#1b6d24]'
                            : 'border-[#e5e1da] bg-[#f4f3f1] text-[#6e6a66]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.isComplete ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Trạng thái"
                    value={restaurant.isPublished ? 'Công khai' : 'Chưa công khai'}
                    tone={restaurant.isPublished ? 'text-[#1b6d24]' : 'text-[#9a5b00]'}
                  />
                  <StatCard
                    label="Hoạt động"
                    value={restaurant.isOpen ? 'Đang mở' : 'Đang đóng'}
                    tone={restaurant.isOpen ? 'text-[#1b6d24]' : 'text-[#b42318]'}
                  />
                  <StatCard label="Tổng món" value={`${restaurant.dishCount} món`} />
                  <StatCard
                    label="Đánh giá TB"
                    value={restaurant.reviewCount > 0 && restaurant.rating !== null ? restaurant.rating.toFixed(1) : 'Chưa có'}
                    tone={restaurant.reviewCount > 0 ? 'text-[#c47120]' : 'text-[#8f6f6d]'}
                  />
                </section>

                <form onSubmit={handleSave} className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e1da] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-extrabold text-[#1a1c1a]">Thông tin cơ bản</h2>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white hover:bg-[#9f1020] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#5b403e]">Tên quán ăn</span>
                      <input
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Số điện thoại</span>
                      <input
                        value={form.phoneNumber}
                        onChange={(event) => updateField('phoneNumber', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="Nhập số điện thoại"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Quận/huyện</span>
                      <input
                        value={form.districtName}
                        onChange={(event) => updateField('districtName', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="VD: Quận 1"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#5b403e]">Địa chỉ đầy đủ</span>
                      <input
                        value={form.address}
                        onChange={(event) => updateField('address', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Giờ mở cửa</span>
                      <input
                        value={form.openingTime}
                        onChange={(event) => updateField('openingTime', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="06:00"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Giờ đóng cửa</span>
                      <input
                        value={form.closingTime}
                        onChange={(event) => updateField('closingTime', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="22:00"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Khoảng giá</span>
                      <input
                        value={form.priceRange}
                        onChange={(event) => updateField('priceRange', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="50k - 150k"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Tags</span>
                      <input
                        value={form.tagsText}
                        onChange={(event) => updateField('tagsText', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="Món truyền thống, Phù hợp khách du lịch"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="flex justify-between text-sm font-bold text-[#5b403e]">
                        <span>Mô tả ngắn</span>
                        <span className="font-medium text-[#8f6f6d]">{form.description.length}/2000</span>
                      </span>
                      <textarea
                        value={form.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="Nhập mô tả về không gian và hương vị đặc trưng..."
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="flex justify-between text-sm font-bold text-[#5b403e]">
                        <span>Câu chuyện quán</span>
                        <span className="font-medium text-[#8f6f6d]">{form.story.length}/2000</span>
                      </span>
                      <textarea
                        value={form.story}
                        onChange={(event) => updateField('story', event.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        placeholder="Kể ngắn về nguồn gốc, món đặc trưng hoặc điều làm quán khác biệt..."
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Latitude</span>
                      <input
                        type="number"
                        value={form.latitude}
                        onChange={(event) => updateField('latitude', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        step="any"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#5b403e]">Longitude</span>
                      <input
                        type="number"
                        value={form.longitude}
                        onChange={(event) => updateField('longitude', event.target.value)}
                        className="h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                        step="any"
                      />
                    </label>
                  </div>
                </form>

                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <div className="mb-5 border-b border-[#e5e1da] pb-4">
                    <h2 className="text-xl font-extrabold text-[#1a1c1a]">Hình ảnh quán</h2>
                    <p className="mt-1 text-sm text-[#6e6a66]">
                      Upload ảnh đại diện và ảnh bìa thật. JPG, PNG, WEBP tối đa 5MB.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-[#5b403e]">Ảnh đại diện</p>
                      <label className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-[#e5e1da] bg-[#f4f3f1] text-center transition-colors hover:border-[#b71422]">
                        {form.imageUrl ? (
                          <img src={form.imageUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                        ) : (
                          <span className="px-4 text-sm font-bold text-[#b71422]">
                            <span className="material-symbols-outlined mb-2 block text-[34px]">add_photo_alternate</span>
                            Tải ảnh lên
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) => void handleUploadImage(event, 'avatar')}
                        />
                      </label>
                      {uploadingType === 'avatar' && (
                        <p className="text-xs font-semibold text-[#6e6a66]">Đang tải ảnh đại diện...</p>
                      )}
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <p className="text-sm font-bold text-[#5b403e]">Ảnh bìa</p>
                      <label className="grid h-48 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-[#e5e1da] bg-[#f4f3f1] text-center transition-colors hover:border-[#b71422]">
                        {form.coverImageUrl ? (
                          <img src={form.coverImageUrl} alt="Ảnh bìa" className="h-full w-full object-cover" />
                        ) : (
                          <span className="px-4 text-sm font-bold text-[#b71422]">
                            <span className="material-symbols-outlined mb-2 block text-[34px]">cloud_upload</span>
                            Tải ảnh bìa lên
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) => void handleUploadImage(event, 'cover')}
                        />
                      </label>
                      {uploadingType === 'cover' && (
                        <p className="text-xs font-semibold text-[#6e6a66]">Đang tải ảnh bìa...</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6 lg:col-span-4">
                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-extrabold text-[#1a1c1a]">Trạng thái hoạt động</h2>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1a1c1a]">Đang mở cửa</p>
                      <p className="mt-1 text-xs text-[#6e6a66]">
                        Owner chỉ được bật/tắt mở cửa, không tự công khai quán.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={restaurant.isOpen}
                      disabled={isSaving || restaurant.isBanned}
                      onClick={() => void handleToggleOpenStatus()}
                      label="Cập nhật trạng thái mở cửa"
                    />
                  </div>
                  {restaurant.isBanned && (
                    <p className="mt-3 text-sm font-semibold text-[#b42318]">
                      Nhà hàng đang bị khóa nên không thể bật mở cửa.
                    </p>
                  )}
                </section>

                <section className="overflow-hidden rounded-xl border border-[#e5e1da] bg-[#fdfcfb] shadow-sm">
                  <div className="border-b border-[#e5e1da] bg-[#e9e8e5] p-4">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1a1c1a]">
                      <span className="material-symbols-outlined text-[20px]">smartphone</span>
                      Xem trước thẻ quán
                    </h2>
                  </div>
                  <div className="bg-[#faf9f6] p-5">
                    <div className="mx-auto max-w-[300px] overflow-hidden rounded-2xl border border-[#e5e1da] bg-white shadow-sm">
                      <div className="relative h-36 bg-[#e3e2e0]">
                        <img
                          src={form.imageUrl || form.coverImageUrl || FALLBACK_IMAGE}
                          alt={form.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                          {restaurant.isOpen ? 'Đang mở' : 'Đóng cửa'}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-xl font-extrabold text-[#1a1c1a]">
                          {form.name || 'Tên quán ăn'}
                        </h3>
                        <div className="mt-2 flex items-center gap-1 text-sm text-[#6e6a66]">
                          <span className="material-symbols-outlined text-[16px] text-[#c47120]">star</span>
                          <span>{restaurant.reviewCount > 0 && restaurant.rating !== null ? restaurant.rating.toFixed(1) : '--'}</span>
                          <span>({restaurant.reviewCount} đánh giá)</span>
                        </div>
                        <p className="mt-2 truncate text-sm text-[#6e6a66]">
                          {form.address || 'Chưa có địa chỉ'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {previewTags.length > 0 ? previewTags.map((tag) => (
                            <span key={tag} className="rounded bg-[#efeeeb] px-2 py-1 text-[10px] font-bold text-[#5b403e]">
                              {tag}
                            </span>
                          )) : (
                            <span className="rounded bg-[#efeeeb] px-2 py-1 text-[10px] font-bold text-[#5b403e]">
                              Đang cập nhật
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-extrabold text-[#1a1c1a]">Vị trí trên bản đồ</h2>
                  <div className="mb-4 grid h-40 place-items-center rounded-lg border border-[#e5e1da] bg-[#f4f3f1]">
                    <span className="material-symbols-outlined text-[44px] text-[#8f6f6d]">map</span>
                  </div>
                  <p className="flex items-start gap-2 text-sm text-[#6e6a66]">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {form.address || 'Chưa có địa chỉ'}
                  </p>
                  {restaurant.needsLocationUpdate && (
                    <p className="mt-3 rounded-lg border border-[#ffdda3] bg-[#fff8eb] p-3 text-sm text-[#7a4b00]">
                      Tọa độ hiện tại là điểm tạm. Hãy nhập lại latitude/longitude chính xác.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-[#1a1c1a]">
                    <span className="material-symbols-outlined text-[#22c55e]">lightbulb</span>
                    Gợi ý cải thiện
                  </h2>
                  <ul className="space-y-3 text-sm text-[#5b403e]">
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#22c55e]">add_circle</span>
                      Thêm ảnh thật của quán và món ăn nổi bật.
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#22c55e]">add_circle</span>
                      Cập nhật menu món ăn để tăng độ tin cậy.
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#22c55e]">add_circle</span>
                      Viết thuyết minh tiếng Việt và tiếng Anh cho quán.
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#22c55e]">add_circle</span>
                      Kiểm tra lại địa chỉ và tọa độ bản đồ.
                    </li>
                  </ul>
                </section>

                <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 text-sm text-[#6e6a66] shadow-sm">
                  Lần cập nhật gần nhất: <span className="font-bold text-[#1a1c1a]">{formatDate(restaurant.updatedAt)}</span>
                </section>
              </aside>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default OwnerRestaurantProfile;
