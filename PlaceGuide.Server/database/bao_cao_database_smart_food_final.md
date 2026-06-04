# BÁO CÁO THIẾT KẾ DATABASE
## Web App hỗ trợ khách du lịch lựa chọn quán ăn và món ăn đa ngôn ngữ

## 1. Phạm vi hệ thống

Database được thiết kế cho hệ thống web phục vụ 3 nhóm người dùng chính:

1. **Khách du lịch**: xem quán ăn, xem menu, nghe giới thiệu quán/món, lọc món theo dị ứng/chế độ ăn, đặt món, thanh toán và đánh giá.
2. **Quán ăn / chủ quán**: quản lý thông tin quán, hình ảnh, menu, món ăn, bản dịch, audio giới thiệu, đơn hàng, thanh toán và báo cáo doanh thu.
3. **Admin**: quản lý tài khoản, quản lý quán, kiểm duyệt dữ liệu và theo dõi hoạt động hệ thống.

Database không còn nhóm ban quản lý tour, tour du lịch hay điểm tham quan. Phần thuyết minh trong hệ thống chỉ tập trung vào **giới thiệu quán ăn** và **giới thiệu món ăn**.

## 2. Định hướng thiết kế

Database được thiết kế ở mức vừa phải cho đồ án: không quá nhỏ như web bán hàng cơ bản, nhưng cũng không quá nặng như hệ thống thương mại thực tế. Hệ thống vẫn giữ đầy đủ các chức năng quan trọng như đa ngôn ngữ, audio giới thiệu, gợi ý quán gần vị trí khách, dị ứng/chế độ ăn, đặt món, thanh toán, đánh giá và thống kê doanh thu cho quán ăn.

Thống kê doanh thu không dùng bảng thống kê riêng. Thay vào đó, hệ thống tạo các **SQL View** để lấy dữ liệu trực tiếp từ bảng đơn hàng, chi tiết đơn hàng, thanh toán và đánh giá. Cách này giúp dữ liệu báo cáo luôn đúng với dữ liệu giao dịch thật.

## 3. Nhóm bảng người dùng và phân quyền

| Bảng | Mục đích |
|---|---|
| `roles` | Lưu các vai trò: ADMIN, RESTAURANT_OWNER, TOURIST. |
| `users` | Lưu tài khoản người dùng, email, mật khẩu mã hóa, số điện thoại, trạng thái. |
| `user_profiles` | Lưu thông tin mở rộng của khách như ngôn ngữ ưu tiên, quốc tịch, ngày sinh. |

Quan hệ chính:

- Một `role` có nhiều `users`.
- Một `user` có một `user_profile`.
- Một chủ quán trong `users` có thể sở hữu nhiều `restaurants`.

## 4. Nhóm bảng quán ăn

| Bảng | Mục đích |
|---|---|
| `restaurants` | Lưu thông tin chính của quán: tên, mô tả, địa chỉ, tọa độ, trạng thái. |
| `restaurant_images` | Lưu ảnh đại diện, ảnh bìa, ảnh không gian và ảnh món ăn của quán. |
| `restaurant_opening_hours` | Lưu giờ mở cửa theo từng ngày trong tuần. |
| `restaurant_special_closures` | Lưu ngày nghỉ đặc biệt của quán. |
| `restaurant_translations` | Lưu bản dịch tên quán và mô tả quán theo từng ngôn ngữ. |
| `menu_uploads` | Lưu file menu giấy do quán upload lên, ví dụ ảnh, PDF hoặc DOCX. |

Quan hệ chính:

- Một `restaurant` thuộc về một chủ quán trong `users`.
- Một `restaurant` có nhiều ảnh, nhiều khung giờ mở cửa, nhiều bản dịch và nhiều file menu upload.
- Tọa độ `latitude`, `longitude` trong `restaurants` dùng cho chức năng gợi ý quán gần vị trí khách.

## 5. Nhóm bảng menu và món ăn

| Bảng | Mục đích |
|---|---|
| `menus` | Lưu menu của từng quán, ví dụ menu chính, menu sáng, menu tối. |
| `menu_categories` | Lưu danh mục món như món chính, đồ uống, tráng miệng. |
| `dishes` | Lưu món ăn, giá tiền, mô tả, trạng thái còn bán/hết món. |
| `dish_images` | Lưu ảnh của món ăn. |
| `dish_translations` | Lưu bản dịch tên món và mô tả món theo từng ngôn ngữ. |

Quan hệ chính:

- Một `restaurant` có nhiều `menus`, nhiều `menu_categories` và nhiều `dishes`.
- Một `menu` có nhiều `dishes`.
- Một `menu_category` có nhiều `dishes`.
- Một `dish` có nhiều ảnh và nhiều bản dịch.

## 6. Nhóm bảng dị ứng và chế độ ăn

| Bảng | Mục đích |
|---|---|
| `allergens` | Lưu các loại dị ứng như lạc, sữa, trứng, hải sản, gluten. |
| `dish_allergens` | Liên kết món ăn với các chất gây dị ứng. |
| `dietary_tags` | Lưu nhãn chế độ ăn như Vegetarian, Vegan, Halal, Gluten Free. |
| `dish_dietary_tags` | Liên kết món ăn với các chế độ ăn phù hợp. |

Quan hệ chính:

