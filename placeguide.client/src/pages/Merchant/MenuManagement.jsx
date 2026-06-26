import React, { useState } from 'react';

const MenuManagement = () => {
  // Đổ mảng dữ liệu giả lập vào state để render động theo yêu cầu của giáo viên
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Phở Bò Tái Lăn",
      price: "65.000đ",
      category: "Món chính",
      description: "Bánh phở tươi, thịt bò bắp hoa xào tái thơm lừng hương gừng và tỏi.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFkioP15r3A48LnXKG7RRCt3IXhhvyNNaizb8GQjih4BX52uDVZdWs03ygXR_EB30tHvudrYAw4t8_J1ALgfzTuSVHlHhwQzlA8K0UzChkA34HYfKINTsIa2dTrIdRoVLDmZXivPPYb-GCcuqM8GAQW0PcVF_4rnJi8bnpTMt0gRcOpWtmKGLDubdjO0qqGHNnlh6iKuG1fe7VPkxZJXFglwko1VcNa5RBFdb9wrQwa0gmh1DW_Q4QtJgMpCNae8ASIDPcsaji1Nc",
      available: true
    },
    {
      id: 2,
      name: "Gỏi Cuốn Tôm Thịt",
      price: "45.000đ",
      category: "Khai vị",
      description: "Bộ 3 cuốn tôm tươi, thịt ba chỉ, rau thơm ăn kèm nước tương đậu phộng.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhbXXPFxaisLBccF1x3qKPKDGohkcemwO7G9WbTNfTc1bnj9Rlfb1IDdYbaaWvNe85ApXJQABvwkFwJBcd3bbTHVEaQVQx3jD4bxkil-DobtS1H5I2cWu-MVZATSHEXEXnBZDl3Cr87kaFJ91pm-hRLcSjfUUbbKN5zqOxNvJVOVjxG_6R4RfdvLKVCY-1W8QtdYtgRuR8tO7Mg1eevlelhXjnhGa7iav0rmw7kjH6YpDK-U4t9RAoan8CNwgvm6LNHn1SKd8OQPc",
      available: true
    },
    {
      id: 3,
      name: "Cà Phê Sữa Đá",
      price: "29.000đ",
      category: "Đồ uống",
      description: "Cà phê phin truyền thống hòa quyện cùng sữa đặc và đá viên mát lạnh.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9Ku5vNed5qOHo19x8E-zkBv3NyaFv95p8lIZ0t_OiSrKJi90w38zG0nkPmcJHhOrotUxP4vLVYcHKERjQRxPFcvLp59zDZGxUS2155UdRxJdcjCO4l1BfbYCVzfPEkPDHOog24f4-p4Y4JH0H9aMj_Y2EwxDvPj5NJNt4ns5rFcUdBiJlbWGwXQpROvEMFiZyfnj0Akr7cgVk0GD-tAtYAcIw2foeP8DTbga7NnYUYAakVcJ-T8iOvltoV93L1S8ubmJ3970jw-I",
      available: true
    },
    {
      id: 4,
      name: "Bánh Mì Thập Cẩm",
      price: "35.000đ",
      category: "Món ăn nhanh",
      description: "Đầy đủ các loại nhân: chả lụa, thịt nguội, pate gan và bơ trứng gà.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAR-aYS0exL_ttZZncB8ukK8M2VEx1JKTgbjAE4S74KNi7h8_USFtudDNY5sjSlnpM3w0W1K4L3-3pbBVUFAx5Oi4qEzeQy06Dkfory7N3nKf9UZd6f2XyTqVNk3Bbzi2k47CkCySm8o1S-V30ywvBI7nYUFEhmNDZyZPFnA6K5m6inmrdVWuZGzSwTOxo6Sd8nQyQJE2TOJHFNPT4N2HS8KTn9iTV4Ol_zp_1OcippQUcD_1-JKM2YXdhb50QGCWyPT6T29hyC5ew",
      available: false // Trạng thái Hết hàng để test điều kiện render
    },
    {
      id: 5,
      name: "Bún Chả Hà Nội",
      price: "55.000đ",
      category: "Món chính",
      description: "Chả miếng và chả viên nướng than hoa, ăn kèm bún tươi và nước mắm chua ngọt.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKFFq0xSNT98OLZVnvpI64nr8NikiJ0t0tsVpV0yQ1BHAwxeIeTX-6tD1N109MwWeTUh92Af6YMpj1K_I1U81EvmxFsOMIRjBMZ-RZuvTsJsHc0kaEU-Vbcbn73fDQ_drbsRXM-jsx5atijyyCSuOpmf1ZsK_nNlCIVKW8iWLproAAILchfednuqTqXcLb8n83D7gP_gowYUfH6hPjQfjO4Zcq1LSdiRARDfMXjRgTicz0C-2PR5hRrCQTke8NN04YofcyNQs5P1o",
      available: true
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen font-['Be_Vietnam_Pro']">
      {/* TopAppBar */}
      <header className="bg-white shadow-sm fixed top-0 w-full z-50 h-16 flex items-center px-3 sm:px-4 md:px-20 justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="material-symbols-outlined text-[#af101a] font-bold cursor-pointer">arrow_back</span>
          <h1 className="truncate text-[18px] leading-[26px] font-bold text-[#af101a] sm:text-[20px] sm:leading-[28px]">Quản lý Thực đơn</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-6">
          <div className="hidden md:flex gap-4">
            <button type="button" className="text-[#af101a] font-bold text-[14px] leading-[20px] font-medium px-4 py-2 hover:bg-[#eae7e7] transition-colors rounded-full">Trang chủ</button>
            <button type="button" className="text-[#5b403d] text-[14px] leading-[20px] font-medium px-4 py-2 hover:bg-[#eae7e7] transition-colors rounded-full">Đơn hàng</button>
            <button type="button" className="text-[#5b403d] text-[14px] leading-[20px] font-medium px-4 py-2 hover:bg-[#eae7e7] transition-colors rounded-full">Báo cáo</button>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffb3ac] flex items-center justify-center text-[#410003] font-bold">M</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 pb-28 px-4 md:px-20 max-w-[1280px] mx-auto">
        {/* Action Bar: Search & Filters */}
        <section className="mb-10 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-[24px]">
          <div className="w-full flex-1 md:max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8f6f6c]">search</span>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-[#f6f3f2] border-none rounded-full text-[16px] leading-[24px] font-normal focus:ring-2 focus:ring-[#af101a]/20 transition-all shadow-sm" 
                placeholder="Tìm kiếm tên món ăn, mô tả..." 
                type="text"
              />
            </div>
          </div>
          
          {/* Bộ lọc Chips phân loại */}
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
            {['Tất cả', 'Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-6 py-2.5 rounded-full text-[14px] leading-[20px] font-medium transition-colors whitespace-nowrap border ${
                  activeFilter === tab 
                    ? 'bg-[#af101a] text-white shadow-md border-transparent' 
                    : 'bg-white border-[#e4beba] text-[#5b403d] hover:bg-[#f6f3f2]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button type="button" className="hidden md:flex bg-[#af101a] text-white px-8 py-4 rounded-full text-[20px] leading-[28px] font-semibold font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            Thêm món mới
          </button>
        </section>

        {/* Menu Grid - Render Động từ State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
          
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eae7e7] transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              <div className="relative h-48">
                <img 
                  className={`w-full h-full object-cover ${!item.available ? 'grayscale' : ''}`} 
                  src={item.image} 
                  alt={item.name} 
                />
                
                {item.available ? (
                  <span className="absolute top-3 right-3 bg-[#1b6d24] text-white px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold shadow-sm">
                    {item.category}
                  </span>
                ) : (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-[20px] leading-[28px] font-semibold">Hết hàng</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-[20px] leading-[28px] font-semibold text-[#1b1c1c]">{item.name}</h3>
                  <span className="shrink-0 font-bold text-[#af101a]">{item.price}</span>
                </div>
                <p className="text-[#5b403d] text-[16px] leading-[24px] font-normal line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>
                <div className="flex gap-2 pt-4 border-t border-[#eae7e7]">
                  <button type="button" className="flex-1 py-2 bg-[#f0eded] text-[#5b403d] text-[14px] leading-[20px] font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#eae7e7] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span> Sửa
                  </button>
                  <button type="button" className="w-12 h-10 bg-[#ffdad6] text-[#93000a] text-[14px] leading-[20px] font-medium rounded-lg flex items-center justify-center hover:opacity-80 transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Card Thêm món ăn nhanh (Bento Nút bấm rỗng) */}
          <button type="button" className="border-2 border-dashed border-[#e4beba] rounded-xl flex flex-col items-center justify-center p-8 hover:bg-[#f6f3f2] hover:border-[#af101a] transition-all group min-h-[300px] w-full">
            <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#af101a] mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined !text-[32px]">add_circle</span>
            </div>
            <p className="text-[20px] leading-[28px] font-semibold text-[#5b403d] group-hover:text-[#af101a] transition-colors">Thêm món ăn mới</p>
            <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#8f6f6c] mt-2">Tải ảnh và nhập thông tin</p>
          </button>

        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-5 z-50">
        <button type="button" className="w-16 h-16 bg-[#af101a] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined !text-[32px]">add</span>
        </button>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white border-t border-[#e4beba] px-2 py-3 flex justify-around items-center">
        <button type="button" className="flex flex-col items-center gap-1 text-[#5b403d]">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold">Tổng quan</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-[#af101a]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold font-bold">Thực đơn</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-[#5b403d]">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold">Đơn hàng</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-[#5b403d]">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
};

export default MenuManagement;
