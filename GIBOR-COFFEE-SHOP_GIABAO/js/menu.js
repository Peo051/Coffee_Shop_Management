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
    // Khởi tạo popup chọn chi nhánh kiểu mới
    initMenuBranchSelector();

    // 1. Tải và render sản phẩm động lần đầu
    renderMenuProducts();

    // 2. Ủy quyền sự kiện click (Event Delegation) cho toàn bộ menu card
    document.addEventListener('click', (event) => {
        const card = event.target.closest('.menu-card');
        if (!card) return;

        // Nếu sản phẩm hết hàng, chặn hoàn toàn click đặt món
        if (card.classList.contains('out-of-stock')) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof showGiborPopup === 'function') {
                showGiborPopup({
                    type: "warning",
                    title: "Tạm Hết Hàng",
                    message: "Sản phẩm này hiện đang tạm hết hàng tại chi nhánh này. Quý khách vui lòng chọn món khác!",
                    confirmText: "Đã hiểu"
                });
            } else {
                alert("Sản phẩm này hiện đang tạm hết hàng tại chi nhánh này. Quý khách vui lòng chọn món khác!");
            }
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

// Logic khởi tạo Popup chọn cửa hàng phong cách The Coffee House
function initMenuBranchSelector() {
    const selectBtn = document.getElementById("menuBranchSelectBtn");
    const overlay = document.getElementById("branchModalOverlay");
    const closeBtn = document.getElementById("branchModalCloseBtn");
    const listContainer = document.getElementById("branchModalList");
    const searchInput = document.getElementById("branchSearchInput");
    const clearBtn = document.getElementById("branchSearchClearBtn");

    if (!selectBtn || !overlay || !closeBtn || !listContainer) return;

    // Lấy chi nhánh đã chọn
    let currentSelectedId = localStorage.getItem("gibor_selected_menu_branch") || "all";

    // Cập nhật nhãn hiển thị ban đầu
    updateSelectBtnLabel(currentSelectedId);

    // Mở Modal
    selectBtn.addEventListener("click", () => {
        renderBranchList("");
        if (searchInput) {
            searchInput.value = "";
        }
        if (clearBtn) {
            clearBtn.style.display = "none";
        }
        overlay.style.display = "flex";
        setTimeout(() => {
            overlay.classList.add("show");
        }, 10);
    });

    // Đóng Modal
    const closeModal = () => {
        overlay.classList.remove("show");
        setTimeout(() => {
            overlay.style.display = "none";
        }, 300);
    };

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Nhập từ khóa tìm kiếm
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value;
            if (clearBtn) {
                clearBtn.style.display = val.length > 0 ? "block" : "none";
            }
            renderBranchList(val);
        });
    }

    // Xóa ô tìm kiếm
    if (clearBtn && searchInput) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.style.display = "none";
            renderBranchList("");
            searchInput.focus();
        });
    }

    // Biến lưu trữ vị trí GPS của người dùng
    let userCoords = null;

    // Yêu cầu quyền lấy vị trí thực tế của thiết bị
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // Render lại danh sách cửa hàng sau khi có vị trí thật để sắp xếp theo khoảng cách gần nhất
                if (overlay.classList.contains("show")) {
                    renderBranchList(searchInput ? searchInput.value : "");
                }
            },
            (error) => {
                console.warn("Không thể lấy vị trí GPS:", error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    // Hàm tính khoảng cách giữa 2 điểm tọa độ GPS theo công thức Haversine (km)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Bán kính Trái đất tính theo km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Khoảng cách thực tế (km)
    }

    // Hàm render danh sách chi nhánh trong Popup
    function renderBranchList(keyword) {
        const branches = typeof window.GIBOR_BRANCH_UTILS !== "undefined"
            ? window.GIBOR_BRANCH_UTILS.all()
            : [];

        listContainer.innerHTML = "";

        // Thêm option "Toàn hệ thống" ở đầu danh sách nếu không có keyword hoặc keyword khớp
        if (!keyword || "he thong toan he thong".includes(keyword.toLowerCase())) {
            const activeClass = currentSelectedId === "all" ? "active" : "";
            const itemHTML = `
                <div class="branch-item ${activeClass}" data-id="all">
                    <div class="branch-item-img">
                        <img src="images/logo/logo.jpg" alt="Toàn hệ thống" onerror="this.src='images/logo/logo.jpg'" />
                    </div>
                    <div class="branch-item-info">
                        <div class="branch-item-name">Toàn Hệ Thống GIBOR COFFEE</div>
                        <div class="branch-item-address">Xem danh sách thực đơn đầy đủ của tất cả các chi nhánh</div>
                        <div class="branch-item-distance"><i class="fa-solid fa-earth-asia"></i> Hệ thống chính thức</div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML("beforeend", itemHTML);
        }

        // Lọc danh sách chi nhánh
        let filteredBranches = typeof window.GIBOR_BRANCH_UTILS !== "undefined"
            ? window.GIBOR_BRANCH_UTILS.search(keyword)
            : branches;

        // Tính khoảng cách thực tế nếu có tọa độ GPS của người dùng
        filteredBranches = filteredBranches.map((b, index) => {
            let dist = null;
            if (userCoords && b.lat && b.lng) {
                dist = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
            } else {
                // Dự phòng khoảng cách mô phỏng nếu người dùng từ chối cấp quyền GPS
                dist = 1.2 + (index * 0.45) % 4.5;
            }
            return { ...b, distance: dist };
        });

        // Sắp xếp các chi nhánh gần nhất lên đầu
        filteredBranches.sort((a, b) => a.distance - b.distance);

        filteredBranches.forEach((b) => {
            const activeClass = currentSelectedId === b.id ? "active" : "";
            const distanceStr = b.distance.toFixed(2);
            const distanceLabel = userCoords 
                ? `<i class="fa-solid fa-location-arrow"></i> Cách đây ${distanceStr} km` 
                : `<i class="fa-solid fa-location-arrow"></i> Cách đây khoảng ${distanceStr} km`;
            
            const itemHTML = `
                <div class="branch-item ${activeClass}" data-id="${escapeHTML(b.id)}">
                    <div class="branch-item-img">
                        <img src="${escapeHTML(b.image)}" alt="${escapeHTML(b.name)}" onerror="this.src='images/logo/logo.jpg'" />
                    </div>
                    <div class="branch-item-info">
                        <div class="branch-item-name">${escapeHTML(b.name)}</div>
                        <div class="branch-item-address">${escapeHTML(b.address)}</div>
                        <div class="branch-item-distance">${distanceLabel}</div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML("beforeend", itemHTML);
        });

        if (listContainer.children.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-muted py-4">Không tìm thấy cửa hàng phù hợp.</div>`;
        }

        // Bắt sự kiện click chọn chi nhánh
        const items = listContainer.querySelectorAll(".branch-item");
        items.forEach(item => {
            item.addEventListener("click", () => {
                const branchId = item.getAttribute("data-id");
                currentSelectedId = branchId;
                localStorage.setItem("gibor_selected_menu_branch", branchId);
                
                // Cập nhật giao diện
                updateSelectBtnLabel(branchId);
                renderMenuProducts();
                closeModal();
            });
        });
    }

    // Hàm cập nhật nhãn trên Button chính
    function updateSelectBtnLabel(branchId) {
        const labelEl = document.getElementById("menuBranchSelectLabel");
        if (!labelEl) return;

        if (branchId === "all") {
            labelEl.innerHTML = `<i class="fa-solid fa-earth-asia me-2" style="color: #d4a373;"></i>Toàn Hệ Thống GIBOR COFFEE`;
        } else {
            const branch = typeof window.GIBOR_BRANCH_UTILS !== "undefined"
                ? window.GIBOR_BRANCH_UTILS.getById(branchId)
                : null;
            if (branch) {
                labelEl.innerHTML = `<i class="fa-solid fa-location-dot me-2" style="color: #d4a373;"></i>${escapeHTML(branch.name)}`;
            } else {
                labelEl.innerHTML = `<i class="fa-solid fa-location-dot me-2" style="color: #d4a373;"></i>Toàn Hệ Thống GIBOR COFFEE`;
            }
        }
    }
}

