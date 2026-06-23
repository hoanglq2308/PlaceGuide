import React from 'react';
import { useNavigate } from 'react-router-dom';

const MerchantWaiting = () => {
  // Khởi tạo hook điều hướng
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen flex flex-col font-['Be_Vietnam_Pro'] overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-[#fcf9f8] shadow-sm top-0 z-50 flex items-center px-4 md:px-20 w-full h-16 sticky">
        {/* Tiện tay gắn luôn nút Back trên thanh Header cho nó xịn */}
        <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[#af101a]">arrow_back</span>
          <h1 className="text-[20px] leading-[28px] font-semibold font-bold text-[#af101a]">
            Merchant Registration
          </h1>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-8">
          <span className="text-[14px] leading-[20px] font-medium text-[#af101a] font-bold">Hồ sơ</span>
          <span className="text-[14px] leading-[20px] font-medium text-[#5b403d] hover:bg-[#eae7e7] transition-colors px-3 py-2 rounded-lg cursor-pointer">Hướng dẫn</span>
          <span className="text-[14px] leading-[20px] font-medium text-[#5b403d] hover:bg-[#eae7e7] transition-colors px-3 py-2 rounded-lg cursor-pointer">Hỗ trợ</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start py-16 px-4 md:px-0 max-w-[1280px] mx-auto w-full">
        {/* Hero Illustration & Success Message */}
        <section className="w-full flex flex-col items-center text-center mb-16">
          <div className="relative w-full max-w-lg mb-8 transition-transform duration-1000 ease-in-out hover:-translate-y-2">
            <img 
              className="w-full h-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOeY3k6OaKCvloE6ClXQwAdY990g1U6Gppp4Ie4Gh9brlvknUCuxZuy4wXRHVaqBmkEFw0WgjNQDGZ7kt_JKVI3hoctha6b_CmEC-aCAq7SSzg3z9OgJ0Y1Ss7jl7D5cK1ShD1OSbaDqSllnQIeExINVcr1it_rfNX4qEiYFXIZcqEmYg7bp3l6l35CVgD9_AhnQ7JcERhG9MDNiuaro4e1jLPxJ4e2sWjUn4pTRJYh_wNhxg_cLdZhZRF-tihQzujKSi7gXNaZsw" 
              alt="Merchant approval simulation status illustration" 
            />
          </div>
          <div className="max-w-2xl">
            <h2 className="text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-[#af101a] mb-4">
              Gửi Hồ Sơ Thành Công!
            </h2>
            <p className="text-[18px] leading-[28px] font-normal text-[#5b403d] mb-8">
              Cảm ơn bạn đã đăng ký trở thành đối tác. Đội ngũ của chúng tôi đang tiến hành xem xét các thông tin và tài liệu bạn đã cung cấp.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {/* NÚT QUAY LẠI TRANG CHỦ ĐÃ ĐƯỢC GẮN NAVIGATE */}
              <button 
                type="button" 
                onClick={() => navigate('/merchant/register')}
                className="bg-[#af101a] text-white text-[14px] leading-[20px] font-medium px-8 py-3 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">home</span>
                Quay lại trang chủ
              </button>
              
              <button type="button" className="bg-[#fcf9f8] border border-[#8f6f6c] text-[#5b403d] text-[14px] leading-[20px] font-medium px-8 py-3 rounded-full hover:bg-[#f6f3f2] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                Xem lại hồ sơ
              </button>
            </div>
          </div>
        </section>

        {/* Status & Process Timeline */}
        <section className="w-full max-w-4xl bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#eae7e7] mb-16">
          <h3 className="text-[20px] leading-[28px] font-semibold text-[#1b1c1c] mb-10 text-center">
            Tiến trình phê duyệt
          </h3>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
              <div className="w-12 h-12 rounded-full bg-[#1b6d24] text-white flex items-center justify-center mb-4 ring-8 ring-[#a0f399]/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <p className="text-[14px] leading-[20px] font-medium text-[#1b6d24] font-bold">Gửi hồ sơ</p>
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#5b403d] mt-1">Đã hoàn thành</p>
            </div>
            <div className="hidden md:block absolute top-6 left-[16%] right-[50%] h-0.5 bg-[#1b6d24]"></div>
            
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
              <div className="w-12 h-12 rounded-full bg-[#8e6a00] text-[#fff3e1] flex items-center justify-center mb-4 animate-pulse ring-8 ring-[#ffdf9e]/30">
                <span className="material-symbols-outlined">pending</span>
              </div>
              <p className="text-[14px] leading-[20px] font-medium text-[#8e6a00] font-bold">Đang xác minh</p>
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#5b403d] mt-1">Dự kiến 24-48 giờ</p>
            </div>
            <div className="hidden md:block absolute top-6 left-[50%] right-[16%] h-0.5 bg-[#eae7e7]"></div>
            
            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
              <div className="w-12 h-12 rounded-full bg-[#eae7e7] text-[#5b403d] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <p className="text-[14px] leading-[20px] font-medium text-[#5b403d]">Hoàn tất</p>
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#5b403d] mt-1">Kích hoạt gian hàng</p>
            </div>
          </div>
        </section>

        {/* Additional Information Bento Box */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full max-w-4xl">
          <div className="md:col-span-2 bg-[#f6f3f2] rounded-2xl p-6 flex flex-col justify-between border border-[#e5e2e1]">
            <div>
              <span className="material-symbols-outlined text-[#af101a] mb-4">info</span>
              <h4 className="text-[20px] leading-[28px] font-semibold text-[#1b1c1c] mb-2">Lưu ý quan trọng</h4>
              <p className="text-[16px] leading-[24px] font-normal text-[#5b403d]">
                Chúng tôi sẽ gửi email thông báo ngay sau khi hồ sơ được phê duyệt hoặc nếu cần bổ sung thêm thông tin. Vui lòng kiểm tra hộp thư đến và cả thư mục spam.
              </p>
            </div>
            <a className="mt-4 text-[#af101a] text-[14px] leading-[20px] font-medium flex items-center gap-1 hover:underline" href="#policy">
              {/* Đã sửa class thành className ở span dưới đây */}
              Xem chính sách đối tác <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
          <div className="bg-[#a0f399] rounded-2xl p-6 flex flex-col items-center text-center justify-center border border-[#1b6d24]/10">
            <div className="w-16 h-16 rounded-full bg-[#217128]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#217128] text-4xl">headset_mic</span>
            </div>
            <h4 className="text-[14px] leading-[20px] font-medium text-[#217128] font-bold mb-2">Cần hỗ trợ gấp?</h4>
            <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#217128]/80 mb-4">Hotline hỗ trợ 24/7 dành cho đối tác mới.</p>
            <button type="button" className="bg-[#217128] text-white px-6 py-2 rounded-full text-[14px] leading-[20px] font-medium w-full hover:opacity-90 transition-all">
              1900 6789
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-16 py-8 text-center text-[#5b403d] text-[12px] leading-[16px] tracking-[0.05em] font-semibold border-t border-[#eae7e7] w-full">
        <p>© 2024 Gourmet Discovery Platform. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default MerchantWaiting;