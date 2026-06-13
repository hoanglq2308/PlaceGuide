import React, { useState } from 'react';

const AuthModal = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); 
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const toggleMode = (mode) => {
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      // 1. Dùng LocalStorage làm DB giả cầy để móc thông tin đăng ký ra
      const savedUser = JSON.parse(localStorage.getItem('mockDB_user'));

      if (savedUser && email === savedUser.email && password === savedUser.password) {
        // Đúng tài khoản thì quăng thông tin (Tên, Email) ra ngoài cho App.jsx hứng
        onLogin({ name: savedUser.name, email: savedUser.email });
      } else if (email === 'admin@gmail.com' && password === '123456') {
        // Code hack cho dev lười: Nhập tk admin mặc định cũng cho vô
        onLogin({ name: 'Admin', email: 'admin@gmail.com' });
      } else {
        setError('Sai email hoặc mật khẩu! Mới tạo acc thì nhập cho đúng vô coi.');
      }
    } else {
      // LOGIC ĐĂNG KÝ
      if (!name || !email || !password || !confirmPassword) {
        setError('Ê, điền thiếu thông tin kìa! Đừng có lười.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu ngắn thế này hacker nó cười cho.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại bị lệch kìa, mắt nhắm mắt mở hả trời?');
        return;
      }
      
      // 2. Cất thông tin vào LocalStorage để nhớ
      localStorage.setItem('mockDB_user', JSON.stringify({ name, email, password }));
      
      alert('Tạo tài khoản thành công! Đăng nhập thử xem nào.');
      setPassword('');
      setConfirmPassword('');
      toggleMode('login'); // Đá về form đăng nhập
    }
  };

  return (
    // ... Giữ nguyên 100% phần giao diện return (HTML/Tailwind) y hệt như Prompt 7, 
    // không cần sửa một chữ nào ở phần UI dưới này nhé! Cứ copy phần ruột UI cũ bỏ vào đây.
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200 transition-transform hover:rotate-12">
              {authMode === 'login' ? '🔐' : '📝'}
            </div>
            <h2 className="text-3xl font-black text-gray-900">
              {authMode === 'login' ? 'Chào mừng lại!' : 'Tạo tài khoản'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Họ và tên</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên..." className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"/>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev-wind@gmail.com" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"/>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"/>
            </div>

            {authMode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Nhập lại mật khẩu</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"/>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 animate-in shake">⚠️ {error}</div>}

            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-95 transition-all mt-2">
              {authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ NGAY'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-gray-600">
            {authMode === 'login' ? (
              <p>Chưa có tài khoản? <button onClick={() => toggleMode('register')} className="text-indigo-600 font-bold hover:underline">Đăng ký ngay</button></p>
            ) : (
              <p>Đã có tài khoản? <button onClick={() => toggleMode('login')} className="text-indigo-600 font-bold hover:underline">Đăng nhập</button></p>
            )}
          </div>

          {authMode === 'login' && (
             <button 
                // 3. Nếu bấm nút Khách thì cũng quăng đại một cái tên ảo ra ngoài
                onClick={() => onLogin({ name: 'Khách qua đường', email: 'guest@placeguide.com' })}
                className="w-full mt-6 py-4 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
             >
               <span>👤</span> Tiếp tục với tư cách Khách
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;