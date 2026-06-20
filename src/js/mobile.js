/* 
========================================================================================

                                    CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
(function () {
  "use strict";

  // ===== CÁC HẰNG SỐ TOÀN CỤC =====
  const MOBILE_BP = 768; // Điểm ngắt kích thước màn hình di động (Breakpoint - 768px)
  const IS_ANDROID = /Android/i.test(navigator.userAgent || ""); // Kiểm tra thiết bị chạy hệ điều hành Android

  // Phân tích và lấy tên file HTML của trang hiện tại từ URL
  const path = location.pathname.replace(/\\/g, "/");
  const page = path.split("/").pop() || "index.html";

  // safeParseJSON: Phân tích cú pháp chuỗi JSON một cách an toàn tránh gây lỗi dừng ứng dụng.
  function safeParseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  // getActiveUser: Lấy thông tin tài khoản người dùng hiện đang đăng nhập từ local.
  function getActiveUser() {
    if (typeof UserManager !== "undefined" && typeof UserManager.getCurrentUser === "function") {
      return UserManager.getCurrentUser();
    }
    const currentUser = safeParseJSON(localStorage.getItem("gibor_current_user"), null);
    if (currentUser) return currentUser;
    return safeParseJSON(localStorage.getItem("loggedInUser"), null);
  }

  // getCurrentPageKey: Trả về khóa định danh của trang hiện tại để đánh dấu nút menu hoạt động.
  function getCurrentPageKey() {
    if (["login.html", "register.html", "account.html"].includes(page))
      return "account";
    return page;
  }

  // openAccountPanel: Chuyển hướng người dùng tới trang thông tin tài khoản hoặc trang đăng nhập.
  function openAccountPanel() {
    const user = getActiveUser();
    location.href = user ? "account.html" : "login.html";
  }

  // setBodyScrollLock: Bật/tắt việc khóa cuộn trang nền để tránh giật màn hình trên thiết bị di động.
  function setBodyScrollLock(locked) {
    if (IS_ANDROID) {
      document.body.classList.remove("m-lock-scroll");
      return;
    }
    document.body.classList.toggle("m-lock-scroll", !!locked);
  }

  // recoverScrollLockState: Tự động phục hồi lại trạng thái khóa cuộn trang dựa trên việc menu drawer có đang mở hay không.
  function recoverScrollLockState() {
    const overlay = document.getElementById("m-drawer-overlay");
    const shouldLock = !!(
      overlay &&
      overlay.classList.contains("open") &&
      isMobile()
    );
    setBodyScrollLock(shouldLock);
    // Bật tắt tương tác chuột/cảm ứng lên lớp overlay tương ứng trạng thái
    if (overlay) {
      overlay.style.pointerEvents = shouldLock ? "auto" : "none";
    }
  }

  // cleanupDesktopArtifacts: Xóa bỏ và dọn dẹp các thành phần HTML/CSS di động khi màn hình co dãn về kích thước desktop.
  function cleanupDesktopArtifacts() {
    // Xóa overlay và drawer menu
    const overlay = document.getElementById("m-drawer-overlay");
    if (overlay) overlay.remove();

    // Xóa thanh điều hướng bottom nav di động
    const bottomNav = document.getElementById("m-bottom-nav");
    if (bottomNav) bottomNav.remove();

    // Xóa thanh trượt danh mục món ăn ở trang thực đơn
    const tabs = document.querySelector(".m-category-tabs");
    if (tabs) tabs.remove();

    // Reset lại thuộc tính đệm đầu của container chứa menu thực đơn
    const menuContainer =
      document.querySelector(".menu-container") ||
      document.querySelector(".menu-section")?.parentElement;
    if (menuContainer) menuContainer.style.removeProperty("padding-top");

    // Khôi phục lại toàn bộ CSS mặc định của Header
    const header = document.querySelector(".header");
    if (header) {
      header.style.removeProperty("position");
      header.style.removeProperty("top");
      header.style.removeProperty("left");
      header.style.removeProperty("right");
      header.style.removeProperty("width");
      header.style.removeProperty("z-index");
    }

    // Mở khóa cuộn trang và xóa hàm toàn cục
    setBodyScrollLock(false);
    window.setMobileDrawerState = null;
  }

  // syncHeaderHeightVar: Đo chiều cao thực tế của Header và cập nhật vào biến CSS toàn cục --m-header-h.
  function syncHeaderHeightVar() {
    const header = document.querySelector(".header");
    if (!header) return;
    const height = Math.ceil(header.getBoundingClientRect().height || 56);
    document.documentElement.style.setProperty("--m-header-h", `${height}px`);
  }

  // ===== UTILITY =====
  // isMobile: Kiểm tra chiều rộng màn hình có thuộc chế độ di động hay không (<= 768px).
  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  // ===== DRAWER MENU DI ĐỘNG =====
  // initDrawer: Khởi tạo và thiết lập các sự kiện đóng mở cho Drawer Menu (menu vuốt di động).
  function initDrawer() {
    if (!isMobile()) return;
    // Kiểm tra nếu drawer đã tồn tại trên DOM thì không khởi tạo lại
    if (document.getElementById("m-drawer-overlay")) return;

    // Tạo phần tử overlay nền mờ cho drawer
    const overlay = document.createElement("div");
    overlay.id = "m-drawer-overlay";
    overlay.className = "m-drawer-overlay";

    // Phân tích trạng thái đăng nhập để hiển thị nút liên kết tài khoản phù hợp
    const user = getActiveUser();
    const authLabel = user ? "Tài khoản của tôi" : "Đăng nhập";
    const authHref = user ? "account.html" : "#";
    const authId = user ? 'id="m-drawer-account"' : "";

    // Xây dựng mã HTML cho Drawer Menu di động
    overlay.innerHTML = `
      <div class="m-drawer">
        <div class="m-drawer-header">
          <span class="m-drawer-brand">GIBOR COFFEE</span>
          <button class="m-drawer-close" aria-label="Đóng menu"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <ul class="m-drawer-nav">
          <li><a href="index.html"  data-page="index.html"><i class="fa-solid fa-house"></i> Trang chủ</a></li>
          <li><a href="menu.html"   data-page="menu.html"><i class="fa-solid fa-mug-hot"></i> Menu</a></li>
          <li><a href="branches.html" data-page="branches.html"><i class="fa-solid fa-store"></i> Chi nhánh</a></li>
          <li><a href="cart.html"   data-page="cart.html"><i class="fa-solid fa-cart-shopping"></i> Giỏ hàng</a></li>
          <li><a href="about.html"  data-page="about.html"><i class="fa-solid fa-award"></i> Về chúng tôi</a></li>
          <li><a href="contact.html" data-page="contact.html"><i class="fa-solid fa-paper-plane"></i> Liên hệ</a></li>
        </ul>
        <div class="m-drawer-footer">
          <a class="m-drawer-auth" href="${authHref}" ${authId}>${authLabel}</a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay); // Đưa drawer vào DOM

    // Tự động đánh dấu class active cho liên kết tương ứng với trang đang hiển thị
    const currentPageKey = getCurrentPageKey();
    overlay.querySelectorAll(".m-drawer-nav a").forEach((a) => {
      if (a.dataset.page === currentPageKey) a.classList.add("active");
    });

    // Định nghĩa hàm thay đổi trạng thái đóng mở của Drawer
    const setDrawerState = (open) => {
      overlay.classList.toggle("open", open);
      setBodyScrollLock(open && isMobile()); // Khóa cuộn trang nền nếu drawer mở
      overlay.style.pointerEvents = open ? "auto" : "none";
    };
    
    // Hàm đóng drawer nhanh
    const closeDrawer = () => setDrawerState(false);

    // Đăng ký các sự kiện tương tác để đóng drawer:
    // 1. Click vào nút dấu X đóng menu
    overlay
      .querySelector(".m-drawer-close")
      .addEventListener("click", closeDrawer);
      
    // 2. Click vào vùng nền mờ phía ngoài drawer
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeDrawer();
    });
    
    // 3. Click vào bất kỳ liên kết điều hướng nào bên trong menu
    overlay.querySelectorAll(".m-drawer-nav a").forEach((a) => {
      a.addEventListener("click", closeDrawer);
    });
    
    // 4. Nhấn phím Escape trên bàn phím
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    // 5. Tự động đóng drawer nếu người dùng thay đổi kích thước màn hình vượt quá breakpoint di động
    window.addEventListener("resize", function () {
      if (!isMobile()) closeDrawer();
    });

    // Đăng ký hàm đóng mở drawer vào biến toàn cục để Header hoặc file khác có thể gọi điều khiển
    window.setMobileDrawerState = setDrawerState;

    // Thiết lập sự kiện click cho liên kết Tài khoản/Đăng nhập ở chân drawer
    const accountBtn = document.getElementById("m-drawer-account");
    if (accountBtn) {
      accountBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeDrawer();
        location.href = "account.html";
      });
    }

    const authBtn = overlay.querySelector(".m-drawer-auth");
    if (authBtn && !user) {
      authBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeDrawer();
        location.href = "login.html";
      });
    }
  }

  // bindMenuToggle: Liên kết sự kiện click của nút hamburger trên header với việc đóng mở Drawer Menu.
  function bindMenuToggle() {
    const toggle = document.querySelector(".menu-toggle, #menuToggle");
    if (!toggle) return;
    if (toggle.dataset.mDrawerBound === "1") return;
    toggle.dataset.mDrawerBound = "1";
    toggle.addEventListener("click", function (e) {
      if (!isMobile()) {
        recoverScrollLockState();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const overlay = document.getElementById("m-drawer-overlay");
      if (!overlay) return;
      const open = !overlay.classList.contains("open");
      if (typeof window.setMobileDrawerState === "function") {
        window.setMobileDrawerState(open);
      } else {
        overlay.classList.toggle("open", open);
      }
    });
  }

  // ===== BOTTOM NAVIGATION DI ĐỘNG =====
  // initBottomNav: Khởi tạo thanh điều hướng chân trang (Bottom Navigation) dành cho thiết bị di động.
  function initBottomNav() {
    if (!isMobile()) return;
    if (document.getElementById("m-bottom-nav")) return; // Không khởi tạo trùng lặp

    // Lấy số lượng sản phẩm giỏ hàng để build badge đỏ
    const cartCount = getCartCount();
    const badgeHtml =
      cartCount > 0 ? `<span class="m-nav-badge">${cartCount}</span>` : "";

    const nav = document.createElement("nav");
    nav.id = "m-bottom-nav";
    nav.className = "m-bottom-nav";
    nav.setAttribute("aria-label", "Điều hướng chính");
    
    // Build cấu trúc HTML của Bottom Nav
    nav.innerHTML = `
      <a href="index.html"  data-page="index.html"><i class="fa-solid fa-house"></i><span>Trang chủ</span></a>
      <a href="menu.html"   data-page="menu.html"><i class="fa-solid fa-mug-hot"></i><span>Menu</span></a>
      <a href="branches.html" data-page="branches.html"><i class="fa-solid fa-store"></i><span>Chi nhánh</span></a>
      <a href="cart.html"   data-page="cart.html">${badgeHtml}<i class="fa-solid fa-cart-shopping"></i><span>Giỏ hàng</span></a>
      <a href="login.html"  data-page="login.html"><i class="fa-solid fa-user"></i><span>Tài khoản</span></a>
    `;

    // Đồng bộ nút tài khoản nếu người dùng đã đăng nhập thành công
    const user = getActiveUser();
    if (user) {
      const accLink = nav.querySelector('[data-page="login.html"]');
      if (accLink) {
        accLink.href = "account.html";
        accLink.dataset.page = "account";
        accLink.querySelector("span").textContent = "Tài khoản";
        accLink.addEventListener("click", function (e) {
          e.preventDefault();
          location.href = "account.html";
        });
      }
    }

    // Mark active
    const currentPageKey = getCurrentPageKey();
    nav.querySelectorAll("a[data-page]").forEach((a) => {
      if (a.dataset.page === currentPageKey) a.classList.add("active");
    });

    document.body.appendChild(nav);
  }

  // getCartCount: Tính tổng số lượng sản phẩm đang có trong giỏ hàng.
  function getCartCount() {
    try {
      if (typeof getCart === "function") {
        const cart = getCart();
        return cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
      }
      const rawCart =
        localStorage.getItem("giborCart") || localStorage.getItem("cart") || "[]";
      const cart = safeParseJSON(rawCart, []);
      return cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    } catch (e) {
      return 0;
    }
  }

  // updateBottomNavBadge: Cập nhật số lượng hiển thị trên badge giỏ hàng của thanh bottom nav di động.
  window.updateBottomNavBadge = function () {
    const badge = document.querySelector(
      '.m-bottom-nav [data-page="cart.html"] .m-nav-badge',
    );
    const count = getCartCount();
    
    // Nếu badge đã tồn tại trên DOM
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = ""; // Hiển thị số lượng
      } else {
        badge.style.display = "none"; // Ẩn badge nếu giỏ hàng trống
      }
    } else if (count > 0) {
      // Nếu chưa có badge và số lượng hàng > 0, tiến hành tạo mới
      const cartLink = document.querySelector(
        '.m-bottom-nav [data-page="cart.html"]',
      );
      if (cartLink) {
        const b = document.createElement("span");
        b.className = "m-nav-badge";
        b.textContent = count;
        cartLink.insertBefore(b, cartLink.firstChild);
      }
    }
  };

  // ===== FOOTER ACCORDION =====
  // initFooterAccordion: Chuyển các cột thông tin chân trang (Footer) thành dạng đóng mở (accordion) trên di động.
  function initFooterAccordion() {
    if (!isMobile()) return;
    const cols = document.querySelectorAll(".footer-col");
    cols.forEach((col, i) => {
      // Giữ cột đầu tiên (Logo + giới thiệu) mở mặc định
      if (i === 0) {
        col.classList.add("m-footer-open");
        return;
      }
      
      const h4 = col.querySelector("h4");
      if (!h4) return;
      
      // Đăng ký sự kiện click tiêu đề cột để toggle class đóng/mở
      h4.addEventListener("click", function () {
        col.classList.toggle("m-footer-open");
      });
    });
  }

  // ===== CATEGORY TABS (Trang thực đơn menu.html) =====
  // initCategoryTabs: Khởi tạo thanh danh mục món ăn (Category Tabs) dính phía trên ở trang thực đơn.
  function initCategoryTabs() {
    if (!isMobile()) return;
    if (page !== "menu.html") return; // Chỉ khởi chạy riêng ở trang menu.html
    if (document.querySelector(".m-category-tabs")) return; // Tránh tạo trùng lặp

    const sections = document.querySelectorAll(".menu-section"); // Các danh mục món ăn chính
    if (!sections.length) return;

    // Tạo thanh container chứa các tab danh mục
    const tabs = document.createElement("div");
    tabs.className = "m-category-tabs";
    tabs.style.position = "fixed";
    tabs.style.left = "0";
    tabs.style.right = "0";
    tabs.style.zIndex = "998";

    // Danh sách icon giả lập nếu cần bổ sung cho các tab
    const icons = {
      "Cà phê": "",
      Matcha: "",
      Trà: "",
      "Bánh ngọt": "",
      Topping: "",
    };

    // Duyệt danh sách các khu vực món để sinh các nút tab tương ứng
    sections.forEach((sec, i) => {
      const titleEl = sec.querySelector(".section-title");
      if (!titleEl) return;
      
      const rawTitle = titleEl.textContent.trim();
      // Rút gọn tiêu đề (chỉ lấy tối đa 2 từ đầu tiên) để hiển thị đẹp trên tab di động
      const shortTitle = rawTitle.split(" ").slice(0, 2).join(" ");
      const icon = Object.keys(icons).find((k) =>
        rawTitle.toLowerCase().includes(k.toLowerCase()),
      );

      const btn = document.createElement("button");
      btn.className = "m-category-tab" + (i === 0 ? " active" : "");
      btn.textContent = (icon ? icons[icon] + " " : "") + shortTitle;
      btn.dataset.index = i;
      
      // Sự kiện click chuyển tab:
      btn.addEventListener("click", () => {
        // Cập nhật class active cho tab click
        tabs
          .querySelectorAll(".m-category-tab")
          .forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        
        // Tính toán khoảng cách tọa độ để cuộn màn hình:
        // Tọa độ y = Vị trí section - Chiều cao header cố định - Chiều cao thanh tab - Khoảng đệm 14px
        const headerH =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--m-header-h",
            ),
          ) || 56;
        const tabsH = tabs.offsetHeight;
        const y =
          sec.getBoundingClientRect().top +
          window.scrollY -
          headerH -
          tabsH -
          14;
          
        // Thực thi cuộn màn hình mượt mà
        window.scrollTo({ top: y, behavior: "smooth" });
      });
      tabs.appendChild(btn);
    });

    // Insert after header or at top of main content
    const menuContainer =
      document.querySelector(".menu-container") ||
      document.querySelector(".menu-section")?.parentElement;
    if (menuContainer) {
      menuContainer.insertBefore(tabs, menuContainer.firstChild);

      const syncTabsOffset = () => {
        if (!isMobile()) {
          menuContainer.style.removeProperty("padding-top");
          return;
        }
        syncHeaderHeightVar();
        const header = document.querySelector(".header");
        const headerH =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--m-header-h",
            ),
          ) || 56;
        if (header) {
          header.style.position = "fixed";
          header.style.top = "0";
          header.style.left = "0";
          header.style.right = "0";
          header.style.width = "100%";
          header.style.zIndex = "999";
        }
        tabs.style.top = `${headerH}px`;
        menuContainer.style.paddingTop = `${headerH + tabs.offsetHeight + 12}px`;
      };

      syncTabsOffset();
      window.addEventListener("resize", syncTabsOffset);
    }

    // Update active tab on scroll
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!isMobile()) return;
        const headerH =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--m-header-h",
            ),
          ) || 56;
        const tabsH = tabs.offsetHeight;
        const scrollY = window.scrollY + headerH + tabsH + 20;
        let activeIdx = 0;
        sections.forEach((sec, i) => {
          if (sec.offsetTop <= scrollY) activeIdx = i;
        });
        tabs.querySelectorAll(".m-category-tab").forEach((t, i) => {
          t.classList.toggle("active", i === activeIdx);
        });
        // Auto-scroll tab into view
        const activeTab = tabs.querySelector(".m-category-tab.active");
        if (activeTab) {
          activeTab.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      });
    });
  }

  // ===== TỐI ƯU HÓA HIỆU NĂNG TẢI TRANG =====
  // optimizeImagesForMobile: Tự động tối ưu hóa tải ảnh (lazy load và async decode) trên thiết bị di động.
  function optimizeImagesForMobile() {
    if (!isMobile()) return;
    const images = document.querySelectorAll("img");
    images.forEach((img, idx) => {
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
      // Keep first few visuals eager for perceived speed; defer the rest.
      if (idx > 2 && !img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (idx > 2 && !img.hasAttribute("fetchpriority")) {
        img.setAttribute("fetchpriority", "low");
      }
    });
  }

  // ===== KHỞI CHẠY HỆ THỐNG DI ĐỘNG =====
  // init: Đăng ký các sự kiện resize, orientationchange và khởi chạy toàn bộ hệ thống giao diện di động.
  function init() {
    // Ensure stale lock class is never carried across history restores.
    setBodyScrollLock(false);

    let mobileMode = isMobile();

    syncHeaderHeightVar();
    window.addEventListener("resize", syncHeaderHeightVar);
    window.addEventListener("orientationchange", syncHeaderHeightVar);
    window.addEventListener("pageshow", syncHeaderHeightVar);
    window.addEventListener("orientationchange", recoverScrollLockState);
    window.addEventListener("pageshow", recoverScrollLockState);

    bindMenuToggle();

    if (mobileMode) {
      initDrawer();
      initBottomNav();
      initFooterAccordion();
      initCategoryTabs();
      optimizeImagesForMobile();
    } else {
      cleanupDesktopArtifacts();
    }

    window.addEventListener("resize", () => {
      const nextMobileMode = isMobile();
      if (nextMobileMode === mobileMode) return;
      mobileMode = nextMobileMode;

      if (mobileMode) {
        initDrawer();
        initBottomNav();
        initFooterAccordion();
        initCategoryTabs();
        optimizeImagesForMobile();
      } else {
        cleanupDesktopArtifacts();
      }
    });

    // Keep cart badge fresh when coming back from background / navigation.
    ["focus", "pageshow", "visibilitychange", "storage"].forEach((evt) => {
      window.addEventListener(evt, () => {
        if (evt === "visibilitychange" && document.hidden) return;
        recoverScrollLockState();
        window.updateBottomNavBadge();
      });
    });

    // Safety net: if drawer is closed but class remains, unlock scroll.
    recoverScrollLockState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
/* 
========================================================================================

                                    KẾT THÚC CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
