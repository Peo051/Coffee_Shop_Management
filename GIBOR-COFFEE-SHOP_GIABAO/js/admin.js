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

const ADMIN_PRODUCTS_KEY = "gibor_admin_products";
const ADMIN_ORDERS_KEY = "gibor_orders";
const ADMIN_USERS_KEY = "gibor_users";

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
  return parseJSON(ADMIN_USERS_KEY, []);
}

function getOrders() {
  return parseJSON(ADMIN_ORDERS_KEY, []);
}

function saveOrders(orders) {
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
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

  function getRevenueByDay(days = 7) {
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

      const date = new Date(getOrderDate(order));
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const target = labels.find((item) => item.key === key);
      if (target) target.value += getOrderTotal(order);
    });
  
    return labels;
  }

function renderRevenueBars(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const data = getRevenueByDay(7);
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
    
    const completedOrders = orders.filter(o => o && o.status === "Hoàn tất");
    const revenue = completedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    const statUsers = document.getElementById("statUsers");
    const statProducts = document.getElementById("statProducts");
    const statOrders = document.getElementById("statOrders");
    const statRevenue = document.getElementById("statRevenue");

    if (statUsers) statUsers.textContent = users.length;
    if (statProducts) statProducts.textContent = products.length;
    if (statOrders) statOrders.textContent = orders.length;
    if (statRevenue) statRevenue.textContent = formatMoney(revenue);

    const recentTable = document.getElementById("recentOrdersTable");
    if (recentTable) {
      const recentOrders = [...orders]
        .sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)))
        .slice(0, 5);

      recentTable.innerHTML = recentOrders.length
        ? recentOrders
            .map(
              (order) => `
                <tr>
                  <td><strong>${escapeHTML(order.code || order.id || "GIBOR")}</strong></td>
                  <td>${escapeHTML(order.userName || order.customerName || "Khách hàng")}</td>
                  <td>${formatMoney(getOrderTotal(order))}</td>
                  <td><span class="status-badge">${escapeHTML(order.status || "Đã ghi nhận")}</span></td>
                </tr>
              `,
            )
            .join("")
        : `<tr><td class="admin-empty" colspan="4">Chưa có đơn hàng nào.</td></tr>`;
    }

    renderRevenueBars("dashboardRevenueBars");
  } catch (error) {
    console.error("Error rendering dashboard:", error);
  }
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
      users = users.filter(u => u && u.role === filterRole);
    }
    if (filterStat) {
      users = users.filter(u => u && u.status === filterStat);
    }

    table.innerHTML = users.length
      ? users
          .map(
            (user) => {
              if (!user) return "";
              return `
                <tr>
                  <td>
                    <div class="admin-name-cell">
                      <span class="admin-avatar">${escapeHTML(getInitials(user))}</span>
                      <div>
                        <strong>${escapeHTML(user.displayName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || "Người dùng")}</strong>
                        <div class="admin-muted">
                          ${user.role === 'admin' ? '<span class="status-badge" style="background:#5c00e6;">Admin</span>' : '<span class="category-badge">User</span>'}
                          ${user.status === 'locked' ? '<span class="status-badge" style="background:#d93025;">Khóa</span>' : '<span class="status-badge">Hoạt động</span>'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>${escapeHTML(user.email || "-")}</td>
                  <td>${escapeHTML(user.phone || "-")}</td>
                  <td>${formatDate(user.createdAt)}</td>
                  <td>
                    <div class="admin-actions">
                      <button class="admin-action ghost" data-edit-user="${escapeHTML(user.id)}" title="Sửa">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button class="admin-action ghost" data-lock-user="${escapeHTML(user.id)}" title="Khóa/Mở khóa">
                        <i class="fas ${user.status === 'locked' ? 'fa-lock' : 'fa-unlock'}"></i>
                      </button>
                      <button class="admin-action ghost" data-reset-password-user="${escapeHTML(user.id)}" title="Reset mật khẩu">
                        <i class="fas fa-key"></i>
                      </button>
                      <button class="admin-action danger" data-delete-user="${escapeHTML(user.id)}" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="admin-empty" colspan="5">Không tìm thấy tài khoản phù hợp.</td></tr>`;
  } catch (error) {
    console.error("Error rendering accounts:", error);
  }
}

