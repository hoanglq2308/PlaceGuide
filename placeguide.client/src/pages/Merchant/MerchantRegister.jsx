import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitMerchantRegistration } from '../../services/merchantRegistrationService';

export default function MerchantRegister() {
    const navigate = useNavigate();

    // 1. State quản lý các ô nhập liệu chữ
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        phoneNumber: '',
    });

    // 2. State quản lý file và ảnh để hiển thị Preview lên giao diện
    const [gpkdFile, setGpkdFile] = useState(null);
    const [gpkdPreview, setGpkdPreview] = useState(null);

    const [attpFile, setAttpFile] = useState(null);
    const [attpPreview, setAttpPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm xử lý khi thay đổi dữ liệu chữ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý khi chọn file Giấy phép kinh doanh
    const handleGpkdChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGpkdFile(file);
            setGpkdPreview(URL.createObjectURL(file)); // Tạo link ảnh tạm thời để hiển thị preview
        }
    };

    // Hàm xử lý khi chọn file An toàn thực phẩm
    const handleAttpChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttpFile(file);
            setAttpPreview(URL.createObjectURL(file)); // Tạo link ảnh tạm thời để hiển thị preview
        }
    };

    // Hàm xóa file nếu chọn lại
    const handleRemoveFile = (type) => {
        if (type === 'gpkd') {
            setGpkdFile(null);
            setGpkdPreview(null);
        } else {
            setAttpFile(null);
            setAttpPreview(null);
        }
    };

    // 3. Hàm gửi dữ liệu (Gom thành FormData để chuẩn bị đập qua .NET API)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.restaurantName || !formData.address || !formData.phoneNumber) {
            alert('Vui lòng điền đầy đủ thông tin cơ bản!');
            return;
        }
        if (!gpkdFile || !attpFile) {
            alert('Vui lòng tải lên đầy đủ giấy tờ pháp lý để xác minh!');
            return;
        }

        const dataSubmit = new FormData();
        dataSubmit.append('RestaurantName', formData.restaurantName);
        dataSubmit.append('Address', formData.address);
        dataSubmit.append('PhoneNumber', formData.phoneNumber);
        dataSubmit.append('FoodSafetyFile', attpFile);
        dataSubmit.append('BusinessLicenseFile', gpkdFile);

        setIsSubmitting(true);

        try {
            await submitMerchantRegistration(dataSubmit);
            navigate('/merchant/waiting');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar / Branding Panel */}
            <aside className="hidden lg:flex flex-col w-[400px] sidebar-gradient p-12 text-on-primary fixed h-full z-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold">VinaFood</h1>
                    <p className="mt-2 text-lg opacity-90">Đăng ký Đối tác</p>
                </div>
                {/* Progress Stepper Vertical for Desktop */}
                <nav className="flex flex-col gap-8 relative">
                    <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-white/20 -z-10"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold shadow-lg z-10">1</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">Cơ bản</span>
                            <span className="text-xs opacity-70">Thông tin định danh</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-white border-2 border-white/50 flex items-center justify-center text-xs font-bold z-10">2</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">Hồ sơ</span>
                            <span className="text-xs opacity-70">Giấy tờ pháp lý</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 border-2 border-white/20 flex items-center justify-center text-xs font-bold z-10">3</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white/50">Xác nhận</span>
                            <span className="text-xs opacity-40">Hoàn tất hồ sơ</span>
                        </div>
                    </div>
                </nav>
                <div className="mt-auto">
                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                        <p className="mb-2 text-sm font-bold">Cần hỗ trợ?</p>
                        <p className="text-sm opacity-80">Hotline: 1900 1234</p>
                        <p className="text-sm opacity-80">Email: doi-tac@vinafood.vn</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-[400px] bg-surface min-h-screen flex flex-col">
                {/* TopAppBar */}
                <header className="bg-surface lg:bg-transparent shadow-sm lg:shadow-none flex items-center px-4 lg:px-16 w-full h-16 lg:h-24 ">
                    <button className="mr-4 text-primary active:scale-95 transition-transform lg:hidden" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-primary lg:text-3xl">Đăng ký Hồ sơ Đối tác</h1>
                </header>

                <div className="px-4 lg:px-16 pb-32 max-w-5xl mt-8 lg:mt-12">
                    {/* Mobile Stepper */}
                    <div className="lg:hidden flex items-center justify-between mb-8 px-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">1</div>
                            <span className="text-xs text-primary">Cơ bản</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-primary mx-2"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">2</div>
                            <span className="text-xs text-primary">Hồ sơ</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-surface-container-highest mx-2"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-xs font-bold">3</div>
                            <span className="text-xs text-on-surface-variant">Xác nhận</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12">
                        {/* Section: Basic Information */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-primary rounded-full"></div>
                                <h2 className="text-xl font-bold text-primary">Thông tin cơ bản</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group md:col-span-2">
                                    <label className="absolute -top-2.5 left-4 px-1 bg-surface text-xs text-on-surface-variant group-focus-within:text-primary transition-colors z-10">Tên quán ăn</label>
                                    <input 
                                        name="restaurantName"
                                        value={formData.restaurantName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-0 bg-transparent text-base transition-all outline-none"
                                        placeholder="Ví dụ: Phở Thìn Lò Đúc" 
                                        type="text"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-4 px-1 bg-surface text-xs text-on-surface-variant group-focus-within:text-primary transition-colors z-10">Địa chỉ chi tiết</label>
                                    <div className="flex items-center w-full rounded-xl border border-outline-variant focus-within:border-primary px-4 py-4 transition-all">
                                        <input 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="min-w-0 flex-1 bg-transparent border-none p-0 text-base outline-none focus:ring-0"
                                            placeholder="Số nhà, tên đường..." 
                                            type="text"
                                        />
                                        <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-4 px-1 bg-surface text-xs text-on-surface-variant group-focus-within:text-primary transition-colors z-10">Số điện thoại liên hệ</label>
                                    <input 
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-0 bg-transparent text-base transition-all outline-none"
                                        placeholder="09xx xxx xxx" 
                                        type="tel"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section: Document Upload */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                                    <h2 className="text-xl font-bold text-primary">Tải hồ sơ pháp lý</h2>
                                    <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                                </div>
                            </div>
                            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">Vui lòng cung cấp ảnh chụp rõ nét các giấy tờ sau để chúng tôi xác minh tính chính danh của cửa hàng.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Document Card 1: Giấy phép kinh doanh */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-on-surface">Giấy phép kinh doanh</span>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">Bắt buộc</span>
                                    </div>

                                    {!gpkdPreview ? (
                                        <div className="dashed-border h-56 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group px-4 text-center" onClick={() => document.getElementById('file-gpkd').click()}>
                                            <input className="hidden" id="file-gpkd" type="file" accept="image/*" onChange={handleGpkdChange} />
                                            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                            </div>
                                            <span className="text-sm font-medium text-on-surface-variant">Mặt trước giấy phép</span>
                                            <span className="text-[10px] text-outline mt-1 uppercase">JPG, PNG (Tối đa 5MB)</span>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-secondary bg-secondary-container/10 h-56 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                            <img src={gpkdPreview} alt="Preview GPKD" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                            <div className="z-10 flex flex-col items-center text-center">
                                                <span className="material-symbols-outlined text-secondary text-5xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                <span className="text-sm font-bold text-on-surface">Đã chọn thành công</span>
                                                <span className="mt-1 max-w-[220px] truncate text-xs text-outline sm:max-w-[250px]">{gpkdFile?.name}</span>
                                                <button type="button" className="mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors" onClick={() => handleRemoveFile('gpkd')}>Thay đổi tệp</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Document Card 2: Chứng nhận ATTP */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-on-surface">Chứng nhận An toàn thực phẩm</span>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">Bắt buộc</span>
                                    </div>

                                    {!attpPreview ? (
                                        <div className="dashed-border h-56 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group px-4 text-center" onClick={() => document.getElementById('file-attp').click()}>
                                            <input className="hidden" id="file-attp" type="file" accept="image/*" onChange={handleAttpChange} />
                                            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                <span className="material-symbols-outlined text-3xl">description</span>
                                            </div>
                                            <span className="text-sm font-medium text-on-surface-variant">Ảnh chụp chứng nhận ATTP</span>
                                            <span className="text-[10px] text-outline mt-1 uppercase">JPG, PNG (Tối đa 5MB)</span>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-secondary bg-secondary-container/10 h-56 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                            <img src={attpPreview} alt="Preview ATTP" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                            <div className="z-10 flex flex-col items-center text-center">
                                                <span className="material-symbols-outlined text-secondary text-5xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                <span className="text-sm font-bold text-on-surface">Đã chọn thành công</span>
                                                <span className="mt-1 max-w-[220px] truncate text-xs text-outline sm:max-w-[250px]">{attpFile?.name}</span>
                                                <button type="button" className="mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors" onClick={() => handleRemoveFile('attp')}>Thay đổi tệp</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tips Banner */}
                            <div className="flex max-w-2xl gap-4 rounded-2xl border border-secondary/20 bg-secondary-container/20 p-4 sm:p-6">
                                <span className="material-symbols-outlined text-secondary text-2xl">info</span>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-on-surface">Mẹo chụp ảnh hồ sơ</p>
                                    <p className="text-sm text-on-surface-variant opacity-80">Đảm bảo ảnh đủ sáng, không bị lóa và thông tin trên giấy tờ phải rõ ràng, không bị che khuất hoặc cắt góc.</p>
                                </div>
                            </div>
                        </section>
                    </form>
                    </div>
                    

                    {/* Desktop Action Bar */}
                    <nav className="fixed bottom-0 right-0 z-50 flex items-center justify-end border-t border-outline-variant bg-surface/90 px-4 py-4 backdrop-blur-lg lg:left-[400px] lg:px-16 lg:py-6">
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                            <button type="button" className="flex items-center justify-center gap-2 text-on-surface-variant px-6 py-3 hover:bg-surface-container-high transition-colors rounded-full active:scale-95 font-medium">
                                <span className="material-symbols-outlined">save</span>
                                <span className="text-sm font-bold">Lưu bản nháp</span>
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center justify-center bg-primary text-on-primary rounded-full px-8 py-4 shadow-xl hover:bg-primary/90 active:scale-98 transition-all gap-3 disabled:cursor-not-allowed disabled:opacity-60 sm:px-12">
                                <span className="text-base font-bold sm:text-lg">{isSubmitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ'}</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </nav>
            </main>
        </div>
    );
}
