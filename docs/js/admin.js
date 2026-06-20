/* 
========================================================================================

                                    CODE BỞI NGUYỄN HOÀNG BẢO

========================================================================================
*/

// Bắt lỗi toàn cục để hiển thị trực tiếp lên giao diện giúp chẩn đoán từ xa cực nhanh
window.addEventListener("error", function (event) {
  const errorDiv = document.createElement("div");
  errorDiv.style.position = "fixed";
  errorDiv.style.bottom = "20px";
  errorDiv.style.right = "20px";
  errorDiv.style.backgroundColor = "#ffdddd";
  errorDiv.style.color = "#990000";
  errorDiv.style.padding = "15px";
  errorDiv.style.border = "2px solid #990000";
  errorDiv.style.borderRadius = "8px";
  errorDiv.style.zIndex = "99999";
  errorDiv.style.maxWidth = "400px";
  errorDiv.style.fontFamily = "monospace";
  errorDiv.style.fontSize = "12px";
  errorDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  errorDiv.innerHTML = `<strong>Lỗi JS phát sinh:</strong><br>${event.message}<br>tại ${event.filename ? event.filename.split('/').pop() : 'inline'}:${event.lineno}:${event.colno}`;
  document.body.appendChild(errorDiv);
});

// Không khai báo lại ADMIN_PRODUCTS_KEY vì đã có trong data.js
// Dùng biến cục bộ cho các key khác
var _ORDERS_KEY = "gibor_orders";
var _USERS_KEY = "gibor_users";

// Pagination state variables
var paginationState = {
  accounts: { currentPage: 1, pageSize: 10 },
  products: { currentPage: 1, pageSize: 10 },
  orders: { currentPage: 1, pageSize: 10 },
  branches: { currentPage: 1, pageSize: 10 },
  customers: { currentPage: 1, pageSize: 10 }
};

function showToast(message, type = "info") {
  const container = document.getElementById("gibor-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `gibor-toast ${type}`;

  let iconClass = "fa-info-circle";
  let title = "Thông báo";
  if (type === "success") {
    iconClass = "fa-check-circle";
    title = "Thành công";
  } else if (type === "error") {
    iconClass = "fa-times-circle";
    title = "Lỗi";
  } else if (type === "warning") {
    iconClass = "fa-exclamation-triangle";
    title = "Cảnh báo";
  }

  toast.innerHTML = `
    <i class="fas ${iconClass} gibor-toast-icon"></i>
    <div class="gibor-toast-body">
      <div class="gibor-toast-title">${title}</div>
      <div class="gibor-toast-message">${message}</div>
    </div>
    <button class="gibor-toast-close">&times;</button>
    <div class="gibor-toast-progress"></div>
  `;

  container.appendChild(toast);

  // Close button functionality
  const closeBtn = toast.querySelector(".gibor-toast-close");
  closeBtn.addEventListener("click", () => {
    removeToast(toast);
  });

  // Auto remove after 3.5s
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, 3500);

  function removeToast(el) {
    if (el.classList.contains("removing")) return;
    el.classList.add("removing");
    clearTimeout(timeoutId);
    el.addEventListener("animationend", () => {
      el.remove();
    });
  }
}

function renderPagination(containerId, totalItems, currentPage, pageSize, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  let html = `
    <div class="admin-pagination-info">
      Hiển thị ${startItem}-${endItem} / ${totalItems} mục
    </div>
    <div class="admin-pagination-controls">
  `;

  // Previous button
  html += `
    <button ${currentPage === 1 ? "disabled" : ""} onclick="window.handlePageChange('${containerId}', ${currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    html += `<button onclick="window.handlePageChange('${containerId}', 1)">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="${i === currentPage ? "active" : ""}" onclick="window.handlePageChange('${containerId}', ${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button onclick="window.handlePageChange('${containerId}', ${totalPages})">${totalPages}</button>`;
  }

  // Next button
  html += `
    <button ${currentPage === totalPages ? "disabled" : ""} onclick="window.handlePageChange('${containerId}', ${currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  html += `</div>`;
  container.innerHTML = html;
}

// Global page change handler
window.handlePageChange = function (containerId, newPage) {
  const key = containerId.replace("Pagination", "");
  if (paginationState[key]) {
    paginationState[key].currentPage = newPage;
    
    // Trigger corresponding render function
    if (key === "accounts") renderAccounts();
    else if (key === "products") renderProducts();
    else if (key === "orders") renderOrders();
    else if (key === "branches") renderBranches();
    else if (key === "customers") renderCustomers();
  }
};

function resetPageAndRender(key, renderFn) {
  if (paginationState[key]) {
    paginationState[key].currentPage = 1;
  }
  renderFn();
}

function parseJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getProducts() {
  if (typeof ProductManager !== "undefined") {
    return ProductManager.getProducts();
  }
  const products = parseJSON(ADMIN_PRODUCTS_KEY, []);
  return products;
}

function saveProducts(products) {
  // Kiểm tra xem đối tượng ProductManager (từ data.js của Trần Gia Bảo) có tồn tại và khả dụng không
  if (typeof ProductManager !== "undefined") {
    // Nếu có, ủy thác việc lưu danh sách sản phẩm cho ProductManager xử lý
    ProductManager.saveProducts(products);
    return;
  }
  // Nếu không có ProductManager, ghi trực tiếp chuỗi JSON của danh sách sản phẩm vào LocalStorage
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
}

/**
 * Lấy danh sách toàn bộ người dùng trong hệ thống.
 * Hàm này hoạt động như một lớp trung gian (Wrapper API), ưu tiên gọi UserManager từ data.js của Trần Gia Bảo
 * để đảm bảo tính nhất quán của dữ liệu người dùng trên toàn hệ thống.
 * 
 * @returns {Array<Object>} Danh sách đối tượng người dùng, hoặc mảng rỗng nếu không tìm thấy.
 */
function getUsers() {
  // Nếu UserManager (thuộc phần code của Trần Gia Bảo) đã được tải, ưu tiên lấy dữ liệu từ đây
  if (typeof UserManager !== "undefined") return UserManager.getUsers();
  
  // Phương thức dự phòng: Đọc trực tiếp từ LocalStorage qua khóa _USERS_KEY và phân tách từ JSON
  return parseJSON(_USERS_KEY, []);
}

/**
 * Lưu trữ danh sách người dùng vào bộ nhớ.
 * Đồng bộ hóa dữ liệu thông qua UserManager nếu có, hoặc ghi đè trực tiếp xuống LocalStorage.
 * 
 * @param {Array<Object>} users - Danh sách người dùng cần lưu trữ.
 */
function saveUsers(users) {
  // Nếu UserManager khả dụng, sử dụng cơ chế lưu trữ chuẩn của UserManager (có cập nhật bộ nhớ cache/state)
  if (typeof UserManager !== "undefined") {
    UserManager.saveUsers(users);
    return;
  }
  
  // Phương thức dự phòng: Ghi đè trực tiếp vào LocalStorage dưới dạng chuỗi JSON
  localStorage.setItem(_USERS_KEY, JSON.stringify(users));
}

/**
 * Lấy thông tin tài khoản admin/quản lý hiện tại đang đăng nhập.
 * 
 * @returns {Object|null} Đối tượng người dùng hiện tại hoặc null nếu chưa đăng nhập.
 */
function getCurrentAdminUser() {
  // Ưu tiên truy xuất thông tin phiên đăng nhập hiện tại thông qua UserManager của Trần Gia Bảo
  if (typeof UserManager !== "undefined") return UserManager.getCurrentUser();
  
  // Phương thức dự phòng: Đọc trực tiếp trạng thái phiên đăng nhập từ LocalStorage với key "gibor_current_user"
  return parseJSON("gibor_current_user", null);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function isProtectedAdminUser(user) {
  return user && (String(user.id) === "admin-001" || String(user.username || "").toLowerCase() === "admin");
}

function isEmailUsedByAnotherUser(users, email, userId = "") {
  const normalizedEmail = normalizeText(email).toLowerCase();
  return users.some((user) => user && String(user.id) !== String(userId) && String(user.email || "").toLowerCase() === normalizedEmail);
}

/**
 * Lấy danh sách tất cả các đơn hàng từ bộ nhớ và tiến hành làm sạch dữ liệu rác.
 * 
 * @returns {Array<Object>} Danh sách đơn hàng hợp lệ đã được lọc bỏ phần tử null/undefined.
 */
function getOrders() {
  // Đọc dữ liệu chuỗi JSON từ LocalStorage dựa trên khóa đơn hàng
  const orders = parseJSON(_ORDERS_KEY, []);
  
  // Đảm bảo dữ liệu trả về luôn là một mảng và loại bỏ các phần tử lỗi (null hoặc undefined)
  return (Array.isArray(orders) ? orders : []).filter(o => o !== null && o !== undefined);
}

/**
 * Lưu danh sách đơn hàng xuống bộ nhớ cục bộ và đồng bộ lên Firebase Realtime Database.
 * Giúp đảm bảo dữ liệu đơn hàng luôn được cập nhật tức thời ở cả client và máy chủ đám mây Firebase.
 * 
 * @param {Array<Object>} orders - Danh sách đơn hàng cần lưu trữ.
 */
function saveOrders(orders) {
  // Ghi danh sách đơn hàng xuống LocalStorage của trình duyệt
  localStorage.setItem(_ORDERS_KEY, JSON.stringify(orders));
  
  // Kiểm tra xem Firebase SDK có được tích hợp và Database có khả dụng trên trang quản trị không
  if (typeof firebase !== 'undefined' && firebase.database) {
    try {
      // Thực hiện đồng bộ trực tiếp mảng đơn hàng lên node 'orders' trên Firebase Realtime Database
      firebase.database().ref('orders').set(orders);
    } catch (e) {
      // Ghi nhận lỗi console nếu quá trình đồng bộ lên đám mây gặp sự cố (như mất kết nối, sai quyền truy cập)
      console.error("Lỗi đồng bộ orders lên Firebase từ Admin:", e);
    }
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}



function getInitials(user) {
  const name = user.displayName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.email || "A";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getOrderTotal(order) {
  return Number(order.total || order.grandTotal || order.subtotal || 0);
}

function getOrderDate(order) {
  return order.createdAt || order.date || order.orderDate || new Date().toISOString();
}

function getOrderItemsText(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) return "Chưa có chi tiết";
  return items
    .slice(0, 3)
    .map((item) => {
      const qty = Number(item.quantity || item.qty || 1);
      return `${item.name || "Sản phẩm"} x${qty}`;
    })
    .join(", ");
}

/**
 * Lấy dữ liệu doanh thu của các đơn hàng đã "Hoàn tất" theo từng ngày.
 * 
 * Nghiệp vụ: Lọc các đơn hàng hoàn tất trong khoảng thời gian nhất định (mặc định là 7 ngày).
 * Hỗ trợ lọc theo chi nhánh để người quản lý chi nhánh chỉ xem được doanh thu của cơ sở mình.
 * 
 * @param {number} [days=7] - Số ngày muốn thống kê doanh thu ngược về trước.
 * @param {string} [branchId=""] - ID của chi nhánh cần thống kê (để trống nếu muốn xem toàn hệ thống).
 * @returns {Array<{key: string, label: string, value: number}>} Danh sách doanh thu theo ngày.
 */
function getRevenueByDay(days = 7, branchId = "") {
  // Lấy danh sách toàn bộ đơn hàng hợp lệ đã được làm sạch dữ liệu rác
  const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
  // Khởi tạo đối tượng ngày hiện tại để làm mốc thời gian đối chiếu
  const today = new Date();
  // Khởi tạo mảng chứa danh sách các nhãn ngày (labels) phục vụ vẽ biểu đồ
  const labels = [];

  // Tạo sẵn danh sách các ngày trong khoảng thời gian thống kê (mặc định là 7 ngày gần nhất)
  for (let index = days - 1; index >= 0; index--) {
    const date = new Date(today);
    // Tính toán lùi ngày tương ứng với chỉ số index
    date.setDate(today.getDate() - index);
    // Trích xuất chuỗi định dạng YYYY-MM-DD để làm khóa (key) so khớp đơn hàng
    const key = date.toISOString().slice(0, 10);
    // Thêm ngày vừa tạo vào danh sách nhãn thống kê với giá trị doanh thu ban đầu bằng 0
    labels.push({
      key,
      // Định dạng hiển thị ngày/tháng tiếng Việt (DD/MM) cho trục biểu đồ
      label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      value: 0,
    });
  }

  // Duyệt qua từng đơn hàng để cộng dồn doanh thu vào ngày tương ứng
  orders.forEach((order) => {
    // Nếu đơn hàng không hợp lệ, bỏ qua
    if (!order) return;
    // Nghiệp vụ: Chỉ tính doanh thu từ những đơn hàng đã hoàn tất giao dịch
    if (order.status !== "Hoàn tất") return;

    // Phân quyền & Lọc chi nhánh: Nếu lọc theo chi nhánh xác định, bỏ qua đơn hàng thuộc chi nhánh khác
    if (branchId && (!order.branch || order.branch.id !== branchId)) return;

    // Lấy thông tin thời gian tạo đơn hàng thông qua hàm bổ trợ getOrderDate (từ data.js của Trần Gia Bảo)
    const date = new Date(getOrderDate(order));
    // Nếu ngày tạo đơn không hợp lệ, bỏ qua
    if (Number.isNaN(date.getTime())) return;
    
    // Trích xuất khóa YYYY-MM-DD từ ngày tạo đơn hàng để khớp với nhãn tương ứng
    const key = date.toISOString().slice(0, 10);
    // Tìm nhãn ngày trùng khớp trong danh sách labels đã chuẩn bị sẵn
    const target = labels.find((item) => item.key === key);
    // Nếu tìm thấy nhãn trùng khớp, cộng dồn tổng tiền đơn hàng (getOrderTotal) vào doanh thu ngày đó
    if (target) target.value += getOrderTotal(order);
  });

  // Trả về danh sách doanh thu theo ngày phục vụ việc vẽ biểu đồ cột
  return labels;
}

/**
 * Vẽ biểu đồ cột biểu thị doanh thu của 7 ngày gần nhất lên giao diện Admin.
 * 
 * Nghiệp vụ: Tính toán tỉ lệ chiều cao cột dựa trên doanh thu lớn nhất (max) của kỳ báo cáo,
 * giúp giao diện hiển thị biểu đồ trực quan, co giãn tự động và thân thiện với người dùng.
 * 
 * @param {string} targetId - ID của phần tử DOM chứa biểu đồ.
 * @param {string} [branchId=""] - ID của chi nhánh cần vẽ biểu đồ (để trống nếu tính toàn hệ thống).
 */
function renderRevenueBars(targetId, branchId = "") {
  const target = document.getElementById(targetId);
  if (!target) return;

  const data = getRevenueByDay(7, branchId);
  const max = Math.max(...data.map((item) => item.value), 1);

  target.innerHTML = data
    .map((item) => {
      const height = Math.max(14, Math.round((item.value / max) * 210));
      return `
        <div class="revenue-bar-item">
          <div class="revenue-bar" style="height:${height}px" title="${formatMoney(item.value)}"></div>
          <div class="revenue-bar-label">
            <span>${item.label}</span>
            <span>${formatMoney(item.value)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDashboard() {
  try {
    // Lấy danh sách người dùng thông qua wrapper getUsers (sử dụng UserManager)
    const users = getUsers() || [];
    // Lấy danh sách sản phẩm thông qua wrapper getProducts (sử dụng ProductManager)
    const products = getProducts() || [];
    // Lấy danh sách tất cả các đơn hàng đã được lọc sạch phần tử lỗi
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    
    // Khởi động biến lưu ID chi nhánh cần lọc doanh thu và thông tin
    let activeBranchId = "";
    // Truy xuất thông tin người dùng hiện tại thông qua đối tượng UserManager của Trần Gia Bảo
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    
    // Cơ chế phân quyền hiển thị số liệu Dashboard:
    if (currentUser) {
      // Nếu là Quản lý chi nhánh (branch_manager), chỉ được xem số liệu thuộc chi nhánh của mình
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } 
      // Nếu là Admin tối cao, mặc định xem tất cả, hoặc lọc theo lựa chọn trên giao diện bộ lọc chi nhánh
      else if (currentUser.role === "admin") {
        const dbBranchFilter = document.getElementById("dashboardBranchFilter");
        if (dbBranchFilter && dbBranchFilter.value !== "all") {
          activeBranchId = dbBranchFilter.value;
        }
      }
    }

    // Tiến hành lọc đơn hàng dựa trên ID chi nhánh đã xác định ở trên
    const filteredOrders = activeBranchId 
      ? orders.filter(o => o && o.branch && o.branch.id === activeBranchId)
      : orders;

    // Lọc ra các đơn hàng đã hoàn tất giao dịch để tính toán doanh thu
    const completedOrders = filteredOrders.filter(o => o && o.status === "Hoàn tất");
    // Tính tổng doanh thu bằng cách duyệt qua các đơn hàng hoàn tất và cộng dồn số tiền (qua helper getOrderTotal)
    const revenue = completedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    // Lấy các thẻ HTML hiển thị thông số thống kê tổng quan
    const statUsers = document.getElementById("statUsers");
    const statProducts = document.getElementById("statProducts");
    const statOrders = document.getElementById("statOrders");
    const statRevenue = document.getElementById("statRevenue");

    // Hiển thị số lượng người dùng, sản phẩm, đơn hàng và tổng doanh thu định dạng tiền tệ Việt Nam
    if (statUsers) statUsers.textContent = users.length;
    if (statProducts) statProducts.textContent = products.length;
    if (statOrders) statOrders.textContent = filteredOrders.length;
    if (statRevenue) statRevenue.textContent = formatMoney(revenue);

    // Xử lý hiển thị danh sách 5 đơn hàng mới nhất trên bảng Dashboard
    const recentTable = document.getElementById("recentOrdersTable");
    if (recentTable) {
      // Sao chép mảng đơn hàng đã lọc và sắp xếp giảm dần theo thời gian tạo (sử dụng getOrderDate của Gia Bảo)
      const recentOrders = [...filteredOrders]
        .sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)))
        .slice(0, 5); // Chỉ lấy 5 đơn hàng đầu tiên sau khi sắp xếp
 
      recentTable.innerHTML = recentOrders.length
        ? recentOrders
            .map(
              (order) => {
                const status = order.status || "Đã ghi nhận";
                let statusClass = "bg-secondary";
                if (status === "Hoàn tất") statusClass = "bg-success";
                else if (status === "Đang xử lý" || status === "Đang giao") statusClass = "bg-info text-dark";
                else if (status === "Đã hủy") statusClass = "bg-danger";
                else if (status === "Chờ thanh toán") statusClass = "bg-warning text-dark";
                else if (status === "Đã ghi nhận") statusClass = "bg-primary";

                return `
                  <tr>
                    <td><strong>${escapeHTML(order.code || order.id || "GIBOR")}</strong></td>
                    <td>${escapeHTML(order.userName || order.customerName || "Khách hàng")}</td>
                    <td>${formatMoney(getOrderTotal(order))}</td>
                    <td><span class="badge ${statusClass}">${escapeHTML(status)}</span></td>
                  </tr>
                `;
              }
            )
            .join("")
        : `<tr><td class="text-center text-muted py-3" colspan="4">Chưa có đơn hàng nào.</td></tr>`;
    }

    renderRevenueBars("dashboardRevenueBars", activeBranchId);
  } catch (error) {
    console.error("Error rendering dashboard:", error);
  }
}

