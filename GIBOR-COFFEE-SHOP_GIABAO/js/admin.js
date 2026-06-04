/* ========================================================================================

                                    TRANG ADMIN

============================================================================================= */

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
  if (typeof ProductManager !== "undefined") {
    ProductManager.saveProducts(products);
    return;
  }
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
}

function getUsers() {
  if (typeof UserManager !== "undefined") return UserManager.getUsers();
  return parseJSON(_USERS_KEY, []);
}

function saveUsers(users) {
  if (typeof UserManager !== "undefined") {
    UserManager.saveUsers(users);
    return;
  }
  localStorage.setItem(_USERS_KEY, JSON.stringify(users));
}

function getCurrentAdminUser() {
  if (typeof UserManager !== "undefined") return UserManager.getCurrentUser();
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

function getOrders() {
  const orders = parseJSON(_ORDERS_KEY, []);
  return (Array.isArray(orders) ? orders : []).filter(o => o !== null && o !== undefined);
}

function saveOrders(orders) {
  localStorage.setItem(_ORDERS_KEY, JSON.stringify(orders));
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  function getRevenueByDay(days = 7, branchId = "") {
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    const today = new Date();
    const labels = [];
  
    for (let index = days - 1; index >= 0; index--) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      labels.push({
        key,
        label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        value: 0,
      });
    }
  
    orders.forEach((order) => {
      if (!order) return;
      // Chỉ tính các đơn hàng "Hoàn tất"
      if (order.status !== "Hoàn tất") return;

      // Lọc theo chi nhánh nếu có yêu cầu
      if (branchId && (!order.branch || order.branch.id !== branchId)) return;

      const date = new Date(getOrderDate(order));
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const target = labels.find((item) => item.key === key);
      if (target) target.value += getOrderTotal(order);
    });
  
    return labels;
  }

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
    const users = getUsers() || [];
    const products = getProducts() || [];
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    
    // Xác định chi nhánh cần lọc
    let activeBranchId = "";
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    if (currentUser) {
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } else if (currentUser.role === "admin") {
        const dbBranchFilter = document.getElementById("dashboardBranchFilter");
        if (dbBranchFilter && dbBranchFilter.value !== "all") {
          activeBranchId = dbBranchFilter.value;
        }
      }
    }

    // Lọc đơn hàng theo chi nhánh
    const filteredOrders = activeBranchId 
      ? orders.filter(o => o && o.branch && o.branch.id === activeBranchId)
      : orders;

    const completedOrders = filteredOrders.filter(o => o && o.status === "Hoàn tất");
    const revenue = completedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    const statUsers = document.getElementById("statUsers");
    const statProducts = document.getElementById("statProducts");
    const statOrders = document.getElementById("statOrders");
    const statRevenue = document.getElementById("statRevenue");

    if (statUsers) statUsers.textContent = users.length;
    if (statProducts) statProducts.textContent = products.length;
    if (statOrders) statOrders.textContent = filteredOrders.length;
    if (statRevenue) statRevenue.textContent = formatMoney(revenue);

    const recentTable = document.getElementById("recentOrdersTable");
    if (recentTable) {
      const recentOrders = [...filteredOrders]
        .sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)))
        .slice(0, 5);
 
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

    table.innerHTML = users.length
      ? users
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
                        <i class="fas fa-pen"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-warning" data-lock-user="${escapeHTML(user.id)}" title="Khóa/Mở khóa">
                        <i class="fas ${user.status === 'locked' ? 'fa-lock' : 'fa-unlock'}"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" data-reset-password-user="${escapeHTML(user.id)}" title="Đặt lại mật khẩu">
                        <i class="fas fa-key"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" data-delete-user="${escapeHTML(user.id)}" title="Xóa tài khoản">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="5">Không tìm thấy tài khoản phù hợp.</td></tr>`;
  } catch (error) {
    console.error("Error rendering accounts:", error);
  }
}

