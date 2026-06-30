import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import ToastMessage from '../../components/ToastMessage';
import {
  banRestaurant,
  getAdminRestaurantById,
  getAdminRestaurants,
  unbanRestaurant,
  updateRestaurantOpenStatus,
  updateRestaurantPublishStatus
} from '../../services/adminRestaurantService';

const PAGE_SIZE = 10;
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'published', label: 'Công khai' },
  { value: 'unpublished', label: 'Chưa công khai' },
  { value: 'pendingSetup', label: 'Chờ hoàn thiện' },
  { value: 'open', label: 'Đang mở' },
  { value: 'closed', label: 'Đang đóng' },
  { value: 'banned', label: 'Đã khóa' }
];

const BAN_REASON_OPTIONS = [
  'Thông tin sai sự thật',
  'Nội dung xuyên tạc',
  'Hình ảnh không phù hợp',
  'Vi phạm chính sách',
  'Khác'
];

function getStoredUserName() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}').fullName || 'Quản trị viên';
  } catch {
    return 'Quản trị viên';
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

function getProfilePresentation(restaurant) {
  if (restaurant?.isBanned || restaurant?.profileStatus === 'banned') {
    return {
      label: 'Đã khóa',
      className: 'bg-[#fff0f0] text-[#b42318] border-[#fecaca]'
    };
  }

  if (restaurant?.profileStatus === 'pendingSetup') {
    return {
      label: 'Chờ hoàn thiện',
      className: 'bg-[#fff4e0] text-[#9a5b00] border-[#ffdda3]'
    };
  }

  if (restaurant?.isPublished) {
    return {
      label: 'Công khai',
      className: 'bg-[#e9f8ed] text-[#1b6d24] border-[#b7e2bf]'
    };
  }

  return {
    label: 'Chưa công khai',
    className: 'bg-[#efeeeb] text-[#5b403e] border-[#d9d1ce]'
  };
}

function getOpenPresentation(isOpen) {
  return isOpen
    ? {
        label: 'Đang mở',
        className: 'bg-[#e9f8ed] text-[#1b6d24] border-[#b7e2bf]'
      }
    : {
        label: 'Đang đóng',
        className: 'bg-[#fff0f0] text-[#b42318] border-[#fecaca]'
      };
}

function StatusBadge({ presentation }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold ${presentation.className}`}>
      {presentation.label}
    </span>
  );
}

function ToggleSwitch({ checked, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-[#006e2f]' : 'bg-[#c9c4bd]'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function StatCard({ icon, label, value, accentClassName = '' }) {
  return (
    <div className={`rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm ${accentClassName}`}>
      <div className="mb-4 flex items-start justify-between">
        <span className="material-symbols-outlined text-[26px] text-[#6e6a66]">
          {icon}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-[#6e6a66]">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-[#1a1c1a]">{value}</p>
    </div>
  );
}

function AdminRestaurants() {
  const navigate = useNavigate();
  const adminName = useMemo(getStoredUserName, []);
  const [restaurantsData, setRestaurantsData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    summary: {
      totalRestaurants: 0,
      publishedRestaurants: 0,
      pendingSetupRestaurants: 0,
      unpublishedRestaurants: 0,
      bannedRestaurants: 0
    },
    districts: []
  });
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReasonType, setBanReasonType] = useState(BAN_REASON_OPTIONS[0]);
  const [banReasonDetail, setBanReasonDetail] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, districtFilter]);

  const loadRestaurants = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const data = await getAdminRestaurants({
        search: debouncedSearch,
        status: statusFilter,
        district: districtFilter,
        page,
        pageSize: PAGE_SIZE
      });
      setRestaurantsData(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, districtFilter, page, statusFilter]);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  const totalPages = Math.max(1, Math.ceil((restaurantsData.totalCount || 0) / PAGE_SIZE));
  const firstItem = restaurantsData.totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, restaurantsData.totalCount);

  const openDetails = async (restaurantId) => {
    setIsPanelOpen(true);
    setIsDetailLoading(true);
    setDetailError('');

    try {
      const restaurant = await getAdminRestaurantById(restaurantId);
      setSelectedRestaurant(restaurant);
    } catch (requestError) {
      setDetailError(requestError.message);
      setSelectedRestaurant(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedRestaurant(null);
    setDetailError('');
    setIsBanModalOpen(false);
  };

  const refreshAfterAction = async (restaurant, message, type = 'success') => {
    setSelectedRestaurant(restaurant);
    setToast({ message, type });
    await loadRestaurants({ showLoading: false });
  };

  const handleTogglePublish = async () => {
    if (!selectedRestaurant || isActionLoading) {
      return;
    }

    if (selectedRestaurant.isBanned) {
      setToast({
        message: 'Không thể công khai nhà hàng đang bị khóa.',
        type: 'warning'
      });
      return;
    }

    const nextIsPublished = !selectedRestaurant.isPublished;

    if (nextIsPublished) {
      const missingItems = selectedRestaurant.checklist
        ?.filter((item) => !item.isComplete)
        .map((item) => item.label)
        .join(', ');

      if (missingItems && !window.confirm(`Nhà hàng này còn thiếu: ${missingItems}. Bạn vẫn muốn công khai?`)) {
        return;
      }
    }

    setIsActionLoading(true);

    try {
      const result = await updateRestaurantPublishStatus(selectedRestaurant.id, nextIsPublished);
      await refreshAfterAction(
        result.restaurant,
        nextIsPublished ? 'Đã công khai nhà hàng.' : 'Đã chuyển nhà hàng về chưa công khai.',
        result.warnings?.length ? 'warning' : 'success'
      );
    } catch (requestError) {
      setToast({ message: requestError.message, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleOpenStatus = async () => {
    if (!selectedRestaurant || isActionLoading) {
      return;
    }

    const nextIsOpen = !selectedRestaurant.isOpen;

    if (selectedRestaurant.isBanned && nextIsOpen) {
      setToast({
        message: 'Không thể bật mở cửa cho nhà hàng đang bị khóa.',
        type: 'warning'
      });
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await updateRestaurantOpenStatus(selectedRestaurant.id, nextIsOpen);
      await refreshAfterAction(
        result.restaurant,
        nextIsOpen ? 'Đã chuyển quán sang đang mở cửa.' : 'Đã chuyển quán sang đang đóng cửa.'
      );
    } catch (requestError) {
      setToast({ message: requestError.message, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openBanModal = () => {
    if (!selectedRestaurant || selectedRestaurant.isBanned || isActionLoading) {
      return;
    }

    setBanReasonType(BAN_REASON_OPTIONS[0]);
    setBanReasonDetail('');
    setIsBanModalOpen(true);
  };

  const closeBanModal = () => {
    if (isActionLoading) {
      return;
    }

    setIsBanModalOpen(false);
    setBanReasonDetail('');
  };

  const handleBanRestaurant = async (event) => {
    event.preventDefault();

    if (!selectedRestaurant || isActionLoading) {
      return;
    }

    const detail = banReasonDetail.trim();
    const reason = detail ? `${banReasonType}: ${detail}` : banReasonType;

    if (banReasonType === 'Khác' && !detail) {
      setToast({
        message: 'Vui lòng nhập lý do cụ thể khi chọn Khác.',
        type: 'warning'
      });
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await banRestaurant(selectedRestaurant.id, reason);
      await refreshAfterAction(result.restaurant, 'Đã khóa nhà hàng.');
      setIsBanModalOpen(false);
      setBanReasonDetail('');
    } catch (requestError) {
      setToast({ message: requestError.message, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnbanRestaurant = async () => {
    if (!selectedRestaurant || isActionLoading) {
      return;
    }

    if (!window.confirm(`Mở khóa nhà hàng "${selectedRestaurant.name}"? Nhà hàng vẫn chưa tự công khai sau khi mở khóa.`)) {
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await unbanRestaurant(
        selectedRestaurant.id,
        'Admin đã kiểm tra và mở khóa nhà hàng.'
      );
      await refreshAfterAction(result.restaurant, 'Đã mở khóa nhà hàng.');
    } catch (requestError) {
      setToast({ message: requestError.message, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-['Be_Vietnam_Pro'] text-[#1a1c1a] lg:flex">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
      <AdminSidebar adminName={adminName} />

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-5 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">
                Quản lý Nhà hàng
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6e6a66]">
                Theo dõi, kiểm duyệt và quản lý hồ sơ các quán ăn trên hệ thống.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-5 lg:p-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon="storefront"
              label="Tổng nhà hàng"
              value={restaurantsData.summary?.totalRestaurants ?? 0}
            />
            <StatCard
              icon="public"
              label="Đang công khai"
              value={restaurantsData.summary?.publishedRestaurants ?? 0}
              accentClassName="border-l-4 border-l-[#006e2f]"
            />
            <StatCard
              icon="pending_actions"
              label="Chờ hoàn thiện"
              value={restaurantsData.summary?.pendingSetupRestaurants ?? 0}
              accentClassName="border-l-4 border-l-[#c47120]"
            />
            <StatCard
              icon="visibility_off"
              label="Chưa công khai"
              value={restaurantsData.summary?.unpublishedRestaurants ?? 0}
              accentClassName="border-l-4 border-l-[#8f6f6d]"
            />
            <StatCard
              icon="gpp_bad"
              label="Đã khóa"
              value={restaurantsData.summary?.bannedRestaurants ?? 0}
              accentClassName="border-l-4 border-l-[#b42318]"
            />
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:min-w-[320px] xl:w-[420px]">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#6e6a66]">
                  search
                </span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm tên quán, địa chỉ, số điện thoại hoặc chủ sở hữu..."
                  aria-label="Tìm kiếm nhà hàng"
                  className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#6e6a66] transition-colors hover:bg-[#efeeeb] hover:text-[#b71422]"
                    aria-label="Xóa từ khóa tìm kiếm nhà hàng"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e1da] bg-white px-4 py-2 text-sm font-bold text-[#1a1c1a] sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Lọc
              </button>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm font-medium outline-none focus:border-[#b71422] sm:w-auto"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Trạng thái: {option.label}
                  </option>
                ))}
              </select>

              <select
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm font-medium outline-none focus:border-[#b71422] sm:w-auto"
              >
                <option value="all">Khu vực: Tất cả</option>
                {(restaurantsData.districts || []).map((district) => (
                  <option key={district} value={district}>
                    Khu vực: {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled
                title="Xuất báo cáo sẽ được bổ sung sau"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e1da] bg-white px-4 py-2 text-sm font-bold text-[#8f6f6d] disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Xuất báo cáo
              </button>

              <button
                type="button"
                onClick={() => void loadRestaurants()}
                disabled={isLoading}
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#e5e1da] bg-white text-[#6e6a66] transition-colors hover:text-[#b71422] disabled:cursor-not-allowed disabled:opacity-60"
                title="Làm mới"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </section>

          {error && (
            <section className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
              Không thể tải danh sách nhà hàng: {error}
              <button
                type="button"
                onClick={() => void loadRestaurants()}
                className="ml-2 font-bold underline"
              >
                Thử lại
              </button>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-[#e5e1da] bg-[#fdfcfb] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <thead className="bg-[#f4f3f1] text-xs font-bold uppercase tracking-wide text-[#6e6a66]">
                  <tr>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Nhà hàng / Địa chỉ</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Chủ sở hữu</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Khu vực</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Hồ sơ</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Hoạt động</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3">Đánh giá</th>
                    <th className="border-b border-[#e5e1da] px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e1da]/70">
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan="7" className="px-4 py-5">
                          <div className="h-5 animate-pulse rounded bg-[#efeeeb]" />
                        </td>
                      </tr>
                    ))
                  ) : restaurantsData.items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-14 text-center text-[#6e6a66]">
                        Chưa có nhà hàng nào trong hệ thống.
                      </td>
                    </tr>
                  ) : (
                    restaurantsData.items.map((restaurant) => {
                      const hasWarnings =
                        !restaurant.hasImage ||
                        !restaurant.hasCoordinates ||
                        !restaurant.hasMenu ||
                        !restaurant.hasVietnameseNarration ||
                        !restaurant.hasEnglishNarration;

                      return (
                        <tr
                          key={restaurant.id}
                          className={`cursor-pointer transition-colors ${
                            restaurant.isBanned ? 'bg-[#fff5f5] hover:bg-[#fff0f0]' : 'hover:bg-white'
                          }`}
                          onClick={() => void openDetails(restaurant.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={restaurant.imageUrl || FALLBACK_IMAGE}
                                alt={restaurant.name}
                                className="h-12 w-12 shrink-0 rounded-lg border border-[#e4beba] object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 font-bold text-[#1a1a1a]">
                                  <span className="truncate">{restaurant.name}</span>
                                  {restaurant.isBanned && (
                                    <span
                                      className="material-symbols-outlined text-[16px] text-[#b42318]"
                                      title="Nhà hàng đã bị khóa"
                                    >
                                      lock
                                    </span>
                                  )}
                                  {hasWarnings && (
                                    <span
                                      className="material-symbols-outlined text-[16px] text-[#ba1a1a]"
                                      title="Thiếu thông tin"
                                    >
                                      warning
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 max-w-[260px] truncate text-xs text-[#6e6a66]">
                                  {restaurant.address || 'Chưa có địa chỉ'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#1a1a1a]">{restaurant.ownerName}</p>
                            <p className="mt-1 text-xs text-[#6e6a66]">
                              {restaurant.ownerEmail || restaurant.phoneNumber || 'Chưa có liên hệ'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-[#6e6a66]">
                            {restaurant.districtName || 'Chưa cập nhật'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge presentation={getProfilePresentation(restaurant)} />
                            <p className="mt-1 text-xs text-[#8f6f6d]">
                              {restaurant.profileCompletionCount}/{restaurant.profileCompletionTotal}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge presentation={getOpenPresentation(restaurant.isOpen)} />
                          </td>
                          <td className="px-4 py-3">
                            {restaurant.reviewCount > 0 && restaurant.rating !== null ? (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined fill text-[16px] text-[#c47120]">
                                  star
                                </span>
                                <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                                <span className="text-xs text-[#6e6a66]">({restaurant.reviewCount})</span>
                              </div>
                            ) : (
                              <span className="text-[#8f6f6d]">Chưa có</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {restaurant.isPublished && !restaurant.isBanned && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    window.open(`/restaurants/${restaurant.id}`, '_blank', 'noopener,noreferrer');
                                  }}
                                  className="rounded-md p-1.5 text-[#6e6a66] transition-colors hover:bg-[#efeeeb] hover:text-[#b71422]"
                                  title="Mở trang khách"
                                >
                                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void openDetails(restaurant.id);
                                }}
                                className="rounded-md p-1.5 text-[#6e6a66] transition-colors hover:bg-[#efeeeb] hover:text-[#b71422]"
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => event.stopPropagation()}
                                className="rounded-md p-1.5 text-[#8f6f6d]"
                                title="Thêm thao tác sẽ bổ sung sau"
                              >
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e1da] bg-[#f4f3f1] px-4 py-3 text-xs text-[#6e6a66]">
              <span>Hiển thị {firstItem}-{lastItem} trong số {restaurantsData.totalCount} nhà hàng</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page <= 1 || isLoading}
                  className="rounded px-2 py-1 transition-colors hover:bg-[#e3e2e0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &lt;
                </button>
                <span className="rounded bg-[#b71422] px-3 py-1 font-bold text-white">{page}</span>
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="rounded px-2 py-1 transition-colors hover:bg-[#e3e2e0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className={`fixed inset-0 z-[60] transition ${isPanelOpen ? 'pointer-events-auto bg-black/20 opacity-100' : 'pointer-events-none bg-transparent opacity-0'}`}>
        <button type="button" aria-label="Đóng panel" onClick={closePanel} className="absolute inset-0 h-full w-full cursor-default" />
        <aside className={`absolute right-0 top-0 flex h-full w-full max-w-[500px] flex-col border-l border-[#e5e1da] bg-[#faf9f6] shadow-2xl transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="flex items-start justify-between gap-3 border-b border-[#e5e1da] bg-[#fdfcfb] p-4 sm:gap-4 sm:p-5">
            {selectedRestaurant ? (
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <img
                  src={selectedRestaurant.imageUrl || FALLBACK_IMAGE}
                  alt={selectedRestaurant.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-[#e4beba] object-cover sm:h-16 sm:w-16"
                />
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold text-[#1a1a1a] sm:text-lg">{selectedRestaurant.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge presentation={getProfilePresentation(selectedRestaurant)} />
                    <StatusBadge presentation={getOpenPresentation(selectedRestaurant.isOpen)} />
                  </div>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-bold text-[#1a1a1a]">Chi tiết nhà hàng</h2>
            )}
            <button
              type="button"
              onClick={closePanel}
              className="rounded-full p-1 text-[#6e6a66] hover:bg-[#efeeeb] hover:text-[#b71422]"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {isDetailLoading ? (
              <div className="space-y-5">
                <div className="h-5 animate-pulse rounded bg-[#efeeeb]" />
                <div className="h-36 animate-pulse rounded bg-[#efeeeb]" />
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
                {detailError}
              </div>
            ) : selectedRestaurant ? (
              <div className="space-y-6">
                {selectedRestaurant.isBanned && (
                  <div className="flex items-start gap-3 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-3 text-sm text-[#991b1b]">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    Nhà hàng này đang bị khóa và đã bị ẩn khỏi các trang dành cho khách.
                  </div>
                )}

                {!selectedRestaurant.isBanned && selectedRestaurant.profileStatus === 'pendingSetup' && (
                  <div className="flex items-start gap-3 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-3 text-sm text-[#991b1b]">
                    <span className="material-symbols-outlined text-[20px]">error_outline</span>
                    Nhà hàng này đang chờ hoàn thiện thông tin trước khi công khai.
                  </div>
                )}

                <section>
                  <h3 className="border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                    Thông tin chung
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="flex min-w-0 gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#6e6a66]">location_on</span>
                      <span className="min-w-0 break-words">{selectedRestaurant.address || 'Chưa có địa chỉ'}</span>
                    </p>
                    <p className="flex min-w-0 gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#6e6a66]">person</span>
                      <span className="min-w-0 break-words">{selectedRestaurant.ownerName} {selectedRestaurant.phoneNumber ? `(${selectedRestaurant.phoneNumber})` : ''}</span>
                    </p>
                    <p className="flex min-w-0 gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#6e6a66]">mail</span>
                      <span className="min-w-0 break-all">{selectedRestaurant.ownerEmail || 'Chưa có email'}</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#6e6a66]">calendar_today</span>
                      <span>Ngày tạo: {formatDate(selectedRestaurant.createdAt)}</span>
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                    Kiểm duyệt nội dung
                  </h3>
                  <div className={`mt-4 rounded-lg border p-3 text-sm ${
                    selectedRestaurant.isBanned
                      ? 'border-[#fecaca] bg-[#fff5f5] text-[#991b1b]'
                      : 'border-[#d9e8dd] bg-[#f0fbf3] text-[#1b6d24]'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[18px]">
                        {selectedRestaurant.isBanned ? 'gpp_bad' : 'verified_user'}
                      </span>
                      {selectedRestaurant.isBanned ? 'Đã khóa' : 'Bình thường'}
                    </div>

                    {selectedRestaurant.isBanned ? (
                      <div className="mt-3 space-y-2 text-[#5b403e]">
                        <p>
                          <span className="font-bold">Lý do:</span>{' '}
                          {selectedRestaurant.banReason || 'Chưa có lý do cụ thể'}
                        </p>
                        <p>
                          <span className="font-bold">Thời gian khóa:</span>{' '}
                          {formatDate(selectedRestaurant.bannedAt)}
                        </p>
                        <p>
                          <span className="font-bold">Admin khóa:</span>{' '}
                          {selectedRestaurant.bannedByAdminName || 'Chưa xác định'}
                        </p>
                      </div>
                    ) : selectedRestaurant.unbannedAt ? (
                      <p className="mt-2 text-[#5b403e]">
                        Mở khóa lần gần nhất: {formatDate(selectedRestaurant.unbannedAt)}
                      </p>
                    ) : (
                      <p className="mt-2 text-[#5b403e]">
                        Nhà hàng chưa bị khóa kiểm duyệt.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="flex justify-between border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                    <span>Độ hoàn thiện hồ sơ</span>
                    <span className="text-[#c47120]">
                      {selectedRestaurant.profileCompletionCount}/{selectedRestaurant.profileCompletionTotal}
                    </span>
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {(selectedRestaurant.checklist || []).map((item) => (
                      <li
                        key={item.key}
                        className={`flex items-center gap-2 rounded-lg border p-2 ${
                          item.isComplete
                            ? 'border-[#d9e8dd] bg-[#f0fbf3] text-[#1b6d24]'
                            : 'border-[#fecaca] bg-[#fff5f5] text-[#b42318]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.isComplete ? 'check_circle' : 'cancel'}
                        </span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                    Chỉ số tương tác
                  </h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-3 text-center">
                      <p className="text-xs text-[#6e6a66]">Món ăn</p>
                      <p className="mt-1 text-xl font-bold">{selectedRestaurant.dishCount}</p>
                    </div>
                    <div className="rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-3 text-center">
                      <p className="text-xs text-[#6e6a66]">Lượt nghe</p>
                      <p className="mt-1 text-xl font-bold">{selectedRestaurant.audioListenCount ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-3 text-center">
                      <p className="text-xs text-[#6e6a66]">Đánh giá</p>
                      <p className="mt-1 text-xl font-bold">
                        {selectedRestaurant.reviewCount > 0 && selectedRestaurant.rating !== null
                          ? selectedRestaurant.rating.toFixed(1)
                          : '0'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
          </div>

          {selectedRestaurant && (
            <footer className="space-y-3 border-t border-[#e5e1da] bg-[#fdfcfb] p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/restaurants/${selectedRestaurant.id}/menu`)}
                  disabled={selectedRestaurant.isBanned}
                  title={selectedRestaurant.isBanned ? 'Nhà hàng đang bị khóa nên không mở trang menu public.' : 'Xem menu'}
                  className="rounded-lg border border-[#e5e1da] bg-[#efeeeb] px-4 py-2 text-sm font-bold text-[#1a1c1a] hover:bg-[#e3e2e0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Xem Menu
                </button>
                <button
                  type="button"
                  disabled
                  title="Sửa thông tin sẽ được triển khai ở bước sau"
                  className="rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sửa thông tin
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-[#e5e1da] pt-3">
                <span className="text-xs text-[#6e6a66]">
                  {selectedRestaurant.isBanned
                    ? 'Không thể công khai nhà hàng đang bị khóa'
                    : selectedRestaurant.isPublished
                      ? 'Đang công khai'
                      : 'Chuyển sang công khai'}
                </span>
                <ToggleSwitch
                  checked={selectedRestaurant.isPublished}
                  disabled={isActionLoading || selectedRestaurant.isBanned}
                  onClick={() => void handleTogglePublish()}
                  label="Cập nhật trạng thái công khai"
                />
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-[#e5e1da] pt-3">
                <span className="text-xs text-[#6e6a66]">
                  {selectedRestaurant.isBanned
                    ? 'Nhà hàng đang bị khóa'
                    : selectedRestaurant.isOpen
                      ? 'Đang mở cửa'
                      : 'Chuyển sang mở cửa'}
                </span>
                <ToggleSwitch
                  checked={selectedRestaurant.isOpen}
                  disabled={isActionLoading || selectedRestaurant.isBanned}
                  onClick={() => void handleToggleOpenStatus()}
                  label="Cập nhật trạng thái mở cửa"
                />
              </div>

              {selectedRestaurant.isBanned ? (
                <button
                  type="button"
                  onClick={() => void handleUnbanRestaurant()}
                  disabled={isActionLoading}
                  className="w-full rounded-lg border border-[#b7e2bf] bg-[#f0fbf3] py-2 text-center text-sm font-bold text-[#1b6d24] hover:bg-[#e9f8ed] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mở khóa quán
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openBanModal}
                  disabled={isActionLoading}
                  className="w-full rounded-lg border border-[#fecaca] bg-[#fff5f5] py-2 text-center text-sm font-bold text-[#ba1a1a] hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Khóa quán
                </button>
              )}
            </footer>
          )}
        </aside>
      </div>

      {isBanModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 px-4">
          <form
            onSubmit={(event) => void handleBanRestaurant(event)}
            className="w-full max-w-lg rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#b71422]">
                  Khóa nhà hàng
                </h2>
                <p className="mt-1 text-sm text-[#6e6a66]">
                  {selectedRestaurant.name} sẽ bị ẩn khỏi Home, bản đồ, menu public và audio public.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBanModal}
                disabled={isActionLoading}
                className="rounded-full p-1 text-[#6e6a66] hover:bg-[#efeeeb] hover:text-[#b71422] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="block text-sm font-bold text-[#5b403e]" htmlFor="ban-reason">
              Lý do khóa
            </label>
            <select
              id="ban-reason"
              value={banReasonType}
              onChange={(event) => setBanReasonType(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
            >
              {BAN_REASON_OPTIONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-bold text-[#5b403e]" htmlFor="ban-detail">
              Ghi chú chi tiết
            </label>
            <textarea
              id="ban-detail"
              value={banReasonDetail}
              onChange={(event) => setBanReasonDetail(event.target.value)}
              rows={4}
              placeholder="Nhập chi tiết để sau này admin/owner có thể kiểm tra lại..."
              className="mt-2 w-full resize-none rounded-lg border border-[#e5e1da] bg-white px-3 py-2 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
            />

            <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-3 text-sm text-[#991b1b]">
              Khi khóa, nhà hàng sẽ bị ẩn khỏi trang khách và không thể nghe thuyết minh public.
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeBanModal}
                disabled={isActionLoading}
                className="rounded-lg border border-[#e5e1da] bg-white px-4 py-2 text-sm font-bold text-[#5b403e] hover:bg-[#efeeeb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white hover:bg-[#9f1020] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isActionLoading ? 'Đang khóa...' : 'Xác nhận khóa'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;
