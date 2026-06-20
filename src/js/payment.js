/*
========================================================================================

                            CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/

// updateQRCode: Cập nhật và hiển thị mã QR thanh toán qua payOS.
async function updateQRCode() {
  // Lấy các phần tử DOM liên quan đến khu vực hiển thị QR thanh toán
  const loader = document.getElementById("qrLoader"); // Icon loading khi đang tạo mã QR
  const qrImg = document.getElementById("qrImage"); // Thẻ img để hiển thị QR Code
  const amountEl = document.getElementById("displayAmount"); // Element hiển thị số tiền thanh toán
  const descEl = document.getElementById("displayDesc"); // Element hiển thị nội dung chuyển khoản
  const bankingInfo = document.getElementById("bankingInfo"); // Container chứa toàn bộ phần thông tin chuyển khoản

  // Nếu thiếu một trong các phần tử giao diện cần thiết, dừng thực thi hàm
  if (!loader || !qrImg || !amountEl || !descEl || !bankingInfo) return;

  // Reset trạng thái thanh toán về mặc định (chưa thành công, chưa có thông tin giao dịch)
  payosPaymentSuccess = false;
  currentPayosPayment = null;
  
  // Hủy các tiến trình đồng bộ (polling check trạng thái thanh toán) cũ nếu đang chạy
  if (payosSyncTimeout) clearTimeout(payosSyncTimeout);
  if (payosSyncInterval) clearInterval(payosSyncInterval);

  // Lấy tổng số tiền cần thanh toán của đơn hàng hiện tại
  const amountNum = getCurrentCheckoutAmount();
  
  // Nếu số tiền không hợp lệ (nhỏ hơn hoặc bằng 0), ẩn QR, thông báo lỗi và dừng thực thi
  if (amountNum <= 0) {
    loader.style.display = "none";
    qrImg.style.display = "none";
    showToast("Khong the tao QR: tong tien khong hop le.");
    return;
  }

  // Xóa icon/thông báo thanh toán thành công cũ nếu tồn tại trong khu vực chuyển khoản
  const oldSuccess = bankingInfo.querySelector(".payos-success-check");
  if (oldSuccess) oldSuccess.remove();

  // Tạo hoặc lấy nhãn hiển thị trạng thái thanh toán payOS trên giao diện
  let statusLabel = bankingInfo.querySelector(".payos-status-label");
  if (!statusLabel) {
    statusLabel = document.createElement("div");
    statusLabel.className = "payos-status-label";
    statusLabel.style.cssText = "font-size:0.8rem;font-weight:700;color:#007bff;margin:10px 0;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;";
    bankingInfo.appendChild(statusLabel);
  }

  // Hiển thị phần chi tiết chuyển khoản, ẩn mã QR cũ và bật spinner tải dữ liệu
  const qrDetails = bankingInfo.querySelector(".qr-details");
  if (qrDetails) qrDetails.style.display = "block";
  qrImg.style.display = "none";
  loader.style.display = "block";
  statusLabel.style.display = "flex";
  statusLabel.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dang tao ma QR payOS...`;
  statusLabel.style.color = "#007bff";

  let payment;
  try {
    // Gọi hàm gửi yêu cầu tạo link thanh toán payOS lên serverless API
    payment = await createPayosPaymentRequest(amountNum);
  } catch (error) {
    // Xử lý khi gặp lỗi kết nối API hoặc lỗi máy chủ không tạo được link thanh toán
    console.error("Khong tao duoc payment link payOS:", error);
    loader.style.display = "none";
    qrImg.style.display = "none";
    statusLabel.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Khong tao duoc ma thanh toan payOS. Kiem tra cau hinh API key hoac CORS cua payOS.`;
    statusLabel.style.color = "#c5221f";
    showToast("Khong tao duoc ma thanh toan payOS.");
    return;
  }

  // Lưu thông tin giao dịch payOS hiện tại vào biến toàn cục để dùng cho các bước tiếp theo
  currentPayosPayment = payment;
  // Cập nhật số tiền và nội dung chuyển khoản tương ứng với giao dịch lên giao diện
  amountEl.innerText = amountNum.toLocaleString("vi-VN") + "d";
  descEl.innerText = payment.description;
  statusLabel.innerHTML = "";
  statusLabel.style.display = "none";

  // Tạo hoặc cập nhật đường link chuyển hướng đến trang cổng thanh toán payOS chính thức
  let checkoutLink = bankingInfo.querySelector(".payos-checkout-link");
  if (!checkoutLink) {
    checkoutLink = document.createElement("a");
    checkoutLink.className = "payos-checkout-link";
    checkoutLink.target = "_blank";
    checkoutLink.rel = "noopener noreferrer";
    checkoutLink.style.cssText = "display:none;margin:8px auto 0;width:max-content;font-size:0.82rem;font-weight:700;color:#007bff;text-decoration:none;";
    bankingInfo.appendChild(checkoutLink);
  }

  // Nếu có link thanh toán checkoutUrl từ payOS, hiển thị nút mở trang thanh toán
  if (payment.checkoutUrl) {
    checkoutLink.href = payment.checkoutUrl;
    checkoutLink.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> Mở trang thanh toán PayOS`;
    checkoutLink.style.display = "block";
  } else {
    checkoutLink.style.display = "none";
  }

  // Thiết lập sự kiện khi ảnh QR được tải xuống thành công từ máy chủ
  qrImg.onload = function () {
    loader.style.display = "none"; // Ẩn spinner loading
    qrImg.style.display = "block"; // Hiển thị ảnh QR Code
  };
  
  // Thiết lập sự kiện khi xảy ra lỗi trong quá trình tải ảnh QR Code
  qrImg.onerror = function () {
    loader.style.display = "none";
    qrImg.style.display = "none";
    showToast("Khong tai duoc ma QR thanh toan payOS.");
  };
  
  // Đặt nguồn ảnh cho thẻ img bằng URL sinh mã QR từ dữ liệu trả về của payOS
  qrImg.src = getQrImageUrl(payment);
}

// renderOrderSummary: Hiển thị thông tin tóm tắt giỏ hàng tại trang thanh toán.
function renderOrderSummary() {
  const cart = getCart(); // Lấy mảng sản phẩm trong giỏ hàng từ localStorage
  const orderItems = document.getElementById("orderItems"); // Phần tử chứa danh sách món
  const orderCount = document.getElementById("orderCount"); // Badge hiển thị số lượng món

  if (!orderItems || !orderCount) return;

  // Tính tổng số lượng tất cả các sản phẩm có trong giỏ hàng và cập nhật lên badge
  orderCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  // Trường hợp giỏ hàng trống, hiển thị giao diện giỏ hàng trống và cập nhật tổng tiền bằng 0
  if (cart.length === 0) {
    orderItems.innerHTML = `
      <div class="cart-empty-mini">
        <i class="fa-solid fa-shopping-cart"></i>
        <p>Giỏ hàng trống</p>
      </div>`;
    updateTotals(0);
    return;
  }

  let html = "";
  // Duyệt qua từng sản phẩm trong giỏ hàng để tạo mã HTML hiển thị
  cart.forEach((item) => {
    const total = item.price * item.quantity; // Tính tổng tiền cho sản phẩm hiện tại (giá * số lượng)
    
    // Lấy danh sách các món trong combo (nếu sản phẩm là một combo)
    const comboItems =
      Array.isArray(item.comboItems) && item.comboItems.length > 0
        ? item.comboItems
        : typeof window.getComboItemsByName === "function"
          ? window.getComboItemsByName(item.name)
          : [];
          
    const metaParts = []; // Mảng chứa các chuỗi thông tin tùy chọn (size, đường, đá, toppings)
    
    // Đưa thông tin các món trong combo vào phần mô tả
    if (comboItems.length > 0) metaParts.push("Gồm: " + comboItems.join(" + "));
    // Đưa thông tin kích thước (size) vào nếu khác kích thước mặc định
    if (item.size && item.size !== "Mặc định")
      metaParts.push("Size " + item.size);
    // Đưa thông tin mức đường
    if (item.sugar) metaParts.push("Đường " + item.sugar);
    // Đưa thông tin mức đá
    if (item.ice) metaParts.push("Đá " + item.ice);
    // Đưa danh sách topping đi kèm sản phẩm nếu có
    if (item.toppings && item.toppings.length > 0) {
      metaParts.push("Topping: " + item.toppings.map((t) => t.name).join(", "));
    }

    // Nối chuỗi HTML của sản phẩm vào chuỗi kết quả chung
    html += `
      <div class="order-item">
        <div class="order-item-img">
          <img src="${item.image}" alt="${item.name}" />
          <span class="order-item-qty">${item.quantity}</span>
        </div>
        <div class="order-item-info">
          <div class="order-item-name">${item.name}</div>
          ${metaParts.length > 0 ? `<div class="order-item-meta">${metaParts.join(" | ")}</div>` : ""}
          ${item.note ? `<div class="order-item-note">Ghi chú: ${item.note}</div>` : ""}
        </div>
        <div class="order-item-price">${formatPrice(total)}</div>
      </div>`;
  });

  // Chèn chuỗi HTML danh sách sản phẩm vào vùng hiển thị trên giao diện
  orderItems.innerHTML = html;

  // Tính tổng tiền tạm tính của giỏ hàng (chưa trừ mã giảm giá, chưa tính phí ship)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  // Cập nhật các mục tiền (tạm tính, phí ship, giảm giá, tổng tiền cuối cùng)
  updateTotals(subtotal);
}

// ===== CẬP NHẬT TỔNG TIỀN =====
let currentDiscount = 0; // Biến lưu số tiền giảm giá từ Coupon
let isFreeShip = false;  // Biến lưu trạng thái đơn hàng có được miễn phí vận chuyển hay không
let pointsDiscount = 0; // Số tiền được giảm khi áp dụng điểm tích lũy của khách hàng thành viên
let usedPoints = 0; // Số điểm tích lũy thực tế đã sử dụng cho đơn hàng này

// updateTotals: Tính toán phí vận chuyển, các khoản giảm giá và cập nhật tổng tiền đơn hàng.
function updateTotals(subtotal) {
  // Lấy các phần tử hiển thị giá trị tiền trên giao diện
  const subEl = document.getElementById("subtotalPrice"); // Tiền tạm tính
  const shipEl = document.getElementById("shippingFee"); // Phí vận chuyển
  const discountRow = document.getElementById("discountRow"); // Dòng hiển thị giảm giá coupon
  const discountEl = document.getElementById("discountAmount"); // Số tiền giảm từ coupon
  const grandEl = document.getElementById("grandTotal"); // Tổng tiền cuối cùng phải trả

  if (!subEl) return;

  // 1. Tính toán phí vận chuyển (shipping fee):
  // Mặc định phí ship là 0đ. Nếu chọn hình thức giao hàng (delivery):
  // - Nếu tổng tiền hàng >= 200,000đ thì được miễn phí ship.
  // - Nếu tổng tiền hàng < 200,000đ và lớn hơn 0đ thì phí ship là 30,000đ.
  let shippingFee = 0;
  if (selectedShipping === "delivery") {
    shippingFee = subtotal > 0 ? (subtotal >= 200000 ? 0 : 30000) : 0;
  }
  // Nếu có mã coupon miễn phí vận chuyển (isFreeShip === true) và giỏ hàng không trống, phí ship bằng 0đ
  if (isFreeShip && subtotal > 0) shippingFee = 0;

  // 2. Tính tổng tiền thanh toán cuối cùng (Grand Total):
  // Công thức: Tổng tiền = Tiền tạm tính - Giảm giá Coupon - Giảm giá đổi điểm + Phí ship
  const grand = subtotal - currentDiscount - pointsDiscount + shippingFee;

  // Cập nhật giá trị tiền tạm tính và phí vận chuyển lên giao diện
  subEl.textContent = formatPrice(subtotal);
  shipEl.textContent =
    shippingFee === 0 && subtotal > 0 ? "Miễn phí" : formatPrice(shippingFee);

  // 3. Cập nhật hiển thị giảm giá từ mã coupon:
  // Nếu có tiền giảm từ coupon (> 0đ), hiển thị dòng giảm giá và số tiền tương ứng
  if (currentDiscount > 0) {
    discountRow.style.display = "flex";
    discountEl.textContent = "- " + formatPrice(currentDiscount);
  } else {
    // Nếu không có giảm giá, ẩn dòng này trên giao diện
    discountRow.style.display = "none";
  }

  // 4. Cập nhật hiển thị giảm giá từ điểm tích lũy thành viên:
  // Có hai dòng hiển thị giảm giá từ điểm cần đồng bộ giá trị trên giao diện
  [
    { rowId: "pointsDiscountRow", elId: "pointsDiscountAmount" },
    { rowId: "pointsDiscountCalcRow", elId: "pointsDiscountCalc" },
  ].forEach(({ rowId, elId }) => {
    const row = document.getElementById(rowId);
    const el = document.getElementById(elId);
    if (row && el) {
      if (pointsDiscount > 0) {
        row.style.display = "flex";
        el.textContent = "- " + formatPrice(pointsDiscount);
      } else {
        row.style.display = "none";
      }
    }
  });

  // 5. Cập nhật điểm tích lũy thành viên dự kiến sẽ nhận được:
  // Điểm tích lũy chỉ được tính dựa trên số tiền thực tế khách trả cho sản phẩm (không tính trên phí vận chuyển)
  // Công thức: Tiền sản phẩm thực tế = Tạm tính - Giảm giá Coupon - Giảm giá đổi điểm
  const productTotal = Math.max(0, subtotal - currentDiscount - pointsDiscount);
  const earnEl = document.getElementById("pointsEarn");
  
  // Nếu tìm thấy phần tử hiển thị điểm thưởng và lớp PointsManager đã được tải thành công
  if (earnEl && typeof PointsManager !== "undefined") {
    // Quy đổi số tiền mua sản phẩm thực tế sang điểm thưởng (ví dụ: 10,000đ = 1 điểm)
    const earnedPoints = PointsManager.moneyToPoints(productTotal);
    earnEl.textContent = "+" + earnedPoints.toLocaleString("vi-VN") + " điểm";
  }

  // Cập nhật tổng tiền cuối cùng lên giao diện (đảm bảo không âm)
  grandEl.textContent = formatPrice(Math.max(0, grand));
}

// ===== MÃ GIẢM GIÁ =====
/**
 * Danh sách cấu trúc các mã giảm giá được cấu hình trên hệ thống Client.
 * Gồm các loại:
 * - percent: Giảm theo phần trăm (kèm theo mức giảm tối đa max)
 * - fixed: Giảm một số tiền cố định
 * - freeship: Miễn phí vận chuyển
 * 
 * @constant {Object} COUPONS
 */
