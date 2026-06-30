import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  getAnalyticsSummary,
  getAudioListenAnalytics,
  getAudioPassAnalytics,
  getRestaurantAnalytics,
  getReviewAnalytics,
  getVisitorAnalytics
} from '../../services/adminAnalyticsService';
import {
  getLanguageDisplayName,
  LANGUAGE_OPTIONS
} from '../../i18n/languageConfig';

const STATUS_LABELS = {
  paid: 'Đã thanh toán',
  pending: 'Đang chờ',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
  published: 'Đang công khai',
  banned: 'Đã khóa'
};

const STATUS_COLORS = {
  paid: '#1b6d24',
  pending: '#c47120',
  failed: '#b71422',
  cancelled: '#8f6f6d',
  expired: '#5b403e'
};

const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGE_OPTIONS.map((language) => [
    language.code,
    getLanguageDisplayName(language.code, 'vi')
  ])
);

function getVietnamDate(offsetDays = 0) {
  const now = new Date();
  const vietnamDate = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
  );
  vietnamDate.setDate(vietnamDate.getDate() + offsetDays);

  const year = vietnamDate.getFullYear();
  const month = String(vietnamDate.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPresetRange(preset) {
  const today = getVietnamDate();

  if (preset === 'today') {
    return { fromDate: today, toDate: today };
  }

  if (preset === 'month') {
    return { fromDate: `${today.slice(0, 8)}01`, toDate: today };
  }

  return {
    fromDate: getVietnamDate(preset === '30days' ? -29 : -6),
    toDate: today
  };
}

function getStoredAdminName() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}').fullName ||
      'Quản trị viên';
  } catch {
    return 'Quản trị viên';
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDateLabel(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value) {
  if (!value) {
    return 'Chưa xác định';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function StatCard({ icon, label, value, detail, tone = 'red' }) {
  const tones = {
    red: 'bg-[#fff3f2] text-[#b71422]',
    green: 'bg-[#edf8ef] text-[#1b6d24]',
    amber: 'bg-[#fff5e8] text-[#9a560e]',
    blue: 'bg-[#edf5fa] text-[#1d6f8f]',
    violet: 'bg-[#f5effb] text-[#75449a]'
  };

  return (
    <article className="min-w-0 rounded-xl border border-[#e5e1da] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6e6a66]">
            {label}
          </p>
          <p className="mt-3 break-words text-2xl font-extrabold text-[#1a1c1a]">
            {value}
          </p>
          {detail && <p className="mt-2 text-xs text-[#6e6a66]">{detail}</p>}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <span className="material-symbols-outlined text-[21px]">{icon}</span>
        </span>
      </div>
    </article>
  );
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-[#e5e1da] bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#1a1c1a]">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-[#6e6a66]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ message = 'Chưa có dữ liệu thống kê.' }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#d8d2ca] bg-[#faf9f6] px-4 text-center text-sm text-[#6e6a66]">
      {message}
    </div>
  );
}

function RevenueChart({ items }) {
  if (!items?.length) {
    return <EmptyChart />;
  }

  const maximum = Math.max(1, ...items.map((item) => item.revenue));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex h-56 min-w-[520px] items-end gap-3 border-b border-[#e5e1da] px-2">
        {items.map((item) => (
          <div key={item.date} className="flex h-full min-w-12 flex-1 flex-col justify-end">
            <div className="mb-2 text-center text-[10px] font-bold text-[#5b403e]">
              {formatNumber(item.paidOrders)}
            </div>
            <div
              className="mx-auto w-full max-w-12 rounded-t-md bg-[#b71422] transition-[height]"
              style={{ height: `${Math.max(5, item.revenue * 78 / maximum)}%` }}
              title={`${formatCurrency(item.revenue)} - ${item.paidOrders} đơn`}
            />
            <p className="mt-2 truncate text-center text-[10px] text-[#6e6a66]">
              {formatDateLabel(item.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupedAudioChart({ items }) {
  if (!items?.length) {
    return <EmptyChart />;
  }

  const maximum = Math.max(
    1,
    ...items.flatMap((item) => [item.restaurant, item.dish])
  );

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex h-52 min-w-[520px] items-end gap-4 border-b border-[#e5e1da] px-2">
        {items.map((item) => (
          <div key={item.date} className="flex h-full min-w-12 flex-1 flex-col justify-end">
            <div className="flex flex-1 items-end justify-center gap-1">
              <div
                className="w-4 rounded-t-sm bg-[#b71422]"
                style={{ height: `${Math.max(3, item.restaurant * 100 / maximum)}%` }}
                title={`Nhà hàng: ${item.restaurant}`}
              />
              <div
                className="w-4 rounded-t-sm bg-[#c47120]"
                style={{ height: `${Math.max(3, item.dish * 100 / maximum)}%` }}
                title={`Món ăn: ${item.dish}`}
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-[#6e6a66]">
              {formatDateLabel(item.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBars({ items, labelKey, valueKey, color = '#b71422' }) {
  if (!items?.length) {
    return <EmptyChart />;
  }

  const maximum = Math.max(1, ...items.map((item) => item[valueKey] || 0));

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item[labelKey]}-${index}`}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
            <span className="min-w-0 truncate font-semibold text-[#1a1c1a]">
              {item[labelKey]}
            </span>
            <span className="shrink-0 font-bold text-[#5b403e]">
              {formatNumber(item[valueKey])}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#efeeeb]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, item[valueKey] * 100 / maximum)}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-32 rounded-xl bg-white" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-white" />
        <div className="h-80 rounded-xl bg-white" />
      </div>
      <p className="text-center text-sm font-semibold text-[#6e6a66]">
        Đang tải dữ liệu phân tích...
      </p>
    </div>
  );
}

function AdminAnalytics() {
  const initialRange = useMemo(() => getPresetRange('7days'), []);
  const [preset, setPreset] = useState('7days');
  const [draftRange, setDraftRange] = useState(initialRange);
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const adminName = useMemo(getStoredAdminName, []);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const parameters = appliedRange;
      const [
        summary,
        audioPass,
        audioListens,
        restaurants,
        reviews,
        visitors
      ] = await Promise.all([
        getAnalyticsSummary(parameters),
        getAudioPassAnalytics({ ...parameters, groupBy: 'day' }),
        getAudioListenAnalytics({ ...parameters, groupBy: 'day' }),
        getRestaurantAnalytics(parameters),
        getReviewAnalytics(parameters),
        getVisitorAnalytics(parameters)
      ]);

      setData({
        summary,
        audioPass,
        audioListens,
        restaurants,
        reviews,
        visitors
      });
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu phân tích.');
    } finally {
      setIsLoading(false);
    }
  }, [appliedRange]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  function selectPreset(nextPreset) {
    setPreset(nextPreset);
    setDraftRange(getPresetRange(nextPreset));
  }

  function applyRange() {
    if (!draftRange.fromDate || !draftRange.toDate) {
      setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (draftRange.fromDate > draftRange.toDate) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }

    setAppliedRange({ ...draftRange });
  }

  const summary = data?.summary || {};
  const audioPass = data?.audioPass || {};
  const audio = data?.audioListens || {};
  const restaurants = data?.restaurants || {};
  const reviews = data?.reviews || {};
  const visitors = data?.visitors || {};
  const topLanguage = audio.byLanguage?.[0];
  const maximumHourly = Math.max(
    1,
    ...(visitors.activeVisitorsByHour || []).map((item) => item.count)
  );
  const maximumRatingCount = Math.max(
    1,
    ...(reviews.ratingDistribution || []).map((item) => item.count)
  );
  const statusTotal = (audioPass.paymentStatus || []).reduce(
    (total, item) => total + item.count,
    0
  );
  const topTabRows = {
    restaurants: (audio.topContents || []).filter(
      (item) => item.contentType === 'restaurant'
    ),
    dishes: (audio.topContents || []).filter(
      (item) => item.contentType === 'dish'
    ),
    ratings: reviews.topRatedRestaurants || [],
    districts: visitors.districtInterest || []
  }[activeTab] || [];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] lg:flex">
      <AdminSidebar adminName={adminName} />

      <main className="min-w-0 flex-1">
        <header className="border-b border-[#e5e1da] bg-white px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Phân tích &amp; Thống kê
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6e6a66]">
                Theo dõi doanh thu AudioPass, lượt nghe thuyết minh, hoạt động
                du khách và chất lượng nội dung trên hệ thống.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadAnalytics()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#d8d2ca] bg-white px-4 py-2.5 text-sm font-bold hover:bg-[#f4f3f1]"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Làm mới
              </button>
              <button
                type="button"
                onClick={() => window.alert('Xuất báo cáo sẽ được bổ sung ở bước sau.')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#b71422] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#930014]"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Xuất báo cáo
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-xl border border-[#e5e1da] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  ['today', 'Hôm nay'],
                  ['7days', '7 ngày qua'],
                  ['30days', '30 ngày qua'],
                  ['month', 'Tháng này']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectPreset(value)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                      preset === value
                        ? 'bg-[#b71422] text-white'
                        : 'bg-[#f4f3f1] text-[#5b403e] hover:bg-[#e9e8e5]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="text-xs font-bold text-[#5b403e]">
                  Từ ngày
                  <input
                    type="date"
                    value={draftRange.fromDate}
                    onChange={(event) => {
                      setPreset('custom');
                      setDraftRange((current) => ({
                        ...current,
                        fromDate: event.target.value
                      }));
                    }}
                    className="mt-1 block h-10 rounded-lg border border-[#d8d2ca] bg-white px-3 text-sm"
                  />
                </label>
                <label className="text-xs font-bold text-[#5b403e]">
                  Đến ngày
                  <input
                    type="date"
                    value={draftRange.toDate}
                    onChange={(event) => {
                      setPreset('custom');
                      setDraftRange((current) => ({
                        ...current,
                        toDate: event.target.value
                      }));
                    }}
                    className="mt-1 block h-10 rounded-lg border border-[#d8d2ca] bg-white px-3 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={applyRange}
                  className="h-10 rounded-lg bg-[#1b6d24] px-5 text-sm font-bold text-white hover:bg-[#14551b]"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </section>

          {error && (
            <section className="rounded-xl border border-[#f0b6b1] bg-[#fff3f2] p-5">
              <p className="font-bold text-[#930014]">
                Không thể tải dữ liệu phân tích.
              </p>
              <p className="mt-1 text-sm text-[#5b403e]">{error}</p>
              <button
                type="button"
                onClick={() => void loadAnalytics()}
                className="mt-4 rounded-lg bg-[#b71422] px-4 py-2 text-sm font-bold text-white"
              >
                Thử lại
              </button>
            </section>
          )}

          {isLoading ? (
            <AnalyticsSkeleton />
          ) : data ? (
            <>
              <section>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    icon="payments"
                    label="Doanh thu AudioPass"
                    value={formatCurrency(summary.audioPassRevenue)}
                    detail={`${formatNumber(audioPass.successRate)}% giao dịch thành công`}
                  />
                  <StatCard
                    icon="verified"
                    label="AudioPass đã thanh toán"
                    value={formatNumber(summary.paidAudioPassOrders)}
                    tone="green"
                  />
                  <StatCard
                    icon="headphones"
                    label="Lượt nghe Audio"
                    value={formatNumber(summary.totalAudioListens)}
                    tone="amber"
                  />
                  <StatCard
                    icon="groups"
                    label="Du khách hoạt động"
                    value={formatNumber(summary.activeVisitors)}
                    detail="Đang online trong cửa sổ 30 giây"
                    tone="blue"
                  />
                  <StatCard
                    icon="reviews"
                    label="Đánh giá mới"
                    value={formatNumber(summary.newReviews)}
                    detail={summary.averageRating == null
                      ? 'Chưa có rating'
                      : `Trung bình ${summary.averageRating}/5`}
                    tone="violet"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold">Hiệu quả AudioPass</h2>
                  <p className="mt-1 text-sm text-[#6e6a66]">
                    Doanh thu và trạng thái thanh toán trong khoảng thời gian đã chọn.
                  </p>
                </div>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <Panel
                    title="Doanh thu AudioPass theo ngày"
                    subtitle={`${formatCurrency(audioPass.totalRevenue)} từ ${formatNumber(audioPass.totalPaidOrders)} đơn thành công`}
                  >
                    <RevenueChart items={audioPass.revenueByDate} />
                  </Panel>
                  <Panel title="Trạng thái thanh toán">
                    <div className="space-y-4">
                      {(audioPass.paymentStatus || []).map((item) => {
                        const percentage = statusTotal
                          ? Math.round(item.count * 100 / statusTotal)
                          : 0;
                        return (
                          <div key={item.status}>
                            <div className="mb-1.5 flex justify-between text-sm">
                              <span className="font-semibold">
                                {STATUS_LABELS[item.status] || item.status}
                              </span>
                              <span className="text-[#6e6a66]">
                                {formatNumber(item.count)} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#efeeeb]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: STATUS_COLORS[item.status] || '#8f6f6d'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </div>
              </section>

              <section className="space-y-5">
                <div className="border-b border-[#e5e1da] pb-3">
                  <h2 className="text-xl font-extrabold">
                    Thống kê số lần Audio được nghe{' '}
                    <span className="text-[#b71422]">(Logic tăng dần)</span>
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon="play_circle"
                    label="Tổng lượt nghe Audio"
                    value={formatNumber(audio.totalListens)}
                  />
                  <StatCard
                    icon="storefront"
                    label="Thuyết minh nhà hàng"
                    value={formatNumber(audio.restaurantListens)}
                    tone="green"
                  />
                  <StatCard
                    icon="restaurant"
                    label="Thuyết minh món ăn"
                    value={formatNumber(audio.dishListens)}
                    tone="amber"
                  />
                  <StatCard
                    icon="language"
                    label="Ngôn ngữ nghe nhiều nhất"
                    value={topLanguage
                      ? LANGUAGE_LABELS[topLanguage.languageCode] || topLanguage.languageCode
                      : 'Chưa có'}
                    detail={topLanguage ? `${topLanguage.percentage}% lượt nghe` : ''}
                    tone="blue"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                  <Panel title="Số lần Audio được nghe theo ngày">
                    <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <i className="h-2.5 w-2.5 rounded-sm bg-[#b71422]" />
                        Audio nhà hàng
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="h-2.5 w-2.5 rounded-sm bg-[#c47120]" />
                        Audio món ăn
                      </span>
                    </div>
                    <GroupedAudioChart items={audio.byDate} />
                    <div className="mt-6 flex gap-3 rounded-lg bg-[#fff3f2] p-4 text-sm leading-6 text-[#5b403e]">
                      <span className="material-symbols-outlined shrink-0 text-[#b71422]">
                        info
                      </span>
                      <p>
                        <strong>Logic tăng dần:</strong> mỗi khi backend trả nội dung
                        audio hợp lệ, hệ thống ghi một sự kiện nghe. Tổng lượt được
                        cộng dồn theo nội dung, ngôn ngữ, loại audio và thời gian.
                        Request bị từ chối 402 không được tính.
                      </p>
                    </div>
                  </Panel>
                  <Panel title="Top nội dung được nghe nhiều nhất">
                    <HorizontalBars
                      items={(audio.topContents || []).slice(0, 5)}
                      labelKey="title"
                      valueKey="listenCount"
                    />
                  </Panel>
                </div>

                <Panel title="Lượt nghe gần đây">
                  {(audio.recentEvents || []).length === 0 ? (
                    <EmptyChart message="Chưa có sự kiện nghe Audio." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-[#e5e1da] text-xs uppercase tracking-wider text-[#6e6a66]">
                          <tr>
                            <th className="px-3 py-3">Thời gian</th>
                            <th className="px-3 py-3">Nội dung</th>
                            <th className="px-3 py-3">Loại</th>
                            <th className="px-3 py-3">Ngôn ngữ</th>
                            <th className="px-3 py-3">Nhà hàng</th>
                            <th className="px-3 py-3 text-right">Cộng thêm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {audio.recentEvents.map((item, index) => (
                            <tr key={`${item.createdAt}-${index}`} className="border-b border-[#efeeeb]">
                              <td className="whitespace-nowrap px-3 py-3 text-[#6e6a66]">
                                {formatDateTime(item.createdAt)}
                              </td>
                              <td className="px-3 py-3 font-bold">{item.contentTitle}</td>
                              <td className="px-3 py-3">
                                {item.contentType === 'dish' ? 'Món ăn' : 'Nhà hàng'}
                              </td>
                              <td className="px-3 py-3 uppercase">{item.languageCode}</td>
                              <td className="px-3 py-3">{item.restaurantName}</td>
                              <td className="px-3 py-3 text-right font-extrabold text-[#1b6d24]">
                                +{item.increment}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              </section>

              <section className="grid gap-6 lg:grid-cols-3">
                <Panel title="Ngôn ngữ khi nghe thuyết minh">
                  <div className="space-y-3">
                    {(audio.byLanguage || []).length === 0 ? (
                      <EmptyChart />
                    ) : audio.byLanguage.map((item, index) => (
                      <div key={item.languageCode} className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: ['#b71422', '#1d6f8f', '#1b6d24', '#c47120', '#75449a'][index % 5]
                          }}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {LANGUAGE_LABELS[item.languageCode] || item.languageCode}
                        </span>
                        <span className="text-sm font-bold">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Tình trạng nhà hàng">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Tổng nhà hàng', restaurants.totalRestaurants],
                      ['Đang công khai', restaurants.publishedRestaurants],
                      ['Chờ hoàn thiện', restaurants.pendingSetupRestaurants],
                      ['Đã khóa', restaurants.bannedRestaurants]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-[#f4f3f1] p-3">
                        <p className="text-xs text-[#6e6a66]">{label}</p>
                        <p className="mt-1 text-xl font-extrabold">{formatNumber(value)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 text-xs text-[#5b403e]">
                    <p>Thiếu thuyết minh: <strong>{formatNumber(restaurants.missingNarrationRestaurants)}</strong></p>
                    <p>Chưa có menu: <strong>{formatNumber(restaurants.missingMenuRestaurants)}</strong></p>
                  </div>
                </Panel>

                <Panel title="Chất lượng đánh giá">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#6e6a66]">Tổng đánh giá</p>
                      <p className="text-xl font-extrabold">{formatNumber(reviews.totalReviews)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6e6a66]">Rating trung bình</p>
                      <p className="text-xl font-extrabold">
                        {reviews.averageRating == null ? 'N/A' : `${reviews.averageRating}/5`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6e6a66]">Bị ẩn</p>
                      <p className="text-xl font-extrabold">{formatNumber(reviews.hiddenReviews)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6e6a66]">Cần kiểm tra</p>
                      <p className="text-xl font-extrabold text-[#b71422]">
                        {formatNumber(reviews.needsReviewReviews)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(reviews.ratingDistribution || []).map((item) => (
                      <div key={item.rating} className="flex items-center gap-2">
                        <span className="w-7 text-xs font-bold">{item.rating}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efeeeb]">
                          <div
                            className="h-full rounded-full bg-[#1b6d24]"
                            style={{ width: `${item.count * 100 / maximumRatingCount}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <Panel
                  title="Phân bổ lượt quan tâm theo quận/huyện"
                  subtitle="Dữ liệu dựa trên lượt xem chi tiết nhà hàng/menu theo khu vực, không lưu tọa độ GPS thô của khách."
                >
                  <HorizontalBars
                    items={visitors.districtInterest}
                    labelKey="districtName"
                    valueKey="count"
                    color="#1b6d24"
                  />
                </Panel>
                <Panel
                  title="Nhà hàng theo quận/huyện"
                  subtitle="Phân bổ toàn bộ nhà hàng hiện có trong hệ thống."
                >
                  <HorizontalBars
                    items={(restaurants.byDistrict || []).slice(0, 10)}
                    labelKey="districtName"
                    valueKey="count"
                    color="#1d6f8f"
                  />
                </Panel>
              </section>

              <Panel
                title="Du khách hoạt động theo giờ"
                subtitle={visitors.peakHour == null
                  ? 'Chưa xác định giờ cao điểm.'
                  : `Giờ cao điểm: ${String(visitors.peakHour).padStart(2, '0')}:00`}
              >
                <div className="overflow-x-auto pb-2">
                  <div className="min-w-[760px]">
                    <div className="flex h-48 items-end gap-1.5 border-b border-[#e5e1da]">
                      {(visitors.activeVisitorsByHour || []).map((item) => {
                        const isPeak = item.hour === visitors.peakHour;
                        return (
                          <div
                            key={item.hour}
                            className="flex h-full flex-1 items-end"
                            title={`${item.hour}:00 - ${item.count} du khách`}
                          >
                            <div
                              className={`w-full rounded-t-sm ${
                                isPeak ? 'bg-[#b71422]' : 'bg-[#d9aaa7]'
                              }`}
                              style={{
                                height: `${Math.max(2, item.count * 100 / maximumHourly)}%`
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex gap-1.5 text-[10px] text-[#6e6a66]">
                      {(visitors.activeVisitorsByHour || []).map((item) => (
                        <span key={item.hour} className="flex-1 text-center">
                          {item.hour % 4 === 0
                            ? `${String(item.hour).padStart(2, '0')}h`
                            : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Top nhà hàng và món ăn nổi bật">
                <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#e5e1da]">
                  {[
                    ['restaurants', 'Nhà hàng được nghe nhiều'],
                    ['dishes', 'Món ăn được nghe nhiều'],
                    ['ratings', 'Nhà hàng rating cao'],
                    ['districts', 'Quận/huyện được quan tâm']
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActiveTab(value)}
                      className={`shrink-0 border-b-2 px-2 pb-3 text-sm font-bold ${
                        activeTab === value
                          ? 'border-[#b71422] text-[#b71422]'
                          : 'border-transparent text-[#6e6a66]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {topTabRows.length === 0 ? (
                  <EmptyChart message="Chưa có dữ liệu cho bảng xếp hạng này." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="border-b border-[#e5e1da] text-xs uppercase tracking-wider text-[#6e6a66]">
                        <tr>
                          <th className="px-3 py-3">#</th>
                          <th className="px-3 py-3">Nội dung</th>
                          <th className="px-3 py-3">Thông tin</th>
                          <th className="px-3 py-3 text-right">Chỉ số</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTabRows.slice(0, 10).map((item, index) => (
                          <tr key={`${activeTab}-${item.restaurantId || item.districtName}-${index}`} className="border-b border-[#efeeeb]">
                            <td className="px-3 py-4 font-bold text-[#8f6f6d]">
                              {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="px-3 py-4 font-bold">
                              {item.title || item.restaurantName || item.districtName}
                            </td>
                            <td className="px-3 py-4 text-[#6e6a66]">
                              {item.restaurantName && item.title !== item.restaurantName
                                ? item.restaurantName
                                : item.languageCode
                                  ? `Ngôn ngữ: ${item.languageCode.toUpperCase()}`
                                  : activeTab === 'ratings'
                                    ? `${item.reviewCount} đánh giá`
                                    : 'Lượt quan tâm'}
                            </td>
                            <td className="px-3 py-4 text-right font-extrabold">
                              {activeTab === 'ratings'
                                ? `${item.rating}/5`
                                : formatNumber(item.listenCount ?? item.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </>
          ) : !error ? (
            <EmptyChart message="Dữ liệu sẽ xuất hiện sau khi khách hàng bắt đầu sử dụng hệ thống." />
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default AdminAnalytics;
