# PlaceGuide / VinaFood

## Test Geolocation trên điện thoại khi chạy local

### Vấn đề thường gặp
Khi mở ứng dụng bằng địa chỉ IP LAN (ví dụ: `http://192.168.x.x:5173`) trên điện thoại di động để kiểm thử, khi click vào **"Dùng vị trí của tôi"**, trình duyệt báo lỗi và không thể lấy được vị trí của bạn mặc dù bạn đã cho phép quyền truy cập vị trí trong cài đặt hệ thống.

**Nguyên nhân:**
Hầu hết các trình duyệt di động hiện đại (Chrome, Safari, v.v.) yêu cầu **Secure Context** (Bối cảnh an toàn) để kích hoạt Geolocation API.
- Các bối cảnh được coi là an toàn: `localhost`, `127.0.0.1`, và các kết nối qua giao thức `HTTPS`.
- Kết nối `http://192.168.x.x:5173` qua mạng LAN **KHÔNG** được xem là Secure Context, do đó trình duyệt sẽ từ chối gọi API Geolocation để bảo vệ an toàn thông tin của người dùng.

---

### Hướng dẫn kiểm thử Local Geolocation đúng cách trên điện thoại

Để kiểm thử tính năng này trên thiết bị di động, bạn có thể lựa chọn 1 trong các phương pháp sau:

#### Phương pháp 1: Sử dụng Cloudflare Tunnel (Khuyên dùng - Nhanh & Tiện lợi)
Cloudflare cung cấp đường truyền HTTPS miễn phí từ localhost ra ngoài Internet.
1. Cài đặt `cloudflared` trên máy tính.
2. Mở terminal và chạy lệnh:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
3. Cloudflare sẽ tạo một URL HTTPS ngẫu nhiên dạng `https://xxxx.trycloudflare.com`.
4. Mở URL HTTPS này trên trình duyệt điện thoại của bạn, đồng ý cấp quyền vị trí, và tính năng lấy vị trí sẽ hoạt động bình thường.

#### Phương pháp 2: Sử dụng Ngrok
Tương tự như Cloudflare Tunnel, Ngrok giúp tạo HTTPS tunnel trực tiếp đến cổng local.
1. Cài đặt và cấu hình `ngrok`.
2. Mở terminal và chạy lệnh:
   ```bash
   ngrok http 5173
   ```
3. Truy cập đường link HTTPS dạng `https://xxxx.ngrok-free.app` được hiển thị trong terminal bằng điện thoại.

#### Phương pháp 3: Cấu hình HTTPS cho Vite tại Local
Nếu không muốn sử dụng các dịch vụ tunnel, bạn có thể thiết lập cấu hình HTTPS cho local server của Vite:
1. Tạo SSL certificate tự ký bằng công cụ `mkcert`:
   ```bash
   mkcert -install
   mkcert localhost 192.168.x.x (Thay bằng IP LAN của bạn)
   ```
2. Cấu hình file `vite.config.js` trong thư mục client:
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import fs from 'fs';

   export default defineConfig({
     plugins: [react()],
     server: {
       host: true,
       port: 5173,
       https: {
         key: fs.readFileSync('./localhost-key.pem'),
         cert: fs.readFileSync('./localhost.pem'),
       }
     }
   });
   ```
3. Cài đặt và tin tưởng root certificate của `mkcert` trên điện thoại di động của bạn, sau đó truy cập qua địa chỉ `https://192.168.x.x:5173`.

---

### Môi trường Production
Trên domain HTTPS chính thức (Production), Geolocation API sẽ hoạt động hoàn toàn bình thường khi được người dùng đồng ý cấp quyền. Đây là hành vi tiêu chuẩn về bảo mật của trình duyệt, không phải lỗi ở mã nguồn hay cơ sở dữ liệu.