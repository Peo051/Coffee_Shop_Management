# ☕ GIBOR COFFEE SHOP

> Website đặt hàng và giới thiệu thương hiệu cà phê **GIBOR** — hương vị nguyên bản, mộc mạc từ nông trại đến tách cà phê.

---

## 📌 Giới thiệu

**GIBOR Coffee** là đồ án môn học xây dựng website thương mại điện tử cho một quán cà phê. Website cung cấp đầy đủ chức năng từ xem menu, đặt hàng, quản lý giỏ hàng đến thanh toán, cùng hệ thống xác thực người dùng tích hợp Firebase và hệ thống điểm tích lũy cho khách hàng thân thiết.

- **Địa chỉ quán chính:** 140 Lê Trọng Tấn, Tân Phú, TP.HCM
- **Hệ thống chi nhánh:** 15 chi nhánh toàn quốc (5 TP.HCM · 5 Hà Nội · 5 Đà Nẵng)
- **Giờ mở cửa:** 07:00 – 22:00 hàng ngày
- **Năm thực hiện:** 2025 – 2026

---

## 👥 Thành viên nhóm

| STT | Thành viên | Vai trò | Phụ trách chính |
|:---:|---|---|---|
| 1 | **Trần Dương Gia Bảo** | Core Developer – Business Logic | `data.js`, `cart.js`, `cart.html`, `payment.html`, `payment.js`, `cart.css`, `payment.css` (phần core), dark mode CSS, hệ thống điểm tích lũy, quản lý đơn hàng |
| 2 | **Trần Gia Bảo** | Frontend Developer – Leader | `index.html`, `about.html`, `contact.html`, `style.css` (phần base), `home.css`, `about.css`, `contact.css`, `mobile.css`, `main.js` (phần chung), `about.js`, `contact.js`, `mobile.js` |
| 3 | **Nguyễn Thế Anh** | Firebase Integration | `login.html`, `register.html`, `loginregister.js`, `firebase.js`, `login.css`, `register.css` |
| 4 | **Nguyễn Hoàng Bảo** | Frontend Developer | `menu.html`, `menu.css`, `popup.css`, phần popup trong `main.js` |

> *Team 3 – Đồ án Kỳ 4 (2025–2026)*  
> *Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)*

---

## 🗂️ Cấu trúc thư mục

```
GIBOR-COFFEE-SHOP_GIABAO/
├── index.html              # Trang chủ                    [Trần Gia Bảo]
├── menu.html               # Trang menu sản phẩm          [Nguyễn Hoàng Bảo]
├── about.html              # Giới thiệu về quán           [Trần Gia Bảo]
├── contact.html            # Liên hệ                      [Trần Gia Bảo]
├── cart.html               # Giỏ hàng                     [Trần Dương Gia Bảo] ★
├── login.html              # Đăng nhập                    [Nguyễn Thế Anh]
├── register.html           # Đăng ký tài khoản            [Nguyễn Thế Anh]
├── payment.html            # Thanh toán                   [Trần Dương Gia Bảo] ★
│
├── css/
│   ├── style.css           # CSS chung + dark mode        [Trần Gia Bảo + Trần Dương Gia Bảo]
│   ├── home.css            # Trang chủ                    [Trần Gia Bảo]
│   ├── menu.css            # Trang menu                   [Nguyễn Hoàng Bảo]
│   ├── about.css           # Trang giới thiệu             [Trần Gia Bảo]
│   ├── contact.css         # Trang liên hệ                [Trần Gia Bảo]
│   ├── cart.css            # Giỏ hàng                     [Trần Dương Gia Bảo] ★
│   ├── login.css           # Đăng nhập                    [Nguyễn Thế Anh]
│   ├── register.css        # Đăng ký                      [Nguyễn Thế Anh]
│   ├── payment.css         # Thanh toán (core)            [Trần Dương Gia Bảo] ★
│   ├── popup.css           # Popup & thông báo            [Nguyễn Hoàng Bảo]
│   └── mobile.css          # Responsive mobile            [Trần Gia Bảo]
│
├── js/
│   ├── data.js             # Toàn bộ data layer           [Trần Dương Gia Bảo] ★
│   ├── firebase.js         # Cấu hình Firebase            [Nguyễn Thế Anh]
│   ├── auth.js             # Xác thực người dùng
│   ├── loginregister.js    # Logic đăng nhập / đăng ký    [Nguyễn Thế Anh]
│   ├── cart.js             # Toàn bộ logic giỏ hàng       [Trần Dương Gia Bảo] ★
│   ├── payment.js          # Toàn bộ logic thanh toán     [Trần Dương Gia Bảo + Trần Gia Bảo] ★
│   ├── main.js             # Logic chung toàn trang       [Trần Gia Bảo + Nguyễn Hoàng Bảo + Trần Dương Gia Bảo]
│   ├── mobile.js           # Hành vi responsive mobile    [Trần Gia Bảo]
│   ├── about.js            # Logic trang giới thiệu       [Trần Gia Bảo]
│   └── contact.js          # Logic trang liên hệ          [Trần Gia Bảo]
│
├── images/
│   ├── logo/               # Logo thương hiệu
│   ├── banner/             # Ảnh banner trang chủ
│   ├── menu/               # Ảnh sản phẩm menu
│   └── about/              # Ảnh trang giới thiệu
│
└── DataBase/
    ├── DB_DA_QuanLyQuanCF.sql   # Script tạo CSDL
    └── Diagram.drawio           # Sơ đồ quan hệ thực thể (ERD)
```

