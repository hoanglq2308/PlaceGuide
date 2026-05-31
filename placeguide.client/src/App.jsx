import React, { useState } from 'react';
import './App.css';

function App() {
  // state để biết đang ở màn hình "login" (đăng nhập) hay "register" (đăng ký)
  const [authMode, setAuthMode] = useState('login');
  
  // state để lưu thông tin người dùng nhập vào
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Hàm xử lý khi bấm nút Gửi (Submit)
  const handleSubmit = (e) => {
    e.preventDefault(); // Chặn việc reload lại trang bậy bạ
    
    if (authMode === 'login') {
      console.log("Gửi lên Backend .NET dữ liệu đăng nhập:", { email, password });
      alert(`Đang đăng nhập bằng tài khoản: ${email}`);
    } else {
      if (password !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp kìa bà ơi!");
        return;
      }
      console.log("Gửi lên Backend .NET dữ liệu đăng ký:", { fullName, email, password });
      alert(`Đăng ký thành công cho: ${fullName}`);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        
        {/* Tiêu đề thay đổi theo chế độ */}
        <h2>{authMode === 'login' ? '🌍 VinaFood Sign In' : '📝 Create Account'}</h2>
        <p className="auth-subtitle">
          {authMode === 'login' ? 'Welcome back! Ready for street food?' : 'Join us to explore Vietnam culinary'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nếu là Đăng ký thì hiện thêm ô nhập Họ Tên */}
          {authMode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="your-email@domain.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {/* Nếu là Đăng ký thì hiện thêm ô Xác nhận mật khẩu */}
          {authMode === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {/* Nút bấm chính */}
          <button type="submit" className="btn-submit">
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Nút chuyển đổi qua lại giữa Đăng nhập và Đăng ký */}
        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>New to VinaFood? <span onClick={() => setAuthMode('register')}>Create an account</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setAuthMode('login')}>Sign In here</span></p>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;