const COUPONS = {
  GIBOR10: { type: "percent", value: 10, max: 50000 }, // Giảm 10%, tối đa 50,000đ
  GIBOR20K: { type: "fixed", value: 20000 },           // Giảm cố định 20,000đ
  FREESHIP: { type: "freeship", value: 0 },            // Miễn phí vận chuyển
};

// applyCoupon: Kiểm tra và áp dụng mã giảm giá của cửa hàng.
function applyCoupon() {
  const input = document.getElementById("couponCode"); // Ô nhập mã giảm giá
  const code = input.value.trim().toUpperCase(); // Loại bỏ khoảng trắng và chuyển thành chữ in hoa

  // Nếu người dùng bấm áp dụng nhưng chưa nhập mã, thông báo nhắc nhở
  if (!code) {
    showToast("Vui lòng nhập mã giảm giá!");
    return;
  }

  // Tìm kiếm thông tin coupon trong danh sách cấu hình
  const coupon = COUPONS[code];
  if (!coupon) {
    // Nếu không tồn tại coupon, reset các giá trị giảm giá về 0 và thông báo lỗi
    showToast("Mã giảm giá không hợp lệ!");
    currentDiscount = 0;
    isFreeShip = false;
    renderOrderSummary();
    return;
  }

  // Lấy danh sách sản phẩm và tính tiền tạm tính để làm căn cứ tính số tiền giảm
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // Reset trạng thái giảm giá của coupon cũ trước khi áp dụng mã mới
  isFreeShip = false;
  currentDiscount = 0;

  // Tính toán số tiền giảm tương ứng với từng loại coupon
  if (coupon.type === "percent") {
    // Coupon giảm theo phần trăm: số tiền giảm = (Tạm tính * % giảm) / 100
    // So sánh với mức giảm tối đa cho phép để lấy giá trị nhỏ hơn
    currentDiscount = Math.min((subtotal * coupon.value) / 100, coupon.max);
  } else if (coupon.type === "fixed") {
    // Coupon giảm số tiền cố định
    currentDiscount = coupon.value;
  } else if (coupon.type === "freeship") {
    // Coupon miễn phí vận chuyển
    isFreeShip = true;
  }

  showToast(`Áp dụng mã "${code}" thành công!`);
  // Gọi hàm cập nhật lại các khoản tiền trên giao diện dựa trên số tiền tạm tính
  updateTotals(subtotal);
}

// ===== ĐIỂM TÍCH LŨY =====
// initPoints: Khởi tạo giao diện đổi điểm tích lũy thành viên khi thanh toán.
function initPoints() {
  const section = document.getElementById("pointsSection"); // Vùng chức năng đổi điểm tích lũy
  if (!section) return;

  // Điều kiện hiển thị: Phải tồn tại lớp UserManager, khách hàng đã đăng nhập và tồn tại PointsManager
  if (
    typeof UserManager === "undefined" ||
    !UserManager.isLoggedIn() ||
    typeof PointsManager === "undefined"
  ) {
    // Nếu chưa đăng nhập, ẩn vùng đổi điểm và dừng thực thi
    section.classList.add("hidden");
    return;
  }

  // Hiển thị vùng đổi điểm tích lũy
  section.classList.remove("hidden");

  // Lấy số điểm hiện có của người dùng từ hệ thống quản lý điểm
  const currentPoints = PointsManager.getPoints();
  const currentEl = document.getElementById("pointsCurrent");
  if (currentEl)
    currentEl.textContent = currentPoints.toLocaleString("vi-VN") + " điểm";

  // Cấu hình ô nhập điểm: điểm tối đa có thể nhập chính là số điểm hiện tại đang sở hữu
  const input = document.getElementById("pointsInput");
  if (input) {
    input.max = currentPoints;
    input.value = 0; // Giá trị mặc định ban đầu là 0
  }

  // Tính toán và hiển thị điểm thưởng dự kiến nhận được khi thanh toán đơn hàng này
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const earnEl = document.getElementById("pointsEarn");
  if (earnEl) {
    const earned = PointsManager.moneyToPoints(subtotal);
    earnEl.textContent = "+" + earned.toLocaleString("vi-VN") + " điểm";
  }

  // Đăng ký sự kiện click cho nút áp dụng đổi điểm
  const btn = document.getElementById("btnUsePoints");
  if (btn) btn.addEventListener("click", applyPoints);
}