function getBranchNameById(branchId) {
  if (!branchId || typeof window.GIBOR_BRANCH_UTILS === 'undefined') return "Chi nhánh";
  const b = window.GIBOR_BRANCH_UTILS.getById(branchId);
  return b ? b.name : "Chi nhánh";
}

function renderAccounts() {
  try {
    const table = document.getElementById("accountsTable");
    if (!table) return;

    let users = (getUsers() || []).filter(u => u !== null && u !== undefined);

    // Áp dụng bộ lọc tìm kiếm
    const searchQuery = document.getElementById("searchAccount") ? document.getElementById("searchAccount").value.toLowerCase().trim() : "";
    const filterRole = document.getElementById("filterAccountRole") ? document.getElementById("filterAccountRole").value : "";
    const filterStat = document.getElementById("filterAccountStatus") ? document.getElementById("filterAccountStatus").value : "";

    if (searchQuery) {
      users = users.filter(u => {
        if (!u) return false;
        const name = (u.displayName || `${u.lastName || ""} ${u.firstName || ""}`).toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        return name.includes(searchQuery) || email.includes(searchQuery) || phone.includes(searchQuery) || username.includes(searchQuery);
      });
    }
    if (filterRole) {
      if (filterRole === "user") {
        users = users.filter(u => u && (u.role === "user" || u.role === "customer" || !u.role || (u.role !== "admin" && u.role !== "branch_manager")));
      } else {
        users = users.filter(u => u && u.role === filterRole);
      }
    }
    if (filterStat) {
      users = users.filter(u => u && u.status === filterStat);
    }

    // Phân trang
    const totalItems = users.length;
    const state = paginationState.accounts;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedUsers = users.slice(startIndex, endIndex);

    table.innerHTML = paginatedUsers.length
      ? paginatedUsers
          .map(
            (user) => {
              if (!user) return "";
              
              let roleBadge = '<span class="badge bg-secondary">Khách hàng</span>';
              if (user.role === 'admin') {
                roleBadge = '<span class="badge bg-dark">Quản trị viên</span>';
              } else if (user.role === 'branch_manager') {
                roleBadge = `<span class="badge bg-warning text-dark">Quản lý: ${escapeHTML(getBranchNameById(user.branchId))}</span>`;
              }

              return `
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <span class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-bold rounded-circle" style="width: 38px; height: 38px; font-size: 0.85rem;">${escapeHTML(getInitials(user))}</span>
                      <div>
                        <strong class="text-dark">${escapeHTML(user.displayName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || "Người dùng")}</strong>
                        <div class="mt-1 d-flex gap-1 flex-wrap">
                          ${roleBadge}
                          ${user.status === 'locked' ? '<span class="badge bg-danger">Bị khóa</span>' : '<span class="badge bg-success">Hoạt động</span>'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>${escapeHTML(user.email || "-")}</td>
                  <td>${escapeHTML(user.phone || "-")}</td>
                  <td>${formatDate(user.createdAt)}</td>
                  <td>
                    <div class="d-flex gap-1 justify-content-end">
                      <button class="btn btn-sm btn-outline-primary" data-edit-user="${escapeHTML(user.id)}" title="Chỉnh sửa">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-warning" data-lock-user="${escapeHTML(user.id)}" title="Khóa/Mở khóa">
                        <i class="fas ${user.status === 'locked' ? 'fa-lock' : 'fa-unlock'}"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" data-reset-password-user="${escapeHTML(user.id)}" title="Đặt lại mật khẩu">
                        <i class="fa-solid fa-key"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" data-delete-user="${escapeHTML(user.id)}" title="Xóa tài khoản">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="5">Không tìm thấy tài khoản phù hợp.</td></tr>`;

    renderPagination("accountsPagination", totalItems, state.currentPage, state.pageSize);
  } catch (error) {
    console.error("Error rendering accounts:", error);
  }
}

function renderProducts() {
  try {
    const table = document.getElementById("productsTable");
    if (!table) return;

    // Sử dụng đối tượng UserManager của Trần Gia Bảo để truy xuất thông tin phiên đăng nhập của người dùng hiện tại
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    // Kiểm tra xem người dùng hiện tại có vai trò là Quản lý chi nhánh hay không (phục vụ phân quyền chức năng sản phẩm)
    const isBranchManager = currentUser && currentUser.role === "branch_manager";

    let products = (getProducts() || []).filter(p => p !== null && p !== undefined && p.status !== "deleted" && p.isDeleted !== true);

    // Áp dụng bộ lọc tìm kiếm
    const searchQuery = document.getElementById("searchProduct") ? document.getElementById("searchProduct").value.toLowerCase().trim() : "";
    const filterCat = document.getElementById("filterProductCategory") ? document.getElementById("filterProductCategory").value : "";
    const filterStat = document.getElementById("filterProductStatus") ? document.getElementById("filterProductStatus").value : "";

    if (searchQuery) {
      products = products.filter(p => {
        if (!p) return false;
        const name = (p.name || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();
        return name.includes(searchQuery) || desc.includes(searchQuery);
      });
    }
    if (filterCat) {
      products = products.filter(p => p && p.category === filterCat);
    }
    if (filterStat) {
      products = products.filter(p => {
        if (!p) return false;
        if (filterStat === "active") return p.status !== "out_of_stock";
        if (filterStat === "out_of_stock") return p.status === "out_of_stock";
        return true;
      });
    }

    // Phân trang
    const totalItems = products.length;
    const state = paginationState.products;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    table.innerHTML = paginatedProducts.length
      ? paginatedProducts
          .map(
            (product) => {
              if (!product) return "";
              return `
                <tr>
                  <td>
                    <img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.name)}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);" onerror="this.src='images/logo/logo.jpg'" />
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--gibor-primary-text);">${escapeHTML(product.name)}</div>
                    ${product.desc ? `<div style="font-size: 0.8rem; color: var(--gibor-muted-text); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(product.desc)}">${escapeHTML(product.desc)}</div>` : ''}
                  </td>
                  <td><span class="badge bg-info text-dark">${escapeHTML(product.category)}</span></td>
                  <td>
                    <strong style="color: var(--gibor-secondary-text);">${formatMoney(product.price)}</strong>
                  </td>
                  <td>
                    ${
                      isBranchManager
                        ? `
                        <select class="form-select form-select-sm admin-status-select" 
                                data-update-product-status="${escapeHTML(product.id)}" 
                                style="width: auto; min-height: unset; padding: 4px 8px; font-size: 0.78rem; font-weight: 700; ${product.status === "out_of_stock" ? "color: #c94c40; border-color: rgba(201, 76, 64, 0.3);" : "color: #39703c; border-color: rgba(57, 112, 60, 0.3);" }">
                          <option value="active" ${product.status !== "out_of_stock" ? "selected" : ""}>Còn hàng</option>
                          <option value="out_of_stock" ${product.status === "out_of_stock" ? "selected" : ""}>Hết hàng</option>
                        </select>
                      `
                        : `
                        ${product.status === "out_of_stock" 
                          ? '<span class="badge bg-danger">Hết hàng</span>' 
                          : '<span class="badge bg-success">Còn hàng</span>'
                        }
                      `
                    }
                    ${
                      isBranchManager
                        ? `
                        <div class="form-check form-switch d-inline-flex align-items-center ms-2" style="min-height: unset; margin: 0; padding-top: 4px;">
                          <input class="form-check-input" type="checkbox" role="switch" 
                                 id="switchBestSeller-${escapeHTML(product.id)}"
                                 data-update-product-bestseller="${escapeHTML(product.id)}"
                                 ${product.isBestSeller ? "checked" : ""} 
                                 style="cursor: pointer; width: 1.8em; height: 1em;">
                          <label class="form-check-label small fw-bold ms-1" for="switchBestSeller-${escapeHTML(product.id)}" style="font-size: 0.72rem; color: #856404; cursor: pointer;">
                            <i class="fa-solid fa-fire text-danger"></i> Nổi bật
                          </label>
                        </div>
                      `
                        : `
                        ${product.isBestSeller ? '<span class="badge bg-warning text-dark ms-1"><i class="fa-solid fa-fire text-danger"></i> Nổi bật</span>' : ''}
                      `
                    }
                  </td>
                  <td>
                    <div class="d-flex gap-1 justify-content-end">
                      ${
                        isBranchManager
                          ? `
                          <span class="text-muted small italic">Chỉ cập nhật trạng thái</span>
                        `
                          : `
                          <button class="btn btn-sm btn-outline-primary" data-edit-product="${escapeHTML(product.id)}" title="Sửa">
                            <i class="fa-solid fa-pen"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" data-delete-product="${escapeHTML(product.id)}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        `
                      }
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="6">Không có sản phẩm nào.</td></tr>`;

    renderPagination("productsPagination", totalItems, state.currentPage, state.pageSize);

    const statProducts = document.getElementById("statProducts");
    if (statProducts) {
      statProducts.textContent = totalItems;
    }
  } catch (error) {
    console.error("Error rendering products:", error);
  }
}

function renderOrders() {
  try {
    const table = document.getElementById("ordersTable");
    if (!table) return;

    let orders = (getOrders() || []).filter(o => o !== null && o !== undefined);

    // Sắp xếp các đơn hàng theo thời gian mới nhất (createdAt giảm dần)
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    // Phân quyền quản lý đơn hàng theo chi nhánh:
    let activeBranchId = "";
    // Sử dụng UserManager của Trần Gia Bảo để lấy thông tin phiên làm việc hiện tại của tài khoản đang đăng nhập
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    if (currentUser) {
      // Nếu là Quản lý chi nhánh (branch_manager), chỉ được thấy và xử lý các đơn hàng của chi nhánh đó
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } 
      // Nếu là Admin tối cao, có quyền chọn lọc chi nhánh thông qua bộ lọc trên giao diện
      else if (currentUser.role === "admin") {
        const branchFilter = document.getElementById("filterOrderBranch");
        if (branchFilter && branchFilter.value) {
          activeBranchId = branchFilter.value;
        }
      }
    }

    if (activeBranchId) {
      orders = orders.filter(o => o && o.branch && o.branch.id === activeBranchId);
    }

    // 1. Tính toán số lượng đơn hàng cho các Badges trước khi áp dụng bộ lọc trạng thái của riêng tab này
    const countAll = orders.length;
    const countPending = orders.filter(o => o && (o.status || "Đã ghi nhận") === "Chờ thanh toán").length;
    const countProcessing = orders.filter(o => o && ["Đã ghi nhận", "Đang xử lý", "Đang giao"].includes(o.status || "Đã ghi nhận")).length;
    const countCompleted = orders.filter(o => o && (o.status || "Hoàn tất") === "Hoàn tất").length;
    const countCancelled = orders.filter(o => o && (o.status || "Đã hủy") === "Đã hủy").length;

    // Cập nhật số lượng lên Badges HTML nếu tồn tại
    if (document.getElementById("badge-count-all")) document.getElementById("badge-count-all").textContent = countAll;
    if (document.getElementById("badge-count-pending")) document.getElementById("badge-count-pending").textContent = countPending;
    if (document.getElementById("badge-count-processing")) document.getElementById("badge-count-processing").textContent = countProcessing;
    if (document.getElementById("badge-count-completed")) document.getElementById("badge-count-completed").textContent = countCompleted;
    if (document.getElementById("badge-count-cancelled")) document.getElementById("badge-count-cancelled").textContent = countCancelled;

    // Áp dụng bộ lọc tìm kiếm
    const searchQuery = document.getElementById("searchOrder") ? document.getElementById("searchOrder").value.toLowerCase().trim() : "";
    
    // Lọc theo nút tab trạng thái nghiệp vụ nhanh đang active (nếu có)
    const activeQuickTab = document.querySelector(".btn-quick-filter.active");
    let filterStat = "";
    if (activeQuickTab) {
      filterStat = activeQuickTab.dataset.statusFilter;
    }

    if (searchQuery) {
      orders = orders.filter(o => {
        if (!o) return false;
        const code = (o.code || o.id || "").toLowerCase();
        const customerName = (o.userName || o.customerName || (o.customer && o.customer.name) || "").toLowerCase();
        const customerPhone = (o.customer && o.customer.phone || "").toLowerCase();
        return code.includes(searchQuery) || customerName.includes(searchQuery) || customerPhone.includes(searchQuery);
      });
    }
    
    if (filterStat) {
      if (filterStat === "Đang xử lý") {
        // Gom nhóm các trạng thái đang thực hiện
        orders = orders.filter(o => o && ["Đã ghi nhận", "Đang xử lý", "Đang giao"].includes(o.status || "Đã ghi nhận"));
      } else {
        orders = orders.filter(o => o && (o.status || "Đã ghi nhận") === filterStat);
      }
    }

    // Sắp xếp đơn hàng
    const sortValue = document.getElementById("sortOrder") ? document.getElementById("sortOrder").value : "newest";
    orders.sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortValue) {
        case "newest":
          return new Date(getOrderDate(b)) - new Date(getOrderDate(a));
        case "oldest":
          return new Date(getOrderDate(a)) - new Date(getOrderDate(b));
        case "price-desc":
          return (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0);
        case "price-asc":
          return (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0);
        default:
          return new Date(getOrderDate(b)) - new Date(getOrderDate(a));
      }
    });

    // Phân trang
    const totalItems = orders.length;
    const state = paginationState.orders;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    table.innerHTML = paginatedOrders.length
      ? paginatedOrders
          .map(
            (order, index) => {
              if (!order) return "";
              const orderCode = order.code || order.id || `DH-${startIndex + index + 1}`;
              
              // Chi nhánh xử lý: Hiển thị tĩnh đồng bộ từ đơn đặt hàng
              const branchCellHtml = `<span style="font-weight:700; color:var(--gibor-secondary-text); font-size:0.85rem;"><i class="fa-solid fa-store" style="color:#e28743;"></i> ${order.branch ? escapeHTML(order.branch.name) : "Giao hàng tận nơi"}</span>`;

              // Hình thức thanh toán: Badge phương thức tĩnh + Dropdown trạng thái thanh toán
              const paymentVal = order.payment || "Thanh toán khi nhận hàng";
              const isBanking = paymentVal === "Chuyển khoản" || paymentVal.toLowerCase().includes("chuyển") || paymentVal.toLowerCase().includes("bank");
              const paymentMethodBadge = `<span class="badge ${isBanking ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'} mb-1">${isBanking ? 'Chuyển khoản' : 'Tiền mặt (COD)'}</span>`;

              const payStat = order.paymentStatus || "Chưa thanh toán";
              const isPaid = payStat === "Đã thanh toán";
              const paymentCellHtml = `
                <div class="d-flex flex-column align-items-start gap-1">
                  ${paymentMethodBadge}
                  <select class="form-select form-select-sm admin-payment-status-select fw-bold ${isPaid ? 'text-success bg-success-subtle border-success-subtle' : 'text-danger bg-danger-subtle border-danger-subtle'}" data-order-code-paystat="${escapeHTML(orderCode)}" style="width: auto; max-width: 140px; font-size: 0.75rem; cursor: pointer;">
                    <option value="Chưa thanh toán" ${!isPaid ? "selected" : ""}>Chưa thanh toán</option>
                    <option value="Đã thanh toán" ${isPaid ? "selected" : ""}>Đã thanh toán</option>
                  </select>
                </div>
              `;

              return `
                <tr>
                  <td>
                    <strong>${escapeHTML(orderCode)}</strong>
                    <div class="text-muted small">${formatDate(getOrderDate(order))}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700;">${escapeHTML(order.userName || order.customerName || (order.customer && order.customer.name) || "Khách hàng")}</div>
                    ${order.customer && order.customer.phone ? `<div style="font-size: 0.8rem; color: var(--gibor-muted-text);"><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${escapeHTML(order.customer.phone)}</div>` : ""}
                  </td>
                  <td>${escapeHTML(getOrderItemsText(order))}</td>
                  <td><strong style="color: var(--gibor-secondary-text);">${formatMoney(getOrderTotal(order))}</strong></td>
                  <td>${paymentCellHtml}</td>
                  <td>${branchCellHtml}</td>
                  <td>
                    <select class="form-select form-select-sm admin-status-select fw-semibold" data-order-code="${escapeHTML(orderCode)}" style="width: auto; font-size: 0.8rem; cursor: pointer;">
                      ${["Chờ thanh toán", "Đã ghi nhận", "Đang xử lý", "Đang giao", "Hoàn tất", "Đã hủy"]
                        .map(
                          (status) =>
                            `<option value="${status}" ${status === (order.status || "Đã ghi nhận") ? "selected" : ""}>${status}</option>`,
                        )
                        .join("")}
                    </select>
                  </td>
                  <td>
                    <div class="d-flex gap-1 justify-content-end">
                      <button class="btn btn-sm btn-outline-info" data-view-order-detail="${escapeHTML(orderCode)}" title="Xem chi tiết" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border-radius: 8px;">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="8">Không tìm thấy đơn hàng phù hợp.</td></tr>`;

    renderPagination("ordersPagination", totalItems, state.currentPage, state.pageSize);
  } catch (error) {
    console.error("Error rendering orders:", error);
  }
}

function renderRevenueReport() {
  try {
    // Lấy toàn bộ đơn hàng hợp lệ đã làm sạch từ bộ nhớ
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    
    // Phân quyền lọc dữ liệu báo cáo theo chi nhánh:
    let activeBranchId = "";
    // Sử dụng UserManager của Trần Gia Bảo để lấy thông tin phiên đăng nhập của người dùng hiện tại
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    if (currentUser) {
      // Nếu là Quản lý chi nhánh (branch_manager), chỉ được thống kê doanh thu của chi nhánh mình quản lý
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } 
      // Nếu là Admin, có quyền tùy chọn chi nhánh cần lọc từ bộ lọc trên giao diện báo cáo doanh thu
      else if (currentUser.role === "admin") {
        const revBranchFilter = document.getElementById("filterRevenueBranch");
        if (revBranchFilter && revBranchFilter.value) {
          activeBranchId = revBranchFilter.value;
        }
      }
    }

    // Lọc đơn hàng theo chi nhánh
    const filteredOrders = activeBranchId
      ? orders.filter(o => o && o.branch && o.branch.id === activeBranchId)
      : orders;

    const completedOrders = filteredOrders.filter(o => o && o.status === "Hoàn tất");
    const canceledOrders = filteredOrders.filter(o => o && o.status === "Đã hủy");
    
    const revenue = completedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const avg = completedOrders.length ? revenue / completedOrders.length : 0;
    
    const cancelRateValue = filteredOrders.length ? (canceledOrders.length / filteredOrders.length) * 100 : 0;

    const data = getRevenueByDay(7, activeBranchId);
    const best = data.reduce((top, item) => (item.value > top.value ? item : top), data[0]);

    // Hiển thị chỉ số báo cáo
    if (document.getElementById("totalRevenueReal")) document.getElementById("totalRevenueReal").textContent = formatMoney(revenue);
    if (document.getElementById("avgOrderValue")) document.getElementById("avgOrderValue").textContent = formatMoney(avg);
    if (document.getElementById("paidOrderCount")) document.getElementById("paidOrderCount").textContent = completedOrders.length;
    if (document.getElementById("canceledOrderCount")) document.getElementById("canceledOrderCount").textContent = canceledOrders.length;
    if (document.getElementById("cancelRate")) document.getElementById("cancelRate").textContent = cancelRateValue.toFixed(1) + "%";
    if (document.getElementById("bestRevenueDay")) {
      document.getElementById("bestRevenueDay").textContent = best && best.value ? `${best.label} (${formatMoney(best.value)})` : "-";
    }

    renderRevenueBars("revenueBars", activeBranchId);
    renderBestSellersReport(filteredOrders); // Gọi thêm báo cáo bán chạy nhất
  } catch (error) {
    console.error("Error rendering revenue report:", error);
  }
}

function renderBestSellersReport(orders) {
  try {
    const table = document.getElementById("bestSellersTable");
    if (!table) return;

    const completedOrders = (orders || []).filter(o => o && o.status === "Hoàn tất");
    
    const stats = {};
    completedOrders.forEach(order => {
      if (!order) return;
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach(item => {
        if (!item) return;
        const name = item.name || "Sản phẩm";
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const totalItemRevenue = price * qty;
        const image = item.image || "images/logo/logo.jpg";
        
        if (!stats[name]) {
          stats[name] = { productName: name, quantitySold: 0, revenue: 0, image: image };
        }
        stats[name].quantitySold += qty;
        stats[name].revenue += totalItemRevenue;
      });
    });

    const sortedStats = Object.values(stats).sort((a, b) => b.quantitySold - a.quantitySold);

    table.innerHTML = sortedStats.length
      ? sortedStats
          .map(
            (item) => `
              <tr>
                <td>
                  <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.productName}" class="rounded-3 me-3 object-fit-cover" style="width: 42px; height: 42px; min-width: 42px;" onerror="this.src='images/logo/logo.jpg'">
                    <div>
                      <strong class="text-dark">${escapeHTML(item.productName)}</strong>
                    </div>
                  </div>
                </td>
                <td class="text-center"><strong style="color: #137333;">${item.quantitySold}</strong> <span class="text-muted small">ly/phần</span></td>
                <td class="text-end fw-bold text-success">${formatMoney(item.revenue)}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td class="admin-empty" colspan="3">Chưa ghi nhận món ăn nào bán ra từ các đơn hoàn tất.</td></tr>`;
  } catch (error) {
    console.error("Error rendering best sellers report:", error);
  }
}

function renderAll() {
  syncBranchDropdowns();
  renderDashboard();
  renderAccounts();
  renderCustomers();
  renderProducts();
  renderBranches();
  renderOrders();
  renderRevenueReport();
}

function resetProductForm() {
  const pId = document.getElementById("productId");
  if (pId) pId.value = "";
  
  const pForm = document.getElementById("productForm");
  if (pForm) pForm.reset();

  if (document.getElementById("productImg")) document.getElementById("productImg").value = "";
  if (document.getElementById("productDesc")) document.getElementById("productDesc").value = "";
  if (document.getElementById("productBestSeller")) document.getElementById("productBestSeller").checked = false;
  if (document.getElementById("productStatus")) document.getElementById("productStatus").checked = true;
  
  const pSubmitText = document.getElementById("productSubmitText");
  if (pSubmitText) pSubmitText.textContent = "Thêm sản phẩm";
}

function bindNavigation() {
  const title = document.getElementById("adminPageTitle");
  const titleMap = {
    dashboard: "Dashboard",
    accounts: "Quản lí tài khoản",
    customers: "Quản lí khách hàng",
    products: "Quản lí sản phẩm",
    orders: "Quản lí đơn hàng",
    revenue: "Báo cáo doanh thu",
  };

  const navButtons = document.querySelectorAll(".admin-nav-btn");

  navButtons.forEach((button) => {
    const tab = button.dataset.adminTab;
    if (!tab) return; 

    button.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-btn").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.remove("active"));
      
      button.classList.add("active");
      
      const panel = document.querySelector(`[data-admin-panel="${tab}"]`);
      if (panel) {
        panel.classList.add("active");
      }
      
      if (title) {
        title.textContent = titleMap[tab] || "Admin";
      }
    });
  });
}

function bindProductForm() {
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = document.getElementById("productId").value;
      const name = document.getElementById("productName").value.trim();
      const category = document.getElementById("productCategory").value;
      const price = Number(document.getElementById("productPrice").value);
      const img = document.getElementById("productImg") ? document.getElementById("productImg").value.trim() : "";
      const desc = document.getElementById("productDesc") ? document.getElementById("productDesc").value.trim() : "";
      const isBestSeller = document.getElementById("productBestSeller") ? document.getElementById("productBestSeller").checked : false;
      const isActive = document.getElementById("productStatus") ? document.getElementById("productStatus").checked : true;
      const status = isActive ? "active" : "out_of_stock";

      if (!name || !category || isNaN(price) || price <= 0) {
        showToast("Vui lòng điền đầy đủ tên, danh mục và giá sản phẩm phải lớn hơn 0.", "warning");
        return;
      }

      const products = getProducts();
      if (id) {
        const index = products.findIndex((product) => product.id === id);
        if (index !== -1) {
          products[index] = { 
            ...products[index], 
            name, 
            category, 
            price, 
            img: img || "images/logo/logo.jpg", 
            desc, 
            isBestSeller, 
            status,
            updatedAt: new Date().toISOString()
          };
          showToast("Cập nhật sản phẩm thành công!", "success");
        }
      } else {
        products.unshift({ 
          id: `p-${Date.now()}`, 
          name, 
          category, 
          price, 
          img: img || "images/logo/logo.jpg", 
          desc, 
          isBestSeller, 
          status,
          updatedAt: new Date().toISOString()
        });
        showToast("Thêm sản phẩm mới thành công!", "success");
      }

      saveProducts(products);
      resetProductForm();
      renderAll();
    });
  }

  const resetBtn = document.getElementById("resetProductForm");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetProductForm);
  }
}

