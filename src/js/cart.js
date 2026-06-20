/* 
========================================================================================
Tên file: cart.js
Tác giả: Trần Dương Gia Bảo
Vai trò: Quản lý nghiệp vụ giỏ hàng (Shopping Cart) của hệ thống GIBOR Coffee.
Các chức năng chính:
  - Hiển thị danh sách sản phẩm trong giỏ hàng (renderCart).
  - Tăng/giảm số lượng sản phẩm trực tiếp (changeQuantity).
  - Xóa sản phẩm đơn lẻ hoặc làm trống giỏ hàng (removeItem, clearCart).
  - Đồng bộ hóa số lượng sản phẩm lên header.
  - Chuyển hướng sang trang thanh toán.
Cấu trúc một phần tử trong Giỏ hàng (CartItem):
  {
    id: "p-2",                       // ID của sản phẩm gốc
    name: "Cà phê sữa",              // Tên sản phẩm
    image: "images/menu/caphesua.jpg",// Ảnh đại diện sản phẩm
    size: "M",                       // Size ly (S/M/L) hoặc "Mặc định" (với bánh ngọt)
    price: 35000,                    // Giá đơn vị (đã cộng tiền size và toppings nếu có)
    sugar: "50%",                    // Phần trăm lượng đường
    ice: "100%",                     // Phần trăm lượng đá
    toppings: [                      // Mảng chứa danh sách toppings thêm
      { name: "Trân châu trắng", price: 10000 }
    ],
    note: "Ít sữa nhiều cafe",      // Ghi chú đặc biệt từ khách hàng
    comboItems: [],                  // Mảng chứa các món trong combo (nếu là sản phẩm combo)
    quantity: 2                      // Số lượng món đặt
  }
========================================================================================
*/

// renderCart: Lấy dữ liệu giỏ hàng từ localStorage và vẽ giao diện bảng danh sách sản phẩm cùng tổng tiền thanh toán.
function renderCart() {
  const cart = getCart();
  const cartEmpty = document.getElementById("cartEmpty"); // Element báo giỏ hàng trống
  const cartContent = document.getElementById("cartContent"); // Element chứa bảng giỏ hàng
  const cartBody = document.getElementById("cartBody"); // Thẻ tbody chứa danh sách sản phẩm render
  const totalItemsEl = document.getElementById("totalItems"); // Thẻ hiển thị tổng số lượng món
  const totalPriceEl = document.getElementById("totalPrice"); // Thẻ hiển thị tổng tiền thanh toán

  if (!cartEmpty || !cartContent || !cartBody) return;

  // Kiểm tra giỏ hàng có trống không để ẩn/hiện giao diện thích hợp
  const isCartEmpty = cart.length === 0;
  cartEmpty.classList.toggle("hidden", !isCartEmpty);
  cartContent.classList.toggle("hidden", isCartEmpty);

  // Nếu trống, xóa trắng bảng và cập nhật tổng tiền về 0
  if (isCartEmpty) {
    cartBody.innerHTML = "";
    if (totalItemsEl) totalItemsEl.textContent = "0";
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(0);
    updateCartCount(); // Đồng bộ badge giỏ hàng về 0 ở header
    return;
  }

  let totalItems = 0; // Biến tích lũy tổng số lượng sản phẩm
  let totalPrice = 0; // Biến tích lũy tổng tiền

  let html = ""; // Chuỗi HTML tích lũy để render bảng
  
  // Duyệt qua từng CartItem để sinh dòng HTML tương ứng
  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity; // Tính thành tiền cho sản phẩm hiện tại
    totalItems += item.quantity; // Cộng dồn số lượng
    totalPrice += subtotal; // Cộng dồn thành tiền vào tổng hóa đơn

    // Xác định xem sản phẩm này có phải là Combo hay không
    const comboItems =
      Array.isArray(item.comboItems) && item.comboItems.length > 0
        ? item.comboItems
        : typeof window.getComboItemsByName === "function"
          ? window.getComboItemsByName(item.name)
          : [];
    const isCombo = comboItems.length > 0;
    const comboSuffix = isCombo ? ` (${comboItems.join(" + ")})` : "";
    
    // Tạo nhãn hiển thị tùy chọn của sản phẩm
    const sugarText = item.sugar ? `Đường: ${item.sugar}` : "";
    const iceText = item.ice ? `Đá: ${item.ice}` : "";
    const noteText = item.note ? `📝 ${item.note}` : "";
    const isFood = item.size === "Mặc định"; // Đối với đồ ăn/bánh ngọt thì không hiển thị size
    const toppingText =
      item.toppings && item.toppings.length > 0
        ? `Topping: ${item.toppings.map((t) => t.name).join(", ")}`
        : "";

    // Sinh thẻ tr chứa thông tin sản phẩm và các nút tăng giảm số lượng, nút xóa
    html += `
      <tr>
        <td data-label="Sản phẩm">
          <div class="cart-product">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-product-info">
              <span class="cart-product-name">${item.name}${comboSuffix}</span>
              ${!isFood ? `<span class="cart-product-options">🍬 ${sugarText} &nbsp;|&nbsp; 🧊 ${iceText}</span>` : ""}
              ${toppingText ? `<span class="cart-product-options">🧁 ${toppingText}</span>` : ""}
              ${noteText ? `<span class="cart-product-note">${noteText}</span>` : ""}
            </div>
          </div>
        </td>
        <td data-label="Size">
          <span class="cart-size">${isFood ? "-" : item.size}</span>
        </td>
        <td data-label="Đơn giá">
          <span class="cart-price">${formatPrice(item.price)}</span>
        </td>
        <td data-label="Số lượng">
          <div class="cart-quantity">
            <button class="btn-quantity" data-index="${index}" data-delta="-1">−</button>
            <span>${item.quantity}</span>
            <button class="btn-quantity" data-index="${index}" data-delta="1">+</button>
          </div>
        </td>
        <td data-label="Thành tiền">
          <span class="cart-subtotal">${formatPrice(subtotal)}</span>
        </td>
        <td data-label="Xóa">
          <button class="btn-remove" data-index="${index}" title="Xóa sản phẩm">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </td>
      </tr>
    `;
  });

  // Chèn HTML đã sinh vào bảng
  cartBody.innerHTML = html;
  totalItemsEl.textContent = totalItems;
  totalPriceEl.textContent = formatPrice(totalPrice);

  updateCartCount(); // Đồng bộ badge ở header
  addCartActionListeners(); // Gắn sự kiện click cho các nút mới được sinh ra
}