// applyPoints: Quy đổi điểm tích lũy thành viên thành số tiền được giảm giá.
function applyPoints() {
  if (typeof PointsManager === "undefined") return;

  const input = document.getElementById("pointsInput"); // Ô nhập số điểm muốn dùng
  const points = parseInt(input.value) || 0; // Chuyển đổi giá trị sang số nguyên, mặc định là 0
  const currentPoints = PointsManager.getPoints(); // Lấy tổng điểm hiện có

  // Kiểm tra điểm không được âm
  if (points < 0) {
    showToast("Số điểm không hợp lệ!");
    return;
  }

  // Kiểm tra điểm dùng không được vượt quá số điểm hiện có
  if (points > currentPoints) {
    showToast(
      "Bạn không đủ điểm! Hiện có: " +
        currentPoints.toLocaleString("vi-VN") +
        " điểm.",
    );
    input.value = currentPoints; // Đưa về số điểm tối đa đang sở hữu
    return;
  }

  // Tính số tiền được giảm từ điểm tích lũy quy đổi (ví dụ: 1 điểm = 10đ)
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  let discount = PointsManager.pointsToMoney(points);

  // Ràng buộc bảo vệ: Số tiền giảm từ điểm không được vượt quá số tiền còn lại sau khi đã giảm coupon
  if (discount > subtotal - currentDiscount) {
    discount = subtotal - currentDiscount; // Giới hạn mức giảm tối đa bằng số tiền còn lại của đơn hàng
    // Tính ngược lại số điểm thực tế cần dùng tương ứng với mức giảm giới hạn này
    const actualPoints = Math.ceil(discount / 10);
    input.value = actualPoints; // Cập nhật lại số điểm hiển thị trên ô nhập
    usedPoints = actualPoints; // Ghi nhận số điểm thực tế sử dụng
    pointsDiscount = PointsManager.pointsToMoney(actualPoints); // Ghi nhận số tiền giảm thực tế từ điểm
  } else {
    // Nếu hợp lệ, ghi nhận các giá trị điểm và tiền giảm tương ứng
    usedPoints = points;
    pointsDiscount = discount;
  }

  // Nếu người dùng nhập 0 điểm, xem như hủy sử dụng điểm
  if (points === 0) {
    pointsDiscount = 0;
    usedPoints = 0;
    showToast("Đã hủy sử dụng điểm.");
  } else {
    showToast(
      `Áp dụng ${usedPoints.toLocaleString("vi-VN")} điểm, giảm ${formatPrice(pointsDiscount)}!`,
    );
  }

  // Cập nhật lại các khoản tiền hiển thị trên giao diện thanh toán
  updateTotals(subtotal);
}

// ===== CHỌN PHƯƠNG THỨC THANH TOÁN =====
let selectedPayment = "cod"; // Biến toàn cục lưu phương thức thanh toán hiện tại ('cod' hoặc 'banking')

// selectPayment: Xử lý thay đổi phương thức thanh toán khi người dùng lựa chọn.
function selectPayment(method) {
  selectedPayment = method; // Cập nhật biến trạng thái toàn cục

  // Duyệt qua tất cả các thẻ tùy chọn thanh toán để xóa classactive cũ
  document
    .querySelectorAll(".payment-option")
    .forEach((el) => el.classList.remove("active"));

  // Thêm class active và chọn radio button của phương thức vừa được click
  const selected = document.querySelector(
    `.payment-option[data-method="${method}"]`,
  );
  if (selected) {
    selected.classList.add("active");
    selected.querySelector("input[type=radio]").checked = true;
  }

  // Lấy phần tử thông tin chuyển khoản ngân hàng và nút Đặt hàng
  const bankInfo = document.getElementById("bankingInfo");
  const btnPlace = document.getElementById("btnPlaceOrder");

  // Hiển thị khung QR chuyển khoản nếu chọn phương thức 'banking', ẩn nếu chọn 'cod'
  if (bankInfo) {
    bankInfo.style.display = method === "banking" ? "block" : "none";
  }

  if (method === "banking") {
    // Cập nhật giao diện nút Đặt hàng sang nhãn thanh toán trực tuyến
    if (btnPlace)
      btnPlace.innerHTML = '<i class="fa-solid fa-credit-card"></i> ĐẶT HÀNG';
    // Tiến hành gọi hàm tạo và hiển thị QR Code động thanh toán payOS
    updateQRCode();
  } else {
    // Cập nhật giao diện nút Đặt hàng về mặc định (COD)
    if (btnPlace)
      btnPlace.innerHTML = '<i class="fa-solid fa-check"></i> ĐẶT HÀNG';
  }
}

// ===== DỮ LIỆU CHI NHÁNH =====
/**
 * Chứa danh sách các chi nhánh của cửa hàng được phân chia theo mã thành phố.
 * Sử dụng IIFE tự chạy để đồng bộ hóa dữ liệu từ thư viện chung `GIBOR_BRANCH_UTILS` (nếu có).
 * Trường hợp không có thư viện chung, hệ thống tự động fallback sử dụng danh sách tĩnh được khai báo.
 * 
 * @constant {Object} BRANCHES
 */
const BRANCHES = (() => {
  // Kiểm tra sự tồn tại của tiện ích quản lý chi nhánh toàn cục
  if (
    typeof window !== "undefined" &&
    window.GIBOR_BRANCH_UTILS &&
    typeof window.GIBOR_BRANCH_UTILS.getByCity === "function"
  ) {
    // Ánh xạ dữ liệu chi nhánh từ hàm getByCity của thư viện chung
    const mapCityBranches = (cityCode) =>
      window.GIBOR_BRANCH_UTILS.getByCity(cityCode).map((branch) => ({
        id: branch.id,
        name: branch.name,
        address: branch.address,
      }));

    return {
      hcm: mapCityBranches("hcm"), // Danh sách chi nhánh tại TP. Hồ Chí Minh
      hn: mapCityBranches("hn"),   // Danh sách chi nhánh tại Hà Nội
      dn: mapCityBranches("dn"),   // Danh sách chi nhánh tại Đà Nẵng
    };
  }

  // Danh sách chi nhánh tĩnh làm phương án dự phòng (fallback)
  return {
    hcm: [
      {
        id: "hcm1",
        name: "GIBOR Lê Trọng Tấn",
        address: "140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP. Hồ Chí Minh",
      },
      {
        id: "hcm2",
        name: "GIBOR Nguyễn Huệ",
        address: "263 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      },
      {
        id: "hcm3",
        name: "GIBOR Võ Văn Tần",
        address: "108 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh",
      },
      {
        id: "hcm4",
        name: "GIBOR Xa lộ Hà Nội",
        address: "77 Xa lộ Hà Nội, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
      },
      {
        id: "hcm5",
        name: "GIBOR Điện Biên Phủ",
        address: "23 Điện Biên Phủ, Phường 15, Bình Thạnh, TP. Hồ Chí Minh",
      },
    ],
    hn: [
      {
        id: "hn1",
        name: "GIBOR Trần Duy Hưng",
        address: "81 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội",
      },
      {
        id: "hn2",
        name: "GIBOR Láng Hạ",
        address: "66 Láng Hạ, Láng Hạ, Đống Đa, Hà Nội",
      },
      {
        id: "hn3",
        name: "GIBOR Bạch Mai",
        address: "115 Bạch Mai, Bạch Mai, Hai Bà Trưng, Hà Nội",
      },
      {
        id: "hn4",
        name: "GIBOR Hoàng Hoa Thám",
        address: "632 Hoàng Hoa Thám, Vĩnh Phúc, Ba Đình, Hà Nội",
      },
      {
        id: "hn5",
        name: "GIBOR Nguyễn Văn Cừ",
        address: "334 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội",
      },
    ],
    dn: [
      {
        id: "dn1",
        name: "GIBOR Võ Nguyên Giáp",
        address: "567 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
      },
      {
        id: "dn2",
        name: "GIBOR Bạch Đằng",
        address: "453 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng",
      },
      {
        id: "dn3",
        name: "GIBOR Nguyễn Văn Linh",
        address: "638 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng",
      },
      {
        id: "dn4",
        name: "GIBOR Tôn Đức Thắng",
        address: "53 Tôn Đức Thắng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng",
      },
      {
        id: "dn5",
        name: "GIBOR Cách Mạng Tháng Tám",
        address: "55 Cách Mạng Tháng Tám, Khuê Trung, Cẩm Lệ, Đà Nẵng",
      },
    ],
  };
})();

let selectedBranch = null; // Biến toàn cục lưu chi nhánh cửa hàng được chọn (dùng khi uống tại quán)

// renderBranches: Hiển thị danh sách các chi nhánh tương ứng với thành phố được chọn.
function renderBranches(city) {
  const branchList = document.getElementById("branchList"); // Khu vực hiển thị danh sách chi nhánh
  if (!branchList) return;

  // Reset chi nhánh được chọn về mặc định khi thay đổi thành phố
  selectedBranch = null;

  // Nếu không có thành phố hoặc thành phố không tồn tại trong danh sách chi nhánh, xóa danh sách trên giao diện
  if (!city || !BRANCHES[city]) {
    branchList.innerHTML = "";
    return;
  }

  let html = "";
  // Duyệt qua mảng chi nhánh của thành phố được chọn để sinh cấu trúc HTML radio button
  BRANCHES[city].forEach((branch) => {
    html += `
      <label class="branch-card" data-branch-id="${branch.id}" onclick="selectBranch('${branch.id}', '${city}')">
        <input type="radio" name="branch" value="${branch.id}" />
        <span class="branch-radio"></span>
        <div class="branch-info">
          <span class="branch-name">${branch.name}</span>
          <span class="branch-address"><i class="fa-solid fa-map-pin"></i> ${branch.address}</span>
        </div>
      </label>`;
  });

  branchList.innerHTML = html;
}

// selectBranch: Lưu thông tin chi nhánh cửa hàng được chọn và cập nhật giao diện.
function selectBranch(branchId, city) {
  // Tìm kiếm đối tượng chi nhánh tương ứng trong danh sách BRANCHES
  selectedBranch = BRANCHES[city].find((b) => b.id === branchId);

  // Xóa class active (đánh dấu lựa chọn) của toàn bộ các card chi nhánh
  document.querySelectorAll(".branch-card").forEach((card) => {
    card.classList.remove("active");
  });

  // Tìm card chi nhánh vừa được chọn để thêm class active và tích chọn radio button tương ứng
  const selected = document.querySelector(
    `.branch-card[data-branch-id="${branchId}"]`,
  );
  if (selected) {
    selected.classList.add("active");
    selected.querySelector("input[type=radio]").checked = true;
  }
}

// ===== CHỌN HÌNH THỨC NHẬN HÀNG =====
let selectedShipping = "delivery"; // Biến toàn cục lưu hình thức nhận hàng ('delivery' hoặc 'dine-in')

// selectShipping: Xử lý thay đổi hình thức nhận hàng và cập nhật các trường thông tin tương ứng.
function selectShipping(method) {
  selectedShipping = method; // Cập nhật biến trạng thái toàn cục

  // Xóa class active của tất cả các tùy chọn hình thức nhận hàng
  document
    .querySelectorAll(".shipping-option")
    .forEach((el) => el.classList.remove("active"));

  // Thêm class active và chọn radio button tương ứng với hình thức nhận hàng được chọn
  const selected = document.querySelector(
    `.shipping-option[data-method="${method}"]`,
  );
  if (selected) {
    selected.classList.add("active");
    selected.querySelector("input[type=radio]").checked = true;
  }

  // Lấy các vùng giao diện cần ẩn/hiện hoặc thay đổi cấu hình
  const shippingNotice = document.getElementById("shippingNotice"); // Dòng thông báo phí vận chuyển
  const requiredFields = document.querySelectorAll(".form-group .required"); // Các dấu (*) bắt buộc nhập
  const branchSection = document.getElementById("branchSection"); // Khu vực chọn chi nhánh
  const addressFields = ["groupAddress", "groupCity", "groupWard"]; // Các ID của form-group liên quan đến địa chỉ giao hàng

  if (method === "delivery") {
    // Trường hợp: Giao hàng tận nơi (delivery)
    if (shippingNotice) shippingNotice.style.display = "flex"; // Hiện thông báo phí vận chuyển
    
    // Hiển thị các dấu (*) yêu cầu bắt buộc nhập thông tin
    requiredFields.forEach((el) => (el.style.display = "inline"));
    
    // Hiển thị các trường địa chỉ, tỉnh/thành phố, phường/xã
    addressFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "block";
    });
    
    // Ẩn khu vực chọn chi nhánh
    if (branchSection) branchSection.style.display = "none";
    selectedBranch = null; // Reset chi nhánh đã chọn về null
    
    // Xóa các thông báo lỗi cũ trên form để giao diện sạch sẽ
    clearAllErrors();
  } else {
    // Trường hợp: Uống tại quán / Tự đến nhận (dine-in)
    if (shippingNotice) shippingNotice.style.display = "none"; // Ẩn thông báo phí vận chuyển
    
    // Ẩn dấu (*) yêu cầu bắt buộc vì không giao hàng tận nơi
    requiredFields.forEach((el) => (el.style.display = "none"));
    
    // Ẩn các trường nhập địa chỉ giao hàng
    addressFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    
    // Hiển thị khu vực chọn chi nhánh cửa hàng
    if (branchSection) branchSection.style.display = "block";
    
    // Xóa các thông báo lỗi cũ
    clearAllErrors();
  }

  // Tính toán lại các loại phí và tổng tiền vì phí ship có sự thay đổi giữa các hình thức nhận hàng
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  updateTotals(subtotal);
}