function bindTableActions() {
  document.addEventListener("click", (event) => {
    const editProductId = event.target.closest("[data-edit-product]")?.dataset.editProduct;
    const deleteProductId = event.target.closest("[data-delete-product]")?.dataset.deleteProduct;
    const editUserId = event.target.closest("[data-edit-user]")?.dataset.editUser;
    const deleteUserId = event.target.closest("[data-delete-user]")?.dataset.deleteUser;
    const lockUserId = event.target.closest("[data-lock-user]")?.dataset.lockUser;
    const resetPasswordUserId = event.target.closest("[data-reset-password-user]")?.dataset.resetPasswordUser;

    if (resetPasswordUserId) {
      const users = getUsers();
      const user = users.find((u) => String(u.id) === String(resetPasswordUserId));
      if (!user) return;
      if (isProtectedAdminUser(user)) {
        showToast("Không reset mật khẩu tài khoản admin chính từ bảng này.", "error");
        return;
      }

      showGiborPrompt({
        title: "Reset Mật Khẩu",
        message: `Nhập mật khẩu mới cho ${user.email || user.username}:`,
        defaultValue: "123456",
        confirmText: "Cập nhật",
        cancelText: "Hủy bỏ",
        onConfirm: (newPass) => {
          if (newPass) {
            if (newPass.length < 6) {
              showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "warning");
              return;
            }
            user.password = newPass;
            user.updatedAt = new Date().toISOString();
            saveUsers(users);
            showToast("Đã reset mật khẩu thành công.", "success");
            // Render lại bảng để đảm bảo cập nhật trạng thái nếu cần
            if (typeof renderAccounts === "function") renderAccounts();
          }
        }
      });
    }

    if (lockUserId) {
      if (lockUserId === "admin-001") {
        showToast("Không thể khóa/mở khóa tài khoản admin chính!", "error");
        return;
      }
      const currentUser = parseJSON("gibor_current_user", null);
      if (currentUser && String(currentUser.id) === String(lockUserId)) {
        showToast("Không thể tự khóa tài khoản của chính mình!", "error");
        return;
      }

      const users = getUsers();
      const user = users.find((u) => String(u.id) === String(lockUserId));
      if (user) {
        user.status = user.status === "locked" ? "active" : "locked";
        user.updatedAt = new Date().toISOString();
        saveUsers(users);
        renderAll();
      }
    }

    if (editUserId) {
      const user = getUsers().find((u) => String(u.id) === String(editUserId));
      if (!user) return;
      if (document.getElementById("accountIndex")) document.getElementById("accountIndex").value = user.id;
      if (document.getElementById("accountName")) document.getElementById("accountName").value = user.displayName || user.firstName || "";
      if (document.getElementById("accountEmail")) document.getElementById("accountEmail").value = user.email || "";
      if (document.getElementById("accountPhone")) document.getElementById("accountPhone").value = user.phone || "";
      if (document.getElementById("accountRole")) {
        document.getElementById("accountRole").value = user.role || "user";
        if (document.getElementById("accountBranchGroup")) {
          document.getElementById("accountBranchGroup").style.display = user.role === "branch_manager" ? "block" : "none";
        }
      }
      if (document.getElementById("accountBranchId") && user.branchId) {
        document.getElementById("accountBranchId").value = user.branchId;
      }
      if (document.getElementById("accountSubmitText")) document.getElementById("accountSubmitText").textContent = "Cập nhật tài khoản";
      
      const form = document.getElementById("accountForm");
      if (form) form.scrollIntoView({ behavior: "smooth" });
    }

    // Xử lý sự kiện click trên chi nhánh
    const editBranchId = event.target.closest("[data-edit-branch]")?.dataset.editBranch;
    const deleteBranchId = event.target.closest("[data-delete-branch]")?.dataset.deleteBranch;

    if (editBranchId) {
      if (typeof window.GIBOR_BRANCH_UTILS === "undefined") return;
      const b = window.GIBOR_BRANCH_UTILS.getById(editBranchId);
      if (!b) return;

      document.getElementById("branchId").value = b.id;
      document.getElementById("branchName").value = b.name;
      document.getElementById("branchCityCode").value = b.cityCode;
      document.getElementById("branchDistrict").value = b.district;
      document.getElementById("branchPhone").value = b.contactPhone;
      document.getElementById("branchEmail").value = b.contactEmail;
      document.getElementById("branchImg").value = b.image || "";
      document.getElementById("branchAddress").value = b.address;
      document.getElementById("branchMapEmbedUrl").value = b.mapEmbedUrl || "";
      document.getElementById("branchShortDesc").value = b.shortDescription || "";
      document.getElementById("branchFullDesc").value = b.fullDescription || "";

      document.getElementById("branchSubmitText").textContent = "Cập nhật chi nhánh";
      
      const form = document.getElementById("branchForm");
      if (form) form.scrollIntoView({ behavior: "smooth" });
    }

    if (deleteBranchId) {
      if (typeof window.GIBOR_BRANCH_UTILS === "undefined") return;
      const b = window.GIBOR_BRANCH_UTILS.getById(deleteBranchId);
      if (!b) return;

      // Nghiệp vụ ràng buộc: Lấy toàn bộ đơn hàng thông qua getOrders() để kiểm tra trước khi thực hiện xóa
      const orders = getOrders();
      // Lọc các đơn hàng chưa hoàn tất hoặc chưa hủy có liên kết với chi nhánh đang yêu cầu xóa
      const activeBranchOrders = orders.filter(o => o && o.branch && (o.branch.id === b.id || o.branch.name === b.name) && o.status !== "Hoàn tất" && o.status !== "Đã hủy");
      if (activeBranchOrders.length > 0) {
        showToast(`Không thể xóa chi nhánh vì hiện đang có ${activeBranchOrders.length} đơn hàng chưa hoàn thành do chi nhánh này xử lý.`, "error");
        return;
      }

      showGiborPopup({
        type: "warning",
        title: "Xác Nhận Xóa",
        message: `Bạn có chắc chắn muốn xóa chi nhánh "${b.name}" không? Hành động này không thể hoàn tác.`,
        confirmText: "Xóa",
        cancelText: "Hủy",
        onConfirm: () => {
          window.GIBOR_BRANCH_UTILS.delete(deleteBranchId);
          showToast(`Đã xóa chi nhánh "${b.name}" thành công.`, "success");
          renderAll();
        }
      });
    }

    if (editProductId) {
      const product = getProducts().find((item) => item.id === editProductId);
      if (!product) return;
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productCategory").value = product.category;
      document.getElementById("productPrice").value = product.price;
      if (document.getElementById("productImg")) document.getElementById("productImg").value = product.img || "";
      if (document.getElementById("productDesc")) document.getElementById("productDesc").value = product.desc || "";
      if (document.getElementById("productBestSeller")) document.getElementById("productBestSeller").checked = Boolean(product.isBestSeller);
      if (document.getElementById("productStatus")) document.getElementById("productStatus").checked = product.status !== "out_of_stock";
      document.getElementById("productSubmitText").textContent = "Cập nhật";
      
      const form = document.getElementById("productForm");
      if (form) form.scrollIntoView({ behavior: "smooth" });
    }

    if (deleteProductId) {
      showGiborPopup({
        type: "warning",
        title: "Xác Nhận Xóa",
        message: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
        confirmText: "Xóa",
        cancelText: "Hủy",
        onConfirm: () => {
          // Thực hiện Soft-delete (xóa mềm):
          // Không xóa trực tiếp khỏi cơ sở dữ liệu để bảo toàn tính toàn vẹn của lịch sử đơn hàng.
          // Đánh dấu isDeleted = true và status = "deleted" để ẩn khỏi thực đơn của khách hàng,
          // đồng thời lưu vết thời gian xóa để phục vụ mục đích kiểm toán và đồng bộ Firebase.
          const updatedProducts = getProducts().map(product => {
            if (product.id === deleteProductId) {
              return {
                ...product,
                isDeleted: true,
                status: "deleted",
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
            return product;
          });
          saveProducts(updatedProducts);
          showToast("Đã xóa sản phẩm thành công.", "success");
          renderAll();
        }
      });
    }

    // Xử lý sự kiện xem thông tin chi tiết của một đơn hàng cụ thể
    const viewOrderCode = event.target.closest("[data-view-order-detail]")?.dataset.viewOrderDetail;
    if (viewOrderCode) {
      // Truy xuất danh sách đơn hàng qua hàm getOrders() để tìm kiếm thông tin
      const orders = getOrders();
      // Tìm kiếm đơn hàng khớp với mã code hoặc ID đơn hàng được yêu cầu xem chi tiết
      const order = orders.find(o => (o.code || o.id) === viewOrderCode);
      if (order) {
        document.getElementById("detailOrderCode").textContent = `#${viewOrderCode}`;
        
        // Dựng thông tin khách hàng
        const customerName = order.userName || order.customerName || (order.customer && order.customer.name) || "Khách hàng";
        const customerPhone = order.customer && order.customer.phone ? order.customer.phone : "-";
        const customerEmail = order.customer && order.customer.email ? order.customer.email : "-";
        const customerAddress = order.customer && order.customer.address ? order.customer.address : "-";
        
        let receiveMethod = "Uống tại quán";
        if (order.shipping && (order.shipping.method === "delivery" || order.shipping.required || customerAddress !== "-")) {
          receiveMethod = "Giao hàng tận nơi";
        } else if (order.shipping && order.shipping.method === "pickup") {
          receiveMethod = "Mang đi (Tự đến lấy)";
        }

        const branchName = order.branch ? order.branch.name : "Toàn hệ thống";
        const paymentVal = order.payment || "Thanh toán khi nhận hàng";
        const payStat = order.paymentStatus || "Chưa thanh toán";
        
        let paymentBadge = `<span class="badge bg-warning text-dark">${escapeHTML(payStat)}</span>`;
        if (payStat === "Đã thanh toán") {
          paymentBadge = `<span class="badge bg-success">${escapeHTML(payStat)}</span>`;
        }

        let infoHtml = `
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <div class="p-3 bg-light rounded-3 h-100 border border-light-subtle">
                <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-circle-user me-1"></i> Thông tin khách hàng</h6>
                <div class="small text-dark mb-2"><strong>Họ tên:</strong> ${escapeHTML(customerName)}</div>
                <div class="small text-dark mb-2"><strong>Số điện thoại:</strong> ${escapeHTML(customerPhone)}</div>
                <div class="small text-dark mb-2"><strong>Email:</strong> ${escapeHTML(customerEmail)}</div>
                <div class="small text-dark"><strong>Địa chỉ nhận hàng:</strong> ${escapeHTML(customerAddress)}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="p-3 bg-light rounded-3 h-100 border border-light-subtle">
                <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-info-circle me-1"></i> Thông tin đơn hàng</h6>
                <div class="small text-dark mb-2"><strong>Hình thức nhận:</strong> ${escapeHTML(receiveMethod)}</div>
                <div class="small text-dark mb-2"><strong>Chi nhánh xử lý:</strong> ${escapeHTML(branchName)}</div>
                <div class="small text-dark mb-2"><strong>Phương thức thanh toán:</strong> ${escapeHTML(paymentVal)}</div>
                <div class="small text-dark mb-2"><strong>Trạng thái thanh toán:</strong> ${paymentBadge}</div>
                <div class="small text-dark"><strong>Thời gian đặt:</strong> ${formatDate(getOrderDate(order))} ${new Date(getOrderDate(order)).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          </div>
        `;

        // Dựng danh sách sản phẩm
        let itemsHtml = `
          <div class="table-responsive border rounded-3 mb-4">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
              <thead class="table-light text-dark fw-bold">
                <tr>
                  <th>Sản phẩm</th>
                  <th class="text-center">Đơn giá</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
        `;

        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach(item => {
          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.price || 0);
          const totalItemPrice = price * qty;
          
          // Chi tiết tùy chọn: Size, Sugar, Ice, Toppings
          const opts = [];
          if (item.size) opts.push(`Size: ${item.size}`);
          if (item.sugar !== undefined) opts.push(`Đường: ${item.sugar}`);
          if (item.ice !== undefined) opts.push(`Đá: ${item.ice}`);
          if (Array.isArray(item.toppings) && item.toppings.length > 0) {
            const toppingNames = item.toppings.map(t => typeof t === 'object' ? (t.name || t.productName) : t);
            opts.push(`Topping: ${toppingNames.join(", ")}`);
          }
          if (item.note) opts.push(`<span class="text-danger">Ghi chú: ${item.note}</span>`);

          let optionsText = "";
          if (opts.length > 0) {
            optionsText = `<div class="text-muted small mt-1" style="font-size: 0.78rem; line-height: 1.3;"><i class="fa-solid fa-gear text-secondary"></i> ${opts.join(" | ")}</div>`;
          }

          itemsHtml += `
            <tr>
              <td>
                <div class="fw-bold text-dark">${escapeHTML(item.name || "Sản phẩm")}</div>
                ${optionsText}
              </td>
              <td class="text-center">${formatMoney(price)}</td>
              <td class="text-center fw-bold">${qty}</td>
              <td class="text-end fw-bold text-dark">${formatMoney(totalItemPrice)}</td>
            </tr>
          `;
        });

        itemsHtml += `
              </tbody>
            </table>
          </div>
        `;

        // Tổng cộng thanh toán
        const subtotal = Number(order.subtotal || 0);
        const shippingFee = Number(order.shipping?.fee || 0);
        const discountVal = Number(order.couponDiscount || order.discount || 0);
        const pointsUsed = Number(order.pointsUsed || 0);
        const pointsDiscount = Number(order.pointsDiscount || 0);
        const totalPay = getOrderTotal(order);

        let billDetailsHtml = `
          <div class="d-flex flex-column align-items-end gap-2 border-top pt-3 text-dark">
            <div class="small">Tạm tính: <strong class="ms-2">${formatMoney(subtotal)}</strong></div>
        `;
        if (shippingFee > 0) {
          billDetailsHtml += `<div class="small">Phí vận chuyển: <strong class="ms-2">${formatMoney(shippingFee)}</strong></div>`;
        }
        if (discountVal > 0) {
          billDetailsHtml += `<div class="small text-danger">Mã giảm giá: <strong class="ms-2">-${formatMoney(discountVal)}</strong></div>`;
        }
        if (pointsUsed > 0) {
          billDetailsHtml += `<div class="small text-danger">Dùng ${pointsUsed} điểm tích lũy: <strong class="ms-2">-${formatMoney(pointsDiscount)}</strong></div>`;
        }
        billDetailsHtml += `
            <div class="fs-5 fw-bold text-primary mt-1">Tổng cộng: <span class="ms-2 text-danger">${formatMoney(totalPay)}</span></div>
          </div>
        `;

        const modalBody = document.getElementById("orderDetailModalBody");
        if (modalBody) {
          modalBody.innerHTML = infoHtml + itemsHtml + billDetailsHtml;
        }

        // Mở Modal bằng Bootstrap API
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
          const detailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
          detailModal.show();
        }
      }
    }

    if (deleteUserId) {
      if (deleteUserId === "admin-001") {
        showToast("Không thể xóa tài khoản admin chính!", "error");
        return;
      }
      const currentUser = parseJSON("gibor_current_user", null);
      if (currentUser && String(currentUser.id) === String(deleteUserId)) {
        showToast("Không thể xóa tài khoản đang đăng nhập!", "error");
        return;
      }
      
      showGiborPopup({
        type: "warning",
        title: "Xác Nhận Xóa",
        message: "Bạn có chắc chắn muốn xóa tài khoản này không?",
        confirmText: "Xóa",
        cancelText: "Hủy",
        onConfirm: () => {
          const users = getUsers().filter((user) => String(user.id) !== String(deleteUserId));
          saveUsers(users);
          showToast("Đã xóa tài khoản thành công.", "success");
          renderAll();
        }
      });
    }
  });

  document.addEventListener("change", (event) => {
    // 1. Cập nhật Trạng thái đơn hàng
    if (event.target.matches("[data-order-code]")) {
      // Truy xuất danh sách đơn hàng qua hàm getOrders()
      const orders = getOrders();
      const code = event.target.dataset.orderCode;
      const orderIdx = orders.findIndex(o => (o.code || o.id) === code);
      if (orderIdx === -1) return;
      
      const newStatus = event.target.value;
      orders[orderIdx].status = newStatus;
      orders[orderIdx].updatedAt = new Date().toISOString();
      
      // TỰ ĐỘNG ĐỒNG BỘ: Nếu đơn hàng "Hoàn tất" thì tự động cập nhật Trạng thái thanh toán là "Đã thanh toán"
      if (newStatus === "Hoàn tất") {
        orders[orderIdx].paymentStatus = "Đã thanh toán";
      } else if (newStatus === "Đã hủy") {
        orders[orderIdx].paymentStatus = "Chưa thanh toán";
      }

      saveOrders(orders);
      renderAll();
    }

    // 2. Cập nhật Trạng thái thanh toán
    if (event.target.matches("[data-order-code-paystat]")) {
      // Truy xuất danh sách đơn hàng qua hàm getOrders() để cập nhật trạng thái thanh toán
      const orders = getOrders();
      const code = event.target.dataset.orderCodePaystat;
      const orderIdx = orders.findIndex(o => (o.code || o.id) === code);
      if (orderIdx === -1) return;
      
      orders[orderIdx].paymentStatus = event.target.value;
      orders[orderIdx].updatedAt = new Date().toISOString();
      saveOrders(orders);
      renderAll();
    }

    // 3. Cập nhật trực tiếp Trạng thái sản phẩm (dành riêng cho Quản lý chi nhánh)
    if (event.target.matches("[data-update-product-status]")) {
      const productId = event.target.dataset.updateProductStatus;
      const newStatus = event.target.value; // "active" hoặc "out_of_stock"
      
      const products = getProducts();
      const productIdx = products.findIndex(p => p && p.id === productId);
      if (productIdx !== -1) {
        products[productIdx].status = newStatus;
        products[productIdx].updatedAt = new Date().toISOString();
        saveProducts(products);
        showToast(`Đã cập nhật trạng thái "${products[productIdx].name}" thành công.`, "success");
        renderAll();
      }
    }

    // 4. Cập nhật trực tiếp trạng thái Bán chạy (dành riêng cho Quản lý chi nhánh)
    if (event.target.matches("[data-update-product-bestseller]")) {
      const productId = event.target.dataset.updateProductBestseller;
      const isChecked = event.target.checked;
      
      const products = getProducts();
      const productIdx = products.findIndex(p => p && p.id === productId);
      if (productIdx !== -1) {
        products[productIdx].isBestSeller = isChecked;
        products[productIdx].updatedAt = new Date().toISOString();
        saveProducts(products);
        showToast(`Đã cập nhật trạng thái nổi bật cho "${products[productIdx].name}" thành công.`, "success");
        renderAll();
      }
    }
  });

  // Tự động đồng bộ giao diện Admin khi có đơn hàng mới được tạo từ trang thanh toán ở tab khác
  window.addEventListener("storage", (e) => {
    if (e.key === _ORDERS_KEY || e.key === "gibor_orders") {
      console.log("Phát hiện dữ liệu đơn hàng mới từ tab khác. Tự động đồng bộ thời gian thực...");
      renderAll();
    }
  });

  window.addEventListener('gibor_products_updated', () => {
    console.log("⚡ Nhận được cập nhật sản phẩm thời gian thực từ Firebase. Đang tải lại danh sách sản phẩm...");
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
  });

  window.addEventListener('gibor_orders_updated', () => {
    console.log("⚡ Nhận được cập nhật đơn hàng thời gian thực từ Firebase. Đang tải lại danh sách đơn hàng...");
    if (typeof renderOrders === 'function') renderOrders();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderRevenueReport === 'function') renderRevenueReport();
  });

  window.addEventListener('gibor_users_updated', () => {
    console.log("⚡ Nhận được cập nhật tài khoản thời gian thực từ Firebase. Đang tải lại danh sách tài khoản...");
    if (typeof renderAccounts === 'function') renderAccounts();
    if (typeof renderCustomers === 'function') renderCustomers();
  });

  window.addEventListener('gibor_branches_updated', () => {
    console.log("⚡ Nhận được cập nhật chi nhánh thời gian thực từ Firebase. Đang tải lại danh sách chi nhánh...");
    if (typeof renderBranches === 'function') renderBranches();
  });
}