// addCartActionListeners: Đăng ký sự kiện click cho các nút thay đổi số lượng và nút xóa sản phẩm vừa được sinh ra.
function addCartActionListeners() {
  // Gắn sự kiện cho các nút tăng/giảm số lượng
  document.querySelectorAll(".btn-quantity").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      const delta = parseInt(e.currentTarget.dataset.delta, 10); // Lấy giá trị +1 hoặc -1
      changeQuantity(index, delta);
    });
  });

  // Gắn sự kiện cho các nút xóa sản phẩm
  document.querySelectorAll(".btn-remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      removeItem(index);
    });
  });
}

// changeQuantity: Tăng hoặc giảm số lượng của một sản phẩm trong giỏ hàng và cập nhật lại giao diện.
function changeQuantity(index, delta) {
  const cart = getCart();

  if (index < 0 || index >= cart.length) return;

  cart[index].quantity += delta;

  // Nếu số lượng món giảm về 0 hoặc ít hơn thì xóa món khỏi giỏ hàng
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
    showToast("Đã xóa sản phẩm khỏi giỏ hàng!");
  }

  saveCart(cart); // Lưu vào LocalStorage
  renderCart(); // Render lại bảng dữ liệu
}

// removeItem: Xóa hoàn toàn một sản phẩm cụ thể ra khỏi giỏ hàng dựa trên index.
function removeItem(index) {
  const cart = getCart();

  if (index < 0 || index >= cart.length) return;

  const removedName = cart[index].name;
  cart.splice(index, 1); // Xóa phần tử tại vị trí index
  saveCart(cart);
  renderCart();
  showToast(`Đã xóa "${removedName}" khỏi giỏ hàng!`);
}

// clearCart: Xóa sạch toàn bộ sản phẩm trong giỏ hàng sau khi người dùng xác nhận.
function clearCart() {
  if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
    saveCart([]); // Lưu mảng trống vào LocalStorage
    renderCart(); // Render lại bảng
    showToast("Đã xóa toàn bộ giỏ hàng!");
  }
}

// openCheckout: Kiểm tra điều kiện giỏ hàng và chuyển hướng người dùng sang trang thanh toán payment.html.
function openCheckout() {
  const cart = getCart();
  // Chặn không cho sang trang thanh toán nếu giỏ hàng rỗng
  if (cart.length === 0) {
    showToast("Giỏ hàng trống, không thể thanh toán!");
    return;
  }
  window.location.href = "payment.html";
}

// DOMContentLoaded callback: Khởi tạo giỏ hàng và đăng ký sự kiện cho các nút Xóa giỏ hàng, Thanh toán khi DOM tải xong.
document.addEventListener("DOMContentLoaded", () => {
  // Render danh sách sản phẩm lần đầu khi tải trang
  renderCart();

  // Gắn sự kiện click cho nút xóa sạch giỏ hàng
  const btnClear = document.getElementById("btnClearCart");
  if (btnClear) {
    btnClear.addEventListener("click", clearCart);
  }

  // Gắn sự kiện click cho nút tiến hành thanh toán
  const btnCheckout = document.getElementById("btnCheckout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", openCheckout);
  }
});

/* 
========================================================================================
                            KẾT THÚC CODE BỞI TRẦN DƯƠNG GIA BẢO
========================================================================================
*/=========================================

                            KẾT THÚC CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