// ===== XÓA LỖI =====
// clearAllErrors: Xóa toàn bộ các lớp cảnh báo và thông báo lỗi trên form.
function clearAllErrors() {
  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("has-error");
    const errorMsg = group.querySelector(".error-message");
    if (errorMsg) errorMsg.remove();
  });
}

// showFieldError: Hiển thị thông báo lỗi dưới một trường nhập liệu cụ thể khi validate thất bại.
function showFieldError(inputId, message, shouldFocus = false) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  // Xóa thông báo lỗi cũ của form-group này nếu tồn tại
  formGroup.classList.remove("has-error");
  const oldError = formGroup.querySelector(".error-message");
  if (oldError) oldError.remove();

  // Thêm class has-error để viền input chuyển màu đỏ (css cấu hình sẵn)
  formGroup.classList.add("has-error");
  
  // Tạo phần tử hiển thị nội dung lỗi bên dưới input
  const errorEl = document.createElement("span");
  errorEl.className = "error-message";
  errorEl.textContent = message;
  formGroup.appendChild(errorEl);

  // Tập trung tiêu điểm (focus) vào input nếu đây là lỗi đầu tiên
  if (shouldFocus) input.focus();
}

// ===== VALIDATE FORM =====
// validateForm: Kiểm tra tính hợp lệ của toàn bộ dữ liệu nhập vào trên form đặt hàng.
function validateForm() {
  // Xóa toàn bộ lỗi cũ trước khi kiểm tra lượt mới
  clearAllErrors();

  const name = document.getElementById("ckName").value.trim(); // Họ tên khách hàng
  let errors = []; // Mảng chứa danh sách các lỗi phát hiện được

  // Họ tên khách hàng là trường bắt buộc trong mọi hình thức
  if (!name) errors.push({ id: "ckName", msg: "Vui lòng nhập họ tên" });

  // 1. Kiểm tra validate khi chọn hình thức "Uống tại quán/Tự đến lấy":
  if (selectedShipping === "dine-in") {
    if (errors.length > 0) {
      showFieldError("ckName", "Vui lòng nhập họ tên", true);
      showToast("Vui lòng nhập tên khách hàng!");
      return false;
    }
    // Bắt buộc phải chọn chi nhánh cửa hàng cụ thể
    if (!selectedBranch) {
      showToast("Vui lòng chọn chi nhánh!");
      return false;
    }
    // Nếu chọn thanh toán chuyển khoản, trả về cờ yêu cầu hiển thị popup chuyển khoản ngân hàng
    if (selectedPayment === "banking") {
      return "NEED_CONFIRM";
    }
    return true;
  }

  // 2. Kiểm tra validate khi chọn hình thức "Giao hàng tận nơi":
  const phone = document.getElementById("ckPhone").value.trim(); // Số điện thoại
  const email = document.getElementById("ckEmail").value.trim(); // Địa chỉ Email
  const address = document.getElementById("ckAddress").value.trim(); // Địa chỉ nhà/Đường
  const city = document.getElementById("ckCity").value; // Tỉnh/Thành phố
  const ward = document.getElementById("ckWard").value; // Phường/Xã

  // Ràng buộc số điện thoại không được trống và phải có độ dài tối thiểu 9 chữ số
  if (!phone || phone.length < 9)
    errors.push({ id: "ckPhone", msg: "Vui lòng nhập số điện thoại hợp lệ" });
  // Ràng buộc email không được trống và phải chứa ký tự '@'
  if (!email || !email.includes("@"))
    errors.push({ id: "ckEmail", msg: "Vui lòng nhập email hợp lệ" });
  // Ràng buộc địa chỉ cụ thể không trống
  if (!address) errors.push({ id: "ckAddress", msg: "Vui lòng nhập địa chỉ" });
  // Ràng buộc tỉnh/thành phố phải chọn
  if (!city) errors.push({ id: "ckCity", msg: "Vui lòng chọn Tỉnh/Thành phố" });
  // Ràng buộc phường/xã phải chọn
  if (!ward) errors.push({ id: "ckWard", msg: "Vui lòng chọn Phường/Xã" });

  // Duyệt mảng lỗi để hiển thị trực quan lên giao diện, focus vào input lỗi đầu tiên
  errors.forEach((err, idx) => {
    showFieldError(err.id, err.msg, idx === 0);
  });

  // Nếu có bất kỳ lỗi nào, thông báo toast và hủy luồng xử lý
  if (errors.length > 0) {
    showToast("Vui lòng điền đầy đủ thông tin giao hàng!");
    return false;
  }

  // Nếu chọn chuyển khoản ngân hàng, yêu cầu xác nhận hiển thị popup thanh toán QR trước
  if (selectedPayment === "banking") {
    return "NEED_CONFIRM";
  }

  return true;
}

// ===== HIỆN POPUP XÁC NHẬN THANH TOÁN =====
// showConfirmPayment: Hiển thị popup overlay xác nhận thanh toán chứa mã QR.
function showConfirmPayment() {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirmOverlay"); // Overlay chứa popup xác nhận chuyển khoản
    const btnOk = document.getElementById("btnConfirmOk"); // Nút "Tôi đã chuyển khoản thành công"
    const btnCancel = document.getElementById("btnConfirmCancel"); // Nút "Hủy giao dịch"

    // Nếu không tồn tại popup overlay trong DOM, tự động coi như đã xác nhận và tiếp tục
    if (!overlay) {
      resolve(true);
      return;
    }

    // Hiển thị popup overlay lên giao diện (thông qua thêm class show)
    overlay.classList.add("show");
    
    // Đảm bảo thông tin ngân hàng hiển thị đầy đủ bên trong popup
    const popupBankInfo = overlay.querySelector("#bankingInfo");
    if (popupBankInfo) {
      popupBankInfo.style.display = "block";
    }

    // Đặc biệt trên mobile: Khởi tạo/tải lại ảnh QR sau khi popup đã hiển thị hoàn toàn
    // Việc này để tránh các cơ chế hoãn tải tài nguyên (lazy load) của trình duyệt di động
    if (selectedPayment === "banking") {
      requestAnimationFrame(() => {
        setTimeout(updateQRCode, 60);
      });
    }

    // Xử lý sự kiện khi người dùng nhấn Xác nhận
    const handleOk = () => {
      // Dọn dẹp các tiến trình đồng bộ trạng thái payOS đang chạy nền
      if (typeof payosSyncTimeout !== "undefined" && payosSyncTimeout) clearTimeout(payosSyncTimeout);
      if (typeof payosSyncInterval !== "undefined" && payosSyncInterval) clearInterval(payosSyncInterval);
      
      overlay.classList.remove("show"); // Ẩn popup
      // Hủy lắng nghe sự kiện để tránh rò rỉ bộ nhớ
      btnOk.removeEventListener("click", handleOk);
      btnCancel.removeEventListener("click", handleCancel);
      resolve(true); // Trả về kết quả thành công
    };

    // Xử lý sự kiện khi người dùng nhấn Hủy
    const handleCancel = () => {
      // Dọn dẹp các tiến trình đồng bộ trạng thái payOS đang chạy nền
      if (typeof payosSyncTimeout !== "undefined" && payosSyncTimeout) clearTimeout(payosSyncTimeout);
      if (typeof payosSyncInterval !== "undefined" && payosSyncInterval) clearInterval(payosSyncInterval);
      
      overlay.classList.remove("show"); // Ẩn popup
      
      // Bấm hủy thì tính toán lại tổng tiền của đơn hàng để đồng bộ giao diện
      const cart = getCart();
      const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      updateTotals(subtotal);
      
      // Hủy lắng nghe sự kiện
      btnOk.removeEventListener("click", handleOk);
      btnCancel.removeEventListener("click", handleCancel);
      resolve(false); // Trả về kết quả thất bại (hủy đặt hàng)
    };

    btnOk.addEventListener("click", handleOk);
    btnCancel.addEventListener("click", handleCancel);
  });
}