function handleLogout() {
  showGiborPopup({
    type: "warning",
    title: "Đăng Xuất",
    message: "Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị không?",
    confirmText: "Đăng xuất",
    cancelText: "Hủy",
    onConfirm: () => {
      // Ưu tiên sử dụng cơ chế đăng xuất chuẩn của UserManager để xóa phiên đăng nhập và xóa cache/state
      if (typeof UserManager !== 'undefined') {
        UserManager.logout();
      } 
      // Phương thức dự phòng nếu UserManager chưa được tải: Xóa thủ công key gibor_current_user khỏi LocalStorage
      else {
        localStorage.removeItem("gibor_current_user");
      }
      window.location.href = "login.html";
    }
  });
}

function bindFilters() {
  // Bộ lọc Dashboard
  const dbBranchFilter = document.getElementById("dashboardBranchFilter");
  if (dbBranchFilter) {
    dbBranchFilter.addEventListener("change", () => {
      renderDashboard();
      // Đồng bộ bộ lọc doanh thu theo chi nhánh tương ứng
      const revBranchFilter = document.getElementById("filterRevenueBranch");
      if (revBranchFilter) {
        revBranchFilter.value = dbBranchFilter.value === "all" ? "" : dbBranchFilter.value;
      }
      renderRevenueReport();
    });
  }

  // Bộ lọc sản phẩm
  const searchProduct = document.getElementById("searchProduct");
  const filterProductCat = document.getElementById("filterProductCategory");
  const filterProductStat = document.getElementById("filterProductStatus");
  if (searchProduct) searchProduct.addEventListener("input", () => resetPageAndRender("products", renderProducts));
  if (filterProductCat) filterProductCat.addEventListener("change", () => resetPageAndRender("products", renderProducts));
  if (filterProductStat) filterProductStat.addEventListener("change", () => resetPageAndRender("products", renderProducts));

  // Bộ lọc đơn hàng
  const searchOrder = document.getElementById("searchOrder");
  const filterOrderBranch = document.getElementById("filterOrderBranch");
  const sortOrder = document.getElementById("sortOrder");
  if (searchOrder) searchOrder.addEventListener("input", () => resetPageAndRender("orders", renderOrders));
  if (filterOrderBranch) filterOrderBranch.addEventListener("change", () => resetPageAndRender("orders", renderOrders));
  if (sortOrder) {
    sortOrder.addEventListener("change", () => {
      resetPageAndRender("orders", renderOrders);
    });
  }

  // Sự kiện cho các nút lọc trạng thái nghiệp vụ nhanh (btn-quick-filter)
  const quickFilters = document.querySelectorAll(".btn-quick-filter");
  quickFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      quickFilters.forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      
      resetPageAndRender("orders", renderOrders);
    });
  });

  // Bộ lọc tài khoản
  const searchAccount = document.getElementById("searchAccount");
  const filterAccountRole = document.getElementById("filterAccountRole");
  const filterAccountStatus = document.getElementById("filterAccountStatus");
  if (searchAccount) searchAccount.addEventListener("input", () => resetPageAndRender("accounts", renderAccounts));
  if (filterAccountRole) filterAccountRole.addEventListener("change", () => resetPageAndRender("accounts", renderAccounts));
  if (filterAccountStatus) filterAccountStatus.addEventListener("change", () => resetPageAndRender("accounts", renderAccounts));

  // Bộ lọc chi nhánh
  const searchBranch = document.getElementById("searchBranch");
  const filterBranchCity = document.getElementById("filterBranchCity");
  if (searchBranch) searchBranch.addEventListener("input", () => resetPageAndRender("branches", renderBranches));
  if (filterBranchCity) filterBranchCity.addEventListener("change", () => resetPageAndRender("branches", renderBranches));

  // Bộ lọc doanh thu
  const revBranchFilter = document.getElementById("filterRevenueBranch");
  if (revBranchFilter) {
    revBranchFilter.addEventListener("change", () => {
      // Đồng bộ bộ lọc dashboard theo chi nhánh tương ứng
      const dbBranchFilter = document.getElementById("dashboardBranchFilter");
      if (dbBranchFilter) {
        dbBranchFilter.value = revBranchFilter.value === "" ? "all" : revBranchFilter.value;
      }
      renderDashboard();
      renderRevenueReport();
    });
  }

  // Bộ lọc khách hàng
  const searchCustomer = document.getElementById("searchCustomer");
  const filterCustomerBranch = document.getElementById("filterCustomerBranch");
  const filterCustomerYear = document.getElementById("filterCustomerYear");
  const sortCustomerBy = document.getElementById("sortCustomerBy");
  if (searchCustomer) searchCustomer.addEventListener("input", () => resetPageAndRender("customers", renderCustomers));
  if (filterCustomerBranch) filterCustomerBranch.addEventListener("change", () => resetPageAndRender("customers", renderCustomers));
  if (filterCustomerYear) filterCustomerYear.addEventListener("change", () => resetPageAndRender("customers", renderCustomers));
  if (sortCustomerBy) sortCustomerBy.addEventListener("change", () => resetPageAndRender("customers", renderCustomers));
}

