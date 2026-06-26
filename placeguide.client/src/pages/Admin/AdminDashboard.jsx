import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getActiveVisitorsByHour,
  getAdminDashboardSummary,
  getVisitorsByDistrict
} from '../../services/adminDashboardService';
import AdminSidebar from '../../components/AdminSidebar';

const REFRESH_INTERVAL_MS = 5_000;
const CHART_REFRESH_INTERVAL_MS = 60_000;
const DISTRICT_BAR_COLORS = [
  'bg-[#af101a]',
  'bg-[#1b6d24]',
  'bg-[#c47120]',
  'bg-[#1d6f8f]',
  'bg-[#8f6f6d]'
];

const adminModules = [
  ['Tổng quan', 'Theo dõi du khách online, AudioPass và lưu lượng truy cập.', 'Đang dùng'],
  ['Đăng ký đối tác', 'Duyệt hồ sơ chủ quán và giấy tờ pháp lý.', 'Đang dùng'],
  ['Nhà hàng', 'Quản lý thông tin, trạng thái và nội dung quán.', 'Sắp triển khai'],
  ['Nội dung', 'Quản lý ảnh, bản dịch và thuyết minh.', 'Sắp triển khai'],
  ['Đánh giá', 'Theo dõi review và nội dung media từ du khách.', 'Sắp triển khai']
];

function formatUpdatedAt(value) {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
}

function getStoredUserName() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}').fullName || 'Quản trị viên';
  } catch {
    return 'Quản trị viên';
  }
}