// ===== ĐẶT HÀNG =====
// placeOrder: Thực hiện quy trình đặt hàng, lưu trữ thông tin đơn hàng và hiển thị popup thành công.
async function placeOrder() {
  const cart = getCart(); // Lấy dữ liệu giỏ hàng hiện tại

  // Nếu giỏ hàng trống, dừng thao tác đặt hàng và hiển thị thông báo
  if (cart.length === 0) {
    showToast("Giỏ hàng trống, không thể đặt hàng!");
    return;
  }

  // Thực hiện kiểm tra tính hợp lệ của các trường dữ liệu trên form thanh toán
  const validationResult = validateForm();

  // 1. Xử lý trường hợp hình thức thanh toán trực tuyến (Chuyển khoản qua payOS):
  if (validationResult === "NEED_CONFIRM") {
    // Mỗi khi khách hàng bấm nút Đặt hàng bằng Banking:
    // Cập nhật lại tổng tiền chi tiết và tạo/tải lại ảnh QR Code thanh toán động mới nhất
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    updateTotals(subtotal);
    updateQRCode();

    // Hiển thị popup overlay xác nhận thanh toán payOS và đợi phản hồi từ phía người dùng (Promise)
    const confirmed = await showConfirmPayment();
    
    // Nếu khách hàng bấm Hủy hoặc chưa thanh toán thành công, dừng tiến trình đặt hàng
    if (!confirmed) {
      showToast("Vui lòng hoàn tất thanh toán trước khi đặt hàng!");
      return;
    }
  } else if (!validationResult) {
    // 2. Trường hợp validate form giao hàng/tại quán bị thất bại (thiếu thông tin bắt buộc)
    return;
  }

  // 3. Sinh mã đơn hàng ngẫu nhiên duy nhất (Unique Order Code):
  // Tiền tố GBR- kết hợp với biểu diễn hệ cơ số 36 của mốc thời gian hiện tại (Date.now()) in hoa
  const code = "GBR-" + Date.now().toString(36).toUpperCase();
  const orderCodeEl = document.getElementById("orderCode");
  // Cập nhật mã đơn hàng vừa sinh lên giao diện hiển thị popup thành công
  if (orderCodeEl) orderCodeEl.textContent = code;

  // 4. Lưu trữ thông tin đơn hàng vào hệ thống dữ liệu (OrderManager):
  if (typeof OrderManager !== "undefined") {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    // Lấy các phần tử nhập liệu trên form thông tin khách hàng
    const ckNameEl = document.getElementById("ckName");
    const ckPhoneEl = document.getElementById("ckPhone");
    const ckEmailEl = document.getElementById("ckEmail");
    const ckAddressEl = document.getElementById("ckAddress");
    const ckCityEl = document.getElementById("ckCity");
    const ckWardEl = document.getElementById("ckWard");

    // Xử lý ghép địa chỉ đầy đủ (Full Address) đối với hình thức giao hàng tận nơi:
    // Ghép theo thứ tự: Số nhà/Tên đường -> Phường/Xã -> Tỉnh/Thành phố
    let fullAddress = "";
    if (selectedShipping === "delivery") {
      const streetAddr = ckAddressEl ? ckAddressEl.value.trim() : "";
      const wardName = ckWardEl
        ? ckWardEl.options[ckWardEl.selectedIndex]?.text
        : "";
      const cityName = ckCityEl
        ? ckCityEl.options[ckCityEl.selectedIndex]?.text
        : "";
      // Lọc bỏ các phần tử rỗng hoặc nhãn mặc định của select để ghép chuỗi ngăn cách bằng dấu phẩy
      const parts = [streetAddr, wardName, cityName].filter(
        (p) => p && p !== "--- Chọn ---",
      );
      fullAddress = parts.join(", ");
    }

    // Xác định chi nhánh cửa hàng (Branch) sẽ tiếp nhận và xử lý đơn hàng này:
    let finalBranch = null;
    if (selectedShipping === "dine-in" && selectedBranch) {
      // Nếu uống tại quán, lấy trực tiếp chi nhánh do khách chọn
      finalBranch = { id: selectedBranch.id, name: selectedBranch.name, address: selectedBranch.address };
    } else if (selectedShipping === "delivery") {
      // Nếu giao hàng tận nơi, tự động gán đơn hàng cho chi nhánh mặc định đầu tiên của thành phố đó
      const cityVal = ckCityEl ? ckCityEl.value : "";
      if (cityVal && typeof window.GIBOR_BRANCH_UTILS !== "undefined") {
        const branchesOfCity = window.GIBOR_BRANCH_UTILS.getByCity(cityVal);
        if (branchesOfCity && branchesOfCity.length > 0) {
          finalBranch = { id: branchesOfCity[0].id, name: branchesOfCity[0].name, address: branchesOfCity[0].address };
        }
      } else if (cityVal && BRANCHES[cityVal] && BRANCHES[cityVal].length > 0) {
        finalBranch = { id: BRANCHES[cityVal][0].id, name: BRANCHES[cityVal][0].name, address: BRANCHES[cityVal][0].address };
      }
    }

    // Lấy số tiền thực tế khách cần thanh toán sau khi trừ các khoản giảm giá
    const grandTotal = getCurrentCheckoutAmount();

    // Gọi hàm saveOrder của OrderManager để ghi nhận đơn hàng mới vào cơ sở dữ liệu Local
    OrderManager.saveOrder({
      code: code, // Mã đơn hàng
      customer: {
        name: ckNameEl ? ckNameEl.value.trim() : "",
        phone: ckPhoneEl ? ckPhoneEl.value.trim() : "",
        email: ckEmailEl ? ckEmailEl.value.trim() : "",
        address: fullAddress, // Địa chỉ giao hàng
      },
      // Ánh xạ mảng sản phẩm trong giỏ hàng sang cấu trúc chi tiết hóa đơn
      items: cart.map((i) => ({
        name: i.name,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        sugar: i.sugar || "",
        ice: i.ice || "",
        toppings: i.toppings || [],
        note: i.note || "",
        comboItems: i.comboItems || [],
      })),
      total: grandTotal, // Tổng tiền cuối cùng
      subtotal: subtotal, // Tiền tạm tính
      couponDiscount: currentDiscount, // Số tiền giảm từ coupon
      pointsUsed: usedPoints, // Số điểm thành viên đã tiêu
      pointsDiscount: pointsDiscount, // Số tiền được giảm tương ứng từ điểm
      payment:
        selectedPayment === "banking"
          ? "Chuyển khoản"
          : "Thanh toán khi nhận hàng",
      shipping: selectedShipping === "delivery" ? "Giao hàng" : "Uống tại quán",
      // Thông tin tích hợp cổng thanh toán trực tuyến payOS
      paymentProvider: selectedPayment === "banking" ? (currentPayosPayment && currentPayosPayment.provider) || "payos" : "cod",
      paymentOrderCode: currentPayosPayment ? currentPayosPayment.orderCode : "",
      paymentLinkId: currentPayosPayment ? currentPayosPayment.paymentLinkId || "" : "",
      checkoutUrl: currentPayosPayment ? currentPayosPayment.checkoutUrl || "" : "",
      branch: finalBranch, // Chi nhánh đảm nhận đơn
      // Đặt trạng thái mặc định của đơn hàng tùy theo phương thức thanh toán
      status: selectedPayment === "banking"
        ? ((typeof payosPaymentSuccess !== "undefined" && payosPaymentSuccess) ? "Đang xử lý" : "Chờ thanh toán")
        : "Đã ghi nhận",
      paymentStatus: (typeof payosPaymentSuccess !== "undefined" && payosPaymentSuccess) ? "Đã thanh toán" : "Chưa thanh toán",
    });

    // 5. Xử lý cộng/trừ điểm tích lũy thành viên (chỉ chạy khi người dùng ĐÃ ĐĂNG NHẬP):
    if (
      typeof UserManager !== "undefined" &&
      UserManager.isLoggedIn() &&
      typeof PointsManager !== "undefined"
    ) {
      // Trừ số điểm tích lũy mà khách hàng đã chọn quy đổi
      if (usedPoints > 0) {
        PointsManager.usePoints(usedPoints);
      }
      
      // Tính toán điểm tích lũy mới được thưởng dựa trên số tiền thực tế mua sản phẩm (không tính phí ship)
      const productOnly = Math.max(
        0,
        subtotal - currentDiscount - pointsDiscount,
      );
      // Ghi nhận điểm thưởng mới vào ví điểm thành viên
      const earnedPoints = PointsManager.earnPoints(productOnly);
    }
  }

  // 6. Dọn dẹp giỏ hàng sau khi đặt hàng thành công:
  // Xóa giỏ hàng trong LocalStorage cho cả hai key dự phòng
  localStorage.removeItem("giborCart");
  localStorage.removeItem("cart");
  // Cập nhật lại số lượng hiển thị trên icon giỏ hàng ở header về 0
  updateCartCount();

  // 7. Hiển thị popup thông báo đặt hàng thành công
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.classList.add("show");
}

