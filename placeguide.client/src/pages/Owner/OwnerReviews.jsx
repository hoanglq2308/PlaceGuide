import { useEffect, useState } from 'react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getOwnerReviews } from '../../services/ownerService';

const PAGE_SIZE = 10;

function OwnerReviews() {
  const [data, setData] = useState({ items: [], totalCount: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.max(Math.ceil(data.totalCount / PAGE_SIZE), 1);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const result = await getOwnerReviews(pageIndex, PAGE_SIZE);
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => { isMounted = false; };
  }, [pageIndex]);

  return (
    <div className="min-h-screen bg-[#faf9f6] lg:flex">
      <OwnerSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
        <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">Đánh giá</h1>

        {isLoading ? (
          <p className="mt-6 text-sm font-bold text-[#5b403e]">Đang tải...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-[#b42318]">{error}</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.items.map((review) => (
                <div key={review.id} className="rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#1a1c1a]">{review.customerName}</p>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#c47120]">
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#5b403e]">{review.comment}</p>
                  <p className="mt-2 text-xs text-[#8f6f6d]">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={pageIndex === 0}
                className="rounded-lg border border-[#e4beba] px-4 py-2 text-sm font-bold text-[#5b403e] disabled:opacity-40"
              >
                Trang trước
              </button>
              <span className="text-sm text-[#6e6a66]">
                Trang {pageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
                disabled={pageIndex + 1 >= totalPages}
                className="rounded-lg border border-[#e4beba] px-4 py-2 text-sm font-bold text-[#5b403e] disabled:opacity-40"
              >
                Trang sau
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default OwnerReviews;