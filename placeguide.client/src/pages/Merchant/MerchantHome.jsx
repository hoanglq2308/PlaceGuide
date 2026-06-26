import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function MerchantHome() {
  const navigate = useNavigate();
  const user = useMemo(getStoredUser, []);
  const ownerName = user.fullName || user.FullName || 'Chủ quán';
  const ownerContact = user.email || user.Email || user.phoneNumber || user.PhoneNumber || 'Merchant account';

  function handleLogout() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] font-['Be_Vietnam_Pro'] text-[#1a1c1a]">
      <header className="sticky top-0 z-40 border-b border-[#e5e1da] bg-[#faf9f6]/95 px-4 py-4 backdrop-blur sm:px-5 md:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex min-w-0 items-center gap-2 text-xl font-extrabold text-[#b71422] sm:text-2xl"
          >
            <span className="material-symbols-outlined text-[28px]">restaurant</span>
            <span className="truncate">VinaFood</span>
          </button>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{ownerName}</p>
              <p className="text-xs text-[#6e6a66]">{ownerContact}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#e4beba] bg-white px-3 py-2 text-sm font-bold text-[#af101a] transition-colors hover:bg-[#fff5f4]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 md:px-16 md:py-14">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ffdda3] bg-[#fff8eb] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#7a4b00]">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              Merchant Portal
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-[#1a1c1a] sm:text-4xl md:text-5xl">
                Bắt đầu đưa quán của bạn lên VinaFood.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#5b403e] md:text-lg">
                Tạo hồ sơ quán, nộp giấy phép kinh doanh và chứng nhận an toàn thực phẩm.
                Sau khi Admin duyệt, bạn sẽ quản lý thông tin quán tại Owner Portal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/merchant/register')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b71422] px-7 py-4 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add_business</span>
                Tạo quán
              </button>
              <button
                type="button"
                onClick={() => navigate('/owner/restaurant')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e4beba] bg-white px-7 py-4 text-sm font-extrabold text-[#5b403e] transition-colors hover:bg-[#fff5f4] hover:text-[#b71422]"
              >
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                Quản lý quán đã duyệt
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e1da] bg-[#fdfcfb] p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-[#b71422]">Quy trình đăng ký</h2>
            <div className="mt-6 space-y-5">
              {[
                {
                  icon: 'person_add',
                  title: '1. Tạo tài khoản',
                  text: 'Bạn có thể dùng email hoặc số điện thoại để đăng ký và đăng nhập.'
                },
                {
                  icon: 'assignment',
                  title: '2. Nộp hồ sơ quán',
                  text: 'Nhập thông tin cơ bản và tải lên giấy phép kinh doanh, chứng nhận an toàn thực phẩm.'
                },
                {
                  icon: 'verified',
                  title: '3. Chờ Admin duyệt',
                  text: 'Sau khi duyệt, tài khoản được gán quyền Owner và quán được tạo ở trạng thái chưa công khai.'
                },
                {
                  icon: 'edit_square',
                  title: '4. Hoàn thiện hồ sơ',
                  text: 'Owner cập nhật ảnh, tọa độ, mô tả, menu và thuyết minh trước khi public.'
                }
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#db3237]/10 text-[#b71422]">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </span>
                  <div>
                    <p className="font-bold text-[#1a1c1a]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#6e6a66]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MerchantHome;