// ===== DỮ LIỆU PHƯỜNG/XÃ THEO TỈNH/THÀNH PHỐ =====
const WARD_NAMES = {
  hcm: [
    "Phường An Hội Tây",
    "Phường An Hội Đông",
    "Phường An Khánh",
    "Phường An Lạc",
    "Phường An Nhơn",
    "Phường An Phú",
    "Phường An Phú Đông",
    "Phường An Đông",
    "Phường Bà Rịa",
    "Phường Bàn Cờ",
    "Phường Bình Cơ",
    "Phường Bình Dương",
    "Phường Bình Hòa",
    "Phường Bình Hưng Hòa",
    "Phường Bình Lợi Trung",
    "Phường Bình Phú",
    "Phường Bình Quới",
    "Phường Bình Thạnh",
    "Phường Bình Thới",
    "Phường Bình Tiên",
    "Phường Bình Trưng",
    "Phường Bình Trị Đông",
    "Phường Bình Tân",
    "Phường Bình Tây",
    "Phường Bình Đông",
    "Phường Bảy Hiền",
    "Phường Bến Cát",
    "Phường Bến Thành",
    "Phường Chánh Hiệp",
    "Phường Chánh Hưng",
    "Phường Chánh Phú Hòa",
    "Phường Chợ Lớn",
    "Phường Chợ Quán",
    "Phường Cát Lái",
    "Phường Cầu Kiệu",
    "Phường Cầu Ông Lãnh",
    "Phường Diên Hồng",
    "Phường Dĩ An",
    "Phường Gia Định",
    "Phường Gò Vấp",
    "Phường Hiệp Bình",
    "Phường Hòa Bình",
    "Phường Hòa Hưng",
    "Phường Hòa Lợi",
    "Phường Hạnh Thông",
    "Phường Khánh Hội",
    "Phường Linh Xuân",
    "Phường Long Bình",
    "Phường Long Phước",
    "Phường Long Trường",
    "Phường Lái Thiêu",
    "Phường Lê Minh Xuân",
    "Phường Lộc An",
    "Phường Lý Thường Kiệt",
    "Phường Minh Phụng",
    "Phường Mỹ Thạnh",
    "Phường Phú An",
    "Phường Phú Hòa",
    "Phường Phú Lâm",
    "Phường Phú Lợi",
    "Phường Phú Mỹ",
    "Phường Phú Nhuận",
    "Phường Phú Thạnh",
    "Phường Phú Thọ",
    "Phường Phú Thọ Hòa",
    "Phường Phước Long",
    "Phường Phước Thành",
    "Phường Phước Thắng",
    "Phường Phước Long B",
    "Phường Phước Tân",
    "Phường Phước Vĩnh",
    "Phường Rạch Dừa",
    "Phường Sài Gòn",
    "Phường Tam Bình",
    "Phường Tam Long",
    "Phường Tam Phước",
    "Phường Tam Thắng",
    "Phường Tân An",
    "Phường Tân Bình",
    "Phường Tân Chánh Hiệp",
    "Phường Tân Hưng",
    "Phường Tân Khánh",
    "Phường Tân Phú",
    "Phường Tân Phước",
    "Phường Tân Sơn",
    "Phường Tân Sơn Nhất",
    "Phường Tân Thành",
    "Phường Tân Thới Hiệp",
    "Phường Tân Thuận",
    "Phường Tân Tạo",
    "Phường Thạnh Lộc",
    "Phường Thạnh Mỹ Tây",
    "Phường Thủ Dầu Một",
    "Phường Thủ Đức",
    "Phường Trảng Dài",
    "Phường Trung Mỹ Tây",
    "Phường Vĩnh Hội",
    "Phường Vũng Tàu",
    "Phường Võ Thị Sáu",
    "Phường Xuân Hòa",
    "Phường Xuân Thành",
    "Phường Đông Hòa",
    "Phường Đông Hưng Thuận",
    "Phường Định Hòa",
    "Phường Đoàn Kết",
    "Phường 30/4",
    "Xã An Bình",
    "Xã An Long",
    "Xã An Nhơn Tây",
    "Xã An Phú",
    "Xã An Thới Đông",
    "Xã Bàu Bàng",
    "Xã Bàu Lâm",
    "Xã Bình Chánh",
    "Xã Bình Giã",
    "Xã Bình Hưng",
    "Xã Bình Khánh",
    "Xã Bình Lợi",
    "Xã Bình Mỹ",
    "Xã Bình Phước",
    "Xã Bình Sơn",
    "Xã Bình Xuyên",
    "Xã Bưng Riềng",
    "Xã Cần Giờ",
    "Xã Châu Pha",
    "Xã Chánh Phú Hòa",
    "Xã Củ Chi",
    "Xã Dầu Tiếng",
    "Xã Hóc Môn",
    "Xã Hòa Hiệp",
    "Xã Hòa Hội",
    "Xã Hòa Hưng",
    "Xã Hưng Long",
    "Xã Long Điền",
    "Xã Long Hải",
    "Xã Long Hòa",
    "Xã Long Hưng",
    "Xã Long Sơn",
    "Xã Lộc An",
    "Xã Minh Thạnh",
    "Xã Mỹ Hạnh",
    "Xã Mỹ Yên",
    "Xã Nhuận Đức",
    "Xã Phú Giáo",
    "Xã Phú Hòa Đông",
    "Xã Phước Hòa",
    "Xã Phước Hải",
    "Xã Phước Thành",
    "Xã Thanh An",
    "Xã Thái Mỹ",
    "Xã Thường Tân",
    "Xã Thạnh An",
    "Xã Trừ Văn Thố",
    "Xã Tân An Hội",
    "Xã Tân Nhựt",
    "Xã Tân Vĩnh Lộc",
    "Xã Vĩnh Lộc",
    "Xã Xuyên Mộc",
    "Xã Xuân Sơn",
    "Xã Xuân Thới Sơn",
    "Xã Đông Thạnh",
    "Xã Đất Đỏ",
    "Đặc khu Côn Đảo",
  ],

  hn: [
    "Phường Ba Đình",
    "Phường Bạch Mai",
    "Phường Bồ Đề",
    "Phường Chương Mỹ",
    "Phường Cầu Giấy",
    "Phường Cửa Nam",
    "Phường Dương Nội",
    "Phường Giảng Võ",
    "Phường Hai Bà Trưng",
    "Phường Hoàn Kiếm",
    "Phường Hoàng Liệt",
    "Phường Hoàng Mai",
    "Phường Hà Đông",
    "Phường Hồng Hà",
    "Phường Khương Đình",
    "Phường Kim Liên",
    "Phường Kiến Hưng",
    "Phường Long Biên",
    "Phường Láng",
    "Phường Lĩnh Nam",
    "Phường Nghĩa Đô",
    "Phường Ngọc Hà",
    "Phường Phú Diễn",
    "Phường Phú Lương",
    "Phường Phú Thượng",
    "Phường Phúc Lợi",
    "Phường Phương Liệt",
    "Phường Sơn Tây",
    "Phường Thanh Liệt",
    "Phường Thanh Xuân",
    "Phường Thượng Cát",
    "Phường Tây Hồ",
    "Phường Tây Mỗ",
    "Phường Tây Tựu",
    "Phường Tùng Thiện",
    "Phường Tương Mai",
    "Phường Từ Liêm",
    "Phường Việt Hưng",
    "Phường Văn Miếu - Quốc Tử Giám",
    "Phường Vĩnh Hưng",
    "Phường Vĩnh Tuy",
    "Phường Xuân Đỉnh",
    "Phường Yên Hòa",
    "Phường Yên Nghĩa",
    "Phường Yên Sở",
    "Phường Ô Chợ Dừa",
    "Phường Đông Ngạc",
    "Phường Đống Đa",
    "Xã Ba Vì",
    "Xã Bát Tràng",
    "Xã Chân Mây",
    "Xã Chương Dương",
    "Xã Cổ Loa",
    "Xã Duyên Hà",
    "Xã Gia Lâm",
    "Xã Gióng",
    "Xã Hạ Mỗ",
    "Xã Hát Môn",
    "Xã Hoài Đức",
    "Xã Hồng Vân",
    "Xã Khánh Hà",
    "Xã Liên Minh",
    "Xã Mai Hoa",
    "Xã Minh Châu",
    "Xã Mê Linh",
    "Xã Nam Phù",
    "Xã Ngọc Hồi",
    "Xã Nguyên Khê",
    "Xã Nội Bài",
    "Xã Phúc Thịnh",
    "Xã Phú Nghĩa",
    "Xã Phú Xuyên",
    "Xã Phượng Dực",
    "Xã Quang Minh",
    "Xã Sóc Sơn",
    "Xã Sơn Đồng",
    "Xã Thanh Oai",
    "Xã Thường Tín",
    "Xã Thuận An",
    "Xã Thư Lâm",
    "Xã Thạch Thất",
    "Xã Tiến Thắng",
    "Xã Trần Phú",
    "Xã Tùng Thiện",
    "Xã Tân Hội",
    "Xã Tản Lĩnh",
    "Xã Vân Đình",
    "Xã Vân Nội",
    "Xã Vĩnh Thanh",
    "Xã Xuân Mai",
    "Xã Yên Bài",
    "Xã Yên Lãng",
    "Xã Yên Mỹ",
    "Xã Yên Sơn",
    "Xã Yên Trung",
    "Xã Yên Xuân",
    "Xã Ô Diên",
    "Xã Đa Phúc",
    "Xã Đan Phượng",
    "Xã Đoài Phương",
    "Xã Đông Anh",
    "Xã Đại Thanh",
    "Xã Đại Xuyên",
    "Xã Ứng Hòa",
    "Xã Ứng Thiên",
  ],

  dn: [
    "Phường An Hải",
    "Phường An Khê",
    "Phường An Thắng",
    "Phường Bàn Thạch",
    "Phường Cẩm Lệ",
    "Phường Cẩm Phô",
    "Phường Cẩm Thanh",
    "Phường Cửa Đại",
    "Phường Duy Tân",
    "Phường Duy Trinh",
    "Phường Duy Xuyên",
    "Phường Điện Bàn",
    "Phường Hòa Cường",
    "Phường Hòa Khánh",
    "Phường Hòa Vang",
    "Phường Hương Trà",
    "Phường Hội An",
    "Phường Kỳ Hà",
    "Phường Kỳ Phương",
    "Phường Kỳ Thịnh",
    "Phường Kỳ Trinh",
    "Phường Liên Chiểu",
    "Phường Minh An",
    "Phường Nam Trà My",
    "Phường Ngũ Hành Sơn",
    "Phường Núi Thành",
    "Phường Phước Mỹ",
    "Phường Sơn Trà",
    "Phường Tam Kỳ",
    "Phường Thanh Khê",
    "Phường Thăng Bình",
    "Phường Thạch Thang",
    "Phường Tiên Phước",
    "Phường Trường Xuân",
    "Phường Trà My",
    "Phường Tân Hiệp",
    "Phường Tân Thạnh",
    "Phường Vĩnh Điện",
    "Phường Võng Nhi",
    "Phường Xuân Hà",
    "Xã A Vương",
    "Xã A Xan",
    "Xã Bến Giằng",
    "Xã Bến Hiên",
    "Xã Cù Lao Chàm",
    "Xã Duy Nghĩa",
    "Xã Duy Phú",
    "Xã Duy Sơn",
    "Xã Duy Trung",
    "Xã Giang Nam",
    "Xã Hòa Bắc",
    "Xã Hòa Châu",
    "Xã Hòa Liên",
    "Xã Hòa Ninh",
    "Xã Hòa Nhơn",
    "Xã Hòa Phong",
    "Xã Hòa Phú",
    "Xã Hòa Phước",
    "Xã Hòa Sơn",
    "Xã Hòa Tiến",
    "Xã La Dêê",
    "Xã Nam Giang",
    "Xã Phú Ninh",
    "Xã Phước Hiệp",
    "Xã Phước Trà",
    "Xã Quế Sơn",
    "Xã Sông Vàng",
    "Xã Tây Giang",
    "Xã Thạnh Mỹ",
    "Xã Tiên Lãnh",
    "Xã Tiên Phước",
    "Xã Trà Don",
    "Xã Trà Linh",
    "Xã Trà Tập",
    "Xã Trà Vân",
    "Xã Trung Phước",
    "Xã Tư",
    "Xã Đại Lộc",
    "Xã Đông Giang",
    "Xã Đăk Pring",
    "Xã Đăk Tôi",
    "Xã Đoàn Kết",
    "Xã Đại Hồng",
    "Xã Ứng Dương",
  ],
};