function renderMenuProducts() {
    if (typeof ProductManager === "undefined") {
        console.error("ProductManager is not defined in data.js");
        return;
    }

    // Lấy chi nhánh được lưu trong localStorage
    const selectedBranchId = localStorage.getItem("gibor_selected_menu_branch") || "all";

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
        let categoryProducts = products.filter(p => p.category === targetCategory && p.status !== "deleted" && p.isDeleted !== true);

        if (categoryProducts.length === 0) {
            gridEl.innerHTML = `<div class="col-12 text-center text-muted py-3">Danh mục này hiện chưa có sản phẩm nào.</div>`;
            return;
        }

        // Render danh sách sản phẩm động
        gridEl.innerHTML = categoryProducts
            .map(product => {
                // Mô phỏng tính trạng của chi nhánh cụ thể (Ví dụ: chi nhánh đó có thể hết hàng một số món nhất định)
                let isOutOfStock = product.status === "out_of_stock";

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

window.addEventListener('gibor_products_updated', () => {
    console.log("⚡ Nhận được cập nhật sản phẩm thời gian thực. Đang tải lại thực đơn...");
    if (typeof renderMenuProducts === 'function') {
        renderMenuProducts();
    }
});

/* 
========================================================================================

                                     KẾT THÚC CODE BỞI NGUYỄN HOÀNG BẢO

========================================================================================
*/