> ★ = File do **Trần Dương Gia Bảo** phụ trách chính

---

## 🌟 Đóng góp chi tiết — Trần Dương Gia Bảo

Trần Dương Gia Bảo chịu trách nhiệm toàn bộ **data layer**, **business logic** và **các trang chức năng cốt lõi** của website, bao gồm:

---

### 📦 `data.js` — Tầng dữ liệu toàn ứng dụng

File `data.js` là **xương sống của toàn bộ website**, cung cấp ba module độc lập:

#### `UserManager` — Quản lý tài khoản người dùng

Lưu trữ toàn bộ dữ liệu người dùng vào `localStorage` với key `gibor_users` và `gibor_current_user`.

| Phương thức | Mô tả |
|---|---|
| `getUsers()` | Lấy danh sách tất cả tài khoản |
| `saveUsers(users)` | Lưu danh sách tài khoản |
| `register({lastName, firstName, email, phone, password})` | Đăng ký tài khoản mới, kiểm tra email trùng, validate mật khẩu ≥ 6 ký tự, tự động đăng nhập sau khi đăng ký |
| `login(email, password)` | Đăng nhập bằng email + mật khẩu |
| `setCurrentUser(user)` | Lưu phiên đăng nhập (không lưu password) |
| `getCurrentUser()` | Lấy thông tin người dùng hiện tại |
| `logout()` | Đăng xuất, xóa phiên |
| `isLoggedIn()` | Kiểm tra trạng thái đăng nhập |
| `updateProfile({lastName, firstName, email, phone})` | Cập nhật thông tin cá nhân, kiểm tra email mới không trùng |
| `updatePassword(oldPassword, newPassword)` | Đổi mật khẩu có xác minh mật khẩu cũ |
| `loginWithGoogle(googleUser)` | Tích hợp Google Auth — nếu email đã tồn tại thì đăng nhập, nếu chưa thì tạo tài khoản mới từ thông tin Google |

#### `PointsManager` — Hệ thống điểm tích lũy

Lưu điểm theo `userId` trong `localStorage` với key `gibor_points`.

**Quy tắc tích lũy:** `1.000đ` chi tiêu = `1 điểm` tích lũy  
**Quy tắc đổi điểm:** `100 điểm` = `1.000đ` giảm giá

| Phương thức | Mô tả |
|---|---|
| `getPoints()` | Lấy điểm hiện tại của user đang đăng nhập |
| `setPoints(points)` | Cập nhật điểm (tự làm tròn xuống, không âm) |
| `earnPoints(amount)` | Cộng điểm sau thanh toán: `floor(amount / 1000)` |
| `usePoints(points)` | Trừ điểm khi đổi, kiểm tra đủ điểm trước khi trừ |
| `pointsToMoney(points)` | Quy đổi điểm → tiền: `floor(points / 100) × 1.000đ` |
| `moneyToPoints(amount)` | Quy đổi tiền → điểm: `floor(amount / 1000)` |