// ===== CẬP NHẬT PHƯỜNG/XÃ THEO TỈNH/THÀNH PHỐ =====
// updateWards: Cập nhật danh sách các lựa chọn Phường/Xã dựa trên Tỉnh/Thành phố được chọn.
function updateWards() {
  const citySelect = document.getElementById("ckCity"); // Thẻ select chọn Tỉnh/Thành phố
  const wardSelect = document.getElementById("ckWard"); // Thẻ select chọn Phường/Xã

  if (!citySelect || !wardSelect) return;

  const selectedCity = citySelect.value; // Lấy mã thành phố được chọn ('hcm', 'hn', 'dn')

  // Xóa toàn bộ danh sách phường/xã cũ (giữ lại tùy chọn placeholder đầu tiên)
  wardSelect.innerHTML = '<option value="">--- Chọn ---</option>';

  // Nếu khách hàng chưa chọn Tỉnh/Thành phố, dừng thực thi và làm mới giao diện tìm kiếm
  if (!selectedCity) {
    refreshSearchable("ckWard");
    return;
  }

  // Truy vấn danh sách phường xã của thành phố tương ứng từ đối tượng dữ liệu WARD_NAMES
  const wards = WARD_NAMES[selectedCity];

  if (!wards) {
    refreshSearchable("ckWard");
    return;
  }

  // Duyệt qua mảng tên phường/xã để tạo các thẻ option mới đưa vào thẻ select gốc
  wards.forEach((ward) => {
    const option = document.createElement("option");
    option.value = ward;
    option.textContent = ward;
    wardSelect.appendChild(option);
  });

  // Cập nhật lại danh sách hiển thị của custom dropdown giả lập tìm kiếm
  refreshSearchable("ckWard");
}

// ===== ĐÓNG POPUP =====
// closeSuccess: Đóng popup overlay thông báo đặt hàng thành công.
function closeSuccess() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.classList.remove("show"); // Gỡ bỏ class show để ẩn popup
}

// ===== TÌM KIẾM PHƯỜNG/XÃ, TỈNH/THÀNH PHỐ =====
// makeSearchable: Biến đổi thẻ select mặc định thành custom dropdown có ô tìm kiếm.
function makeSearchable(selectId) {
  const select = document.getElementById(selectId); // Lấy thẻ select gốc
  if (!select) return;

  // 1. Ẩn thẻ select mặc định của trình duyệt đi để thay thế bằng giao diện mới
  select.style.display = "none";

  // 2. Tạo wrapper chứa toàn bộ cấu trúc dropdown mới
  const wrapper = document.createElement("div");
  wrapper.className = "ss-wrapper";
  wrapper.dataset.for = selectId; // Lưu thuộc tính liên kết với selectId gốc

  // 3. Tạo thanh hiển thị giá trị đang chọn
  const display = document.createElement("div");
  display.className = "ss-display";
  display.innerHTML =
    '<span class="ss-display-text">--- Chọn ---</span><i class="fa-solid fa-magnifying-glass-location ss-arrow"></i>';

  // 4. Tạo dropdown chứa ô tìm kiếm và danh sách kết quả
  const dropdown = document.createElement("div");
  dropdown.className = "ss-dropdown";

  // 5. Tạo ô input nhập văn bản để tìm kiếm
  const search = document.createElement("input");
  search.type = "text";
  search.className = "ss-search";
  search.placeholder = "Tìm kiếm";

  // 6. Vùng chứa danh sách các tùy chọn giả lập
  const optList = document.createElement("div");
  optList.className = "ss-options";

  // Ghép nối các thành phần DOM giả lập lại với nhau
  dropdown.appendChild(search);
  dropdown.appendChild(optList);
  wrapper.appendChild(display);
  wrapper.appendChild(dropdown);

  // Chèn wrapper giả lập vào vị trí ngay sau thẻ select gốc trong cây DOM
  select.parentElement.insertBefore(wrapper, select.nextSibling);

  // Dựng danh sách các tùy chọn hiển thị ban đầu dựa trên select gốc
  refreshSearchable(selectId);

  // 7. Thiết lập sự kiện click mở/đóng dropdown giả lập:
  display.addEventListener("click", (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt làm kích hoạt click đóng của document
    
    // Đóng toàn bộ các dropdown giả lập khác đang mở trên trang
    document.querySelectorAll(".ss-wrapper.open").forEach((w) => {
      if (w !== wrapper) w.classList.remove("open");
    });
    
    // Bật tắt class open để ẩn/hiện dropdown hiện tại
    wrapper.classList.toggle("open");
    
    // Nếu dropdown được mở ra, reset ô tìm kiếm và tập trung tiêu điểm (focus) vào input nhập liệu
    if (wrapper.classList.contains("open")) {
      search.value = "";
      filterSSOptions(optList, ""); // Hiển thị đầy đủ danh sách ban đầu
      setTimeout(() => search.focus(), 50);
    }
  });

  // 8. Thiết lập sự kiện khi người dùng gõ từ khóa vào ô tìm kiếm:
  search.addEventListener("input", () => {
    filterSSOptions(optList, search.value); // Tiến hành lọc danh sách
  });

  // Ngăn chặn sự kiện click bên trong dropdown làm đóng chính nó
  dropdown.addEventListener("click", (e) => e.stopPropagation());

  // Thiết lập sự kiện click toàn trang để đóng dropdown tự động khi click ra ngoài
  document.addEventListener("click", () => {
    wrapper.classList.remove("open");
  });
}

// refreshSearchable: Cập nhật danh sách tùy chọn giả lập đồng bộ theo select gốc.
function refreshSearchable(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  // Tìm wrapper giả lập tương ứng với selectId
  const wrapper = select.parentElement.querySelector(
    '.ss-wrapper[data-for="' + selectId + '"]',
  );
  if (!wrapper) return;

  const optList = wrapper.querySelector(".ss-options"); // Vùng chứa danh sách
  const displayText = wrapper.querySelector(".ss-display-text"); // Text hiển thị
  
  // Xóa sạch các tùy chọn giả lập cũ
  optList.innerHTML = "";

  let hasOptions = false; // Biến đánh dấu select gốc có chứa dữ liệu hợp lệ hay không

  // Duyệt qua toàn bộ danh sách option thực tế của select gốc
  Array.from(select.options).forEach((opt) => {
    if (!opt.value) return; // Bỏ qua option đầu tiên (placeholder rỗng)
    hasOptions = true;
    
    // Tạo phần tử div giả lập thay thế cho thẻ option
    const div = document.createElement("div");
    div.className = "ss-option";
    div.textContent = opt.textContent;
    div.dataset.value = opt.value;

    // Sự kiện click chọn một item giả lập:
    div.addEventListener("click", () => {
      select.value = opt.value; // Gán giá trị được chọn vào select gốc
      select.dispatchEvent(new Event("change")); // Kích hoạt sự kiện change của select gốc để các logic khác chạy theo
      
      displayText.textContent = opt.textContent; // Thay đổi text hiển thị trên thanh hiển thị
      wrapper.querySelector(".ss-display").classList.add("selected");
      wrapper.classList.remove("open"); // Đóng dropdown
      
      // Xóa class active cũ và gán active cho phần tử vừa click để đánh dấu chọn trên giao diện
      optList
        .querySelectorAll(".ss-option")
        .forEach((o) => o.classList.remove("active"));
      div.classList.add("active");
    });

    optList.appendChild(div); // Thêm phần tử giả lập vào danh sách
  });

  // Nếu select chưa được chọn hoặc select gốc trống, hiển thị trạng thái mặc định
  if (!select.value || !hasOptions) {
    displayText.textContent = "--- Chọn ---";
    wrapper.querySelector(".ss-display").classList.remove("selected");
  }
}

// filterSSOptions: Lọc danh sách tùy chọn của dropdown giả lập theo từ khóa tìm kiếm không dấu.
function filterSSOptions(optList, query) {
  // Chuẩn hóa từ khóa tìm kiếm: chuyển chữ thường, loại bỏ khoảng trắng dư, chuyển tiếng Việt có dấu về không dấu
  const q = query
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
    
  const options = optList.querySelectorAll(".ss-option");
  let visibleCount = 0; // Đếm số lượng tùy chọn khớp với kết quả tìm kiếm

  // Duyệt qua tất cả các tùy chọn để kiểm tra tính khớp
  options.forEach((opt) => {
    // Chuẩn hóa văn bản của tùy chọn giả lập sang không dấu
    const text = opt.textContent
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
      
    // Nếu từ khóa trống hoặc văn bản chứa từ khóa, hiển thị tùy chọn, ngược lại ẩn đi
    if (!q || text.includes(q)) {
      opt.style.display = "";
      visibleCount++;
    } else {
      opt.style.display = "none";
    }
  });

  // Hiển thị thông báo "Không tìm thấy kết quả" nếu số lượng khớp bằng 0
  let noResult = optList.querySelector(".ss-no-result");
  if (visibleCount === 0) {
    if (!noResult) {
      noResult = document.createElement("div");
      noResult.className = "ss-no-result";
      noResult.textContent = "Không tìm thấy kết quả";
      optList.appendChild(noResult);
    }
    noResult.style.display = "";
  } else if (noResult) {
    noResult.style.display = "none";
  }
}

