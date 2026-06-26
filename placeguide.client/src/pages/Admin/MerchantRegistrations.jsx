import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ToastMessage from '../../components/ToastMessage';
import {
  approveRestaurantRegistration,
  getRestaurantRegistrationById,
  getRestaurantRegistrations,
  rejectRestaurantRegistration
} from '../../services/adminRestaurantRegistrationService';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Rejected', label: 'Từ chối' }
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

function getStatusPresentation(status) {
  if (status === 'Approved') {
    return {
      label: 'Đã duyệt',
      className: 'bg-[#e9f8ed] text-[#1b6d24]',
      dotClassName: 'bg-[#1b6d24]'
    };
  }

  if (status === 'Rejected') {
    return {
      label: 'Từ chối',
      className: 'bg-[#fff0f0] text-[#b42318]',
      dotClassName: 'bg-[#b42318]'
    };
  }

  return {
    label: 'Chờ duyệt',
    className: 'bg-[#fff4e0] text-[#9a5b00]',
    dotClassName: 'bg-[#a36700]'
  };
}

function isImageFile(url) {
  return /\.(?:png|jpe?g|gif|webp)(?:\?.*)?$/i.test(url || '');
}

function StatusBadge({ status }) {
  const presentation = getStatusPresentation(status);

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${presentation.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${presentation.dotClassName}`} />
      {presentation.label}
    </span>
  );
}

function DocumentReference({ label, url }) {
  if (!url) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-lg border border-dashed border-[#d9d1ce] bg-[#faf9f6] p-4 text-center text-sm text-[#6e6a66]">
        <span className="material-symbols-outlined mb-2 text-[30px] text-[#8f6f6d]">description</span>
        {label}: Chưa có tệp
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-[16/10] overflow-hidden rounded-lg border border-[#e5e1da] bg-[#faf9f6] shadow-sm transition-shadow hover:shadow-md"
    >
      {isImageFile(url) ? (
        <img
          src={url}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-[#6e6a66]">
          <span className="material-symbols-outlined text-[38px]">description</span>
          <span className="text-sm font-semibold">Mở tài liệu</span>
        </div>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#1a1c1a] shadow-sm">
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Xem tài liệu
        </span>
      </span>
    </a>
  );
}

function MerchantRegistrations() {
  const adminName = useMemo(getStoredUserName, []);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalCount: 0, page: 1, pageSize: PAGE_SIZE });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const loadRegistrations = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getRestaurantRegistrations({
        status: statusFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGE_SIZE
      });
      setData(result);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  useEffect(() => {
    if (!isPanelOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (isRejectModalOpen) {
        setIsRejectModalOpen(false);
      } else {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, isRejectModalOpen]);

  const totalPages = Math.max(1, Math.ceil((data.totalCount || 0) / PAGE_SIZE));
  const firstItem = data.totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, data.totalCount);

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedRegistration(null);
    setDetailError('');
    setActionError('');
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const openDetails = async (id) => {
    setIsPanelOpen(true);
    setIsDetailLoading(true);
    setDetailError('');
    setActionError('');

    try {
      const registration = await getRestaurantRegistrationById(id);
      setSelectedRegistration(registration);
    } catch (requestError) {
      setDetailError(requestError.message);
      setSelectedRegistration(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const refreshAfterAction = async (registration, message) => {
    setSelectedRegistration(registration);
    setIsRejectModalOpen(false);
    setRejectionReason('');
    setToast({ message, type: 'success' });
    await loadRegistrations();
  };

  const handleApprove = async () => {
    if (!selectedRegistration || !window.confirm(`Duyệt đơn của ${selectedRegistration.restaurantName}?`)) {
      return;
    }

    setIsActionLoading(true);
    setActionError('');

    try {
      const approvalResult = await approveRestaurantRegistration(selectedRegistration.id);

      // API returns both the newly created restaurant id and the refreshed registration.
      await refreshAfterAction(
        approvalResult.registration,
        approvalResult.message || 'Đã duyệt đơn và tạo hồ sơ quán ăn.'
      );
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!selectedRegistration || !rejectionReason.trim()) {
      return;
    }

    setIsActionLoading(true);
    setActionError('');

    try {
      const registration = await rejectRestaurantRegistration(
        selectedRegistration.id,
        rejectionReason.trim()
      );
      await refreshAfterAction(registration, 'Đã từ chối đơn đăng ký đối tác.');
    } catch (requestError) {
      setActionError(requestError.message);
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
        <header className="sticky top-0 z-30 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 lg:gap-8">
              <h1 className="min-w-0 text-xl font-extrabold text-[#b71422] lg:text-2xl">Quản lý Đăng ký Đối tác</h1>
              <label className="relative w-full min-w-0 flex-1 sm:min-w-[220px] lg:max-w-md">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#5b403e]">search</span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm tên quán hoặc số điện thoại..."
                  className="h-10 w-full rounded-lg border border-[#e5e1da] bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]"
                />
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" title="Thông báo chưa triển khai" className="grid h-10 w-10 place-items-center rounded-full text-[#5b403e] transition-colors hover:bg-[#efeeeb]">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button type="button" title="Trợ giúp chưa triển khai" className="grid h-10 w-10 place-items-center rounded-full text-[#5b403e] transition-colors hover:bg-[#efeeeb]">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-5 lg:p-8">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a1a1a]">Danh sách đơn đăng ký</h2>
              <p className="mt-1 text-sm text-[#5b403e]">
                {statusFilter === 'Pending' ? 'Hệ thống đang có ' : 'Có '}
                <span className="font-bold text-[#b71422]">{data.totalCount} đơn</span>
                {statusFilter === 'Pending' ? ' cần xử lý.' : ' phù hợp với bộ lọc hiện tại.'}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                Trạng thái
                <span className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5b403e]">filter_list</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-[#e5e1da] bg-white py-2 pl-9 pr-8 text-sm font-semibold text-[#1a1c1a] outline-none focus:border-[#b71422] sm:min-w-[158px]"
                  >
                    <option value="">Tất cả trạng thái</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[#5b403e]">expand_more</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => void loadRegistrations()}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e1da] bg-white px-4 text-sm font-semibold text-[#1a1c1a] transition-colors hover:bg-[#efeeeb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[19px]">refresh</span>
                Làm mới
              </button>
            </div>
          </section>

          {error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
              Không thể tải danh sách đăng ký đối tác: {error}
            </div>
          )}

          <section className="overflow-hidden rounded-lg border border-[#e5e1da] bg-[#fdfcfb] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="border-b border-[#e5e1da] bg-[#f4f3f1] text-xs font-bold uppercase tracking-wide text-[#5b403e]">
                  <tr>
                    <th className="px-6 py-4">Tên quán</th>
                    <th className="px-6 py-4">Chủ sở hữu</th>
                    <th className="px-6 py-4">Số điện thoại</th>
                    <th className="px-6 py-4">Ngày đăng ký</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e1da]">
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan="6" className="px-6 py-5"><div className="h-5 animate-pulse rounded bg-[#efeeeb]" /></td>
                      </tr>
                    ))
                  ) : data.items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-14 text-center text-sm text-[#6e6a66]">
                        Không có đơn đăng ký nào phù hợp.
                      </td>
                    </tr>
                  ) : data.items.map((registration) => (
                    <tr key={registration.id} className="transition-colors hover:bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#db3237]/10 text-[#b71422]">
                            <span className="material-symbols-outlined">restaurant</span>
                          </span>
                          <span className="font-semibold text-[#1a1a1a]">{registration.restaurantName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#1a1a1a]">{registration.ownerName}</p>
                        <p className="mt-1 text-xs text-[#6e6a66]">{registration.ownerEmail || 'Chưa có email'}</p>
                      </td>
                      <td className="px-6 py-4 text-[#5b403e]">{registration.phoneNumber}</td>
                      <td className="px-6 py-4 text-[#5b403e]">{formatDate(registration.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={registration.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void openDetails(registration.id)}
                          className="rounded-lg border border-[#b71422] px-4 py-2 text-sm font-semibold text-[#b71422] transition-colors hover:bg-[#b71422]/5"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e1da] bg-[#f4f3f1] px-6 py-3 text-sm">
              <p className="text-[#5b403e]">Hiển thị {firstItem}-{lastItem} trên {data.totalCount} kết quả</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Trang trước"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page <= 1 || isLoading}
                  className="grid h-8 w-8 place-items-center rounded border border-[#e5e1da] bg-white text-[#5b403e] transition-colors hover:bg-[#efeeeb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="grid h-8 min-w-8 place-items-center rounded bg-[#b71422] px-2 text-xs font-bold text-white">{page}</span>
                <button
                  type="button"
                  title="Trang sau"
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="grid h-8 w-8 place-items-center rounded border border-[#e5e1da] bg-white text-[#5b403e] transition-colors hover:bg-[#efeeeb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className={`fixed inset-0 z-[60] transition ${isPanelOpen ? 'pointer-events-auto bg-black/20 opacity-100' : 'pointer-events-none bg-transparent opacity-0'}`}>
        <button type="button" aria-label="Đóng panel" onClick={closePanel} className="absolute inset-0 h-full w-full cursor-default" />
        <aside className={`absolute right-0 top-0 flex h-full w-full max-w-[500px] flex-col border-l border-[#e5e1da] bg-[#faf9f6] shadow-2xl transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="flex items-center justify-between gap-3 border-b border-[#e5e1da] bg-[#f4f3f1] px-4 py-4 sm:px-5 sm:py-5 lg:px-8">
            <div>
              <h2 className="text-lg font-bold text-[#1a1a1a] sm:text-xl">Chi tiết đăng ký</h2>
              {selectedRegistration && <div className="mt-2"><StatusBadge status={selectedRegistration.status} /></div>}
            </div>
            <button type="button" onClick={closePanel} title="Đóng" className="grid h-10 w-10 place-items-center rounded-full text-[#5b403e] transition-colors hover:bg-[#e9e8e5]" aria-label="Đóng">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          {isDetailLoading ? (
            <div className="space-y-6 p-5 lg:p-8"><div className="h-6 animate-pulse rounded bg-[#efeeeb]" /><div className="h-40 animate-pulse rounded bg-[#efeeeb]" /></div>
          ) : detailError ? (
            <div className="m-5 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b] lg:m-8">{detailError}</div>
          ) : selectedRegistration && (
            <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-5 lg:p-8">
              {actionError && <div className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">{actionError}</div>}

              <section>
                <h3 className="border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5b403e]">Thông tin cơ bản</h3>
                <dl className="mt-5 grid gap-5 text-sm">
                  <div><dt className="text-[#6e6a66]">Tên quán</dt><dd className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedRegistration.restaurantName}</dd></div>
                  <div><dt className="text-[#6e6a66]">Địa chỉ đầy đủ</dt><dd className="mt-1 leading-6 text-[#1a1a1a]">{selectedRegistration.address}</dd></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div><dt className="text-[#6e6a66]">Số điện thoại</dt><dd className="mt-1 font-bold text-[#1a1a1a]">{selectedRegistration.phoneNumber}</dd></div>
                    <div><dt className="text-[#6e6a66]">Người đại diện</dt><dd className="mt-1 text-[#1a1a1a]">{selectedRegistration.ownerName}</dd></div>
                  </div>
                  {selectedRegistration.ownerEmail && <div><dt className="text-[#6e6a66]">Email</dt><dd className="mt-1 break-all text-[#1a1a1a]">{selectedRegistration.ownerEmail}</dd></div>}
                </dl>
              </section>

              <section>
                <h3 className="border-b border-[#e5e1da] pb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5b403e]">Hồ sơ pháp lý</h3>
                <div className="mt-5 space-y-6">
                  <div><p className="mb-2 text-sm font-semibold text-[#1a1a1a]">Giấy phép kinh doanh</p><DocumentReference label="Giấy phép kinh doanh" url={selectedRegistration.businessLicenseUrl} /></div>
                  <div><p className="mb-2 text-sm font-semibold text-[#1a1a1a]">Giấy chứng nhận VSATTP</p><DocumentReference label="Giấy chứng nhận VSATTP" url={selectedRegistration.foodSafetyCertificateUrl} /></div>
                </div>
              </section>

              {selectedRegistration.adminNote && (
                <section className="rounded-lg border border-[#e4beba] bg-[#fffaf9] p-4 text-sm">
                  <p className="font-bold text-[#5b403e]">Ghi chú Admin</p>
                  <p className="mt-2 leading-6 text-[#6e6a66]">{selectedRegistration.adminNote}</p>
                </section>
              )}

              {selectedRegistration.status === 'Approved' && selectedRegistration.approvedRestaurantId && (
                <section className="rounded-lg border border-[#b7e2bf] bg-[#effaf1] p-4 text-sm">
                  <p className="font-bold text-[#1b6d24]">Hồ sơ quán đã được tạo</p>
                  <p className="mt-2 leading-6 text-[#39683f]">Quán đang chờ chủ quán hoàn thiện thông tin trước khi công khai.</p>
                  <p className="mt-2 break-all text-xs font-semibold text-[#39683f]">Mã hồ sơ quán: {selectedRegistration.approvedRestaurantId}</p>
                </section>
              )}
            </div>
          )}

          {selectedRegistration?.status === 'Pending' && (
            <footer className="grid grid-cols-1 gap-3 border-t border-[#e5e1da] bg-[#f4f3f1] p-4 sm:grid-cols-2 sm:p-5 lg:p-6">
              <button type="button" onClick={() => setIsRejectModalOpen(true)} disabled={isActionLoading} className="rounded-lg border border-[#ff4d4d] bg-white px-3 py-3 text-sm font-bold text-[#b42318] transition-colors hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60">Từ chối đơn</button>
              <button type="button" onClick={() => void handleApprove()} disabled={isActionLoading} className="rounded-lg bg-[#006e2f] px-3 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#005321] disabled:cursor-not-allowed disabled:opacity-60">{isActionLoading ? 'Đang xử lý...' : 'Duyệt đơn này'}</button>
            </footer>
          )}
        </aside>
      </div>

      {isRejectModalOpen && selectedRegistration && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-5">
          <form onSubmit={handleReject} className="w-full max-w-md rounded-lg border border-[#e5e1da] bg-white p-4 shadow-xl sm:p-5">
            <h2 className="text-lg font-bold">Từ chối đơn đăng ký</h2>
            <p className="mt-2 text-sm leading-6 text-[#6e6a66]">Nhập lý do để chủ quán có thể bổ sung hồ sơ.</p>
            <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} required maxLength="1000" className="mt-4 min-h-32 w-full rounded-lg border border-[#d9d1ce] p-3 text-sm outline-none focus:border-[#b71422] focus:ring-1 focus:ring-[#b71422]" placeholder="Ví dụ: Giấy phép kinh doanh chưa hiển thị rõ thông tin..." />
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsRejectModalOpen(false)} disabled={isActionLoading} className="rounded-lg border border-[#d9d1ce] px-4 py-2 text-sm font-semibold text-[#5b403e]">Hủy</button>
              <button type="submit" disabled={isActionLoading || !rejectionReason.trim()} className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isActionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MerchantRegistrations;