#### `OrderManager` — Lịch sử đơn hàng

Lưu đơn hàng vào `localStorage` với key `gibor_orders`, lọc theo `userId`.

| Phương thức | Mô tả |
|---|---|
| `getOrders()` | Lấy tất cả đơn hàng của user hiện tại |
| `saveOrder(order)` | Lưu đơn hàng mới kèm thông tin user và timestamp |

---

### 🛒 `cart.js` — Toàn bộ logic giỏ hàng

Quản lý giỏ hàng bằng `localStorage` với key `giborCart`. Mỗi item trong giỏ có đầy đủ: tên, giá, số lượng, size, lượng đường, lượng đá, topping, ghi chú, ảnh.

| Hàm | Mô tả |
|---|---|
| `getCart()` / `saveCart(cart)` | Đọc / ghi giỏ hàng vào localStorage |
| `formatPrice(price)` | Định dạng số tiền VNĐ (`toLocaleString("vi-VN") + "đ"`) |
| `updateCartCount()` | Cập nhật badge số lượng trên icon giỏ hàng ở header |
| `showToast(message)` | Hiển thị thông báo nổi (toast) tự đóng sau 2.5 giây |
| `renderCart()` | Render toàn bộ bảng giỏ hàng: ảnh, tên, tùy chọn (size, đường, đá, topping), ghi chú, đơn giá, số lượng, thành tiền, nút xóa |
| `changeQuantity(index, delta)` | Tăng/giảm số lượng; tự động xóa sản phẩm khi số lượng về 0 |
| `removeItem(index)` | Xóa một sản phẩm khỏi giỏ, hiển thị toast xác nhận |
| `clearCart()` | Xóa toàn bộ giỏ hàng (có hộp thoại xác nhận `confirm()`) |
| `openCheckout()` | Kiểm tra giỏ không trống rồi chuyển sang trang thanh toán |

---

### 💳 `payment.js` — Toàn bộ logic thanh toán

File lớn nhất dự án (~1.463 dòng), xử lý toàn bộ luồng đặt hàng:

#### Hiển thị đơn hàng
- `renderOrderSummary()` — Render danh sách sản phẩm bên cột phải (ảnh, tên, meta: size/đường/đá/topping, ghi chú, giá thành)
- `updateTotals(subtotal)` — Tính và cập nhật: tạm tính, phí vận chuyển, giảm giá coupon, giảm giá điểm, **tổng thanh toán cuối cùng**

#### Logic phí vận chuyển
- **Uống tại quán** → Miễn phí
- **Giao hàng** → Đơn từ `200.000đ` trở lên: **Miễn phí** | Đơn dưới `200.000đ`: `30.000đ`
- Có mã `FREESHIP`: luôn miễn phí ship

#### Hệ thống mã giảm giá
| Mã | Loại | Giá trị |
|---|---|---|
| `GIBOR10` | Phần trăm | Giảm 10%, tối đa 50.000đ |
| `GIBOR20K` | Cố định | Giảm thẳng 20.000đ |
| `FREESHIP` | Vận chuyển | Miễn phí ship |

#### Hệ thống điểm trong thanh toán
- Hiển thị điểm hiện có của người dùng
- Cho phép nhập số điểm muốn dùng (tối đa bằng điểm hiện có)
- Tự động tính điểm giảm không vượt quá tổng tiền hàng
- Hiển thị điểm sẽ nhận được sau khi đặt hàng (tính trên tiền hàng, không tính phí ship)

#### Chọn phương thức thanh toán
| Phương thức | Mô tả |
|---|---|
| `COD` | Thanh toán tiền mặt khi nhận hàng |
| `Banking` | Thanh toán chuyển khoản — tự động hiển thị QR code với số tiền cụ thể |

