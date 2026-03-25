# Hướng Dẫn Đổi Mật Khẩu với OTP qua Email

## Tính năng đã được cập nhật

Hệ thống đổi mật khẩu đã được tích hợp với Firebase Authentication để gửi OTP xác thực qua email.

## Cách hoạt động

### 1. Truy cập trang Tài khoản
- Đăng nhập vào tài khoản của bạn
- Vào trang `account.html` hoặc click vào tên người dùng > "Tài khoản của tôi"

### 2. Chuyển sang tab Bảo mật
- Click vào tab "Bảo mật" trong trang tài khoản
- Điền form đổi mật khẩu:
  - Mật khẩu hiện tại
  - Mật khẩu mới (tối thiểu 6 ký tự)
  - Xác nhận mật khẩu mới

### 3. Xác thực OTP qua Email
Khi bạn submit form:

1. **Hệ thống kiểm tra mật khẩu cũ** - Đảm bảo bạn nhập đúng mật khẩu hiện tại

2. **Gửi OTP qua Firebase** - Có 2 trường hợp:
   - **Firebase hoạt động**: Email xác thực sẽ được gửi qua Firebase Authentication
   - **Firebase không khả dụng**: Mã OTP sẽ hiển thị trực tiếp trên popup (fallback mode)

3. **Nhập mã OTP** - Popup sẽ hiện ra với:
   - 6 ô nhập số
   - Đếm ngược 5 phút
   - Nút "Gửi lại mã" nếu cần
   - Nút "Xác nhận" để hoàn tất

4. **Hoàn tất** - Sau khi xác thực thành công:
   - Mật khẩu được cập nhật
   - Tự động đăng xuất
   - Chuyển về trang đăng nhập

## Cấu hình Firebase

File `account.html` đã được cấu hình với Firebase:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCnHG40t4WN230Alu4ia0cvzKhfndeBfpE",
  authDomain: "coffee-a718c.firebaseapp.com",
  projectId: "coffee-a718c",
  storageBucket: "coffee-a718c.firebasestorage.app",
  messagingSenderId: "37237991343",
  appId: "1:37237991343:web:035a77871af9b41476315a",
  measurementId: "G-YSS8HXMN6R",
};
```

## Các file đã được cập nhật

### 1. `js/main.js`
- Hàm `sendOTPViaFirebase()` - Gửi email xác thực qua Firebase
- Hàm `showEmailOTPPopup()` - Hiển thị popup nhập OTP với thông báo rõ ràng
- Hàm `generateOTP()` - Tạo mã OTP 6 số

### 2. `js/account.js`
- Hàm `bindPasswordSave()` - Xử lý form đổi mật khẩu
- Kiểm tra mật khẩu cũ trước khi gửi OTP
- Tự động đăng xuất sau khi đổi mật khẩu thành công

### 3. `css/style.css`
- Style cho `.otp-firebase-hint` - Thông báo email đã gửi qua Firebase
- Style cho `.otp-demo-hint` - Thông báo fallback mode
- Dark mode support cho cả 2 loại thông báo

## Lưu ý quan trọng

### Bảo mật
- Mật khẩu cũ được kiểm tra trước khi gửi OTP
- OTP có thời hạn 5 phút
- Tự động đăng xuất sau khi đổi mật khẩu để bảo mật

### Firebase Email
- Firebase sẽ gửi email "Password Reset" chứa link reset
- Đây là email chính thức từ Firebase Authentication
- Nếu không nhận được email, kiểm tra thư mục Spam/Junk

### Fallback Mode
- Nếu Firebase không hoạt động, mã OTP sẽ hiển thị trực tiếp trên popup
- Mã cũng được log ra console để debug: `📧 [GIBOR] Mã xác nhận: XXXXXX`

## Cải tiến trong tương lai

1. **Custom Email Template** - Tùy chỉnh nội dung email từ Firebase
2. **SMS OTP** - Thêm tùy chọn nhận OTP qua SMS
3. **2FA** - Xác thực 2 yếu tố cho tài khoản
4. **Email Verification** - Xác thực email khi đăng ký tài khoản mới

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log để xem trạng thái Firebase
2. Đảm bảo email đăng ký là email hợp lệ
3. Kiểm tra kết nối internet
4. Thử chế độ fallback nếu Firebase không hoạt động

---

**Phát triển bởi**: Nhóm GIBOR Coffee Shop
**Ngày cập nhật**: 2026-03-25
