/* 
========================================================================================

                                     CODE NGUYỄN HOÀNG BẢO (NÂNG CẤP ĐỘNG)

========================================================================================
*/

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải và render sản phẩm động
    renderMenuProducts();

    // 2. Ủy quyền sự kiện click (Event Delegation) cho toàn bộ menu card
    document.addEventListener('click', (event) => {
        const card = event.target.closest('.menu-card');
        if (!card) return;

        // Nếu sản phẩm hết hàng, chặn hoàn toàn click đặt món
        if (card.classList.contains('out-of-stock')) {
            event.preventDefault();
            event.stopPropagation();
            alert("Sản phẩm này hiện đang tạm hết hàng. Quý khách vui lòng chọn món khác!");
            return;
        }

        const name = card.dataset.name;
        const img = card.dataset.img;
        const price = parseInt(card.dataset.price, 10);
        const category = card.dataset.category || 'drink';

        if (typeof openPopup === 'function') {
            openPopup(name, img, price, category);
        }
    });
});

function renderMenuProducts() {
    if (typeof ProductManager === "undefined") {
        console.error("ProductManager is not defined in data.js");
        return;
    }

    const products = ProductManager.getProducts();
    const menuSections = document.querySelectorAll(".menu-section");

    menuSections.forEach(section => {
        const titleEl = section.querySelector(".section-title");
        const gridEl = section.querySelector(".menu-grid");
        if (!titleEl || !gridEl) return;

        const text = titleEl.textContent.toUpperCase();
        let targetCategory = "";

        if (text.includes("CÀ PHÊ") || text.includes("CA PHE")) targetCategory = "Cà phê";
        else if (text.includes("MATCHA")) targetCategory = "Matcha";
        else if (text.includes("TRÀ SỮA") || text.includes("TRA SUA")) targetCategory = "Trà sữa";
        else if (text.includes("TRÀ") || text.includes("TRA")) targetCategory = "Trà";
        else if (text.includes("BÁNH NGỌT") || text.includes("BANH NGOT")) targetCategory = "Bánh ngọt";
        else if (text.includes("COMBO")) targetCategory = "Combo";
        else if (text.includes("TOPPING")) targetCategory = "Topping";

        if (!targetCategory) return;

        // Lọc sản phẩm theo danh mục
        const categoryProducts = products.filter(p => p.category === targetCategory);

        if (categoryProducts.length === 0) {
            gridEl.innerHTML = `<div class="col-12 text-center text-muted py-3">Danh mục này hiện chưa có sản phẩm nào.</div>`;
            return;
        }

        // Render danh sách sản phẩm động
        gridEl.innerHTML = categoryProducts
            .map(product => {
                const isOutOfStock = product.status === "out_of_stock";
                const cardClass = `menu-card h-100 w-100 ${product.isBestSeller && !isOutOfStock ? 'best-seller' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`;
                
                // fallback category cho popup: Bánh ngọt -> food, còn lại -> drink hoặc topping
                const popupCategory = product.category === "Bánh ngọt" ? "food" : (product.category === "Topping" ? "topping" : "drink");

                return `
                    <div class="col-6 col-md-4 col-lg-3 d-flex">
                        <div
                            class="${cardClass}"
                            data-name="${escapeHTML(product.name)}"
                            data-img="${escapeHTML(product.img)}"
                            data-price="${product.price}"
                            data-category="${popupCategory}"
                            ${isOutOfStock ? 'style="opacity: 0.55; cursor: not-allowed;"' : ''}
                        >
                            ${product.isBestSeller && !isOutOfStock ? '<span class="badge"> <i class="icon">🔥</i> BÁN CHẠY NHẤT </span>' : ''}
                            ${isOutOfStock ? '<span class="badge" style="background:#ea4335;"><i class="icon">🚫</i> TẠM HẾT HÀNG </span>' : ''}
                            <img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.name)}" onerror="this.src='images/logo/logo.jpg'" style="${isOutOfStock ? 'filter: grayscale(80%);' : ''}" />
                            <h4>${escapeHTML(product.name)}</h4>
                            <p>${escapeHTML(product.desc || 'Hương vị tuyệt hảo – công thức độc quyền GIBOR')}</p>
                            <span class="price">${Number(product.price).toLocaleString("vi-VN")}đ</span>
                        </div>
                    </div>
                `;
            })
            .join("");
    });
}

/* 
========================================================================================

                                     KẾT THÚC CODE BỞI NGUYỄN HOÀNG BẢO

========================================================================================
*/