#### Hệ thống chọn chi nhánh (15 chi nhánh)
- **TP. Hồ Chí Minh (5):** Lê Trọng Tấn, Nguyễn Huệ, Võ Văn Tần, Xa lộ Hà Nội, Điện Biên Phủ
- **Hà Nội (5):** Trần Duy Hưng, Láng Hạ, Bạch Mai, Hoàng Hoa Thám, Nguyễn Văn Cừ
- **Đà Nẵng (5):** Võ Nguyên Giáp, Bạch Đằng, Nguyễn Văn Linh, Tôn Đức Thắng, Cách Mạng Tháng Tám

#### Hoàn tất đơn hàng
- Validate đầy đủ thông tin (họ tên, SĐT, địa chỉ / chi nhánh)
- Tạo mã đơn hàng ngẫu nhiên (`GIBOR-XXXXXX`)
- Lưu đơn vào `OrderManager`
- Trừ điểm đã dùng và cộng điểm mới qua `PointsManager`
- Xóa giỏ hàng sau khi đặt thành công
- Hiển thị popup xác nhận đơn hàng

---

### 🎨 `cart.html` + `cart.css` — Giao diện trang giỏ hàng
- Bảng giỏ hàng responsive (ẩn/hiện header theo màn hình với `data-label`)
- Cột hiển thị: Sản phẩm (ảnh + tên + tùy chọn + ghi chú), Size, Đơn giá, Số lượng (nút −/+), Thành tiền, Nút xóa
- Tổng số lượng + tổng tiền cập nhật real-time
- Nút **Xóa tất cả** và **Tiến hành thanh toán**
- Trạng thái giỏ trống với icon và hướng dẫn

### 🎨 `payment.html` + `payment.css` (phần core) — Giao diện trang thanh toán
- Layout 2 cột: Form thông tin (trái) + Tóm tắt đơn hàng (phải)
- Form thông tin giao hàng / chọn chi nhánh
- Section mã giảm giá với input + nút áp dụng
- Section điểm tích lũy (chỉ hiện khi đã đăng nhập)
- Chọn phương thức thanh toán với UI card có animation active
- QR code thanh toán ngân hàng (hiện khi chọn Banking)

---

## ✨ Tính năng toàn trang

### 🏠 Trang chủ *(Trần Gia Bảo)*
- Preloader loading screen với logo thương hiệu
- Banner hero với call-to-action đặt hàng / ghé thăm quán
- Giới thiệu triết lý cà phê nguyên bản (100% Rang Mộc, Pha Chế Tận Tâm)
- Banner khuyến mãi giới hạn: Mua 2 Tặng 1 Bạc Xỉu (07:00–10:00)
- Google Maps iframe nhúng vị trí trường HUIT

### ☕ Menu *(Nguyễn Hoàng Bảo)*
- Hiển thị sản phẩm theo danh mục (cà phê, trà, đồ ăn, ...)
- Popup chọn size, lượng đường, lượng đá, topping, ghi chú trước khi thêm vào giỏ

### 🛒 Giỏ hàng *(Trần Dương Gia Bảo)*
- Xem, chỉnh sửa, xóa sản phẩm trong giỏ
- Hiển thị đầy đủ tùy chọn đã chọn (size, đường, đá, topping, ghi chú)
- Tổng tiền cập nhật real-time
- Toast notification khi thao tác

### 💳 Thanh toán *(Trần Dương Gia Bảo + Trần Gia Bảo)*
- Xem lại đơn hàng trước khi đặt
- Chọn giao hàng hoặc đến lấy tại quán (15 chi nhánh)
- Mã giảm giá (GIBOR10 / GIBOR20K / FREESHIP)
- Sử dụng điểm tích lũy để giảm giá
- Thanh toán COD hoặc chuyển khoản (QR)
- Xác nhận đơn hàng với mã đơn ngẫu nhiên

### 👤 Tài khoản người dùng *(Nguyễn Thế Anh + Trần Dương Gia Bảo)*
- Đăng ký / đăng nhập bằng email & mật khẩu
- Đăng nhập bằng Google OAuth (Firebase)
- Dropdown thông tin tài khoản: tên, email, điểm tích lũy
- Cập nhật thông tin cá nhân, đổi mật khẩu
- Xem lịch sử đơn hàng

