# Hướng Dẫn Kiểm Tra Email Duy Nhất

## Tính năng đã được cập nhật

Hệ thống đã được cải tiến để đảm bảo mỗi email chỉ được sử dụng một lần duy nhất, bất kể phương thức đăng ký (Email/Password, Google, hoặc GitHub).

## Cách hoạt động

### 1. Đăng ký bằng Email/Password (Form thông thường)

Khi người dùng đăng ký bằng form:

**Bước 1: Kiểm tra LocalStorage**
- Hệ thống kiểm tra email đã tồn tại trong localStorage chưa
- So sánh không phân biệt chữ hoa/thường (case-insensitive)
- Nếu email đã tồn tại:
  - Kiểm tra `provider` của tài khoản
  - Hiển thị thông báo phù hợp:
    - "Email này đã được đăng ký bằng tài khoản Google. Vui lòng đăng nhập bằng Google."
    - "Email này đã được đăng ký bằng tài khoản GitHub. Vui lòng đăng nhập bằng GitHub."
    - "Email đã được dùng để đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác."

**Bước 2: Kiểm tra Firebase**
- Nếu email chưa có trong localStorage, tiếp tục đăng ký trên Firebase
- Firebase sẽ kiểm tra email có tồn tại trên hệ thống Firebase chưa
- Nếu có lỗi `auth/email-already-in-use`:
  - Hiển thị: "Email này đã được đăng ký trên Firebase. Nếu bạn đã đăng ký bằng Google/GitHub, vui lòng đăng nhập bằng phương thức đó."

**Bước 3: Lưu vào LocalStorage**
- Tạo tài khoản mới với `provider: "email"`
- Lưu thông tin vào localStorage

### 2. Đăng nhập bằng Google

Khi người dùng đăng nhập bằng Google:

**Kiểm tra email trong LocalStorage:**
- Tìm email trong danh sách users (case-insensitive)
- Nếu tìm thấy:
  - Kiểm tra `provider` của tài khoản
  - Nếu `provider === "email"` và chưa có `googleUid`:
    - **Từ chối đăng nhập**
    - Hiển thị: "Email này đã được đăng ký bằng tài khoản thông thường. Vui lòng đăng nhập bằng email và mật khẩu."
  - Nếu đã có `googleUid` hoặc `provider === "google"`:
    - Cho phép đăng nhập
    - Cập nhật thông tin Google (uid, photoURL)

**Nếu email chưa tồn tại:**
- Tạo tài khoản mới với `provider: "google"`
- Lưu thông tin Google (uid, photoURL, displayName)

### 3. Đăng nhập bằng GitHub

Hoạt động tương tự như Google:

**Kiểm tra email trong LocalStorage:**
- Tìm email trong danh sách users (case-insensitive)
- Nếu tìm thấy:
  - Kiểm tra `provider` của tài khoản
  - Nếu `provider === "email"` và chưa có `githubUid`:
    - **Từ chối đăng nhập**
    - Hiển thị: "Email này đã được đăng ký bằng tài khoản thông thường. Vui lòng đăng nhập bằng email và mật khẩu."
  - Nếu đã có `githubUid` hoặc `provider === "github"`:
    - Cho phép đăng nhập
    - Cập nhật thông tin GitHub

**Nếu email chưa tồn tại:**
- Tạo tài khoản mới với `provider: "github"`

## Cấu trúc dữ liệu User

Mỗi user trong localStorage có cấu trúc:

```javascript
{
  id: 1234567890,
  lastName: "Nguyễn",
  firstName: "Văn A",
  displayName: "Nguyễn Văn A",
  email: "example@gmail.com",
  phone: "0123456789",
  password: "******", // Chỉ có với provider: "email"
  provider: "email" | "google" | "github", // Phương thức đăng ký
  googleUid: "...", // Chỉ có với Google
  githubUid: "...", // Chỉ có với GitHub
  photoURL: "...", // Chỉ có với Google/GitHub
  createdAt: "2026-03-25T..."
}
```

## Các trường hợp sử dụng