- Một món ăn có thể chứa nhiều chất gây dị ứng.
- Một chất gây dị ứng có thể xuất hiện trong nhiều món ăn.
- Một món ăn có thể có nhiều nhãn chế độ ăn.
- Chức năng này giúp khách du lịch lọc món an toàn và phù hợp hơn.

## 7. Nhóm bảng audio giới thiệu

| Bảng | Mục đích |
|---|---|
| `audio_files` | Lưu file audio giới thiệu quán hoặc món ăn theo từng ngôn ngữ. |

Bảng `audio_files` dùng thiết kế linh hoạt với hai cột:

- `target_type`: xác định audio thuộc về `RESTAURANT` hay `DISH`.
- `target_id`: lưu id của quán hoặc món tương ứng.

Cách này giúp database gọn hơn, không cần tách thành nhiều bảng audio khác nhau.

## 8. Nhóm bảng giỏ hàng, đơn hàng và thanh toán

| Bảng | Mục đích |
|---|---|
| `carts` | Lưu giỏ hàng của khách trước khi đặt món. |
| `cart_items` | Lưu các món trong giỏ hàng. |
| `orders` | Lưu đơn hàng sau khi khách gửi đơn. |
| `order_items` | Lưu chi tiết món trong từng đơn hàng. |
| `payment_methods` | Lưu các phương thức thanh toán như CASH, VIETQR, MOMO, ZALOPAY, CARD. |
| `payments` | Lưu thông tin thanh toán, số tiền, trạng thái, mã giao dịch, QR code. |

Quan hệ chính:

- Một `cart` có nhiều `cart_items`.
- Một `order` có nhiều `order_items`.
- Một `order` có thể có nhiều bản ghi `payments`, phù hợp khi có nhiều lần thử thanh toán.
- Một `restaurant` có nhiều `orders`.
- Một `dish` có thể xuất hiện trong nhiều `order_items`.

## 9. Nhóm bảng đánh giá và tương tác

| Bảng | Mục đích |
|---|---|
| `restaurant_reviews` | Lưu đánh giá sao và bình luận cho quán. |
| `dish_reviews` | Lưu đánh giá sao và bình luận cho món ăn. |
| `favorites` | Lưu quán hoặc món mà khách yêu thích. |
| `notifications` | Lưu thông báo gửi đến người dùng. |
| `audit_logs` | Lưu lịch sử thao tác quan trọng của admin hoặc chủ quán. |

Quan hệ chính:

- Một khách du lịch có thể đánh giá nhiều quán và nhiều món.
- Một quán có nhiều đánh giá.
- Một món có nhiều đánh giá.
- Dữ liệu đánh giá được dùng để hỗ trợ gợi ý quán ăn và món ăn.

## 10. Nhóm view thống kê cho quán ăn

Hệ thống có các view báo cáo sau:

| View | Mục đích |
|---|---|
| `v_restaurant_daily_revenue` | Thống kê doanh thu và số đơn theo ngày của từng quán. |
| `v_restaurant_monthly_revenue` | Thống kê doanh thu và số đơn theo tháng. |
| `v_restaurant_best_selling_dishes` | Thống kê món bán chạy theo số lượng và doanh thu. |
| `v_restaurant_rating_summary` | Thống kê số đánh giá và điểm trung bình của quán. |
| `v_dish_rating_summary` | Thống kê số đánh giá và điểm trung bình của món. |
| `v_restaurant_dashboard_summary` | Tổng hợp dữ liệu dashboard cho chủ quán: đơn hoàn thành, đơn chờ, doanh thu, số món, số đánh giá. |

Các view này giúp chủ quán xem được doanh thu và hiệu quả kinh doanh từ các dịch vụ phát sinh qua web app mà không cần tạo bảng thống kê riêng.

## 11. Các mối quan hệ quan trọng

- `roles` 1-n `users`
- `users` 1-n `restaurants`
- `restaurants` 1-n `menus`
- `restaurants` 1-n `menu_categories`
- `restaurants` 1-n `dishes`
- `menus` 1-n `dishes`
- `menu_categories` 1-n `dishes`
- `dishes` n-n `allergens` thông qua `dish_allergens`
- `dishes` n-n `dietary_tags` thông qua `dish_dietary_tags`
- `restaurants` 1-n `orders`
- `orders` 1-n `order_items`
- `orders` 1-n `payments`
- `restaurants` 1-n `restaurant_reviews`
- `dishes` 1-n `dish_reviews`

## 12. Kết luận

Database sau khi chỉnh sửa phù hợp với phạm vi đồ án: hệ thống phục vụ khách du lịch, quán ăn/chủ quán và admin. Cấu trúc database không còn các bảng liên quan đến tour du lịch hay ban quản lý tour. Thay vào đó, hệ thống tập trung vào quán ăn, menu, món ăn, dịch thuật đa ngôn ngữ, audio giới thiệu, hỗ trợ lựa chọn món theo dị ứng/chế độ ăn, đặt món, thanh toán, đánh giá và thống kê doanh thu.

Thiết kế này đủ đầy đủ để triển khai chức năng chính của web app, đồng thời vẫn giữ mức độ vừa phải để sinh viên có thể code, kiểm thử, vẽ ERD và trình bày khi bảo vệ đồ án.
