import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  clearActiveAudioPassCheckout,
  createAudioPassCheckout,
  getActiveAudioPassCheckout,
  getAudioPassCheckoutStatus,
  saveActiveAudioPassCheckout
} from '../services/audioPassCheckoutService';
import { saveAudioPassToken } from '../services/audioGuideService';

const STATUS_POLL_INTERVAL_MS = 5000;

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Đang chờ thanh toán',
    paid: 'Đã thanh toán',
    expired: 'Đơn đã hết hạn',
    cancelled: 'Đơn đã hủy',
    failed: 'Thanh toán thất bại'
  };

  return labels[status] || 'Không xác định';
}

function getStatusClassName(status) {
  const classNames = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-200',
    paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    expired: 'bg-slate-100 text-slate-700 ring-slate-200',
    cancelled: 'bg-slate-100 text-slate-700 ring-slate-200',
    failed: 'bg-red-50 text-red-800 ring-red-200'
  };

  return classNames[status] || 'bg-slate-100 text-slate-700 ring-slate-200';
}

function canCreateNewCheckout(status) {
  return ['expired', 'cancelled', 'failed'].includes(status);
}

function AudioPassCheckout() {
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pollTimerRef = useRef(null);
  const hasInitialized = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const refreshCheckoutStatus = useCallback(async () => {
    const activeCheckout = getActiveAudioPassCheckout();

    if (!activeCheckout) {
      stopPolling();
      return null;
    }

    // A completed checkout is checked once on page load so a deleted or
    // expired local AudioPass token can be restored within its original term.
    const shouldRestoreAudioPass = activeCheckout.status === 'paid';

    if (activeCheckout.status !== 'pending' && !shouldRestoreAudioPass) {
      stopPolling();
      return activeCheckout;
    }

    try {
      const status = await getAudioPassCheckoutStatus(
        activeCheckout.orderCode,
        activeCheckout.checkoutAccessToken
      );

      const updatedCheckout = {
        ...activeCheckout,
        ...status
      };

      if (updatedCheckout.audioPassToken) {
        saveAudioPassToken(updatedCheckout.audioPassToken);
      }

      saveActiveAudioPassCheckout(updatedCheckout);
      setCheckout(updatedCheckout);

      if (updatedCheckout.status !== 'pending') {
        stopPolling();
      }

      return updatedCheckout;
    } catch (requestError) {
      if (requestError.code === 'CHECKOUT_NOT_FOUND') {
        clearActiveAudioPassCheckout();
        setCheckout(null);
      }

      stopPolling();
      setError(requestError.message);

      return null;
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();

    pollTimerRef.current = window.setInterval(() => {
      void refreshCheckoutStatus();
    }, STATUS_POLL_INTERVAL_MS);
  }, [refreshCheckoutStatus, stopPolling]);

  const createNewCheckout = useCallback(async () => {
    stopPolling();
    clearActiveAudioPassCheckout();
    setError('');
    setIsLoading(true);

    try {
      const newCheckout = await createAudioPassCheckout();

      setCheckout(newCheckout);

      if (newCheckout.status === 'pending') {
        startPolling();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [startPolling, stopPolling]);

  useEffect(() => {
    if (hasInitialized.current) {
      return stopPolling;
    }

    hasInitialized.current = true;

    async function initializeCheckout() {
      const activeCheckout = getActiveAudioPassCheckout();

      if (!activeCheckout) {
        await createNewCheckout();
        return;
      }

      setCheckout(activeCheckout);
      setIsLoading(false);

      const updatedCheckout = await refreshCheckoutStatus();

      if (updatedCheckout?.status === 'pending') {
        startPolling();
      }
    }

    void initializeCheckout();

    return stopPolling;
  }, [createNewCheckout, refreshCheckoutStatus, startPolling, stopPolling]);

  function handleOpenPayOSCheckout() {
    if (!checkout?.checkoutUrl) {
      setError('Không tìm thấy đường dẫn thanh toán PayOS.');
      return;
    }

    window.open(checkout.checkoutUrl, '_blank', 'noopener,noreferrer');
  }

  if (error) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 py-8 text-slate-800 sm:px-6">
        <section className="mx-auto w-full max-w-xl rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-red-800">
            Không thể kiểm tra đơn thanh toán
          </h1>

          <p className="mt-3 leading-6 text-slate-600">{error}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void createNewCheckout()}
              className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
            >
              Tạo mã thanh toán mới
            </button>

            <Link
              to="/home"
              className="inline-flex items-center font-semibold text-red-700 hover:text-red-900"
            >
              Quay lại trang khám phá
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading || !checkout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4 text-slate-700">
        Đang tạo mã thanh toán...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8 text-slate-800 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/home"
          className="inline-flex font-semibold text-red-700 hover:text-red-900"
        >
          Quay lại trang khám phá
        </Link>

        <section className="mt-5 rounded-lg border border-rose-200 bg-white p-5 shadow-sm sm:p-7">
          <header className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-emerald-700">
              AudioPass
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-red-800 sm:text-3xl">
                Mở thuyết minh ẩm thực
              </h1>

              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ${getStatusClassName(checkout.status)}`}
              >
                {getStatusLabel(checkout.status)}
              </span>
            </div>

            <p className="mt-3 leading-6 text-slate-600">
              Mở cổng thanh toán PayOS để quét mã QR hoặc chọn phương thức
              thanh toán được PayOS hỗ trợ. Trang này tự kiểm tra kết quả.
            </p>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="text-lg font-bold text-red-800">Thanh toán qua PayOS</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Mã QR thanh toán được PayOS hiển thị trên trang thanh toán bảo mật.
              </p>
              <button
                type="button"
                onClick={handleOpenPayOSCheckout}
                disabled={checkout.status !== 'pending'}
                className="mt-6 rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Mở cổng thanh toán
              </button>
              <p className="mt-4 text-sm leading-5 text-slate-500">
                Đơn hết hạn lúc {formatDateTime(checkout.expiresAtUtc)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-rose-100 pb-3">
                <p className="text-sm text-slate-500">Gói</p>
                <strong className="mt-1 block">AudioPass 24 giờ</strong>
              </div>

              <div className="border-b border-rose-100 pb-3">
                <p className="text-sm text-slate-500">Số tiền</p>
                <strong className="mt-1 block text-2xl text-red-700">
                  {formatVnd(checkout.amountVnd)}
                </strong>
              </div>

              {canCreateNewCheckout(checkout.status) ? (
                <button
                  type="button"
                  onClick={() => void createNewCheckout()}
                  className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
                >
                  Tạo mã thanh toán mới
                </button>
              ) : (
                <p className="text-sm leading-5 text-slate-500">
                  {checkout.status === 'pending'
                    ? 'Trang này đang tự kiểm tra trạng thái thanh toán.'
                    : 'Giao dịch đã được ghi nhận. AudioPass đã được mở trên thiết bị này.'}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AudioPassCheckout;