function renderProducts() {
  try {
    const table = document.getElementById("productsTable");
    if (!table) return;

    const products = (getProducts() || []).filter(p => p !== null && p !== undefined);

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
                    <div style="font-weight: 700; color: #4f311d;">${escapeHTML(product.name)}</div>
                    ${product.desc ? `<div style="font-size: 0.8rem; color: #796454; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(product.desc)}">${escapeHTML(product.desc)}</div>` : ''}
                  </td>
                  <td><span class="category-badge">${escapeHTML(product.category)}</span></td>
                  <td><strong style="color: #5f3d24;">${formatMoney(product.price)}</strong></td>
                  <td>
                    ${product.status === "out_of_stock" 
                      ? '<span class="status-badge" style="background:#d93025; color:#fff; font-weight:600; padding:4px 8px; border-radius:6px; font-size:0.8rem;">Hết hàng</span>' 
                      : '<span class="status-badge" style="background:#137333; color:#fff; font-weight:600; padding:4px 8px; border-radius:6px; font-size:0.8rem;">Còn hàng</span>'
                    }
                    ${product.isBestSeller ? '<span class="status-badge" style="background:#f2994a; color:#fff; font-weight:600; padding:4px 8px; border-radius:6px; font-size:0.8rem; margin-left:4px;"><i class="fa-solid fa-fire"></i> Hot</span>' : ''}
                  </td>
                  <td>
                    <div class="admin-actions">
                      <button class="admin-action ghost" data-edit-product="${escapeHTML(product.id)}" title="Sửa">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button class="admin-action danger" data-delete-product="${escapeHTML(product.id)}" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          )
          .join("")
      : `<tr><td class="admin-empty" colspan="6">Không có sản phẩm nào.</td></tr>`;

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
              return `
                <tr>
                  <td>
                    <strong>${escapeHTML(orderCode)}</strong>
                    <div class="admin-muted">${formatDate(getOrderDate(order))}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700;">${escapeHTML(order.userName || order.customerName || (order.customer && order.customer.name) || "Khách hàng")}</div>
                    ${order.customer && order.customer.phone ? `<div style="font-size: 0.8rem; color: #796454;"><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${escapeHTML(order.customer.phone)}</div>` : ""}
                  </td>
                  <td>${escapeHTML(getOrderItemsText(order))}</td>
                  <td><strong style="color: #5f3d24;">${formatMoney(getOrderTotal(order))}</strong></td>
                  <td>
                    <select class="admin-status-select" data-order-code="${escapeHTML(orderCode)}" style="border: 1px solid rgba(95,61,36,0.25); border-radius: 6px; padding: 4px 8px; color:#4f311d; font-weight:600; cursor:pointer;">
                      ${["Đã ghi nhận", "Đang xử lý", "Đang giao", "Hoàn tất", "Đã hủy"]
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
      : `<tr><td class="admin-empty" colspan="5">Không tìm thấy đơn hàng phù hợp.</td></tr>`;
  } catch (error) {
    console.error("Error rendering orders:", error);
  }
}

function renderRevenueReport() {
  try {
    const orders = (getOrders() || []).filter(o => o !== null && o !== undefined);
    const completedOrders = orders.filter(o => o && o.status === "Hoàn tất");
    const canceledOrders = orders.filter(o => o && o.status === "Đã hủy");
    
    const revenue = completedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const avg = completedOrders.length ? revenue / completedOrders.length : 0;
    
    const cancelRateValue = orders.length ? (canceledOrders.length / orders.length) * 100 : 0;

    const data = getRevenueByDay(7);
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

    renderRevenueBars("revenueBars");
    renderBestSellersReport(orders); // Gọi thêm báo cáo bán chạy nhất
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
                <td><strong style="color: #4f311d;">${escapeHTML(item.productName)}</strong></td>
                <td><strong style="color: #137333;">${item.quantitySold} ly/phần</strong></td>
                <td><strong style="color: #5f3d24;">${formatMoney(item.revenue)}</strong></td>
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
  renderDashboard();
  renderAccounts();
  renderProducts();
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

      if (!name || !category || !price) {
        alert("Vui lòng điền đầy đủ tên, danh mục và giá sản phẩm.");
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

      const newPass = prompt(`Nhập mật khẩu mới cho ${user.email || user.username}:`, "123456");
      if (newPass) {
        if (newPass.length < 6) {
          alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
          return;
        }
        user.password = newPass;
        if(typeof UserManager !== 'undefined') {
          UserManager.saveUsers(users);
        } else {
          localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
        }
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
        if(typeof UserManager !== 'undefined') {
          UserManager.saveUsers(users);
        } else {
          localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
        }
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
      if (document.getElementById("accountSubmitText")) document.getElementById("accountSubmitText").textContent = "Cập nhật tài khoản";
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
      if(typeof UserManager !== 'undefined') {
        UserManager.saveUsers(users);
      } else {
        localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
      }
      renderAll();
    }
  });

  document.addEventListener("change", (event) => {
    if (!event.target.matches("[data-order-code]")) return;
    const orders = getOrders();
    const code = event.target.dataset.orderCode;
    const orderIdx = orders.findIndex(o => (o.code || o.id) === code);
    if (orderIdx === -1) return;
    orders[orderIdx].status = event.target.value;
    saveOrders(orders);
    renderAll();
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
  // Bộ lọc sản phẩm
  const searchProduct = document.getElementById("searchProduct");
  const filterProductCat = document.getElementById("filterProductCategory");
  const filterProductStat = document.getElementById("filterProductStatus");
  if (searchProduct) searchProduct.addEventListener("input", renderProducts);
  if (filterProductCat) filterProductCat.addEventListener("change", renderProducts);
  if (filterProductStat) filterProductStat.addEventListener("change", renderProducts);

  // Bộ lọc đơn hàng
  const searchOrder = document.getElementById("searchOrder");
  const filterOrderStatus = document.getElementById("filterOrderStatus");
  if (searchOrder) searchOrder.addEventListener("input", renderOrders);
  if (filterOrderStatus) filterOrderStatus.addEventListener("change", renderOrders);

  // Bộ lọc tài khoản
  const searchAccount = document.getElementById("searchAccount");
  const filterAccountRole = document.getElementById("filterAccountRole");
  const filterAccountStatus = document.getElementById("filterAccountStatus");
  if (searchAccount) searchAccount.addEventListener("input", renderAccounts);
  if (filterAccountRole) filterAccountRole.addEventListener("change", renderAccounts);
  if (filterAccountStatus) filterAccountStatus.addEventListener("change", renderAccounts);
}

function initAdminPage() {
  try {
    // BẢO VỆ TRANG ADMIN
    if (typeof UserManager !== 'undefined') {
      UserManager.requireAdmin();
    }
  } catch (error) {
    console.error("Lỗi xác thực Admin:", error);
  }

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
    { name: "bindNavigation", fn: bindNavigation },
    { name: "bindProductForm", fn: bindProductForm },
    { name: "bindTableActions", fn: bindTableActions },
    { name: "bindAccountForm", fn: bindAccountForm },
    { name: "bindFilters", fn: bindFilters },
    { name: "renderAll", fn: renderAll }
  ];

  initSteps.forEach((step) => {
    try {
      step.fn();
    } catch (error) {
      console.error(`Lỗi trong bước khởi tạo ${step.name}:`, error);
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
  const accountSubmitText = document.getElementById("accountSubmitText");
  const resetAccountForm = document.getElementById("resetAccountForm");
  
  if (!accountForm) return;

  function resetAccount() {
    if(accountIndex) accountIndex.value = "";
    if(accountName) accountName.value = "";
    if(accountEmail) accountEmail.value = "";
    if(accountPhone) accountPhone.value = "";
    if(accountPassword) accountPassword.value = ""; 
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

    if (!firstName || !email || !phone) {
      alert("Vui lòng điền đầy đủ họ tên, email và số điện thoại.");
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
        role: "user",
        status: "active",
        permissions: [],
        provider: "local",
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

    if(typeof UserManager !== 'undefined') {
      UserManager.saveUsers(users);
    } else {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
    }
    
    renderAll();
    resetAccount();
  });

  if (resetAccountForm) {
    resetAccountForm.addEventListener("click", resetAccount);
  }
}