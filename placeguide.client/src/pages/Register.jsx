import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage';
import { registerUser } from '../services/authService';


function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toast, setToast] = useState({
        message: '',
        type: 'success',
    });
    
    //const [terms, setTerms] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setToast({
                message: 'Mật khẩu xác nhận không khớp!',
                type: 'error',
            });
            return;
        }

        try{
            await registerUser({
                fullName,
                email,
                password,
            });
            setToast({
                message: 'Đăng ký thành công!',
                type: 'success',
            });
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        }catch(error){
            setToast({
                message: error.message,
                type: 'error',
            });
        }

    };

    return (
        <div className="bg-orange-50 min-h-screen flex flex-col relative font-sans text-stone-900 selection:bg-red-200 selection:text-red-700">
            <ToastMessage
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: '',
                        type: 'success',
                    })
                }
            />
            {/* Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    alt="Vietnamese street food spread with pho, banh mi, and spring rolls"
                    className="w-full h-full object-cover object-center filter brightness-90"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNVIS4kRrdyb0LYrrwJ6VPEBFyHOuGxt0XTkB57IkqHi3aeYnFr0cuVjwfIFkI3w6g1n_mPHgUlYDXVSn-EkhtNh6VLBkpJx-72Pw3LpoLRB6zly7gN2mx98lWjP0RzVXo5Ac_cMl4mW2LFPzy0yamqWbkqTWmviI40Bui4JZAXjqwzPIVykerd9x4F1Zcv00PkxvN0K8feUyF58Gu8jQK0H2Xpku60mc_Rrf78q7nAgjp38EcN5WsvaQ9lNAEe3x8jljCxWfvBIs2"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 w-full px-5 md:px-16 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white text-2xl font-bold tracking-tight drop-shadow-md">
                    <span className="material-symbols-outlined text-red-200">
                        restaurant
                    </span>
                    VinaFood
                </div>

                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 border border-white/30">
                    <button className="text-white text-sm font-bold px-2 py-1">
                        VN
                    </button>
                    <span className="text-white/50">|</span>
                    <button className="text-white text-sm px-2 py-1 opacity-70 hover:opacity-100 transition-opacity">
                        EN
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex items-center justify-center p-5 md:p-16">
                <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-red-100/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-700 via-red-500 to-green-600"></div>

                    <div className="text-center mb-10">
                        <h1 className="text-[28px] md:text-[32px] font-bold text-black mb-1">
                            Tạo tài khoản
                        </h1>
                        <p className="text-base text-gray-600">
                            Bắt đầu hành trình ẩm thực của bạn cùng VinaFood.
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-sm font-semibold text-black"
                                htmlFor="fullname"
                            >
                                Họ và tên
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        person
                                    </span>
                                </div>

                                <input
                                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg text-base text-black placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all outline-none"
                                    id="fullname"
                                    name="fullname"
                                    placeholder="Nguyễn Văn A"
                                    required
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-sm font-semibold text-black"
                                htmlFor="email"
                            >
                                Địa chỉ Email
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        mail
                                    </span>
                                </div>

                                <input
                                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg text-base text-black placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all outline-none"
                                    id="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-sm font-semibold text-black"
                                htmlFor="password"
                            >
                                Mật khẩu
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        lock
                                    </span>
                                </div>

                                <input
                                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg text-base text-black placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all outline-none"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-sm font-semibold text-black"
                                htmlFor="confirm-password"
                            >
                                Xác nhận mật khẩu
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        lock_reset
                                    </span>
                                </div>

                                <input
                                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg text-base text-black placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all outline-none"
                                    id="confirm-password"
                                    name="confirm-password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                       
                        <button
                            className="w-full mt-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold py-4 rounded-lg shadow-sm hover:shadow-[0_4px_20px_rgba(255,77,77,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            type="submit"
                        >
                            Đăng ký
                            <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-gray-200 pt-6">
                        <p className="text-base text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link
                                className="text-red-700 hover:text-red-800 font-bold ml-1 transition-colors hover:underline"
                                to="/login"
                            >
                                Đăng nhập ngay.
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>

    );
}

export default Register;