function applyRolePermissions(user) {
  const isBranchManager = user.role === "branch_manager";
  
  const sidebarAvatar = document.getElementById("sidebarUserAvatar");
  const sidebarName = document.getElementById("sidebarUserDisplayName");
  const sidebarRole = document.getElementById("sidebarUserRole");
  
  if (sidebarAvatar) {
    const initials = (user.displayName || user.username || "A").split(" ").filter(Boolean).slice(-2).map(p => p.charAt(0)).join("").toUpperCase();
    sidebarAvatar.textContent = initials || "A";
  }
  if (sidebarName) {
    sidebarName.textContent = user.displayName || user.firstName || user.username || "Quản lý";
  }
  
  if (isBranchManager) {
    const branch = window.GIBOR_BRANCH_UTILS ? window.GIBOR_BRANCH_UTILS.getById(user.branchId) : null;
    const branchName = branch ? branch.name : "Chi nhánh";
    if (sidebarRole) sidebarRole.textContent = `QL: ${branchName}`;
    
    // Quản lý được xem tab sản phẩm và chi nhánh nhưng không được quản lý tài khoản người dùng
    const forbiddenTabs = ["accounts"];
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      const tab = btn.dataset.adminTab;
      if (forbiddenTabs.includes(tab)) {
        btn.style.display = "none";
      }
    });

    // Ẩn form thêm sản phẩm đối với Quản lý chi nhánh
    const productFormCard = document.querySelector('#productForm')?.closest('.card');
    if (productFormCard) {
      productFormCard.style.display = "none";
    }

    // Đổi tên tab branches đối với branch_manager
    const branchesBtn = document.querySelector('.admin-nav-btn[data-admin-tab="branches"]');
    if (branchesBtn) {
      const textSpan = branchesBtn.querySelector("span");
      if (textSpan) textSpan.textContent = "Danh sách chi nhánh";
    }
    
    // Ẩn hoặc khóa select box bộ lọc chi nhánh
    const dbFilter = document.getElementById("dashboardFilterBar");
    if (dbFilter) dbFilter.style.display = "none";
    
    const orderBranchFilter = document.getElementById("orderBranchFilterContainer");
    if (orderBranchFilter) orderBranchFilter.style.display = "none";
    
    const revBranchFilter = document.getElementById("revenueBranchFilterContainer");
    if (revBranchFilter) revBranchFilter.style.display = "none";

    const customerBranchFilter = document.getElementById("filterCustomerBranch");
    if (customerBranchFilter) {
      customerBranchFilter.value = user.branchId || "";
      customerBranchFilter.disabled = true;
    }
  } else {
    if (sidebarRole) sidebarRole.textContent = "Quản trị cấp cao";
  }
}