// ===== SỰ KIỆN KHI TẢI TRANG =====
// Đăng ký lắng nghe sự kiện DOMContentLoaded để khởi tạo trang web
document.addEventListener("DOMContentLoaded", () => {
  // Cập nhật số lượng sản phẩm trên icon giỏ hàng header
  updateCartCount();
  // Khởi dựng và hiển thị thông tin giỏ hàng ở cột bên phải
  renderOrderSummary();

  // ===== ĐIỀN SẴN THÔNG TIN NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP =====
  // Kiểm tra sự tồn tại của UserManager và tài khoản đã đăng nhập
  if (typeof UserManager !== "undefined" && UserManager.isLoggedIn()) {
    const user = UserManager.getCurrentUser(); // Lấy thông tin user hiện tại
    const ckName = document.getElementById("ckName");
    const ckPhone = document.getElementById("ckPhone");
    const ckEmail = document.getElementById("ckEmail");
    
    // Tự động điền thông tin cá nhân vào form thanh toán để giảm thiểu thao tác nhập liệu
    if (ckName && user.displayName) ckName.value = user.displayName;
    if (ckPhone && user.phone) ckPhone.value = user.phone;
    if (ckEmail && user.email) ckEmail.value = user.email;
  }

  // Đăng ký sự kiện click áp dụng coupon giảm giá
  const btnCoupon = document.querySelector(".btn-coupon");
  if (btnCoupon) btnCoupon.addEventListener("click", applyCoupon);

  // Đăng ký sự kiện phím bấm Enter trong ô nhập mã giảm giá
  const couponInput = document.getElementById("couponCode");
  if (couponInput) {
    couponInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") applyCoupon();
    });
  }

  // Đăng ký sự kiện chọn phương thức thanh toán (COD / Banking) cho các phần tử DOM
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const method = opt.dataset.method;
      selectPayment(method);
    });
  });

  // Đăng ký sự kiện chọn hình thức nhận hàng (Giao hàng / Tại quán)
  document.querySelectorAll(".shipping-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const method = opt.dataset.method;
      selectShipping(method);
    });
  });

  // Khởi tạo các trạng thái mặc định của trang thanh toán ban đầu:
  selectShipping("delivery"); // Giao hàng tận nơi mặc định
  selectPayment("cod"); // Thanh toán tiền mặt COD mặc định
  initPoints(); // Khởi tạo ví điểm tích lũy thành viên

  // Kích hoạt tính năng tìm kiếm giả lập cho các thẻ select Tỉnh/Thành phố và Phường/Xã
  makeSearchable("ckCity");
  makeSearchable("ckWard");

  // Thiết lập sự kiện change khu vực chi nhánh để cập nhật lại danh sách chi nhánh tương ứng
  const branchCity = document.getElementById("branchCity");
  if (branchCity) {
    branchCity.addEventListener("change", () => {
      renderBranches(branchCity.value);
    });
  }

  // Tự động tích chọn chi nhánh cửa hàng trên form nếu trước đó khách hàng đã chọn một chi nhánh cụ thể từ menu:
  const menuSelectedBranchId = localStorage.getItem("gibor_selected_menu_branch") || "all";
  if (menuSelectedBranchId !== "all" && typeof window.GIBOR_BRANCH_UTILS !== "undefined") {
    const activeBranch = window.GIBOR_BRANCH_UTILS.getById(menuSelectedBranchId);
    if (activeBranch && branchCity) {
      // Thiết lập thành phố/khu vực tương ứng
      branchCity.value = activeBranch.cityCode;
      // Khởi tạo hiển thị danh sách các chi nhánh của khu vực đó
      renderBranches(activeBranch.cityCode);
      // Tích sẵn chọn chi nhánh cụ thể này
      selectBranch(activeBranch.id, activeBranch.cityCode);
    }
  }

  // Thiết lập sự kiện change của Tỉnh/Thành phố để cập nhật lại các Phường/Xã tương ứng
  const citySelect = document.getElementById("ckCity");
  if (citySelect) {
    citySelect.addEventListener("change", updateWards);
  }

  // Đăng ký sự kiện click cho nút Đặt hàng
  const btnPlace = document.getElementById("btnPlaceOrder");
  if (btnPlace) btnPlace.addEventListener("click", placeOrder);

  // Đăng ký sự kiện click bên ngoài khung popup thành công để đóng popup
  const overlay = document.getElementById("successOverlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeSuccess();
    });
  }
});

/*
========================================================================================

                            KẾT THÚC CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/

/*
========================================================================================

                            BẮT ĐẦU CODE BỞI TRẦN GIA BẢO

========================================================================================
*/

var payosSyncTimeout = null;
var payosSyncInterval = null;
var currentPayosPayment = null;
var payosPaymentSuccess = false; // Biến đánh dấu đã thanh toán thành công qua payOS

// Ghi chú: Hàm getPayosConfig, createHmacSha256Hex và createPayosSignature đã bị loại bỏ vì các thao tác xử lý bảo mật/tạo chữ ký thanh toán payOS đã được chuyển hoàn toàn lên phía máy chủ (/api/create-payos-payment) để đảm bảo không rò rỉ API Keys/Checksum Keys.

// getCurrentCheckoutAmount: Lấy số tiền thanh toán cuối cùng của đơn hàng từ giao diện.
function getCurrentCheckoutAmount() {
  const totalEl = document.getElementById("grandTotal");
  const totalText = totalEl ? totalEl.innerText : "0";
  return parseInt(totalText.replace(/[^0-9]/g, "") || "0", 10);
}

// buildPayosOrderCode: Tạo mã đơn hàng số ngẫu nhiên phục vụ cho payOS.
function buildPayosOrderCode() {
  return Number(String(Date.now()).slice(-9));
}

// buildReturnUrl: Xây dựng URL trả về sau khi hoàn tất hoặc hủy thanh toán payOS.
function buildReturnUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("payos", "return");
  return url.toString();
}


// createPayosPaymentRequest: Tạo yêu cầu thanh toán payOS thông qua serverless API hoặc chế độ giả lập.
async function createPayosPaymentRequest(amount) {
  // Lấy cấu hình công khai
  const branchId = selectedBranch ? selectedBranch.id : "";
  const suffix = branchId ? '_' + branchId : '';
  const enabled = localStorage.getItem("gibor_payos_enabled" + suffix) || localStorage.getItem("gibor_payos_enabled") || "false";
  const mockMode = localStorage.getItem("gibor_payos_mock_mode" + suffix) || localStorage.getItem("gibor_payos_mock_mode") || "false";

  const orderCode = buildPayosOrderCode();
  const description = `GIBOR${orderCode}`;
  const returnUrl = buildReturnUrl();
  const cancelUrl = buildReturnUrl();

  if (mockMode === "true") {
    console.log("⚡ payOS Mock Mode is enabled. Simulating payment link creation.");
    return {
      provider: "payos",
      orderCode,
      description,
      amount,
      paymentLinkId: `mock-${orderCode}`,
      checkoutUrl: buildReturnUrl() + `&mockOrderCode=${orderCode}`,
      qrCode: `mock-qr-${orderCode}`,
      isMock: true
    };
  }

  // Gửi yêu cầu đến Serverless API /api/create-payos-payment
  const response = await fetch("/api/create-payos-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
      items: getCart().map((item) => ({
        name: String(item.name || "GIBOR item").slice(0, 50),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),
    }),
  });

  const result = await response.json();

  if (!response.ok || result.code !== "00" || !result.data) {
    throw new Error(result.message || result.desc || "Không tạo được link thanh toán payOS qua backend.");
  }

  return {
    provider: "payos",
    orderCode: result.data.orderCode || "",
    description: result.data.description || "",
    amount,
    paymentLinkId: result.data.paymentLinkId || "",
    checkoutUrl: result.data.checkoutUrl || "",
    qrCode: result.data.qrCode || "",
  };
}

// fetchPayosPaymentStatus: Lấy trạng thái giao dịch thanh toán payOS từ máy chủ.
async function fetchPayosPaymentStatus(payment) {
  if (!payment || !payment.orderCode) return null;

  if (payment.isMock) {
    // Mock thanh toán tự động thành công sau một khoảng thời gian
    return {
      data: { status: "PAID", amountPaid: payment.amount },
      isPaid: true,
      status: "Đang xử lý",
      paymentStatus: "Đã thanh toán",
    };
  }

  // Gọi Serverless API /api/get-payos-payment
  const response = await fetch(`/api/get-payos-payment?orderCode=${encodeURIComponent(payment.orderCode)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const result = await response.json().catch(() => null);
  if (!result || result.code !== "00" || !result.data) return null;

  const code = String(result.data.code || "").toUpperCase();
  const status = String(result.data.status || "").toUpperCase();
  const paidAmount = Number(result.data.amountPaid || 0);
  const expectedAmount = Number(result.data.amount || payment.amount || 0);
  const isPaid = code === "00" || status === "PAID" || (expectedAmount > 0 && paidAmount >= expectedAmount);

  return {
    data: result.data,
    isPaid,
    status: isPaid ? "Đang xử lý" : "Chờ thanh toán",
    paymentStatus: isPaid ? "Đã thanh toán" : "Chưa thanh toán",
  };
}

// getQrImageUrl: Tạo hoặc lấy đường dẫn ảnh QR thanh toán từ thông tin giao dịch.
function getQrImageUrl(payment) {
  if (payment.qrCode) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payment.qrCode)}`;
  }
  return payment.qrImageUrl || "";
}

// playSuccessSound: Phát âm thanh báo hiệu khi giao dịch thanh toán thành công.
function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    oscillator.start();
    
    setTimeout(() => {
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    }, 120);
    setTimeout(() => {
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
    }, 240);

    setTimeout(() => {
      oscillator.stop();
    }, 400);
  } catch (e) {
    console.log("Audio API not supported or blocked:", e);
  }
}

/*
========================================================================================

                            KẾT THÚC CODE BỞI TRẦN GIA BẢO

========================================================================================
*/
