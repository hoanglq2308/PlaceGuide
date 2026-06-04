import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        navigate('/home');
    };

    return (
        <div className="bg-orange-50 text-stone-900 font-sans h-screen w-full flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Vietnamese street food spread with pho, banh mi, and spring rolls"
                    className="w-full h-full object-cover object-center filter brightness-90"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNVIS4kRrdyb0LYrrwJ6VPEBFyHOuGxt0XTkB57IkqHi3aeYnFr0cuVjwfIFkI3w6g1n_mPHgUlYDXVSn-EkhtNh6VLBkpJx-72Pw3LpoLRB6zly7gN2mx98lWjP0RzVXo5Ac_cMl4mW2LFPzy0yamqWbkqTWmviI40Bui4JZAXjqwzPIVykerd9x4F1Zcv00PkxvN0K8feUyF58Gu8jQK0H2Xpku60mc_Rrf78q7nAgjp38EcN5WsvaQ9lNAEe3x8jljCxWfvBIs2"
                />
            </div>

            <div className="absolute top-5 right-5 md:top-10 md:right-10 z-20">
                <button className="flex items-center gap-1 text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">language</span>
                    <span className="text-sm font-semibold">VN | EN</span>
                </button>
            </div>

            <div className="relative z-10 w-full max-w-md px-5 md:px-0">
                <div className="bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-xl p-10 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-[32px]">🌍</span>
                        <h1 className="text-2xl font-semibold text-black tracking-tight">VinaFood</h1>
                    </div>

                    <h2 className="text-[28px] md:text-[32px] font-bold text-black mb-1 text-center">Đăng nhập VinaFood</h2>
                    <p className="text-base text-black mb-8 text-center">Khám phá hương vị Việt cùng VinaFood.</p>

                    <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-black text-center" htmlFor="email">Địa chỉ Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500">mail</span>
                                </div>
                                <input
                                    className="w-full bg-white border border-gray-600 rounded-full py-3 pl-10 pr-4 text-base text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all"
                                    id="email"
                                    name="email"
                                    placeholder="Nhập email của bạn"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-black text-center" htmlFor="password">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500">lock</span>
                                </div>
                                <input
                                    className="w-full bg-white border border-gray-600 rounded-full py-3 pl-10 pr-4 text-base text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-[-8px]">
                            <a className="text-sm font-semibold text-red-700 hover:underline" href="#">Quên mật khẩu?</a>
                        </div>

                        <button
                            className="w-full bg-red-700 text-white rounded-full py-4 text-sm font-semibold hover:bg-red-800 transition-colors shadow-sm mt-3"
                            type="submit"
                        >
                            Đăng nhập
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-base text-gray-600">
                            Bạn mới đến VinaFood? <Link className="text-red-700 font-bold hover:underline" to="/register">Tạo tài khoản ngay.</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
  );
}

export default Login;