function getVietnamDateValue() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [hourlyVisitors, setHourlyVisitors] = useState([]);
  const [districtVisitors, setDistrictVisitors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getVietnamDateValue);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [error, setError] = useState('');
  const [chartError, setChartError] = useState('');
  const [districtChartError, setDistrictChartError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isDistrictChartLoading, setIsDistrictChartLoading] = useState(true);
  const adminName = useMemo(getStoredUserName, []);

  const loadSummary = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const dashboardSummary = await getAdminDashboardSummary();
      setSummary(dashboardSummary);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHourlyVisitors = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setIsChartLoading(true);
    }

    try {
      const statistics = await getActiveVisitorsByHour(selectedDate);
      setHourlyVisitors(statistics);
      setChartError('');
    } catch (requestError) {
      setChartError(requestError.message);
    } finally {
      setIsChartLoading(false);
    }
  }, [selectedDate]);

  const loadDistrictVisitors = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setIsDistrictChartLoading(true);
    }

    try {
      const statistics = await getVisitorsByDistrict(selectedDate);
      setDistrictVisitors(statistics);
      setDistrictChartError('');
    } catch (requestError) {
      setDistrictChartError(requestError.message);
    } finally {
      setIsDistrictChartLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadSummary({ showLoading: true });

    const intervalId = window.setInterval(() => {
      void loadSummary();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadSummary]);

  useEffect(() => {
    void loadHourlyVisitors({ showLoading: true });

    const intervalId = window.setInterval(() => {
      void loadHourlyVisitors();
    }, CHART_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadHourlyVisitors]);

  useEffect(() => {
    void loadDistrictVisitors({ showLoading: true });

    const intervalId = window.setInterval(() => {
      void loadDistrictVisitors();
    }, CHART_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadDistrictVisitors]);

  const activeVisitors = summary?.activeVisitors ?? 0;
  const totalVisitors = summary?.totalVisitors ?? 0;
  const paidAudioPassOrders = summary?.paidAudioPassOrders ?? 0;
  const totalRestaurants = summary?.totalRestaurants ?? 0;
  const publishedRestaurants = summary?.publishedRestaurants ?? 0;
  const pendingRestaurantRegistrations = summary?.pendingRestaurantRegistrations ?? 0;
  const approvedRestaurantRegistrations = summary?.approvedRestaurantRegistrations ?? 0;
  const rejectedRestaurantRegistrations = summary?.rejectedRestaurantRegistrations ?? 0;
  const activeWindowSeconds = summary?.activeWindowSeconds ?? 60;
  const maximumHourlyVisitors = Math.max(
    1,
    ...hourlyVisitors.map(({ activeVisitors: count }) => count)
  );
  const totalDistrictVisitors = districtVisitors.reduce(
    (total, { visitorCount }) => total + visitorCount,
    0
  );
  const visibleDistrictVisitors = showAllDistricts
    ? districtVisitors
    : districtVisitors.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] lg:flex">
      <AdminSidebar adminName={adminName} />

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e1da] bg-white/85 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <div>
            <h1 className="text-xl font-extrabold text-[#af101a]">Tổng quan hệ thống</h1>
            <p className="mt-1 text-sm text-[#6e6a66]">Theo dõi hoạt động du khách theo thời gian thực.</p>
          </div>
          <Link to="/home" className="text-sm font-semibold text-[#af101a] hover:underline">
            Mở trang khách
          </Link>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-5 lg:p-8">
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-[#e5e1da] bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-[#5b403d]">Tổng số du khách</p>
              <p className="mt-3 text-5xl font-extrabold tabular-nums text-[#1a1c1a]">
                {isLoading ? '...' : totalVisitors}
              </p>
              <p className="mt-5 border-t border-[#f0eded] pt-4 text-sm leading-6 text-[#6e6a66]">
                Số thiết bị đã từng truy cập PlaceGuide.
              </p>
            </div>

            <div className="border border-[#e5e1da] bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-[#5b403d]">Quán đang công khai</p>
              <p className="mt-3 text-5xl font-extrabold tabular-nums text-[#1a1c1a]">
                {isLoading ? '...' : publishedRestaurants}
              </p>
              <p className="mt-5 border-t border-[#f0eded] pt-4 text-sm leading-6 text-[#6e6a66]">
                Tổng hồ sơ quán trong hệ thống: {isLoading ? '...' : totalRestaurants}.
              </p>
            </div>

            <div className="border border-[#e5e1da] bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-[#5b403d]">AudioPass đã xác nhận</p>
              <p className="mt-3 text-5xl font-extrabold tabular-nums text-[#1b6d24]">
                {isLoading ? '...' : paidAudioPassOrders}
              </p>
              <p className="mt-5 border-t border-[#f0eded] pt-4 text-sm leading-6 text-[#6e6a66]">
                Giao dịch AudioPass có trạng thái đã thanh toán.
              </p>
            </div>

            <Link
              to="/admin/merchant-registrations"
              className="border border-[#e4beba] bg-white p-6 shadow-sm transition-colors hover:bg-[#fff5f4]"
            >
              <p className="text-sm font-medium text-[#5b403d]">Đơn đối tác chờ duyệt</p>
              <p className="mt-3 text-5xl font-extrabold tabular-nums text-[#af101a]">
                {isLoading ? '...' : pendingRestaurantRegistrations}
              </p>
              <p className="mt-5 border-t border-[#f0eded] pt-4 text-sm leading-6 text-[#6e6a66]">
                Đã duyệt: {isLoading ? '...' : approvedRestaurantRegistrations} · Từ chối: {isLoading ? '...' : rejectedRestaurantRegistrations}
              </p>
            </Link>

            <div className="border border-[#e4beba] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#af101a]">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1b6d24]" />
                    TRỰC TUYẾN
                  </div>
                  <p className="mt-5 text-sm font-medium text-[#5b403d]">Du khách đang hoạt động</p>
                  <p className="mt-1 text-5xl font-extrabold tabular-nums text-[#af101a]">
                    {isLoading ? '...' : activeVisitors}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadSummary({ showLoading: true })}
                  className="border border-[#e4beba] px-3 py-2 text-sm font-semibold text-[#af101a] transition-colors hover:bg-[#fff5f4] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                >
                  Làm mới
                </button>
              </div>

              <p className="mt-6 border-t border-[#f0eded] pt-4 text-sm leading-6 text-[#6e6a66]">
                Một du khách được tính khi thiết bị của họ hoạt động trong {activeWindowSeconds} giây gần nhất.
              </p>
            </div>
          </section>

          <section className="border border-[#e5e1da] bg-[#f6f3f2] p-5 text-sm text-[#6e6a66]">
            Dữ liệu live cập nhật mỗi 5 giây. Lần gần nhất: {formatUpdatedAt(summary?.generatedAtUtc)}.
          </section>

          {error && (
            <section className="border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
              Không thể tải số liệu: {error}
            </section>
          )}

          <section className="border border-[#e5e1da] bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-sm font-bold uppercase text-[#af101a]">Lưu lượng du khách</p>
                <h2 className="mt-1 text-xl font-extrabold">Du khách hoạt động theo giờ</h2>
                <p className="mt-2 text-sm leading-6 text-[#6e6a66]">
                  Mỗi cột là số thiết bị ẩn danh có hoạt động ít nhất một lần trong giờ đó.
                </p>
              </div>

              <label className="grid w-full gap-1 text-sm font-semibold text-[#5b403d] sm:w-auto">
                Ngày xem báo cáo
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setShowAllDistricts(false);
                  }}
                  className="h-10 w-full border border-[#d9d1ce] bg-white px-3 text-sm font-medium text-[#1a1c1a] outline-none transition-colors focus:border-[#af101a]"
                />
              </label>
            </div>

            {chartError && (
              <div className="mt-5 border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
                Không thể tải biểu đồ: {chartError}
              </div>
            )}

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="min-w-[720px]">
                <div className="flex h-64 items-stretch gap-1 border-b border-[#d9d1ce] px-2 pt-3">
                  {isChartLoading
                    ? Array.from({ length: 24 }, (_, index) => (
                      <div
                        key={index}
                        className="flex h-full min-w-5 flex-1 flex-col justify-end"
                      >
                        <div className="h-24 animate-pulse bg-[#f0eded]" />
                      </div>
                    ))
                    : hourlyVisitors.map(({ hour, activeVisitors: count }) => {
                      const height = count === 0
                        ? '0%'
                        : `${Math.max(8, (count / maximumHourlyVisitors) * 100)}%`;

                      return (
                        <div
                          key={hour}
                          className="flex h-full min-w-5 flex-1 flex-col justify-end"
                          title={`${hour}: ${count} du khách`}
                          aria-label={`${hour}: ${count} du khách`}
                        >
                          <span className="mb-1 text-center text-xs font-bold tabular-nums text-[#af101a]">
                            {count || ''}
                          </span>
                          <div className="flex flex-1 items-end">
                            <div
                              className="w-full bg-[#af101a] transition-[height] duration-300 hover:bg-[#8f0d15]"
                              style={{ height }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-2 flex gap-1 px-2 text-xs font-medium text-[#8f6f6d]">
                  {(isChartLoading
                    ? Array.from({ length: 24 }, (_, index) => ({ hour: `${index}:00` }))
                    : hourlyVisitors
                  ).map(({ hour }, index) => (
                    <span key={`${hour}-${index}`} className="min-w-5 flex-1 text-center">
                      {index % 3 === 0 ? hour : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eded] pt-4 text-sm text-[#6e6a66]">
              <span>24 mốc giờ theo giờ Việt Nam.</span>
              <span>Dữ liệu biểu đồ làm mới mỗi 60 giây.</span>
            </div>
          </section>

          <section className="border border-[#e5e1da] bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">Nguồn khách</h2>
                <p className="mt-1 text-sm leading-6 text-[#6e6a66]">Phân bổ theo quận/huyện</p>
              </div>
              <span className="border border-[#e4beba] bg-[#fff5f4] px-3 py-2 text-sm font-bold text-[#af101a]">
                Nguồn: Xem quán
              </span>
            </div>

            {districtChartError && (
              <div className="mt-5 border border-[#fecaca] bg-[#fff5f5] p-4 text-sm text-[#991b1b]">
                Không thể tải biểu đồ quận/huyện: {districtChartError}
              </div>
            )}

            {isDistrictChartLoading ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-2/5 animate-pulse bg-[#f0eded]" />
                    <div className="h-2 w-full animate-pulse bg-[#f0eded]" />
                  </div>
                ))}
              </div>
            ) : districtVisitors.length === 0 ? (
              <div className="mt-6 border border-dashed border-[#d9d1ce] bg-[#faf9f6] px-5 py-12 text-center text-sm leading-6 text-[#6e6a66]">
                Chưa có dữ liệu phân bổ theo quận/huyện cho ngày này.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {visibleDistrictVisitors.map(({ districtName, visitorCount }, index) => {
                  const percentage = totalDistrictVisitors > 0
                    ? Math.round((visitorCount / totalDistrictVisitors) * 100)
                    : 0;

                  return (
                    <div key={districtName}>
                      <div className="mb-1 flex items-center justify-between gap-4 text-sm">
                        <span className="min-w-0 break-words font-medium text-[#1a1c1a]">{districtName}</span>
                        <span className="shrink-0 tabular-nums text-[#6e6a66]">
                          {percentage}% ({visitorCount})
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0eded]">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            DISTRICT_BAR_COLORS[index % DISTRICT_BAR_COLORS.length]
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eded] pt-4 text-sm text-[#6e6a66]">
              <span>Mỗi du khách chỉ được tính một lần cho mỗi quận/huyện trong ngày.</span>
              <span>Không lưu GPS thô trong thống kê này.</span>
            </div>

            {districtVisitors.length > 5 && !isDistrictChartLoading && (
              <button
                type="button"
                onClick={() => setShowAllDistricts((currentValue) => !currentValue)}
                className="mt-6 flex w-full items-center justify-center gap-1 border border-[#d9d1ce] py-2 text-sm font-semibold text-[#5b403d] transition-colors hover:bg-[#faf9f6]"
              >
                {showAllDistricts ? 'Thu gọn danh sách' : 'Xem báo cáo chi tiết'}
                <span className="material-symbols-outlined text-sm">
                  {showAllDistricts ? 'expand_less' : 'arrow_forward'}
                </span>
              </button>
            )}
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold">Khu vực quản trị</h2>
              <p className="mt-1 text-sm text-[#6e6a66]">
                Các module đang dùng và phần sẽ triển khai tiếp.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {adminModules.map(([title, description, status]) => (
                <div key={title} className="border border-[#e5e1da] bg-white p-5">
                  <p className="font-bold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6e6a66]">{description}</p>
                  <p
                    className={`mt-4 text-xs font-semibold uppercase ${
                      status === 'Đang dùng' ? 'text-[#1b6d24]' : 'text-[#8f6f6d]'
                    }`}
                  >
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