function initAdminPage() {
  // Tự động chuẩn hóa (migration) thông tin tài khoản admin cũ trong localStorage nếu có thiếu sót
  try {
    const rawUser = localStorage.getItem("gibor_current_user");
    if (rawUser) {
      const currentUser = JSON.parse(rawUser);
      if (currentUser && currentUser.role === "admin") {
        let changed = false;
        if (!currentUser.username) { currentUser.username = "admin"; changed = true; }
        if (!currentUser.email) { currentUser.email = "admin@giborcoffee.com"; changed = true; }
        if (!currentUser.id) { currentUser.id = "admin-001"; changed = true; }
        if (changed) {
          localStorage.setItem("gibor_current_user", JSON.stringify(currentUser));
          console.log("Đã tự động chuẩn hóa thông tin tài khoản Admin cũ.");
        }
      }
    }
  } catch (e) {
    console.error("Lỗi tự động chuẩn hóa Admin:", e);
  }

  // BẢO VỆ TRANG ADMIN - Hỗ trợ cả Admin và Branch Manager
  let isAuthorized = false;
  let currentUser = null;
  
  // Cơ chế bảo vệ trang quản trị (Authorization Middleware):
  // Sử dụng UserManager của Trần Gia Bảo để kiểm tra quyền truy cập của người dùng đang đăng nhập
  if (typeof UserManager !== 'undefined') {
    currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      // Cho phép truy cập nếu người dùng có quyền Admin (UserManager.isAdmin()) hoặc có vai trò là Quản lý chi nhánh (branch_manager)
      if (UserManager.isAdmin() || currentUser.role === "branch_manager") {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    showToast("Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập bằng tài khoản quản lý hoặc admin.", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return; // CHẶN HOÀN TOÀN
  }

  console.log("✅ Xác thực quyền Admin/Manager thành công, tiến hành khởi tạo...");

  // Đồng bộ giao diện phân quyền
  applyRolePermissions(currentUser);

  const todayEl = document.getElementById("adminToday");
  if (todayEl) {
    todayEl.textContent = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Khởi tạo các sự kiện và hiển thị an toàn
  const initSteps = [
    { name: "bindSidebarToggle", fn: bindSidebarToggle },
    { name: "bindNavigation", fn: bindNavigation },
    { name: "bindProductForm", fn: bindProductForm },
    { name: "bindBranchForm", fn: bindBranchForm },
    { name: "bindTableActions", fn: bindTableActions },
    { name: "bindAccountForm", fn: bindAccountForm },
    { name: "bindFilters", fn: bindFilters },
    { name: "bindPayosForm", fn: bindPayosForm },
    { name: "renderAll", fn: renderAll }
  ];

  initSteps.forEach((step) => {
    try {
      step.fn();
    } catch (error) {
      console.error(`❌ Lỗi trong bước khởi tạo ${step.name}:`, error);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPage);
} else {
  initAdminPage();
}

function bindAccountForm() {
  const accountForm = document.getElementById("accountForm");
  const accountIndex = document.getElementById("accountIndex");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");
  const accountPhone = document.getElementById("accountPhone");
  const accountPassword = document.getElementById("accountPassword"); 
  const accountRole = document.getElementById("accountRole");
  const accountBranchGroup = document.getElementById("accountBranchGroup");
  const accountBranchId = document.getElementById("accountBranchId");
  const accountSubmitText = document.getElementById("accountSubmitText");
  const resetAccountForm = document.getElementById("resetAccountForm");
  
  if (!accountForm) return;

  // Lắng nghe sự kiện thay đổi vai trò để ẩn/hiện chọn chi nhánh
  if (accountRole) {
    accountRole.addEventListener("change", function() {
      if (accountBranchGroup) {
        accountBranchGroup.style.display = accountRole.value === "branch_manager" ? "block" : "none";
      }
    });
  }

  function resetAccount() {
    if(accountIndex) accountIndex.value = "";
    if(accountName) accountName.value = "";
    if(accountEmail) accountEmail.value = "";
    if(accountPhone) accountPhone.value = "";
    if(accountPassword) accountPassword.value = ""; 
    if(accountRole) {
      accountRole.value = "user";
      if (accountBranchGroup) accountBranchGroup.style.display = "none";
    }
    if(accountBranchId) accountBranchId.selectedIndex = 0;
    if(accountSubmitText) accountSubmitText.textContent = "Thêm tài khoản";
  }

  accountForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const users = getUsers();
    const idStr = accountIndex.value;
    const firstName = accountName.value.trim(); 
    const email = accountEmail.value.trim();
    const phone = accountPhone.value.trim();
    const password = accountPassword ? accountPassword.value.trim() : "";
    const roleVal = accountRole ? accountRole.value : "user";
    const branchVal = roleVal === "branch_manager" && accountBranchId ? accountBranchId.value : "";

    if (!firstName || !email || !phone) {
      showToast("Vui lòng điền đầy đủ họ tên, email và số điện thoại.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Email không đúng định dạng.", "warning");
      return;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      showToast("Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0).", "warning");
      return;
    }

    if (isEmailUsedByAnotherUser(users, email, idStr)) {
      showToast("Email này đã được sử dụng bởi tài khoản khác.", "error");
      return;
    }

    if (roleVal === "branch_manager" && !branchVal) {
      showToast("Vui lòng chọn chi nhánh cho tài khoản Branch Manager.", "warning");
      return;
    }

    const currentUser = getCurrentAdminUser();
    const targetUser = idStr === "" ? null : users.find(u => String(u.id) === String(idStr));
    if (targetUser && isProtectedAdminUser(targetUser) && roleVal !== "admin") {
      showToast("Không thể hạ quyền tài khoản admin chính.", "error");
      return;
    }
    if (targetUser && currentUser && String(currentUser.id) === String(targetUser.id) && roleVal !== "admin") {
      showToast("Không thể tự hạ quyền tài khoản đang đăng nhập.", "error");
      return;
    }

    if (idStr === "") {
      // Thêm mới tài khoản
      if (!password || password.length < 6) {
        showToast("Vui lòng nhập mật khẩu mới có ít nhất 6 ký tự.", "warning");
        return;
      }
      const newUser = {
        id: Date.now(),
        lastName: "",
        firstName: firstName,
        username: email.split('@')[0],
        displayName: firstName,
        email: email,
        phone: phone,
        password: password,
        role: roleVal,
        branchId: branchVal,
        status: "active",
        permissions: roleVal === "admin" ? ["*"] : [],
        provider: "email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      showToast("Thêm tài khoản mới thành công!", "success");
    } else {
      // Cập nhật tài khoản hiện có
      const index = users.findIndex(u => String(u.id) === idStr);
      if (index > -1) {
        users[index].firstName = firstName;
        users[index].displayName = firstName;
        users[index].email = email;
        users[index].phone = phone;
        users[index].role = roleVal;
        users[index].branchId = branchVal;
        users[index].permissions = roleVal === "admin" ? ["*"] : [];
        users[index].updatedAt = new Date().toISOString();
        if (password) {
          if (password.length < 6) {
            showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "warning");
            return;
          }
          users[index].password = password;
        }
        showToast("Cập nhật tài khoản thành công!", "success");
      }
    }

    saveUsers(users);

    // Nghiệp vụ đồng bộ session: Nếu admin/quản lý tự cập nhật thông tin của chính mình
    if (currentUser && idStr !== "" && String(currentUser.id) === String(idStr) && typeof UserManager !== "undefined") {
      // Tìm lại thông tin người dùng vừa được cập nhật trong danh sách
      const updatedSelf = users.find(u => String(u.id) === String(idStr));
      // Cập nhật lại thông tin mới nhất vào phiên đăng nhập thông qua UserManager để đồng bộ lập tức
      if (updatedSelf) UserManager.setCurrentUser(updatedSelf);
    }
    
    renderAll();
    resetAccount();
  });

  if (resetAccountForm) {
    resetAccountForm.addEventListener("click", resetAccount);
  }
}

function syncBranchDropdowns() {
  if (typeof window.GIBOR_BRANCH_UTILS === "undefined") return;
  const branches = window.GIBOR_BRANCH_UTILS.all();
  
  // 1. Dropdown chi nhánh trong Form tài khoản (Accounts)
  const accountBranchSelect = document.getElementById("accountBranchId");
  if (accountBranchSelect) {
    const prevVal = accountBranchSelect.value;
    accountBranchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>' + branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (prevVal) accountBranchSelect.value = prevVal;
  }
  
  // 2. Dropdown bộ lọc chi nhánh ở Dashboard
  const dbBranchFilter = document.getElementById("dashboardBranchFilter");
  if (dbBranchFilter) {
    const prevVal = dbBranchFilter.value;
    dbBranchFilter.innerHTML = '<option value="all">Toàn hệ thống</option>' + 
      branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (prevVal) dbBranchFilter.value = prevVal;
  }
  
  // 3. Dropdown bộ lọc chi nhánh ở Orders
  const orderBranchFilter = document.getElementById("filterOrderBranch");
  if (orderBranchFilter) {
    const prevVal = orderBranchFilter.value;
    orderBranchFilter.innerHTML = '<option value="">Tất cả chi nhánh</option>' + 
      branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (prevVal) orderBranchFilter.value = prevVal;
  }
  
  // 4. Dropdown bộ lọc chi nhánh ở Revenue
  const revBranchFilter = document.getElementById("filterRevenueBranch");
  if (revBranchFilter) {
    const prevVal = revBranchFilter.value;
    revBranchFilter.innerHTML = '<option value="">Toàn hệ thống</option>' + 
      branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (prevVal) revBranchFilter.value = prevVal;
  }

  // 5. Dropdown bộ lọc chi nhánh ở Customers
  const customerBranchFilter = document.getElementById("filterCustomerBranch");
  if (customerBranchFilter) {
    const prevVal = customerBranchFilter.value;
    customerBranchFilter.innerHTML = '<option value="">Tất cả chi nhánh mua hàng</option>' + 
      branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (prevVal) customerBranchFilter.value = prevVal;
  }
}

function renderBranches() {
  try {
    const table = document.getElementById("branchesTable");
    if (!table) return;

    if (typeof window.GIBOR_BRANCH_UTILS === "undefined") return;
    let list = window.GIBOR_BRANCH_UTILS.all();

    // Xác định phân quyền hiển thị đối với Branch Manager
    // Lấy thông tin tài khoản hiện tại thông qua đối tượng UserManager của Trần Gia Bảo
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    // Kiểm tra xem người dùng hiện tại có phải là Quản lý chi nhánh hay không
    const isBranchManager = currentUser && currentUser.role === "branch_manager";

    // Ẩn/hiện card form chi nhánh dựa trên phân quyền
    const branchFormCard = document.getElementById("branchFormCard");
    if (branchFormCard) {
      branchFormCard.style.display = isBranchManager ? "none" : "block";
    }

    // Ẩn/hiện cột header Hành động
    const tableHeader = table.closest("table")?.querySelector("thead th:last-child");
    if (tableHeader) {
      tableHeader.style.display = isBranchManager ? "none" : "";
    }

    // Áp dụng bộ lọc và tìm kiếm
    const searchVal = document.getElementById("searchBranch") ? document.getElementById("searchBranch").value.toLowerCase().trim() : "";
    const filterCity = document.getElementById("filterBranchCity") ? document.getElementById("filterBranchCity").value : "";

    if (searchVal) {
      list = list.filter(b => {
        const name = b.name.toLowerCase();
        const addr = b.address.toLowerCase();
        return name.includes(searchVal) || addr.includes(searchVal);
      });
    }

    if (filterCity) {
      list = list.filter(b => b.cityCode === filterCity);
    }

    // Phân trang
    const totalItems = list.length;
    const state = paginationState.branches;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedList = list.slice(startIndex, endIndex);

    table.innerHTML = paginatedList.length
      ? paginatedList.map(b => {
          let actionCellHtml = "";
          if (!isBranchManager) {
            actionCellHtml = `
              <td>
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm btn-outline-primary" data-edit-branch="${escapeHTML(b.id)}" title="Sửa">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-delete-branch="${escapeHTML(b.id)}" title="Xóa">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            `;
          }

          return `
            <tr>
              <td>
                <img src="${escapeHTML(b.image)}" alt="${escapeHTML(b.name)}" style="width: 65px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);" onerror="this.src='images/logo/logo.jpg'" />
              </td>
              <td><strong style="color: var(--gibor-primary-text); font-size: 0.9rem;">${escapeHTML(b.name)}</strong></td>
              <td><span class="badge bg-secondary">${escapeHTML(b.cityName)}</span></td>
              <td>${escapeHTML(b.district)}</td>
              <td>
                <div style="font-size: 0.8rem; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(b.address)}">
                  ${escapeHTML(b.address)}
                </div>
              </td>
              <td>
                <div style="font-size: 0.75rem; color: var(--gibor-muted-text);">
                  <div><i class="fa-solid fa-phone" style="width:14px;"></i> ${escapeHTML(b.contactPhone)}</div>
                  <div><i class="fa-solid fa-envelope" style="width:14px;"></i> ${escapeHTML(b.contactEmail)}</div>
                </div>
              </td>
              ${actionCellHtml}
            </tr>
          `;
        }).join("")
      : `<tr><td class="text-center text-muted py-3" colspan="${isBranchManager ? 6 : 7}">Không tìm thấy chi nhánh phù hợp.</td></tr>`;

    renderPagination("branchesPagination", totalItems, state.currentPage, state.pageSize);

    // Cập nhật thẻ thống kê chi nhánh ở Dashboard
    const statBranches = document.getElementById("statBranches");
    if (statBranches) {
      statBranches.textContent = totalItems;
    }
  } catch (e) {
    console.error("Lỗi renderBranches:", e);
  }
}

function resetBranchForm() {
  document.getElementById("branchId").value = "";
  const form = document.getElementById("branchForm");
  if (form) form.reset();
  document.getElementById("branchSubmitText").textContent = "Thêm chi nhánh";
}

function bindBranchForm() {
  const form = document.getElementById("branchForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (typeof window.GIBOR_BRANCH_UTILS === "undefined") return;

      const id = document.getElementById("branchId").value;
      const name = document.getElementById("branchName").value.trim();
      const cityCode = document.getElementById("branchCityCode").value;
      const district = document.getElementById("branchDistrict").value.trim();
      const phone = document.getElementById("branchPhone").value.trim();
      const email = document.getElementById("branchEmail").value.trim();
      const img = document.getElementById("branchImg").value.trim();
      const address = document.getElementById("branchAddress").value.trim();
      const mapEmbedUrl = document.getElementById("branchMapEmbedUrl").value.trim();
      const shortDescription = document.getElementById("branchShortDesc").value.trim();
      const fullDescription = document.getElementById("branchFullDesc").value.trim();

      if (!name || !district || !phone || !email || !address) {
        showToast("Vui lòng nhập đầy đủ các thông tin bắt buộc.", "warning");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Email chi nhánh không đúng định dạng.", "warning");
        return;
      }

      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        showToast("Số điện thoại liên hệ không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0).", "warning");
        return;
      }

      const branchData = {
        name,
        cityCode,
        district,
        contactPhone: phone,
        contactEmail: email,
        image: img || "images/logo/logo.jpg",
        address,
        mapEmbedUrl,
        shortDescription,
        fullDescription
      };

      if (id) {
        const success = window.GIBOR_BRANCH_UTILS.update(id, branchData);
        if (success) {
          showToast("Cập nhật chi nhánh thành công!", "success");
        } else {
          showToast("Cập nhật thất bại.", "error");
        }
      } else {
        window.GIBOR_BRANCH_UTILS.add(branchData);
        showToast("Thêm chi nhánh mới thành công!", "success");
      }

      resetBranchForm();
      renderAll();
    });
  }

  const resetBtn = document.getElementById("resetBranchForm");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetBranchForm);
  }
}

function bindSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggle");
  if (!toggleBtn) return;

  // Khôi phục trạng thái co giãn từ localStorage
  const isCollapsed = localStorage.getItem("admin_sidebar_collapsed") === "true";
  if (isCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
    const collapsed = document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem("admin_sidebar_collapsed", collapsed ? "true" : "false");
  });
}

