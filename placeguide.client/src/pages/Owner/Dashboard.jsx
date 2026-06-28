import { useEffect, useState } from 'react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getDashboardStats } from '../../services/ownerDashboardService';

function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-wide text-[#6e6a66]">{label}</p>
        <span className={`material-symbols-outlined text-[24px] ${tone}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function Dashboard() {
  const storedUser = getStoredUser();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getDashboardStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-['Be_Vietnam_Pro'] text-[#1a1c1a] lg:flex">
      <OwnerSidebar
        ownerName={storedUser.fullName || 'Chủ quán'}
        ownerContact={storedUser.email || storedUser.phoneNumber || 'Owner Portal'}
      />

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">
              Tổng quan
            </h1>
            <p className="mt-1 text-sm text-[#6e6a66]">
              Thống kê nhanh về hoạt động kinh doanh của quán.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-5 lg:p-8">
          {isLoading ? (
            <section className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-10 text-center shadow-sm">
              <span className="material-symbols-outlined animate-pulse text-[44px] text-[#b71422]">
                dashboard
              </span>
              <p className="mt-3 text-sm font-bold text-[#5b403e]">
                Đang tải dữ liệu tổng quan...
              </p>
            </section>
          ) : error ? (
            <section className="rounded-xl border border-[#fecaca] bg-[#fff5f5] p-10 text-center shadow-sm">
              <span className="material-symbols-outlined text-[44px] text-[#b42318]">error</span>
              <p className="mt-3 text-sm text-[#6e6a66]">{error}</p>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon="restaurant_menu"
                label="Tổng số món"
                value={stats.totalDishes}
                tone="text-[#b71422]"
              />
              <StatCard
                icon="reviews"
                label="Tổng số đánh giá"
                value={stats.totalReviews}
                tone="text-[#1b6d24]"
              />
              <StatCard
                icon="star"
                label="Điểm đánh giá trung bình"
                value={
                  <span className="inline-flex items-center gap-1">
                    {stats.averageRating.toFixed(1)}
                    <span className="material-symbols-outlined text-[22px] text-[#c47120]">
                      star
                    </span>
                  </span>
                }
                tone="text-[#c47120]"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;