### Trường hợp 1: Đăng ký email trước, sau đó thử đăng nhập Google
1. User đăng ký: `test@gmail.com` bằng form (provider: "email")
2. User thử đăng nhập Google với cùng email `test@gmail.com`
3. **Kết quả**: Bị từ chối với thông báo "Email này đã được đăng ký bằng tài khoản thông thường..."

### Trường hợp 2: Đăng nhập Google trước, sau đó thử đăng ký email
1. User đăng nhập Google: `test@gmail.com` (provider: "google")
2. User thử đăng ký form với cùng email `test@gmail.com`
3. **Kết quả**: Bị từ chối với thông báo "Email này đã được đăng ký bằng tài khoản Google..."

### Trường hợp 3: Đăng ký email, sau đó đăng ký lại email
1. User đăng ký: `test@gmail.com` bằng form
2. User thử đăng ký lại với cùng email
3. **Kết quả**: Bị từ chối với thông báo "Email đã được dùng để đăng ký..."

### Trường hợp 4: Đăng nhập Google nhiều lần
1. User đăng nhập Google: `test@gmail.com` lần đầu (tạo tài khoản mới)
2. User đăng nhập Google lần 2 với cùng email
3. **Kết quả**: Đăng nhập thành công (không tạo tài khoản mới)

## Các file đã được cập nhật

### 1. `js/data.js`
- **UserManager.register()**: Kiểm tra email và provider, so sánh case-insensitive
- **UserManager.loginWithGoogle()**: Kiểm tra provider trước khi cho phép đăng nhập
- **UserManager.loginWithGithub()**: Kiểm tra provider trước khi cho phép đăng nhập

### 2. `js/loginregister.js`
- **registerForm submit**: Kiểm tra localStorage trước, sau đó mới kiểm tra Firebase
- **handleGoogleSignIn()**: Xử lý trường hợp `success: false` từ UserManager
- **handleGithubSignIn()**: Xử lý trường hợp `success: false` từ UserManager

## Lợi ích

1. **Bảo mật**: Mỗi email chỉ được sử dụng một lần
2. **Rõ ràng**: Thông báo lỗi cụ thể giúp user biết cách đăng nhập đúng
3. **Nhất quán**: Dữ liệu đồng bộ giữa Firebase và LocalStorage
4. **Linh hoạt**: Hỗ trợ nhiều phương thức đăng nhập (Email, Google, GitHub)

## Lưu ý quan trọng

### So sánh email không phân biệt chữ hoa/thường
- `Test@Gmail.com` và `test@gmail.com` được coi là cùng một email
- Sử dụng `.toLowerCase()` khi so sánh

### Provider tracking
- Mỗi tài khoản có trường `provider` để biết phương thức đăng ký ban đầu
- Giá trị: `"email"`, `"google"`, hoặc `"github"`

### Firebase và LocalStorage
- Firebase: Xác thực và gửi email reset password
- LocalStorage: Lưu trữ thông tin user cho ứng dụng
- Cả 2 đều kiểm tra email trùng lặp

## Test cases

### Test 1: Đăng ký email
```
Input: test1@gmail.com + password
Expected: Tạo tài khoản thành công với provider: "email"
```

### Test 2: Đăng ký lại cùng email
```
Input: test1@gmail.com + password (lần 2)
Expected: Lỗi "Email đã được dùng để đăng ký..."
```

### Test 3: Đăng nhập Google với email đã đăng ký form
```
Input: Google login với test1@gmail.com
Expected: Lỗi "Email này đã được đăng ký bằng tài khoản thông thường..."
```

### Test 4: Đăng nhập Google lần đầu
```
Input: Google login với test2@gmail.com (chưa tồn tại)
Expected: Tạo tài khoản mới với provider: "google"
```

### Test 5: Đăng ký form với email đã đăng nhập Google
```
Input: test2@gmail.com + password (đã có trong Google)
Expected: Lỗi "Email này đã được đăng ký bằng tài khoản Google..."
```

---

**Phát triển bởi**: Nhóm GIBOR Coffee Shop  
**Ngày cập nhật**: 2026-03-25