function bindPayosForm() {
  const form = document.getElementById("payosConfigForm");
  if (!form) return;

  const branchSelect = document.getElementById("payosBranchSelect");
  const clientIdInput = document.getElementById("payosClientId");
  const apiKeyInput = document.getElementById("payosApiKey");
  const checksumKeyInput = document.getElementById("payosChecksumKey");
  const mockToggle = document.getElementById("payosMockToggle");

  // Load danh sách chi nhánh vào select
  if (branchSelect && typeof window.GIBOR_BRANCH_UTILS !== "undefined") {
    const branches = window.GIBOR_BRANCH_UTILS.all() || [];
    let optionsHtml = '<option value="">Mặc định (Toàn hệ thống)</option>';
    branches.forEach(b => {
      optionsHtml += `<option value="${b.id}">${b.name}</option>`;
    });
    branchSelect.innerHTML = optionsHtml;
  }

  // Hàm load cấu hình payOS theo chi nhánh
  function loadPayosConfig() {
    const branchId = branchSelect ? branchSelect.value : "";
    const suffix = branchId ? "_" + branchId : "";

    const enabled = localStorage.getItem("gibor_payos_enabled" + suffix);
    if (clientIdInput) { // dùng làm nút bật tắt payos
      clientIdInput.value = enabled === "true" ? "Đã bật" : "Đang tắt";
      clientIdInput.disabled = true;
    }
    
    // Ẩn/vô hiệu hóa các trường nhạy cảm nếu chúng tồn tại trong DOM để bảo mật hoàn toàn
    if (apiKeyInput) {
      apiKeyInput.value = "********************************";
      apiKeyInput.disabled = true;
    }
    if (checksumKeyInput) {
      checksumKeyInput.value = "********************************";
      checksumKeyInput.disabled = true;
    }

    const mockModeValue = localStorage.getItem("gibor_payos_mock_mode" + suffix);
    if (mockToggle) {
      mockToggle.checked = mockModeValue === "true";
    }
  }

  if (branchSelect) {
    branchSelect.addEventListener("change", loadPayosConfig);
  }

  window.addEventListener("gibor_payos_config_updated", loadPayosConfig);

  // Phân quyền bảo mật: Kiểm tra danh tính tài khoản đang thao tác thông qua UserManager của Trần Gia Bảo
  const currentUser = typeof UserManager !== "undefined" ? UserManager.getCurrentUser() : null;
  const isBranchManager = currentUser && currentUser.role === "branch_manager";

  if (isBranchManager) {
    // Nếu là quản lý chi nhánh:
    // 1. Khóa select chọn chi nhánh, chỉ cho xem chi nhánh của họ
    if (branchSelect) {
      branchSelect.value = currentUser.branchId || "";
      branchSelect.disabled = true;
    }
    if (mockToggle) mockToggle.disabled = true;

    // 3. Khóa nút lưu
    const saveBtn = form.querySelector("button[type='submit']");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i> Chỉ Admin mới được quyền sửa';
      saveBtn.className = "btn btn-secondary text-white fw-bold px-4 rounded-pill";
    }
  }

  // Khởi tạo hiển thị ban đầu
  loadPayosConfig();

  // Sự kiện submit lưu cấu hình (chỉ chạy đối với admin)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isBranchManager) {
      showToast("Bạn không có quyền sửa cấu hình payOS.", "error");
      return;
    }

    const branchId = branchSelect ? branchSelect.value : "";
    const suffix = branchId ? "_" + branchId : "";

    // Toggle trạng thái kích hoạt (enabled) khi click submit
    const currentEnabled = localStorage.getItem("gibor_payos_enabled" + suffix) === "true";
    const nextEnabled = !currentEnabled;

    localStorage.setItem("gibor_payos_enabled" + suffix, nextEnabled ? "true" : "false");

    const isMock = mockToggle ? (mockToggle.checked ? "true" : "false") : "false";
    if (mockToggle) {
      localStorage.setItem("gibor_payos_mock_mode" + suffix, isMock);
    }

    // Đồng bộ lên Firebase Realtime Database các thuộc tính công khai
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        const dbKey = branchId || 'default';
        firebase.database().ref('payos_configs/' + dbKey).set({
          enabled: nextEnabled,
          mockMode: isMock === "true",
          branchId: branchId,
          displayName: branchId ? `Chi nhánh ${branchId.toUpperCase()}` : "Toàn hệ thống",
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Lỗi đồng bộ cấu hình payOS lên Firebase:", err);
      }
    }

    loadPayosConfig();
    showToast(`Đã ${nextEnabled ? "Bật" : "Tắt"} cấu hình payOS & lưu chế độ Mock=${isMock} cho ${branchId ? "chi nhánh này" : "toàn hệ thống"}.`, "success");
  });
}
// ===================== BÁO CÁO DOANH THU =====================
(function () {
  function isCompletedOrder(order) {
    return ["Hoàn tất", "Đã hoàn tất", "Completed"].includes(order && order.status);
  }

  function isCanceledOrder(order) {
    return ["Đã hủy", "Đã huỷ", "Canceled", "Cancelled"].includes(order && order.status);
  }

  /**
   * Xác định chi nhánh hoạt động hiện tại để lập báo cáo thống kê doanh thu.
   * Hỗ trợ tự động nhận diện và khóa chi nhánh đối với tài khoản Quản lý chi nhánh (Branch Manager).
   * 
   * @returns {string} ID của chi nhánh cần thống kê (để trống nếu thống kê toàn hệ thống).
   */
  function getActiveRevenueBranchId() {
    let activeBranchId = "";
    // Sử dụng UserManager của Trần Gia Bảo để truy xuất thông tin tài khoản hiện tại
    const currentUser = typeof UserManager !== "undefined" ? UserManager.getCurrentUser() : null;

    // Phân quyền xác định ID chi nhánh:
    if (currentUser && currentUser.role === "branch_manager") {
      // Nếu là Quản lý chi nhánh, mặc định lấy mã chi nhánh liên kết với tài khoản này
      activeBranchId = currentUser.branchId || "";
    } else {
      // Nếu là Admin, lấy chi nhánh được chọn từ dropdown bộ lọc trên giao diện
      const revBranchFilter = document.getElementById("filterRevenueBranch");
      activeBranchId = revBranchFilter ? revBranchFilter.value : "";
    }

    return activeBranchId;
  }

  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day + 1);
    return d;
  }

  function getQuarter(date) {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  function getPeriodConfig(period) {
    if (period === "week") return { count: 8, title: "Doanh thu 8 tuần gần nhất" };
    if (period === "month") return { count: 12, title: "Doanh thu 12 tháng gần nhất" };
    if (period === "quarter") return { count: 4, title: "Doanh thu 4 quý gần nhất" };
    return { count: 14, title: "Doanh thu 14 ngày gần nhất" };
  }

  function buildRevenuePeriods(period, branchId) {
    // Truy xuất toàn bộ các đơn hàng hiện có thông qua getOrders() để tính toán số liệu doanh thu theo kỳ
    const orders = (getOrders() || []).filter(Boolean);
    const today = new Date();
    const config = getPeriodConfig(period);
    const periods = [];

    for (let i = config.count - 1; i >= 0; i--) {
      const date = new Date(today);
      let key = "";
      let label = "";
      let start = null;
      let end = null;

      if (period === "week") {
        date.setDate(today.getDate() - i * 7);
        start = startOfWeek(date);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const year = start.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const weekNo = Math.ceil((((start - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);

        key = `${year}-W${String(weekNo).padStart(2, "0")}`;
        label = `Tuần ${weekNo}/${year}`;
      } else if (period === "month") {
        date.setMonth(today.getMonth() - i);
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        label = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (period === "quarter") {
        const currentQuarterIndex = today.getFullYear() * 4 + getQuarter(today) - 1 - i;
        const year = Math.floor(currentQuarterIndex / 4);
        const quarter = currentQuarterIndex % 4 + 1;
        const startMonth = (quarter - 1) * 3;

        start = new Date(year, startMonth, 1);
        end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);

        key = `${year}-Q${quarter}`;
        label = `Quý ${quarter}/${year}`;
      } else {
        date.setDate(today.getDate() - i);
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        key = start.toISOString().slice(0, 10);
        label = start.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      }

      periods.push({
        key,
        label,
        start,
        end,
        revenue: 0,
        completedCount: 0,
        canceledCount: 0
      });
    }

    orders.forEach(function (order) {
      if (branchId && (!order.branch || order.branch.id !== branchId)) return;

      const date = new Date(getOrderDate(order));
      if (Number.isNaN(date.getTime())) return;

      const target = periods.find(function (item) {
        return date >= item.start && date <= item.end;
      });

      if (!target) return;

      if (isCompletedOrder(order)) {
        target.completedCount += 1;
        target.revenue += getOrderTotal(order);
      }

      if (isCanceledOrder(order)) {
        target.canceledCount += 1;
      }
    });

    return periods;
  }

  function renderRevenuePeriodBars(data) {
    const target = document.getElementById("revenueBars");
    if (!target) return;

    const max = Math.max.apply(null, data.map(function (item) {
      return item.revenue;
    }).concat([1]));

    target.innerHTML = data.map(function (item) {
      const height = Math.max(14, Math.round((item.revenue / max) * 260));

      return `
        <div class="revenue-bar-item">
          <div class="revenue-bar" style="height:${height}px" title="${formatMoney(item.revenue)}"></div>
          <div class="revenue-bar-label">
            <span>${item.label}</span>
            <span>${formatMoney(item.revenue)}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderRevenuePeriodTable(data) {
    const table = document.getElementById("revenuePeriodTable");
    if (!table) return;

    table.innerHTML = data.length
      ? data.map(function (item) {
          return `
            <tr>
              <td><strong>${item.label}</strong></td>
              <td><strong style="color:#137333;">${item.completedCount}</strong></td>
              <td><strong style="color:#c5221f;">${item.canceledCount}</strong></td>
              <td><strong style="color:var(--gibor-secondary-text);">${formatMoney(item.revenue)}</strong></td>
            </tr>
          `;
        }).join("")
      : `<tr><td class="admin-empty" colspan="4">Chưa có dữ liệu doanh thu.</td></tr>`;
  }

  /**
   * Hàm toàn cục để khởi chạy và kết xuất báo cáo doanh thu lên giao diện quản trị.
   */
  window.renderRevenueReport = function () {
    try {
      // Đọc toàn bộ danh sách đơn hàng từ bộ nhớ thông qua getOrders()
      const orders = (getOrders() || []).filter(Boolean);
      const activeBranchId = getActiveRevenueBranchId();
      const period = document.getElementById("filterRevenuePeriod")?.value || "day";
      const config = getPeriodConfig(period);

      const filteredOrders = activeBranchId
        ? orders.filter(function (order) {
            return order.branch && order.branch.id === activeBranchId;
          })
        : orders;

      const completedOrders = filteredOrders.filter(isCompletedOrder);
      const canceledOrders = filteredOrders.filter(isCanceledOrder);

      const data = buildRevenuePeriods(period, activeBranchId);
      const periodRevenue = data.reduce(function (sum, item) {
        return sum + item.revenue;
      }, 0);
      const periodCompleted = data.reduce(function (sum, item) {
        return sum + item.completedCount;
      }, 0);
      const avg = periodCompleted ? periodRevenue / periodCompleted : 0;
      const cancelRateValue = filteredOrders.length ? (canceledOrders.length / filteredOrders.length) * 100 : 0;
      const best = data.reduce(function (top, item) {
        return item.revenue > top.revenue ? item : top;
      }, data[0] || { revenue: 0, label: "-" });

      const desc = document.getElementById("revenueReportDesc");
      if (desc) desc.textContent = config.title + ".";

      if (document.getElementById("totalRevenueReal")) {
        document.getElementById("totalRevenueReal").textContent = formatMoney(periodRevenue);
      }

      if (document.getElementById("avgOrderValue")) {
        document.getElementById("avgOrderValue").textContent = formatMoney(avg);
      }

      if (document.getElementById("paidOrderCount")) {
        document.getElementById("paidOrderCount").textContent = periodCompleted;
      }

      if (document.getElementById("canceledOrderCount")) {
        document.getElementById("canceledOrderCount").textContent = canceledOrders.length;
      }

      if (document.getElementById("cancelRate")) {
        document.getElementById("cancelRate").textContent = cancelRateValue.toFixed(1) + "%";
      }

      if (document.getElementById("bestRevenueDay")) {
        document.getElementById("bestRevenueDay").textContent =
          best && best.revenue ? `${best.label} (${formatMoney(best.revenue)})` : "-";
      }

      renderRevenuePeriodBars(data);
      renderRevenuePeriodTable(data);
      renderBestSellersReport(filteredOrders);
      renderBranchRevenueComparison(orders, activeBranchId);
    } catch (error) {
      console.error("Error rendering custom revenue report:", error);
    }
  };

  function renderBranchRevenueComparison(orders, activeBranchId) {
    const tableBody = document.getElementById("branchRevenueComparisonTable");
    if (!tableBody) return;

    const branches = window.GIBOR_BRANCH_UTILS ? (window.GIBOR_BRANCH_UTILS.all() || []) : [];
    const completedOrders = orders.filter(isCompletedOrder);
    
    // Tính tổng doanh thu toàn hệ thống từ các đơn hàng hoàn tất
    const totalSystemRevenue = completedOrders.reduce(function (sum, order) {
      return sum + getOrderTotal(order);
    }, 0);

    const branchStats = branches.map(function (branch) {
      const branchOrders = completedOrders.filter(function (order) {
        return order.branch && String(order.branch.id) === String(branch.id);
      });
      const revenue = branchOrders.reduce(function (sum, order) {
        return sum + getOrderTotal(order);
      }, 0);
      const percentage = totalSystemRevenue > 0 ? (revenue / totalSystemRevenue) * 100 : 0;
      return {
        id: branch.id,
        name: branch.name,
        image: branch.image || "images/logo/logo.jpg",
        orderCount: branchOrders.length,
        revenue: revenue,
        percentage: percentage
      };
    });

    // Sắp xếp theo doanh thu giảm dần
    branchStats.sort(function (a, b) {
      return b.revenue - a.revenue;
    });

    if (branchStats.length === 0) {
      tableBody.innerHTML = `<tr><td class="admin-empty" colspan="4">Không có dữ liệu chi nhánh.</td></tr>`;
      return;
    }

    tableBody.innerHTML = branchStats.map(function (item) {
      const isSelected = activeBranchId && String(item.id) === String(activeBranchId);
      const rowClass = isSelected ? 'table-warning-subtle' : '';
      return `
        <tr class="${rowClass}">
          <td>
            <div class="d-flex align-items-center">
              <img src="${item.image}" alt="${item.name}" class="rounded-3 me-3 object-fit-cover" style="width: 42px; height: 42px; min-width: 42px;" onerror="this.src='images/logo/logo.jpg'">
              <div>
                <strong class="text-dark">${item.name}</strong> ${isSelected ? '<span class="badge bg-warning text-dark ms-1 small">Đang lọc</span>' : ''}
              </div>
            </div>
          </td>
          <td class="text-center fw-semibold text-secondary">${item.orderCount} đơn</td>
          <td class="text-end fw-bold text-success">${formatMoney(item.revenue)}</td>
          <td class="text-end">
            <div class="d-flex align-items-center justify-content-end gap-2">
              <span class="small fw-bold text-muted" style="min-width: 45px;">${item.percentage.toFixed(1)}%</span>
              <div class="progress" style="width: 100px; height: 6px; border-radius: 3px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${item.percentage}%" aria-valuenow="${item.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const periodFilter = document.getElementById("filterRevenuePeriod");
    if (periodFilter) {
      periodFilter.addEventListener("change", window.renderRevenueReport);
    }

    window.renderRevenueReport();
  });
})();

function getCustomerRank(spent, orderCount) {
  if (spent >= 3000000 || orderCount > 10) {
    return { key: "vip", label: "VIP 👑", class: "rank-vip" };
  } else if (spent >= 1500000 || orderCount >= 6) {
    return { key: "loyal", label: "Thân thiết 🤝", class: "rank-loyal" };
  } else if (spent >= 500000 || orderCount >= 3) {
    return { key: "potential", label: "Tiềm năng ⚡", class: "rank-potential" };
  } else {
    return { key: "new", label: "Mới 🌱", class: "rank-new" };
  }
}

function renderCustomers() {
  try {
    const tableBody = document.getElementById("customersTableBody");
    if (!tableBody) return;

    // Đọc danh sách tất cả người dùng trong hệ thống (sử dụng getUsers)
    const users = (getUsers() || []).filter(u => u !== null && u !== undefined);
    // Chỉ lọc ra các tài khoản là khách hàng (loại bỏ tài khoản Quản trị viên và Quản lý chi nhánh)
    let customers = users.filter(u => u.role !== 'admin' && u.role !== 'branch_manager');

    // Lấy toàn bộ đơn hàng hợp lệ đã làm sạch (sử dụng getOrders) để phục vụ tính toán chi tiêu khách hàng
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    
    // Lấy bộ lọc chi nhánh
    const filterBranchEl = document.getElementById("filterCustomerBranch");
    const filterBranchId = filterBranchEl ? filterBranchEl.value : "";

    // Lấy bộ lọc năm
    const filterYearEl = document.getElementById("filterCustomerYear");
    const filterYear = filterYearEl ? filterYearEl.value : "";

    const pointsData = JSON.parse(localStorage.getItem("gibor_points") || "{}");

    // Tính toán dữ liệu cho từng khách hàng
    let customerList = [];
    customers.forEach(user => {
      let userOrders = orders.filter(order => order && String(order.userId) === String(user.id));
      let completedUserOrders = userOrders.filter(order => ["Hoàn tất", "Đã hoàn tất", "Completed"].includes(order.status));
      
      // Tính toán thống kê theo từng năm của khách hàng này (trên tất cả đơn hàng hoàn tất)
      const yearStats = {};
      completedUserOrders.forEach(order => {
        const oDate = new Date(getOrderDate(order));
        const y = oDate.getFullYear();
        if (!Number.isNaN(y)) {
          if (!yearStats[y]) {
            yearStats[y] = { year: y, count: 0, spent: 0 };
          }
          yearStats[y].count += 1;
          yearStats[y].spent += getOrderTotal(order);
        }
      });

      // Áp dụng bộ lọc chi nhánh cho hiển thị bảng chính
      if (filterBranchId) {
        completedUserOrders = completedUserOrders.filter(order => order.branch && String(order.branch.id) === String(filterBranchId));
      }

      // Áp dụng bộ lọc năm cho hiển thị bảng chính
      if (filterYear) {
        completedUserOrders = completedUserOrders.filter(order => {
          const oDate = new Date(getOrderDate(order));
          return String(oDate.getFullYear()) === String(filterYear);
        });
      }

      // Nếu đang chọn lọc cụ thể theo chi nhánh hoặc năm, ẩn khách hàng này nếu không có giao dịch phù hợp
      if (filterBranchId || filterYear) {
        if (completedUserOrders.length === 0) {
          return;
        }
      }

      const orderCount = completedUserOrders.length;
      const totalSpent = completedUserOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
      const points = pointsData[user.id] || 0;

      // Tính toán chi nhánh mua nhiều nhất của khách hàng này (trên tất cả đơn hàng hoàn tất của họ)
      const branchStats = {};
      let allCompletedUserOrders = userOrders.filter(order => ["Hoàn tất", "Đã hoàn tất", "Completed"].includes(order.status));
      allCompletedUserOrders.forEach(order => {
        if (!order.branch) return;
        const bId = order.branch.id;
        const bName = order.branch.name || "Chi nhánh khác";
        if (!branchStats[bId]) {
          branchStats[bId] = { id: bId, name: bName, count: 0, spent: 0 };
        }
        branchStats[bId].count += 1;
        branchStats[bId].spent += getOrderTotal(order);
      });

      // Xác định chi nhánh mua nhiều nhất
      let favBranch = null;
      Object.values(branchStats).forEach(stat => {
        if (!favBranch) {
          favBranch = stat;
        } else {
          if (stat.count > favBranch.count) {
            favBranch = stat;
          } else if (stat.count === favBranch.count && stat.spent > favBranch.spent) {
            favBranch = stat;
          }
        }
      });

      customerList.push({
        id: user.id,
        displayName: user.displayName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.username || "Khách hàng",
        phone: user.phone || "-",
        email: user.email || "-",
        orderCount,
        totalSpent,
        points,
        favBranch,
        branchStats,
        yearStats,
        completedUserOrders: allCompletedUserOrders,
        user
      });
    });

    // Tìm Top 1, Top 2, Top 3 chi tiêu nhiều nhất (chỉ những ai có chi tiêu > 0)
    const spentSorted = [...customerList]
      .filter(c => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const top1Id = spentSorted[0] ? spentSorted[0].id : null;
    const top2Id = spentSorted[1] ? spentSorted[1].id : null;
    const top3Id = spentSorted[2] ? spentSorted[2].id : null;

    // Lọc theo tìm kiếm
    const searchInput = document.getElementById("searchCustomer");
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
    if (searchQuery) {
      customerList = customerList.filter(c => 
        c.displayName.toLowerCase().includes(searchQuery) ||
        c.email.toLowerCase().includes(searchQuery) ||
        c.phone.toLowerCase().includes(searchQuery)
      );
    }

    // Sắp xếp
    const sortByEl = document.getElementById("sortCustomerBy");
    const sortBy = sortByEl ? sortByEl.value : "totalSpent";

    if (sortBy === "totalSpent") {
      customerList.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === "orderCount") {
      customerList.sort((a, b) => b.orderCount - a.orderCount);
    } else if (sortBy === "points") {
      customerList.sort((a, b) => b.points - a.points);
    } else if (sortBy === "name") {
      customerList.sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
    }

    // Lưu danh sách đã tính toán vào biến toàn cục của window để dùng khi xem chi tiết
    window.GIBOR_CUSTOMER_LIST_DATA = customerList;

    // Phân trang
    const totalItems = customerList.length;
    const state = paginationState.customers;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedCustomers = customerList.slice(startIndex, endIndex);

    // Render ra bảng
    tableBody.innerHTML = paginatedCustomers.length
      ? paginatedCustomers.map(c => {
          let vipBadge = "";
          if (c.id === top1Id) {
            vipBadge = `<span class="badge bg-warning text-dark ms-2" style="font-size: 0.75rem; border: 1px solid #d39e00;"><i class="fa-solid fa-crown text-danger me-1"></i>Top 1 Chi tiêu</span>`;
          } else if (c.id === top2Id) {
            vipBadge = `<span class="badge bg-secondary text-white ms-2" style="font-size: 0.75rem;"><i class="fa-solid fa-medal me-1"></i>Top 2</span>`;
          } else if (c.id === top3Id) {
            vipBadge = `<span class="badge text-white ms-2" style="font-size: 0.75rem; background-color: #cd7f32;"><i class="fa-solid fa-medal me-1"></i>Top 3</span>`;
          }

          const totalLifetimeSpent = c.completedUserOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
          const lifetimeOrderCount = c.completedUserOrders.length;
          const rank = getCustomerRank(totalLifetimeSpent, lifetimeOrderCount);
          const rankBadge = `<span class="rank-badge ${rank.class} ms-2">${rank.label}</span>`;

          let favBranchText = `<div class="text-muted small mt-1"><i class="fa-solid fa-store-alt text-secondary me-1"></i>Chưa có giao dịch</div>`;
          if (c.favBranch) {
            favBranchText = `<div class="text-muted small mt-1" style="font-size: 0.8rem;"><i class="fa-solid fa-store text-danger me-1"></i>Thường mua tại: <strong class="text-dark">${escapeHTML(c.favBranch.name)}</strong> (${c.favBranch.count} đơn)</div>`;
          }

          return `
            <tr>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <span class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-bold rounded-circle" style="width: 38px; height: 38px; font-size: 0.85rem;">${escapeHTML(getInitials(c.user))}</span>
                  <div>
                    <div class="d-flex align-items-center flex-wrap">
                      <strong class="text-dark">${escapeHTML(c.displayName)}</strong>
                      ${vipBadge}
                      ${rankBadge}
                    </div>
                    ${favBranchText}
                  </div>
                </div>
              </td>
              <td>${escapeHTML(c.phone)}</td>
              <td>${escapeHTML(c.email)}</td>
              <td class="text-center"><strong class="text-primary">${c.orderCount}</strong> đơn</td>
              <td class="text-end fw-bold text-success">${formatMoney(c.totalSpent)}</td>
              <td class="text-center text-warning fw-bold"><i class="fa-solid fa-star me-1"></i>${c.points.toLocaleString("vi-VN")}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary px-3 rounded-pill btn-view-customer" data-id="${c.id}">
                  <i class="fa-solid fa-eye me-1"></i>Chi tiết
                </button>
              </td>
            </tr>
          `;
        }).join("")
      : `<tr><td class="text-center text-muted py-3" colspan="7">Không tìm thấy khách hàng phù hợp.</td></tr>`;

    renderPagination("customersPagination", totalItems, state.currentPage, state.pageSize);

    // Gắn sự kiện click xem chi tiết
    document.querySelectorAll(".btn-view-customer").forEach(btn => {
      btn.addEventListener("click", function() {
        const cId = this.dataset.id;
        showCustomerDetail(cId);
      });
    });

  } catch (error) {
    console.error("Error rendering customers table:", error);
  }
}

function showCustomerDetail(customerId) {
  try {
    const list = window.GIBOR_CUSTOMER_LIST_DATA || [];
    const customer = list.find(c => String(c.id) === String(customerId));
    if (!customer) return;

    // 1. Cập nhật thông tin cơ bản
    document.getElementById("detCustomerName").textContent = customer.displayName;
    document.getElementById("detCustomerPhone").textContent = customer.phone;
    document.getElementById("detCustomerEmail").textContent = customer.email;
    document.getElementById("detCustomerPoints").innerHTML = `<i class="fa-solid fa-star me-1"></i>${customer.points.toLocaleString("vi-VN")}`;
    document.getElementById("detCustomerTotalOrders").textContent = `${customer.completedUserOrders.length} đơn`;
    
    const allCompletedSpent = customer.completedUserOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    document.getElementById("detCustomerTotalSpent").textContent = formatMoney(allCompletedSpent);

    // Avatar
    const avatarEl = document.getElementById("detCustomerAvatar");
    if (avatarEl) {
      avatarEl.textContent = getInitials(customer.user);
    }

    // Hạng thành viên động
    const totalLifetimeSpent = customer.completedUserOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const lifetimeOrderCount = customer.completedUserOrders.length;
    const rank = getCustomerRank(totalLifetimeSpent, lifetimeOrderCount);
    const rankBadgeEl = document.getElementById("detCustomerRankBadge");
    if (rankBadgeEl) {
      rankBadgeEl.innerHTML = `<span class="rank-badge ${rank.class}">${rank.label}</span>`;
    }

    // VIP Badge trong modal
    const badgeContainer = document.getElementById("detCustomerVIPBadge");
    if (badgeContainer) {
      // Tìm thứ hạng chi tiêu trong danh sách gốc
      const sortedAll = [...list]
        .filter(c => c.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent);
      
      const rankIdx = sortedAll.findIndex(c => String(c.id) === String(customer.id));
      if (rankIdx === 0) {
        badgeContainer.innerHTML = `<span class="badge bg-warning text-dark" style="border: 1px solid #d39e00;"><i class="fa-solid fa-crown text-danger me-1"></i>Top 1 Chi tiêu</span>`;
      } else if (rankIdx === 1) {
        badgeContainer.innerHTML = `<span class="badge bg-secondary text-white"><i class="fa-solid fa-medal me-1"></i>Top 2</span>`;
      } else if (rankIdx === 2) {
        badgeContainer.innerHTML = `<span class="badge text-white" style="background-color: #cd7f32;"><i class="fa-solid fa-medal me-1"></i>Top 3</span>`;
      } else {
        badgeContainer.innerHTML = "";
      }
    }

    // 2. Banner Chi nhánh mua nhiều nhất
    const favContainer = document.getElementById("detCustomerFavBranchContainer");
    const favNameEl = document.getElementById("detCustomerFavBranchName");
    if (customer.favBranch) {
      favContainer.style.setProperty("display", "flex", "important");
      favNameEl.textContent = `${customer.favBranch.name} (${customer.favBranch.count} đơn - ${formatMoney(customer.favBranch.spent)})`;
    } else {
      favContainer.style.setProperty("display", "none", "important");
    }

    // 3. Render bảng thống kê chi nhánh
    const branchTable = document.getElementById("detCustomerBranchTableBody");
    const statsList = Object.values(customer.branchStats || {});
    if (statsList.length > 0) {
      // Sắp xếp chi nhánh theo số đơn mua giảm dần
      statsList.sort((a, b) => b.count - a.count || b.spent - a.spent);

      branchTable.innerHTML = statsList.map(stat => {
        const ratio = allCompletedSpent > 0 ? ((stat.spent / allCompletedSpent) * 100).toFixed(1) : "0.0";
        const isFav = customer.favBranch && stat.id === customer.favBranch.id;
        const favMarker = isFav ? `<span class="badge bg-warning-subtle text-warning-emphasis ms-2"><i class="fa-solid fa-heart me-1"></i>Nhiều nhất</span>` : "";

        return `
          <tr class="${isFav ? 'table-warning-subtle' : ''}">
            <td><strong>${escapeHTML(stat.name)}</strong>${favMarker}</td>
            <td class="text-center fw-bold text-dark">${stat.count} đơn</td>
            <td class="text-end text-success fw-bold">${formatMoney(stat.spent)}</td>
            <td class="text-end text-muted small">${ratio}%</td>
          </tr>
        `;
      }).join("");
    } else {
      branchTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Chưa phát sinh giao dịch thành công tại chi nhánh nào.</td></tr>`;
    }

    // 3.5. Render bảng thống kê theo năm
    const yearTable = document.getElementById("detCustomerYearTableBody");
    const yearStatsList = Object.values(customer.yearStats || {});
    if (yearStatsList.length > 0) {
      // Sắp xếp các năm mới nhất lên đầu
      yearStatsList.sort((a, b) => b.year - a.year);

      yearTable.innerHTML = yearStatsList.map(stat => {
        return `
          <tr>
            <td><strong>Năm ${stat.year}</strong></td>
            <td class="text-center fw-bold text-dark">${stat.count} đơn</td>
            <td class="text-end text-success fw-bold">${formatMoney(stat.spent)}</td>
          </tr>
        `;
      }).join("");
    } else {
      yearTable.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">Chưa phát sinh giao dịch thành công trong năm nào.</td></tr>`;
    }

    // 4. Render 5 đơn hàng gần nhất
    const ordersTable = document.getElementById("detCustomerOrdersTableBody");
    const recentOrders = [...customer.completedUserOrders]
      .sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)))
      .slice(0, 5);

    if (recentOrders.length > 0) {
      ordersTable.innerHTML = recentOrders.map(order => {
        const dateStr = formatDate(getOrderDate(order));
        const branchName = order.branch ? order.branch.name : "Trực tuyến";
        const code = order.code || order.id || "GIBOR";
        
        let paymentBadge = `<span class="badge bg-secondary-subtle text-secondary-emphasis">Khác</span>`;
        const payMethod = String(order.paymentMethod || order.payment || "").toLowerCase();
        if (payMethod.includes("momo")) {
          paymentBadge = `<span class="badge bg-danger-subtle text-danger"><i class="fa-brands fa-paypal me-1"></i>MoMo</span>`;
        } else if (payMethod.includes("chuyển khoản") || payMethod.includes("banking") || payMethod.includes("payos")) {
          paymentBadge = `<span class="badge bg-primary-subtle text-primary"><i class="fa-solid fa-university me-1"></i>Banking</span>`;
        } else if (payMethod.includes("tiền mặt") || payMethod.includes("cash") || payMethod.includes("cod")) {
          paymentBadge = `<span class="badge bg-success-subtle text-success"><i class="fa-solid fa-money-bill-wave me-1"></i>Tiền mặt</span>`;
        }

        return `
          <tr>
            <td><strong>${escapeHTML(code)}</strong></td>
            <td>${dateStr}</td>
            <td>${escapeHTML(branchName)}</td>
            <td class="text-end fw-bold text-dark">${formatMoney(getOrderTotal(order))}</td>
            <td class="text-center">${paymentBadge}</td>
          </tr>
        `;
      }).join("");
    } else {
      ordersTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Chưa có giao dịch hoàn tất nào gần đây.</td></tr>`;
    }

    // 5. Hiển thị modal
    const modalEl = document.getElementById("customerDetailModal");
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  } catch (e) {
    console.error("Error showing customer detail:", e);
  }
}