### 🔔 Hệ thống Popup *(Nguyễn Hoàng Bảo)*
- Popup thông báo thành công / lỗi / cảnh báo
- Modal xác nhận hành động
- Animation mượt mà, hỗ trợ dark mode

### 🎨 Giao diện & UX *(Trần Gia Bảo + Trần Dương Gia Bảo)*
- **Dark Mode** — toggle sáng/tối, lưu vào localStorage, áp dụng toàn trang
- **Responsive Design** — desktop, tablet, mobile
- **Hamburger Menu** — điều hướng mobile mượt mà
- **Sticky Header** — thanh nav cố định khi cuộn
- Font: *Montserrat*, *Playfair Display*, *Mrs Saint Delafield* (Google Fonts)
- Icon: Font Awesome 6.5.1

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| HTML5 | — | Cấu trúc trang web |
| CSS3 | — | Giao diện, animation, CSS variables, dark mode |
| JavaScript | ES6+ | Logic frontend, DOM manipulation, module pattern |
| Firebase Auth | v10 (compat) | Xác thực Google OAuth |
| localStorage | Web API | Lưu trữ users, giỏ hàng, đơn hàng, điểm, theme |
| Font Awesome | 6.5.1 | Bộ icon giao diện |
| Google Fonts | — | Montserrat, Playfair Display, Mrs Saint Delafield |
| Google Maps Embed | — | Bản đồ vị trí quán |

### 📦 Cấu trúc dữ liệu localStorage

| Key | Kiểu | Mô tả | Tác giả |
|---|---|---|---|
| `gibor_users` | `Array<User>` | Danh sách tất cả tài khoản | Trần Dương Gia Bảo |
| `gibor_current_user` | `User` | Phiên đăng nhập hiện tại (không có password) | Trần Dương Gia Bảo |
| `gibor_points` | `{userId: number}` | Điểm tích lũy theo từng user | Trần Dương Gia Bảo |
| `gibor_orders` | `Array<Order>` | Lịch sử đơn hàng | Trần Dương Gia Bảo |
| `giborCart` | `Array<CartItem>` | Giỏ hàng hiện tại | Trần Dương Gia Bảo |
| `theme` | `"dark"` \| `"light"` | Tùy chọn giao diện | Trần Gia Bảo |

---

## 🗄️ Cơ sở dữ liệu

| File | Mô tả |
|---|---|
| `DataBase/DB_DA_QuanLyQuanCF.sql` | Script tạo và khởi tạo toàn bộ CSDL |
| `DataBase/Diagram.drawio` | Sơ đồ quan hệ thực thể (ERD) |

---

## 🚀 Hướng dẫn chạy dự án

Dự án là website tĩnh thuần HTML/CSS/JS, **không cần cài đặt** phụ thuộc nào.

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng trình duyệt web (Chrome / Edge / Firefox).

### Cách 2: Dùng Live Server *(khuyến nghị)*
1. Cài extension **Live Server** trong VS Code
2. Click chuột phải vào `index.html` → **Open with Live Server**
3. Trình duyệt tự động mở tại `http://127.0.0.1:5500`

> ⚠️ **Lưu ý:** Chức năng đăng nhập Google (Firebase) yêu cầu chạy qua HTTP server. Không hoạt động khi mở trực tiếp bằng `file://`.

### Tài khoản thử nghiệm
- Đăng ký tài khoản mới tại trang `/register.html`
- Hoặc đăng nhập bằng Google tại `/login.html`

### Mã giảm giá thử nghiệm
| Mã | Ưu đãi |
|---|---|
| `GIBOR10` | Giảm 10% (tối đa 50.000đ) |
| `GIBOR20K` | Giảm thẳng 20.000đ |
| `FREESHIP` | Miễn phí vận chuyển |

---

## 📱 Hỗ trợ thiết bị

| Thiết bị | Kích thước | Trạng thái |
|---|---|---|
| Desktop | ≥ 1024px | ✅ Đầy đủ |
| Tablet | 768px – 1023px | ✅ Đầy đủ |
| Mobile | < 768px | ✅ Đầy đủ |

---

## 📄 Bản quyền

© 2026 **GIBOR COFFEE**. Đồ án học thuật, Kỳ 4 (2025–2026).  
Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT).
