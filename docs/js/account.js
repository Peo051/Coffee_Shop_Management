/* 
========================================================================================

                                    CODE BỞI NGUYỄN THẾ ANH

========================================================================================
*/
(function () {
  "use strict";

  // Lấy thẻ root của trang quản lý tài khoản khách hàng
  const root = document.getElementById("accountPageRoot");
  if (!root) return; // Nếu không nằm ở trang tài khoản, dừng thực thi file này

  /**
   * Hiển thị popup thông báo thành công dạng modal tùy chỉnh của Gibor Coffee.
   * Nếu không có thư viện popup, tự động fallback dùng hàm alert() của trình duyệt.
   * 
   * @function notifySuccess
   * @param {string} title - Tiêu đề thông báo thành công
   * @param {string} message - Nội dung chi tiết thông báo
   * @param {function} [onConfirm] - Hàm callback sẽ thực thi khi người dùng bấm OK
   * @returns {void} Không trả về giá trị
   */
  function notifySuccess(title, message, onConfirm) {
    if (typeof showGiborPopup === "function") {
      showGiborPopup({
        type: "success",
        title,
        message,
        confirmText: "OK",
        onConfirm,
      });
      return;
    }
    alert(message);
    if (typeof onConfirm === "function") onConfirm();
  }

  /**
   * Hiển thị popup thông báo lỗi dạng modal tùy chỉnh của Gibor Coffee.
   * Nếu không có thư viện popup, tự động fallback dùng hàm alert() của trình duyệt.
   * 
   * @function notifyError
   * @param {string} title - Tiêu đề thông báo lỗi
   * @param {string} message - Nội dung chi tiết lỗi
   * @returns {void} Không trả về giá trị
   */
  function notifyError(title, message) {
    if (typeof showGiborPopup === "function") {
      showGiborPopup({
        type: "error",
        title,
        message,
        confirmText: "Thử lại",
      });
      return;
    }
    alert(message);
  }

  /**
   * Phân tích tham số trên URL (?tab=...) để xác định tab giao diện nào được hiển thị mặc định.
   * 
   * @function parseTabFromURL
   * @returns {string} Trả về tên tab được chọn ('orders' hoặc 'profile')
   */
  function parseTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "orders") return "orders"; // Tab Lịch sử đơn hàng
    return "profile"; // Tab Thông tin cá nhân mặc định
  }

  /**
   * Cập nhật trạng thái hiển thị của tab chính (Profile hoặc Orders) trên giao diện.
   * Thêm class active cho nút bấm và panel tương ứng, xóa class active của các tab khác.
   * 
   * @function setActivePanel
   * @param {string} tab - Tên tab muốn hiển thị active ('profile' hoặc 'orders')
   * @returns {void} Không trả về giá trị
   */
  function setActivePanel(tab) {
    // Duyệt qua tất cả các nút tab chính
    document.querySelectorAll(".account-menu-btn[data-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    // Duyệt qua tất cả các panel nội dung chính
    document.querySelectorAll(".account-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === tab);
    });
  }

  /**
   * Cập nhật trạng thái hiển thị của tab con trong phần thông tin tài khoản (Thông tin cá nhân 'info' hoặc Bảo mật 'security').
   * 
   * @function setActiveSubtab
   * @param {string} subtab - Tên subtab muốn kích hoạt active
   * @returns {void} Không trả về giá trị
   */
  function setActiveSubtab(subtab) {
    // Duyệt và cập nhật trạng thái các nút tab con
    document.querySelectorAll(".subtab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.subtab === subtab);
    });

    // Duyệt và cập nhật các panel nội dung tab con
    document.querySelectorAll(".subtab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.subpanel === subtab);
    });
  }

  /**
   * Hiển thị thông tin tổng quan của người dùng lên phần Header của trang tài khoản.
   * Sinh ra ký tự viết tắt (Initials) dựa trên Họ và Tên để làm avatar hiển thị mặc định.
   * 
   * @function renderUserHeader
   * @param {Object} currentUser - Đối tượng người dùng hiện tại đang đăng nhập
   * @returns {void} Không trả về giá trị
   */
  function renderUserHeader(currentUser) {
    const display = document.getElementById("accountDisplayName"); // Tên hiển thị
    const email = document.getElementById("accountEmail"); // Email tài khoản
    const avatar = document.getElementById("accountAvatar"); // Khung ảnh đại diện chữ cái

    if (display) display.textContent = currentUser.displayName || "Tài khoản";
    if (email) email.textContent = currentUser.email || "-";

    // Sinh ký tự viết tắt: Chữ cái đầu tiên của Họ + Chữ cái đầu tiên của Tên
    const initials = (
      (currentUser.lastName ? currentUser.lastName.charAt(0) : "") +
      (currentUser.firstName ? currentUser.firstName.charAt(0) : "")
    ).toUpperCase();
    if (avatar) avatar.textContent = initials || "G"; // Fallback là chữ G (GIBOR) nếu rỗng
  }

  /**
   * Điền sẵn dữ liệu của người dùng hiện tại vào các ô input của form cập nhật thông tin cá nhân.
   * 
   * @function fillProfileForm
   * @param {Object} currentUser - Đối tượng người dùng hiện tại đang đăng nhập
   * @returns {void} Không trả về giá trị
   */
  function fillProfileForm(currentUser) {
    const lastName = document.getElementById("profileLastName");
    const firstName = document.getElementById("profileFirstName");
    const phone = document.getElementById("profilePhone");
    const email = document.getElementById("profileEmail");

    if (lastName) lastName.value = currentUser.lastName || "";
    if (firstName) firstName.value = currentUser.firstName || "";
    if (phone) phone.value = currentUser.phone || "";
    if (email) email.value = currentUser.email || "";
  }

  /**
   * Truy vấn và hiển thị danh sách đơn hàng đã mua của người dùng (tab Lịch sử đơn hàng).
   * Lấy đơn hàng từ OrderManager, sắp xếp theo thứ tự thời gian mới nhất lên đầu,
   * xây dựng cấu trúc HTML hiển thị trạng thái đơn hàng (sử dụng màu sắc riêng biệt cho từng trạng thái),
   * danh sách món ăn, phương thức thanh toán, giao hàng và nút hủy đơn nếu đơn hàng đang ở bước đầu xử lý.
   * 
   * @function renderOrders
   * @returns {void} Không trả về giá trị
   */
  function renderOrders() {
    const list = document.getElementById("orderList"); // Khung chứa danh sách hóa đơn đơn hàng
    if (!list) return;

    // Truy vấn mảng đơn hàng từ tầng quản lý OrderManager
    const orders =
      typeof OrderManager !== "undefined" &&
      typeof OrderManager.getOrders === "function"
        ? OrderManager.getOrders()
        : [];

    // Nếu không có đơn hàng nào, hiển thị giao diện thông báo đơn hàng trống
    if (!orders.length) {
      list.innerHTML =
        '<div class="order-empty"><i class="fa-solid fa-box-open"></i><p>Bạn chưa có đơn hàng nào.</p></div>';
      return;
    }

    // Sao chép mảng đơn hàng và sắp xếp giảm dần theo ngày tạo (đơn mới nhất hiển thị lên đầu)
    const sorted = orders
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || Date.now()) -
          new Date(a.createdAt || a.date || Date.now()),
      );

    // Duyệt qua danh sách đơn hàng đã sắp xếp để build mã HTML động
    list.innerHTML = sorted
      .map((order) => {
        // Tạo chuỗi danh sách các sản phẩm đi kèm số lượng trong đơn hàng
        const itemRows = (order.items || [])
          .map((item) => {
            const qty = Number(item.quantity || 1);
            const name = item.name || "Sản phẩm";
            return `<li>${qty} x ${name}</li>`;
          })
          .join("");

        // Format lại thời gian hiển thị đơn hàng dạng chuỗi dễ đọc
        const createdLabel = formatDate(order.createdAt || order.date, true);
        const total = Number(order.total || 0).toLocaleString("vi-VN");
        const code = order.code || "DH" + Date.now();
        const status = order.status || "Đã ghi nhận";

        // Thiết lập mã màu CSS (badge) tương ứng với từng trạng thái đơn hàng (xanh lam, cam, xanh lá, đỏ)
        let badgeStyle = "background: #e8f0fe; color: #1a73e8;"; // Đã ghi nhận (xanh lam nhạt)
        if (status === "Đang xử lý") badgeStyle = "background: #fef7e0; color: #b06000;"; // Cam nhạt
        else if (status === "Đang giao") badgeStyle = "background: #e6f4ea; color: #137333;"; // Xanh lá nhạt
        else if (status === "Hoàn tất") badgeStyle = "background: #137333; color: #ffffff;"; // Xanh lá đậm chữ trắng
        else if (status === "Đã hủy") badgeStyle = "background: #fce8e6; color: #c5221f;"; // Đỏ nhạt

        // Đơn hàng chỉ được phép hủy nếu đang ở trạng thái mới ghi nhận hoặc đang bắt đầu chuẩn bị (Đang xử lý)
        const isCancelable = status === "Đã ghi nhận" || status === "Đang xử lý";

        return `
          <article class="order-card" style="position: relative; margin-bottom: 15px;">
            <div class="order-card-top" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;">
              <div class="order-code" style="font-weight: 700; color: #4f311d;">#${code}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; ${badgeStyle}">${escapeHTML(status)}</span>
                <span class="order-date" style="font-size: 0.82rem; color: #796454;">${createdLabel}</span>
              </div>
            </div>
            <ul class="order-items" style="margin: 0; padding-left: 18px; color: #574434; margin-bottom: 10px;">
              ${itemRows || "<li>Không có chi tiết sản phẩm</li>"}
            </ul>
            <div class="order-card-foot" style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px dashed rgba(95, 61, 36, 0.25);">
              <span style="font-size: 0.92rem; color: #614b3a;">
                <i class="fa-solid fa-credit-card" style="font-size: 0.85rem; margin-right: 3px;"></i> ${order.payment || "Chưa rõ"} · 
                <i class="fa-solid fa-truck" style="font-size: 0.85rem; margin-right: 3px;"></i> ${order.shipping || "Chưa rõ"}
              </span>
              <div style="display: flex; align-items: center; gap: 12px;">
                ${isCancelable ? `<button class="btn-cancel-order" data-cancel-order-code="${escapeHTML(code)}" style="background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">Hủy đơn</button>` : ''}
                <strong style="font-size: 1.1rem; color: #5f3d24;">${total}đ</strong>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  /**
   * Đăng ký sự kiện click cho các nút chuyển đổi Tab chính và phụ trên trang tài khoản.
   * Đồng thời đồng bộ trạng thái Tab lên tham số URL bằng History API để giữ nguyên Tab khi F5.
   * 
   * @function bindTabEvents
   * @returns {void} Không trả về giá trị
   */
  function bindTabEvents() {
    // Đăng ký sự kiện click cho các nút Menu Tab chính (Hồ sơ / Đơn hàng)
    document.querySelectorAll(".account-menu-btn[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        setActivePanel(tab); // Bật panel tương ứng
        // Cập nhật tham số trên URL không gây reload trang
        const nextURL = `${window.location.pathname}?tab=${tab}`;
        history.replaceState(null, "", nextURL);
      });
    });

    // Đăng ký sự kiện click cho các nút Menu Tab con trong Hồ Sơ (Thông tin cá nhân / Bảo mật)
    document.querySelectorAll(".subtab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveSubtab(btn.dataset.subtab);
      });
    });
  }

  /**
   * Đăng ký sự kiện submit cho biểu mẫu cập nhật thông tin cá nhân.
   * Xác thực thông tin rỗng, kiểm tra xem có sự thay đổi Email không (nếu thay đổi email, yêu cầu xác thực OTP),
   * sau đó thực thi gọi UserManager để cập nhật thông tin người dùng vào cơ sở dữ liệu.
   * 
   * @function bindProfileSave
   * @param {Object} currentUser - Đối tượng người dùng hiện tại đang đăng nhập
   * @returns {void} Không trả về giá trị
   */
  function bindProfileSave(currentUser) {
    const form = document.getElementById("profileInfoForm"); // Form thông tin cá nhân
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Ngăn chặn tải lại trang mặc định của form submit

      // Thu thập giá trị nhập liệu và loại bỏ khoảng trắng thừa
      const newLastName = document.getElementById("profileLastName").value.trim();
      const newFirstName = document.getElementById("profileFirstName").value.trim();
      const newPhone = document.getElementById("profilePhone").value.trim();
      const newEmail = document.getElementById("profileEmail").value.trim();

      // Kiểm tra các trường bắt buộc nhập
      if (!newLastName || !newFirstName || !newEmail) {
        notifyError("Thiếu thông tin", "Vui lòng nhập đầy đủ họ, tên và email.");
        return;
      }

      // Kiểm tra xem email nhập mới có khác với email hiện tại không
      const emailChanged =
        newEmail.toLowerCase() !== String(currentUser.email || "").toLowerCase();

      // Hàm nội bộ thực thi lưu trữ thông tin sau khi đã qua bước xác thực
      const doSave = () => {
        const result = UserManager.updateProfile({
          lastName: newLastName,
          firstName: newFirstName,
          phone: newPhone,
          email: newEmail,
        });

        // Nếu cập nhật thất bại (ví dụ: trùng email với tài khoản khác)
        if (!result.success) {
          notifyError("Cập nhật thất bại", result.message || "Không thể cập nhật thông tin.");
          return;
        }

        // Cập nhật thành công, hiện thông báo và tải lại trang để hiển thị thông tin mới nhất
        notifySuccess("Đã lưu", "Thông tin tài khoản đã được cập nhật.", () => {
          window.location.reload();
        });
      };

      // Nếu có thay đổi email và hệ thống tồn tại popup xác nhận OTP email
      if (emailChanged && typeof showEmailOTPPopup === "function") {
        showEmailOTPPopup(newEmail, doSave); // Gửi OTP đến email mới trước khi thực hiện lưu
      } else {
        doSave(); // Lưu thông tin trực tiếp nếu không đổi email
      }
    });
  }

  /**
   * Đăng ký sự kiện submit cho biểu mẫu đổi mật khẩu tài khoản.
   * Tiến hành kiểm tra độ mạnh của mật khẩu mới (>= 6 ký tự), trùng khớp xác nhận,
   * kiểm tra mật khẩu hiện tại (old password) xem có chính xác hay không,
   * sau đó tạo yêu cầu đổi mật khẩu và gửi email xác nhận hoặc đổi trực tiếp tùy cấu hình hệ thống.
   * 
   * @function bindPasswordSave
   * @param {Object} currentUser - Đối tượng người dùng hiện tại đang đăng nhập
   * @returns {void} Không trả về giá trị
   */
  function bindPasswordSave(currentUser) {
    const form = document.getElementById("profileSecurityForm"); // Form đổi mật khẩu
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Lấy giá trị các ô mật khẩu
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Kiểm tra thiếu trường thông tin
      if (!oldPassword || !newPassword || !confirmPassword) {
        notifyError("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin đổi mật khẩu.");
        return;
      }

      // Ràng buộc bảo mật: Mật khẩu mới bắt buộc phải có tối thiểu 6 ký tự
      if (newPassword.length < 6) {
        notifyError("Mật khẩu yếu", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      // Ràng buộc bảo mật: Mật khẩu mới và mật khẩu xác nhận phải trùng nhau
      if (newPassword !== confirmPassword) {
        notifyError("Không khớp", "Xác nhận mật khẩu mới không trùng khớp.");
        return;
      }

      // Lấy thông tin tài khoản hiện có để đối chiếu mật khẩu cũ
      const users = UserManager.getUsers();
      const user = users.find((u) => u.id === currentUser.id);
      
      // Nếu mật khẩu cũ nhập vào không khớp với mật khẩu lưu trong cơ sở dữ liệu
      if (!user || user.password !== oldPassword) {
        notifyError("Sai mật khẩu", "Mật khẩu hiện tại không đúng. Vui lòng thử lại.");
        return;
      }

      // Tạo cấu trúc đối tượng yêu cầu đổi mật khẩu tạm thời
      const changePasswordRequest = {
        userId: currentUser.id,
        email: currentUser.email,
        oldPassword: oldPassword,
        newPassword: newPassword,
        timestamp: Date.now(),
        token: generateVerificationToken() // Sinh token ngẫu nhiên để xác thực liên kết email
      };
      
      // Lưu yêu cầu đổi mật khẩu tạm thời vào SessionStorage
      sessionStorage.setItem('gibor_password_change_request', JSON.stringify(changePasswordRequest));

      // Thực thi gửi email xác nhận đổi mật khẩu (tăng tính bảo mật cho đồ án)
      if (typeof sendPasswordChangeVerificationEmail === "function") {
        sendPasswordChangeVerificationEmail(currentUser.email, changePasswordRequest.token);
      } else {
        // Phương án dự phòng (fallback): Thực hiện cập nhật mật khẩu trực tiếp trong dữ liệu local
        const result = UserManager.updatePassword(oldPassword, newPassword);
        if (!result.success) {
          notifyError("Đổi mật khẩu thất bại", result.message || "Không thể đổi mật khẩu.");
          return;
        }

        // Thông báo đổi thành công, thực hiện logout và yêu cầu đăng nhập lại bằng mật khẩu mới
        notifySuccess("Thành công", "Bạn đã đổi mật khẩu thành công. Vui lòng đăng nhập lại.", () => {
          form.reset();
          UserManager.logout();
          window.location.href = "login.html";
        });
      }
    });
  }

  /**
   * Đăng ký sự kiện click cho nút Đăng xuất tài khoản.
   * Hiển thị popup modal cảnh báo xác nhận đăng xuất của hệ thống.
   * 
   * @function bindLogout
   * @returns {void} Không trả về giá trị
   */
  function bindLogout() {
    const logoutBtn = document.getElementById("accountLogoutBtn"); // Nút đăng xuất
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
      // Sử dụng popup modal tùy chỉnh của Gibor Coffee
      if (typeof showGiborPopup === "function") {
        showGiborPopup({
          type: "warning",
          title: "Đăng xuất",
          message: "Bạn có chắc muốn đăng xuất khỏi tài khoản?",
          confirmText: "Đăng xuất",
          cancelText: "Hủy",
          onConfirm: () => {
            UserManager.logout(); // Gọi logic đăng xuất, xóa session trong localStorage
            window.location.href = "login.html"; // Chuyển hướng về trang đăng nhập
          },
        });
        return;
      }

      // Fallback sử dụng confirm mặc định của trình duyệt
      if (confirm("Bạn có chắc muốn đăng xuất?")) {
        UserManager.logout();
        window.location.href = "login.html";
      }
    });
  }

  /**
   * Đăng ký sự kiện click "Hủy đơn" cho các đơn hàng trong danh sách lịch sử.
   * Sự kiện này được đăng ký thông qua cơ chế Event Delegation trên container cha `#orderList`
   * để giảm số lượng lắng nghe sự kiện và xử lý tốt cho các phần tử HTML được render động.
   * 
   * @function bindOrderCancel
   * @returns {void} Không trả về giá trị
   */
  function bindOrderCancel() {
    const list = document.getElementById("orderList");
    if (!list) return;

    list.addEventListener("click", (e) => {
      // Tìm xem có click trúng nút Hủy đơn (hoặc con của nó) không
      const btn = e.target.closest(".btn-cancel-order");
      if (!btn) return;

      const code = btn.dataset.cancelOrderCode; // Lấy mã đơn hàng cần hủy
      if (!code) return;

      // Xác nhận hủy đơn hàng
      if (confirm(`Bạn có chắc muốn hủy đơn hàng #${code} không?`)) {
        // Lấy danh sách tất cả các đơn hàng từ LocalStorage
        const allOrders = JSON.parse(localStorage.getItem("gibor_orders") || "[]");
        // Tìm kiếm chỉ số của đơn hàng cần hủy dựa vào mã code
        const idx = allOrders.findIndex(o => o.code === code);
        
        if (idx > -1) {
          allOrders[idx].status = "Đã hủy"; // Cập nhật trạng thái đơn hàng sang 'Đã hủy'
          localStorage.setItem("gibor_orders", JSON.stringify(allOrders)); // Lưu lại vào LocalStorage
          
          notifySuccess("Đã hủy đơn", `Đơn hàng #${code} đã được hủy thành công!`, () => {
            renderOrders(); // Tải và hiển thị lại danh sách đơn hàng đã cập nhật trạng thái mới
          });
        } else {
          notifyError("Thất bại", "Không tìm thấy đơn hàng trong hệ thống.");
        }
      }
    });
  }

  /**
   * Khởi tạo trang web: Kiểm tra quyền truy cập (yêu cầu đăng nhập),
   * kiểm tra xử lý liên kết xác thực đổi mật khẩu từ Email gửi về,
   * render các khối nội dung giao diện và đăng ký toàn bộ sự kiện tương tác.
   * 
   * @function init
   * @returns {void} Không trả về giá trị
   */
  function init() {
    // Nếu chưa load lớp UserManager, dừng hoạt động
    if (typeof UserManager === "undefined") return;

    // Kiểm tra xem có người dùng đang đăng nhập hay không
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) {
      // Chưa đăng nhập thì chuyển hướng ngay lập tức về trang login
      window.location.href = "login.html";
      return;
    }

    // 1. Kiểm tra xem có tham số verify_password_change trên URL không (xác thực liên kết từ email):
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify_password_change');
    
    if (verifyToken && typeof verifyAndChangePassword === "function") {
      // Tiến hành xóa token khỏi thanh địa chỉ URL để tránh lặp lại xác thực khi F5
      window.history.replaceState({}, document.title, window.location.pathname);
      // Gọi hàm xác thực và tiến hành cập nhật mật khẩu mới
      verifyAndChangePassword(verifyToken);
      return;
    }

    // 2. Render dữ liệu của tài khoản hiện tại lên giao diện
    renderUserHeader(currentUser); // Header Avatar + Name
    fillProfileForm(currentUser); // Form thông tin
    renderOrders(); // Danh sách lịch sử mua hàng

    // 3. Đăng ký liên kết các sự kiện tương tác
    bindTabEvents(); // Chuyển đổi qua lại các Tab
    bindProfileSave(currentUser); // Lưu hồ sơ
    bindPasswordSave(currentUser); // Đổi mật khẩu
    bindLogout(); // Đăng xuất
    bindOrderCancel(); // Hủy đơn hàng

    // 4. Cấu hình Tab hoạt động mặc định ban đầu
    setActiveSubtab("info"); // Tab con là thông tin cá nhân
    setActivePanel(parseTabFromURL()); // Tab chính lấy từ URL (?tab=...)

    root.hidden = false; // Hiển thị nội dung trang tài khoản sau khi đã khởi tạo xong dữ liệu
  }

  // Chạy hàm init sau khi cấu trúc DOM đã được tải xong hoàn toàn
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();