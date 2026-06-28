import { Link, useLocation, useNavigate } from 'react-router-dom';

const activeNavigationItems = [
  { label: 'Tổng quan', icon: 'dashboard', to: '/owner/dashboard' },
  { label: 'Thông tin quán', icon: 'storefront', to: '/owner/restaurant' },
  { label: 'Menu món ăn', icon: 'restaurant_menu', to: '/merchant/menu' },
  { label: 'Thuyết minh', icon: 'record_voice_over', to: '/owner/narration' },
  { label: 'Đánh giá', icon: 'reviews', to: '/owner/reviews' },
  { label: 'Cài đặt', icon: 'settings', to: '/owner/settings' }
];

const plannedNavigationItems = [];


function OwnerSidebar({ ownerName = 'Chủ quán', ownerContact = 'Owner Portal' }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <aside className="border-b border-[#e4beba] bg-[#f4f3f1] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="px-5 py-5 lg:px-6 lg:py-7">
        <p className="text-xl font-extrabold text-[#af101a]">VinaFood Owner</p>
        <p className="mt-1 text-xs text-[#5b403e]">Quản lý hồ sơ quán ăn</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-4">
        {activeNavigationItems.map((item) => {
          const isActive = pathname === item.to;

          return (
            <Link
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={`flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors lg:rounded-md ${
                isActive
                  ? 'border-b-2 border-[#b71422] bg-[#db3237]/10 text-[#b71422] lg:border-b-0 lg:border-r-4'
                  : 'text-[#5b403d] hover:bg-[#e9e8e5] hover:text-[#b71422]'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {plannedNavigationItems.map((item) => (
          <span
            key={item.label}
            className="flex shrink-0 items-center gap-2 px-3 py-2 text-sm text-[#8f6f6d]"
            title="Chức năng đang được xây dựng"
          >
            <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
            {item.label}
          </span>
        ))}
      </nav>

      <div className="hidden border-t border-[#e4beba] p-5 lg:mt-auto lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#db3237]/15 text-[#b71422]">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{ownerName}</p>
            <p className="mt-1 truncate text-xs text-[#6e6a66]">{ownerContact}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#e4beba] bg-white px-3 py-2 text-sm font-bold text-[#af101a] transition-colors hover:bg-[#fff5f4]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default OwnerSidebar;