function renderProducts() {
  try {
    const table = document.getElementById("productsTable");
    if (!table) return;

    let products = (getProducts() || []).filter(p => p !== null && p !== undefined);

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

    table.innerHTML = products.length
      ? products
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
                  <td><strong style="color: var(--gibor-secondary-text);">${formatMoney(product.price)}</strong></td>
                  <td>
                    ${product.status === "out_of_stock" 
                      ? '<span class="badge bg-danger">Hết hàng</span>' 
                      : '<span class="badge bg-success">Còn hàng</span>'
                    }
                    ${product.isBestSeller ? '<span class="badge bg-warning text-dark ms-1"><i class="fa-solid fa-fire text-danger"></i> Nổi bật</span>' : ''}
                  </td>
                  <td>
                    <div class="d-flex gap-1 justify-content-end">
                      <button class="btn btn-sm btn-outline-primary" data-edit-product="${escapeHTML(product.id)}" title="Sửa">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" data-delete-product="${escapeHTML(product.id)}" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="6">Không có sản phẩm nào.</td></tr>`;

    const statProducts = document.getElementById("statProducts");
    if (statProducts) {
      statProducts.textContent = products.length;
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

    // Xác định phân quyền và lọc theo chi nhánh của người đăng nhập
    let activeBranchId = "";
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    if (currentUser) {
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } else if (currentUser.role === "admin") {
        const branchFilter = document.getElementById("filterOrderBranch");
        if (branchFilter && branchFilter.value) {
          activeBranchId = branchFilter.value;
        }
      }
    }

    if (activeBranchId) {
      orders = orders.filter(o => o && o.branch && o.branch.id === activeBranchId);
    }

    // Áp dụng bộ lọc tìm kiếm
    const searchQuery = document.getElementById("searchOrder") ? document.getElementById("searchOrder").value.toLowerCase().trim() : "";
    const filterStat = document.getElementById("filterOrderStatus") ? document.getElementById("filterOrderStatus").value : "";

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
      orders = orders.filter(o => o && (o.status || "Đã ghi nhận") === filterStat);
    }

    table.innerHTML = orders.length
      ? orders
          .map(
            (order, index) => {
              if (!order) return "";
              const orderCode = order.code || order.id || `DH-${index + 1}`;
              
              // Chi nhánh xử lý: Hiển thị tĩnh đồng bộ từ đơn đặt hàng
              const branchCellHtml = `<span style="font-weight:700; color:var(--gibor-secondary-text); font-size:0.85rem;"><i class="fas fa-store" style="color:#e28743;"></i> ${order.branch ? escapeHTML(order.branch.name) : "Giao hàng tận nơi"}</span>`;

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
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="text-center text-muted py-3" colspan="7">Không tìm thấy đơn hàng phù hợp.</td></tr>`;
  } catch (error) {
    console.error("Error rendering orders:", error);
  }
}

function renderRevenueReport() {
  try {
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    
    // Xác định chi nhánh cần lọc
    let activeBranchId = "";
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    if (currentUser) {
      if (currentUser.role === "branch_manager") {
        activeBranchId = currentUser.branchId;
      } else if (currentUser.role === "admin") {
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
        
        if (!stats[name]) {
          stats[name] = { productName: name, quantitySold: 0, revenue: 0 };
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
                <td><strong style="color: var(--gibor-primary-text);">${escapeHTML(item.productName)}</strong></td>
                <td><strong style="color: #137333;">${item.quantitySold} ly/phần</strong></td>
                <td><strong style="color: var(--gibor-secondary-text);">${formatMoney(item.revenue)}</strong></td>
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
  document.getElementById("productId").value = "";
  document.getElementById("productForm").reset();
  if (document.getElementById("productImg")) document.getElementById("productImg").value = "";
  if (document.getElementById("productDesc")) document.getElementById("productDesc").value = "";
  if (document.getElementById("productBestSeller")) document.getElementById("productBestSeller").checked = false;
  if (document.getElementById("productStatus")) document.getElementById("productStatus").checked = true;
  document.getElementById("productSubmitText").textContent = "Thêm sản phẩm";
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
  console.log("Khởi tạo bindNavigation, tìm thấy số nút điều hướng:", navButtons.length);

  navButtons.forEach((button) => {
    const tab = button.dataset.adminTab;
    if (!tab) {
      console.log("Bỏ qua nút không có data-admin-tab:", button.textContent.trim());
      return; 
    }

    console.log("Đã gán sự kiện click cho tab điều hướng:", tab);

    button.addEventListener("click", () => {
      console.log("Người dùng click chuyển sang tab:", tab);
      document.querySelectorAll(".admin-nav-btn").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.remove("active"));
      
      button.classList.add("active");
      
      const panel = document.querySelector(`[data-admin-panel="${tab}"]`);
      if (panel) {
        panel.classList.add("active");
        console.log(`Đã kích hoạt panel [data-admin-panel="${tab}"] thành công`);
      } else {
        console.warn(`Không tìm thấy panel tương ứng cho tab: ${tab}`);
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
        alert("Vui lòng điền đầy đủ tên, danh mục và giá sản phẩm phải lớn hơn 0.");
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
            status 
          };
          alert("Cập nhật sản phẩm thành công!");
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
          status 
        });
        alert("Thêm sản phẩm mới thành công!");
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
        alert("Không reset mật khẩu tài khoản admin chính từ bảng này.");
        return;
      }

      const newPass = prompt(`Nhập mật khẩu mới cho ${user.email || user.username}:`, "123456");
      if (newPass) {
        if (newPass.length < 6) {
          alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
          return;
        }
        user.password = newPass;
        saveUsers(users);
        alert("Đã reset mật khẩu thành công.");
      }
    }

    if (lockUserId) {
      if (lockUserId === "admin-001") {
        alert("Không thể khóa/mở khóa tài khoản admin chính!");
        return;
      }
      const currentUser = parseJSON("gibor_current_user", null);
      if (currentUser && String(currentUser.id) === String(lockUserId)) {
        alert("Không thể tự khóa tài khoản của chính mình!");
        return;
      }

      const users = getUsers();
      const user = users.find((u) => String(u.id) === String(lockUserId));
      if (user) {
        user.status = user.status === "locked" ? "active" : "locked";
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

      // Cảnh báo nếu có đơn hàng hoạt động chưa hoàn thành được gán cho chi nhánh này
      const orders = getOrders();
      const activeBranchOrders = orders.filter(o => o && o.branch && (o.branch.id === b.id || o.branch.name === b.name) && o.status !== "Hoàn tất" && o.status !== "Đã hủy");
      if (activeBranchOrders.length > 0) {
        alert(`Không thể xóa chi nhánh vì hiện đang có ${activeBranchOrders.length} đơn hàng chưa hoàn thành do chi nhánh này xử lý.`);
        return;
      }

      if (confirm(`Bạn có chắc muốn xoá chi nhánh "${b.name}"?`)) {
        window.GIBOR_BRANCH_UTILS.delete(deleteBranchId);
        renderAll();
      }
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

    if (deleteProductId && confirm("Bạn có chắc muốn xoá sản phẩm này?")) {
      saveProducts(getProducts().filter((product) => product.id !== deleteProductId));
      renderAll();
    }

    if (deleteUserId && confirm("Bạn có chắc muốn xoá tài khoản này?")) {
      if (deleteUserId === "admin-001") {
        alert("Không thể xóa tài khoản admin chính!");
        return;
      }
      const currentUser = parseJSON("gibor_current_user", null);
      if (currentUser && String(currentUser.id) === String(deleteUserId)) {
        alert("Không thể xóa tài khoản đang đăng nhập!");
        return;
      }
      
      const users = getUsers().filter((user) => String(user.id) !== String(deleteUserId));
      saveUsers(users);
      renderAll();
    }
  });

  document.addEventListener("change", (event) => {
    // 1. Cập nhật Trạng thái đơn hàng
    if (event.target.matches("[data-order-code]")) {
      const orders = getOrders();
      const code = event.target.dataset.orderCode;
      const orderIdx = orders.findIndex(o => (o.code || o.id) === code);
      if (orderIdx === -1) return;
      
      const newStatus = event.target.value;
      orders[orderIdx].status = newStatus;
      
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
      const orders = getOrders();
      const code = event.target.dataset.orderCodePaystat;
      const orderIdx = orders.findIndex(o => (o.code || o.id) === code);
      if (orderIdx === -1) return;
      
      orders[orderIdx].paymentStatus = event.target.value;
      saveOrders(orders);
      renderAll();
    }
  });

  // Tự động đồng bộ giao diện Admin khi có đơn hàng mới được tạo từ trang thanh toán ở tab khác
  window.addEventListener("storage", (e) => {
    if (e.key === _ORDERS_KEY || e.key === "gibor_orders") {
      console.log("Phát hiện dữ liệu đơn hàng mới từ tab khác. Tự động đồng bộ thời gian thực...");
      renderAll();
    }
  });
}

function handleLogout() {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    if (typeof UserManager !== 'undefined') {
      UserManager.logout();
    } else {
      localStorage.removeItem("gibor_current_user");
    }
    window.location.href = "login.html";
  }
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
  if (searchProduct) searchProduct.addEventListener("input", renderProducts);
  if (filterProductCat) filterProductCat.addEventListener("change", renderProducts);
  if (filterProductStat) filterProductStat.addEventListener("change", renderProducts);

  // Bộ lọc đơn hàng
  const searchOrder = document.getElementById("searchOrder");
  const filterOrderBranch = document.getElementById("filterOrderBranch");
  const filterOrderStatus = document.getElementById("filterOrderStatus");
  if (searchOrder) searchOrder.addEventListener("input", renderOrders);
  if (filterOrderBranch) filterOrderBranch.addEventListener("change", renderOrders);
  if (filterOrderStatus) filterOrderStatus.addEventListener("change", renderOrders);

  // Bộ lọc tài khoản
  const searchAccount = document.getElementById("searchAccount");
  const filterAccountRole = document.getElementById("filterAccountRole");
  const filterAccountStatus = document.getElementById("filterAccountStatus");
  if (searchAccount) searchAccount.addEventListener("input", renderAccounts);
  if (filterAccountRole) filterAccountRole.addEventListener("change", renderAccounts);
  if (filterAccountStatus) filterAccountStatus.addEventListener("change", renderAccounts);

  // Bộ lọc chi nhánh
  const searchBranch = document.getElementById("searchBranch");
  const filterBranchCity = document.getElementById("filterBranchCity");
  if (searchBranch) searchBranch.addEventListener("input", renderBranches);
  if (filterBranchCity) filterBranchCity.addEventListener("change", renderBranches);

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
  if (searchCustomer) searchCustomer.addEventListener("input", renderCustomers);
  if (filterCustomerBranch) filterCustomerBranch.addEventListener("change", renderCustomers);
  if (filterCustomerYear) filterCustomerYear.addEventListener("change", renderCustomers);
  if (sortCustomerBy) sortCustomerBy.addEventListener("change", renderCustomers);
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
    
    // Ẩn các nút điều hướng sidebar đến accounts, products (giữ lại branches để xem tất cả chi nhánh)
    const forbiddenTabs = ["accounts", "products"];
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      const tab = btn.dataset.adminTab;
      if (forbiddenTabs.includes(tab)) {
        btn.style.display = "none";
      }
    });

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
    if (sidebarRole) sidebarRole.textContent = "Quản trị tối cao";
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
  
  if (typeof UserManager !== 'undefined') {
    currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      if (UserManager.isAdmin() || currentUser.role === "branch_manager") {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    alert("Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập bằng tài khoản quản lý hoặc admin.");
    window.location.href = "login.html";
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
      console.log(`▶ Đang chạy: ${step.name}`);
      step.fn();
      console.log(`✅ Hoàn thành: ${step.name}`);
    } catch (error) {
      console.error(`❌ Lỗi trong bước khởi tạo ${step.name}:`, error);
    }
  });

  console.log("✅ Trang Admin đã khởi tạo hoàn tất.");
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
      alert("Vui lòng điền đầy đủ họ tên, email và số điện thoại.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email không đúng định dạng.");
      return;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0).");
      return;
    }

    if (isEmailUsedByAnotherUser(users, email, idStr)) {
      alert("Email này đã được sử dụng bởi tài khoản khác.");
      return;
    }

    if (roleVal === "branch_manager" && !branchVal) {
      alert("Vui lòng chọn chi nhánh cho tài khoản Branch Manager.");
      return;
    }

    const currentUser = getCurrentAdminUser();
    const targetUser = idStr === "" ? null : users.find(u => String(u.id) === String(idStr));
    if (targetUser && isProtectedAdminUser(targetUser) && roleVal !== "admin") {
      alert("Không thể hạ quyền tài khoản admin chính.");
      return;
    }
    if (targetUser && currentUser && String(currentUser.id) === String(targetUser.id) && roleVal !== "admin") {
      alert("Không thể tự hạ quyền tài khoản đang đăng nhập.");
      return;
    }

    if (idStr === "") {
      // Thêm mới tài khoản
      if (!password || password.length < 6) {
        alert("Vui lòng nhập mật khẩu mới có ít nhất 6 ký tự.");
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
      };
      users.push(newUser);
      alert("Thêm tài khoản mới thành công!");
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
        if (password) {
          if (password.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
          }
          users[index].password = password;
        }
        alert("Cập nhật tài khoản thành công!");
      }
    }

    saveUsers(users);

    if (currentUser && idStr !== "" && String(currentUser.id) === String(idStr) && typeof UserManager !== "undefined") {
      const updatedSelf = users.find(u => String(u.id) === String(idStr));
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
    const currentUser = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
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

    table.innerHTML = list.length
      ? list.map(b => {
          let actionCellHtml = "";
          if (!isBranchManager) {
            actionCellHtml = `
              <td>
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm btn-outline-primary" data-edit-branch="${escapeHTML(b.id)}" title="Sửa">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-delete-branch="${escapeHTML(b.id)}" title="Xóa">
                    <i class="fas fa-trash"></i>
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

    // Cập nhật thẻ thống kê chi nhánh ở Dashboard
    const statBranches = document.getElementById("statBranches");
    if (statBranches) {
      statBranches.textContent = list.length;
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
        alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Email chi nhánh không đúng định dạng.");
        return;
      }

      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        alert("Số điện thoại liên hệ không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0).");
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
          alert("Cập nhật chi nhánh thành công!");
        } else {
          alert("Cập nhật thất bại.");
        }
      } else {
        window.GIBOR_BRANCH_UTILS.add(branchData);
        alert("Thêm chi nhánh mới thành công!");
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

    if (clientIdInput) clientIdInput.value = localStorage.getItem("gibor_payos_client_id" + suffix) || "";
    if (apiKeyInput) apiKeyInput.value = localStorage.getItem("gibor_payos_api_key" + suffix) || "";
    if (checksumKeyInput) checksumKeyInput.value = localStorage.getItem("gibor_payos_checksum_key" + suffix) || "";

    const autoSync = localStorage.getItem("gibor_payos_mock_toggle" + suffix);
    if (mockToggle) {
      mockToggle.checked = autoSync !== "false"; // Mặc định là true
    }
  }

  if (branchSelect) {
    branchSelect.addEventListener("change", loadPayosConfig);
  }

  // Phân quyền kiểm tra người dùng hiện tại
  const currentUser = typeof UserManager !== "undefined" ? UserManager.getCurrentUser() : null;
  const isBranchManager = currentUser && currentUser.role === "branch_manager";

  if (isBranchManager) {
    // Nếu là quản lý chi nhánh:
    // 1. Khóa select chọn chi nhánh, chỉ cho xem chi nhánh của họ
    if (branchSelect) {
      branchSelect.value = currentUser.branchId || "";
      branchSelect.disabled = true;
    }
    // 2. Disable tất cả ô nhập key
    if (clientIdInput) clientIdInput.disabled = true;
    if (apiKeyInput) apiKeyInput.disabled = true;
    if (checksumKeyInput) checksumKeyInput.disabled = true;
    if (mockToggle) mockToggle.disabled = true;

    // 3. Khóa nút lưu
    const saveBtn = form.querySelector("button[type='submit']");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-lock me-2"></i> Chỉ Admin mới được quyền sửa';
      saveBtn.className = "btn btn-secondary text-white fw-bold px-4 rounded-pill";
    }
  }

  // Khởi tạo hiển thị ban đầu
  loadPayosConfig();

  // Xử lý nút toggle ẩn/hiện password key
  form.querySelectorAll(".toggle-password-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        const icon = btn.querySelector("i");
        if (icon) {
          icon.className = isPassword ? "fas fa-eye" : "fas fa-eye-slash";
        }
      }
    });
  });

  // Sự kiện submit lưu cấu hình (chỉ chạy đối với admin)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isBranchManager) {
      alert("Bạn không có quyền sửa cấu hình payOS.");
      return;
    }

    const branchId = branchSelect ? branchSelect.value : "";
    const suffix = branchId ? "_" + branchId : "";

    const clientId = clientIdInput ? clientIdInput.value.trim() : "";
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : "";
    const checksumKey = checksumKeyInput ? checksumKeyInput.value.trim() : "";

    if (!clientId || !apiKey || !checksumKey) {
      alert("Vui lòng điền đầy đủ Client ID, API Key và Checksum Key payOS.");
      return;
    }

    localStorage.setItem("gibor_payos_client_id" + suffix, clientId);
    localStorage.setItem("gibor_payos_api_key" + suffix, apiKey);
    localStorage.setItem("gibor_payos_checksum_key" + suffix, checksumKey);

    if (mockToggle) {
      localStorage.setItem("gibor_payos_mock_toggle" + suffix, mockToggle.checked ? "true" : "false");
    }

    alert(`Đã lưu cấu hình payOS cho ${branchId ? "chi nhánh này" : "toàn hệ thống"}.`);
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

  function getActiveRevenueBranchId() {
    let activeBranchId = "";
    const currentUser = typeof UserManager !== "undefined" ? UserManager.getCurrentUser() : null;

    if (currentUser && currentUser.role === "branch_manager") {
      activeBranchId = currentUser.branchId || "";
    } else {
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
              <td><strong style="color:#5f3d24;">${formatMoney(item.revenue)}</strong></td>
            </tr>
          `;
        }).join("")
      : `<tr><td class="admin-empty" colspan="4">Chưa có dữ liệu doanh thu.</td></tr>`;
  }

  window.renderRevenueReport = function () {
    try {
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
    } catch (error) {
      console.error("Error rendering custom revenue report:", error);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    const periodFilter = document.getElementById("filterRevenuePeriod");
    if (periodFilter) {
      periodFilter.addEventListener("change", window.renderRevenueReport);
    }

    window.renderRevenueReport();
  });
})();

function renderCustomers() {
  try {
    const tableBody = document.getElementById("customersTableBody");
    if (!tableBody) return;

    const users = (getUsers() || []).filter(u => u !== null && u !== undefined);
    // Chỉ hiển thị khách hàng (role !== 'admin' && role !== 'branch_manager')
    let customers = users.filter(u => u.role !== 'admin' && u.role !== 'branch_manager');

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

    // Render ra bảng
    tableBody.innerHTML = customerList.length
      ? customerList.map(c => {
          let vipBadge = "";
          if (c.id === top1Id) {
            vipBadge = `<span class="badge bg-warning text-dark ms-2" style="font-size: 0.75rem; border: 1px solid #d39e00;"><i class="fas fa-crown text-danger me-1"></i>Top 1 Chi tiêu</span>`;
          } else if (c.id === top2Id) {
            vipBadge = `<span class="badge bg-secondary text-white ms-2" style="font-size: 0.75rem;"><i class="fas fa-medal me-1"></i>Top 2</span>`;
          } else if (c.id === top3Id) {
            vipBadge = `<span class="badge text-white ms-2" style="font-size: 0.75rem; background-color: #cd7f32;"><i class="fas fa-medal me-1"></i>Top 3</span>`;
          }

          let favBranchText = `<div class="text-muted small mt-1"><i class="fas fa-store-alt text-secondary me-1"></i>Chưa có giao dịch</div>`;
          if (c.favBranch) {
            favBranchText = `<div class="text-muted small mt-1" style="font-size: 0.8rem;"><i class="fas fa-store text-danger me-1"></i>Thường mua tại: <strong class="text-dark">${escapeHTML(c.favBranch.name)}</strong> (${c.favBranch.count} đơn)</div>`;
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
                    </div>
                    ${favBranchText}
                  </div>
                </div>
              </td>
              <td>${escapeHTML(c.phone)}</td>
              <td>${escapeHTML(c.email)}</td>
              <td class="text-center"><strong class="text-primary">${c.orderCount}</strong> đơn</td>
              <td class="text-end fw-bold text-success">${formatMoney(c.totalSpent)}</td>
              <td class="text-center text-warning fw-bold"><i class="fas fa-star me-1"></i>${c.points.toLocaleString("vi-VN")}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary px-3 rounded-pill btn-view-customer" data-id="${c.id}">
                  <i class="fas fa-eye me-1"></i>Chi tiết
                </button>
              </td>
            </tr>
          `;
        }).join("")
      : `<tr><td class="text-center text-muted py-3" colspan="7">Không tìm thấy khách hàng phù hợp.</td></tr>`;

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
    document.getElementById("detCustomerPoints").innerHTML = `<i class="fas fa-star me-1"></i>${customer.points.toLocaleString("vi-VN")}`;
    document.getElementById("detCustomerTotalOrders").textContent = `${customer.completedUserOrders.length} đơn`;
    
    const allCompletedSpent = customer.completedUserOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    document.getElementById("detCustomerTotalSpent").textContent = formatMoney(allCompletedSpent);

    // Avatar
    const avatarEl = document.getElementById("detCustomerAvatar");
    if (avatarEl) {
      avatarEl.textContent = getInitials(customer.user);
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
        badgeContainer.innerHTML = `<span class="badge bg-warning text-dark" style="border: 1px solid #d39e00;"><i class="fas fa-crown text-danger me-1"></i>Top 1 Chi tiêu</span>`;
      } else if (rankIdx === 1) {
        badgeContainer.innerHTML = `<span class="badge bg-secondary text-white"><i class="fas fa-medal me-1"></i>Top 2</span>`;
      } else if (rankIdx === 2) {
        badgeContainer.innerHTML = `<span class="badge text-white" style="background-color: #cd7f32;"><i class="fas fa-medal me-1"></i>Top 3</span>`;
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
        const favMarker = isFav ? `<span class="badge bg-warning-subtle text-warning-emphasis ms-2"><i class="fas fa-heart me-1"></i>Nhiều nhất</span>` : "";

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
          paymentBadge = `<span class="badge bg-danger-subtle text-danger"><i class="fab fa-paypal me-1"></i>MoMo</span>`;
        } else if (payMethod.includes("chuyển khoản") || payMethod.includes("banking") || payMethod.includes("payos")) {
          paymentBadge = `<span class="badge bg-primary-subtle text-primary"><i class="fas fa-university me-1"></i>Banking</span>`;
        } else if (payMethod.includes("tiền mặt") || payMethod.includes("cash") || payMethod.includes("cod")) {
          paymentBadge = `<span class="badge bg-success-subtle text-success"><i class="fas fa-money-bill-wave me-1"></i>Tiền mặt</span>`;
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
