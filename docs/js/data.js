/* 
  ========================================================================================

                                    CODE BỞI TRẦN DƯƠNG GIA BẢO

  ========================================================================================
  QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG - data.js
  Lưu trữ & xử lý dữ liệu người dùng bằng localStorage
*/

const ADMIN_PRODUCTS_KEY = "gibor_admin_products";

const defaultProducts = [
  { id: "p-1", name: "Cà phê đen", category: "Cà phê", price: 25000, img: "images/menu/capheden.jpg", desc: "Đậm đà nguyên chất – chuẩn gu truyền thống", isBestSeller: false, status: "active" },
  { id: "p-2", name: "Cà phê sữa", category: "Cà phê", price: 30000, img: "images/menu/caphesua.jpg", desc: "Béo nhẹ hòa quyện – dễ uống mỗi ngày", isBestSeller: false, status: "active" },
  { id: "p-3", name: "Bạc xỉu", category: "Cà phê", price: 32000, img: "images/menu/bacxiu.jpg", desc: "Ngọt ngào sữa nhiều – cà phê thoang thoảng", isBestSeller: true, status: "active" },
  { id: "p-4", name: "Cà phê muối", category: "Cà phê", price: 36000, img: "images/menu/caphemuoi.jpg", desc: "Đậm vị cà phê – lớp kem muối béo mịn", isBestSeller: false, status: "active" },
  { id: "p-5", name: "Matcha Latte", category: "Matcha", price: 40000, img: "images/menu/matchalatte.jpg", desc: "Matcha nguyên chất – béo thơm dịu nhẹ", isBestSeller: false, status: "active" },
  { id: "p-6", name: "Matcha Dừa", category: "Matcha", price: 36000, img: "images/menu/matchadua.jpg", desc: "Matcha hòa dừa – thanh mát, béo nhẹ", isBestSeller: false, status: "active" },
  { id: "p-7", name: "Matcha Dâu", category: "Matcha", price: 36000, img: "images/menu/matchadau.jpg", desc: "Chua ngọt dâu – cân bằng vị matcha", isBestSeller: false, status: "active" },
  { id: "p-8", name: "Matcha Xoài", category: "Matcha", price: 36000, img: "images/menu/matchaxoai.jpg", desc: "Xoài tươi ngọt dịu – kết hợp matcha độc đáo", isBestSeller: false, status: "active" },
  { id: "p-9", name: "Trà Dâu", category: "Trà", price: 30000, img: "images/menu/tradau.jpg", desc: "Thanh mát trà – thơm ngọt vị dâu", isBestSeller: false, status: "active" },
  { id: "p-10", name: "Trà Vải", category: "Trà", price: 30000, img: "images/menu/travai.jpg", desc: "Ngọt nhẹ vải – giải khát sảng khoái", isBestSeller: false, status: "active" },
  { id: "p-11", name: "Trà Lựu Hibiscus", category: "Trà", price: 30000, img: "images/menu/luuhibicus.jpg", desc: "Chua nhẹ hibiscus – tươi mát lựu đỏ", isBestSeller: false, status: "active" },
  { id: "p-12", name: "Trà Đào", category: "Trà", price: 28000, img: "images/menu/tradao.jpg", desc: "Đào thơm dịu – vị trà thanh nhẹ", isBestSeller: false, status: "active" },
  { id: "p-13", name: "Trà Sữa Trân Châu Đường Đen", category: "Trà sữa", price: 30000, img: "images/menu/tranchauduongden.jpg", desc: "Ngọt đậm đường đen – trân châu dẻo dai", isBestSeller: true, status: "active" },
  { id: "p-14", name: "Trà Sữa Truyền Thống", category: "Trà sữa", price: 25000, img: "images/menu/truyenthong.jpg", desc: "Hương trà sữa classic – ngọt dịu dễ uống", isBestSeller: false, status: "active" },
  { id: "p-15", name: "Trà Sữa Thái Xanh", category: "Trà sữa", price: 20000, img: "images/menu/thaixanh.jpg", desc: "Thơm trà Thái – thanh mát nhẹ nhàng", isBestSeller: false, status: "active" },
  { id: "p-16", name: "Trà Sữa Caramel", category: "Trà sữa", price: 35000, img: "images/menu/trasuacaramel.jpg", desc: "Ngọt thanh vị trà sữa – Lớp caramel béo ngậy", isBestSeller: true, status: "active" },
  { id: "p-17", name: "Trà Sữa Gạo Rang", category: "Trà sữa", price: 30000, img: "images/menu/trasuagaorang.jpg", desc: "Thơm nhẹ mùi gạo rang – Ngọt thanh của sữa và trà", isBestSeller: false, status: "active" },
  { id: "p-18", name: "Trà Sữa Kem Cheese", category: "Trà sữa", price: 38000, img: "images/menu/trasuakemcheese.jpg", desc: "Thanh mát của trà – Lớp kem cheese mặn mặn", isBestSeller: false, status: "active" },
  { id: "p-19", name: "Trà Sữa Khoai Môn", category: "Trà sữa", price: 32000, img: "images/menu/trasuakhoaimon.jpg", desc: "Thơm ngon – Khoai môn béo ngậy", isBestSeller: false, status: "active" },
  { id: "p-20", name: "Trà Sữa Oreo", category: "Trà sữa", price: 30000, img: "images/menu/trasuaoreo.jpg", desc: "Thơm nhẹ vị trà, vị béo của sữa tươi – Kem Oreo", isBestSeller: false, status: "active" },
  { id: "p-21", name: "Trà Sữa Pudding", category: "Trà sữa", price: 35000, img: "images/menu/trasuapudding.jpg", desc: "Thơm ngon – Ít ngọt cùng pudding mềm mịn", isBestSeller: false, status: "active" },
  { id: "p-22", name: "Trà Sữa Socola", category: "Trà sữa", price: 20000, img: "images/menu/trasuasocola.jpg", desc: "Vị sữa béo nhẹ và socola đậm đà", isBestSeller: false, status: "active" },
  { id: "p-23", name: "Bánh Cheesecake", category: "Bánh ngọt", price: 35000, img: "images/menu/cheesecake.jpg", desc: "Béo mịn phô mai – tan ngay đầu lưỡi", isBestSeller: false, status: "active" },
  { id: "p-24", name: "Bánh Cupcake", category: "Bánh ngọt", price: 33000, img: "images/menu/cupcake.jpg", desc: "Mềm xốp nhỏ xinh – ngọt ngào tinh tế", isBestSeller: false, status: "active" },
  { id: "p-25", name: "Bánh Bông Lan Kem Tươi", category: "Bánh ngọt", price: 30000, img: "images/menu/bonglankemtuoi.jpg", desc: "Nhẹ mềm – kem tươi mát dịu", isBestSeller: false, status: "active" },
  { id: "p-26", name: "Bánh Cookie", category: "Bánh ngọt", price: 36000, img: "images/menu/cookie.jpg", desc: "Giòn tan – ngọt nhẹ vừa ăn", isBestSeller: false, status: "active" },
  { id: "p-27", name: "Bánh Brownie Socola", category: "Bánh ngọt", price: 40000, img: "images/menu/brownie.jpg", desc: "Đậm vị socola – mềm ẩm quyến rũ", isBestSeller: false, status: "active" },
  { id: "p-28", name: "Bánh Mousse Dâu", category: "Bánh ngọt", price: 38000, img: "images/menu/mousse.jpg", desc: "Mịn mát – chua ngọt vị dâu", isBestSeller: false, status: "active" },
  { id: "p-29", name: "Bánh Tiramisu", category: "Bánh ngọt", price: 35000, img: "images/menu/tiramisu.jpg", desc: "Cà phê thơm – mềm mịn chuẩn Ý", isBestSeller: true, status: "active" },
  { id: "p-30", name: "Bánh Red Velvet", category: "Bánh ngọt", price: 45000, img: "images/menu/redvelvet.jpg", desc: "Mềm xốp đỏ quyến rũ – kem cheese béo nhẹ", isBestSeller: false, status: "active" },
  { id: "p-31", name: "Combo 1", category: "Combo", price: 55000, img: "images/menu/combo1.jpg", desc: "Bạc xỉu + Bánh Cheesecake", isBestSeller: true, status: "active" },
  { id: "p-32", name: "Combo 2", category: "Combo", price: 50000, img: "images/menu/combo2.jpg", desc: "Cà phê đen + Bánh Cookie", isBestSeller: false, status: "active" },
  { id: "p-33", name: "Combo 3", category: "Combo", price: 60000, img: "images/menu/combo3.jpg", desc: "Cà phê sữa + Bánh CupCake", isBestSeller: false, status: "active" },
  { id: "p-34", name: "Combo 4", category: "Combo", price: 58000, img: "images/menu/combo4.jpg", desc: "Cà phê muối + Bánh Bông Lan Kem Tươi", isBestSeller: false, status: "active" },
  { id: "p-35", name: "Combo 5", category: "Combo", price: 45000, img: "images/menu/combo5.jpg", desc: "Matcha Dâu + Bánh Mousse Dâu", isBestSeller: false, status: "active" },
  { id: "p-36", name: "Combo 6", category: "Combo", price: 52000, img: "images/menu/combo6.jpg", desc: "Matcha Xoài + Bánh Tiramisu", isBestSeller: false, status: "active" },
  { id: "p-37", name: "Combo 7", category: "Combo", price: 48000, img: "images/menu/combo7.jpg", desc: "Matcha Dừa + Bánh Cheesecake", isBestSeller: false, status: "active" },
  { id: "p-38", name: "Combo 8", category: "Combo", price: 55000, img: "images/menu/combo8.jpg", desc: "Matcha Latte + Bánh Bông Lan Kem Tươi", isBestSeller: true, status: "active" },
  { id: "p-39", name: "Combo 9", category: "Combo", price: 50000, img: "images/menu/combo9.jpg", desc: "Trà Vải + Bánh Brownie Socola", isBestSeller: false, status: "active" },
  { id: "p-40", name: "Combo 10", category: "Combo", price: 48000, img: "images/menu/combo10.jpg", desc: "Trà Lựu Hibiscus + Bánh Red Velvet", isBestSeller: true, status: "active" },
  { id: "p-41", name: "Combo 11", category: "Combo", price: 52000, img: "images/menu/combo11.jpg", desc: "Trà Đào + Bánh Bông Lan Kem Tươi", isBestSeller: false, status: "active" },
  { id: "p-42", name: "Combo 12", category: "Combo", price: 55000, img: "images/menu/combo12.jpg", desc: "Trà Dâu + Bánh Tiramisu", isBestSeller: false, status: "active" },
  { id: "p-43", name: "Trân châu đen", category: "Topping", price: 10000, img: "images/menu/tranchauden.jpg", desc: "Trân châu đen dẻo dai ngọt dịu", isBestSeller: false, status: "active" },
  { id: "p-44", name: "Trân châu trắng", category: "Topping", price: 10000, img: "images/menu/3Q.jpg", desc: "Trân châu trắng giòn dai sần sật", isBestSeller: false, status: "active" },
  { id: "p-45", name: "Thạch trái cây", category: "Topping", price: 10000, img: "images/menu/thachtraicay.jpg", desc: "Thạch dẻo thơm mát hương trái cây", isBestSeller: false, status: "active" },
  { id: "p-46", name: "Thạch dừa", category: "Topping", price: 10000, img: "images/menu/thachdua.jpg", desc: "Thạch dừa non giòn ngọt tự nhiên", isBestSeller: false, status: "active" },
  { id: "p-47", name: "Thạch matcha", category: "Topping", price: 15000, img: "images/menu/thachmatcha.jpg", desc: "Thạch matcha thơm nồng chuẩn vị Nhật", isBestSeller: false, status: "active" },
  { id: "p-48", name: "Thạch củ năng", category: "Topping", price: 15000, img: "images/menu/thachcunang.jpg", desc: "Thạch củ năng giòn rụm bên trong", isBestSeller: false, status: "active" },
  { id: "p-49", name: "Khoai môn bóng", category: "Topping", price: 15000, img: "images/menu/khoaimonbong.jpg", desc: "Khoai môn dẻo bùi thơm ngậy", isBestSeller: false, status: "active" },
];

const PRODUCT_IMAGE_OVERRIDES = {
  "p-44": "images/menu/3Q.jpg",
};

function normalizeProduct(product) {
  let img = product.img || "";
  const overrideImg = PRODUCT_IMAGE_OVERRIDES[product.id];
  if (overrideImg) {
    img = overrideImg;
  }
  
  // Nếu img rỗng hoặc là ảnh logo fallback, thử tìm ảnh gốc từ defaultProducts
  if (!img || img === "images/logo/logo.jpg") {
    const defaultP = defaultProducts.find(d => d.id === product.id || d.name === product.name);
    if (defaultP && defaultP.img) {
      img = defaultP.img;
    } else {
      img = "images/logo/logo.jpg";
    }
  }
  
  return {
    id: product.id || `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: product.name || "",
    category: product.category || "other",
    price: Number(product.price) || 0,
    img: img,
    desc: product.desc || "",
    isBestSeller: Boolean(product.isBestSeller),
    status: product.status || "active"
  };
}

const ProductManager = {
  getProducts() {
    let products = [];
    try {
      const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
      products = raw ? JSON.parse(raw) : [];
    } catch(e) {
      products = [];
    }
    if (!Array.isArray(products) || !products.length) {
      products = defaultProducts;
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }
    
    // Khôi phục ảnh gốc cho sản phẩm mặc định bị ô nhiễm
    let needSave = false;
    products = products.filter(p => p !== null && p !== undefined).map(p => {
      const normalized = normalizeProduct(p);
      // Kiểm tra nếu ảnh đã bị đổi thành logo cho sản phẩm gốc
      if (p.img !== normalized.img) {
        needSave = true;
      }
      return normalized;
    });
    
    // Lưu lại nếu có thay đổi ảnh
    if (needSave) {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
    }
    
    return products;
  },
  saveProducts(products) {
    const cleanProducts = (products || []).filter(p => p !== null && p !== undefined).map(normalizeProduct);
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(cleanProducts));
    
    // Đồng bộ lên Firebase
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        firebase.database().ref('products').set(cleanProducts);
      } catch (e) {
        console.error('Lỗi khi đồng bộ sản phẩm lên Firebase:', e);
      }
    }
  }
};

// Khởi chạy đồng bộ Firebase và gán cấu hình URL database thông minh
let activeDbUrl = "https://manage-coffee-3a860-default-rtdb.asia-southeast1.firebasedatabase.app";
let dbWrapperSetup = false;

function setupDatabaseURLWrapper() {
  if (dbWrapperSetup) return;
  if (typeof firebase !== 'undefined' && firebase.database) {
    const originalDatabase = firebase.database;
    firebase.database = function(url) {
      return originalDatabase.call(firebase, url || activeDbUrl);
    };
    dbWrapperSetup = true;
    console.log("🔌 Đã cấu hình wrap firebase.database() với URL mặc định:", activeDbUrl);

    // Kiểm tra kết nối tới Singapore để làm fallback sang US nếu cần
    try {
      const testDb = originalDatabase.call(firebase, "https://manage-coffee-3a860-default-rtdb.asia-southeast1.firebasedatabase.app");
      const connectedRef = testDb.ref(".info/connected");
      let timeoutId = setTimeout(() => {
        connectedRef.off();
        console.warn("⚠️ Không thể kết nối tới Singapore DB. Chuyển sang US DB.");
        activeDbUrl = "https://manage-coffee-3a860-default-rtdb.firebaseio.com";
      }, 4000);

      connectedRef.on("value", function listener(snap) {
        if (snap.val() === true) {
          clearTimeout(timeoutId);
          connectedRef.off("value", listener);
          console.log("✅ Kết nối thành công tới Singapore DB.");
          activeDbUrl = "https://manage-coffee-3a860-default-rtdb.asia-southeast1.firebasedatabase.app";
        }
      });
    } catch (e) {
      console.warn("⚠️ Lỗi kiểm tra kết nối DB:", e.message);
    }
  }
}

function loadFirebaseDatabase(callback) {
  if (typeof firebase !== 'undefined' && firebase.database) {
    setupDatabaseURLWrapper();
    if (callback) callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js';
  script.onload = () => {
    console.log('Firebase Database SDK loaded dynamically.');
    setupDatabaseURLWrapper();
    if (callback) callback();
  };
  document.head.appendChild(script);
}

// Các hàm gộp (merge) dữ liệu để tránh ghi đè làm mất đơn hàng
function mergeProducts(local, remote) {
  const localMap = new Map((local || []).map(p => [p.id, p]));
  const remoteMap = new Map((remote || []).map(p => [p.id, p]));
  const mergedMap = new Map();

  for (const [id, rProd] of remoteMap) {
    const lProd = localMap.get(id);
    if (lProd) {
      const lTime = new Date(lProd.updatedAt || 0).getTime();
      const rTime = new Date(rProd.updatedAt || 0).getTime();
      mergedMap.set(id, lTime >= rTime ? lProd : rProd);
    } else {
      mergedMap.set(id, rProd);
    }
  }

  for (const [id, lProd] of localMap) {
    if (!mergedMap.has(id)) {
      mergedMap.set(id, lProd);
    }
  }

  return Array.from(mergedMap.values());
}

function mergeOrders(local, remote) {
  const getKey = (o) => String(o.code || o.id || "");
  const localMap = new Map((local || []).map(o => [getKey(o), o]));
  const remoteMap = new Map((remote || []).map(o => [getKey(o), o]));
  const mergedMap = new Map();

  const statusPriority = {
    "Hoàn tất": 4,
    "Đã hủy": 4,
    "Đang giao": 3,
    "Đang xử lý": 2,
    "Chờ thanh toán": 1,
    "Đã ghi nhận": 0
  };

  for (const [key, rOrder] of remoteMap) {
    const lOrder = localMap.get(key);
    if (lOrder) {
      const lPriority = statusPriority[lOrder.status] || 0;
      const rPriority = statusPriority[rOrder.status] || 0;
      if (lPriority > rPriority) {
        mergedMap.set(key, lOrder);
      } else if (rPriority > lPriority) {
        mergedMap.set(key, rOrder);
      } else {
        const lTime = new Date(lOrder.updatedAt || lOrder.createdAt || 0).getTime();
        const rTime = new Date(rOrder.updatedAt || rOrder.createdAt || 0).getTime();
        mergedMap.set(key, lTime >= rTime ? lOrder : rOrder);
      }
    } else {
      mergedMap.set(key, rOrder);
    }
  }

  for (const [key, lOrder] of localMap) {
    if (!mergedMap.has(key)) {
      mergedMap.set(key, lOrder);
    }
  }

  return Array.from(mergedMap.values());
}

function mergeUsers(local, remote) {
  const localMap = new Map((local || []).map(u => [String(u.id), u]));
  const remoteMap = new Map((remote || []).map(u => [String(u.id), u]));
  const mergedMap = new Map();

  for (const [id, rUser] of remoteMap) {
    const lUser = localMap.get(id);
    if (lUser) {
      const lTime = new Date(lUser.updatedAt || lUser.createdAt || 0).getTime();
      const rTime = new Date(rUser.updatedAt || rUser.createdAt || 0).getTime();
      mergedMap.set(id, lTime >= rTime ? lUser : rUser);
    } else {
      mergedMap.set(id, rUser);
    }
  }

  for (const [id, lUser] of localMap) {
    if (!mergedMap.has(id)) {
      mergedMap.set(id, lUser);
    }
  }

  return Array.from(mergedMap.values());
}

function initFirebaseSync() {
  setupDatabaseURLWrapper();
  loadFirebaseDatabase(() => {
    setupDatabaseURLWrapper();
    if (typeof firebase !== "undefined") {
      try {
        const db = firebase.database();
        
        // 1. Đồng bộ Products
        const dbProductsRef = db.ref('products');
        dbProductsRef.on('value', (snapshot) => {
          const remoteProducts = snapshot.val();
          const localRaw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
          let localProducts = [];
          try {
            localProducts = localRaw ? JSON.parse(localRaw) : [];
          } catch(e) {}
          if (!Array.isArray(localProducts)) localProducts = [];

          if (remoteProducts && Array.isArray(remoteProducts)) {
            const mergedProducts = mergeProducts(localProducts, remoteProducts);
            const mergedStr = JSON.stringify(mergedProducts);
            const remoteStr = JSON.stringify(remoteProducts);
            
            if (localRaw !== mergedStr) {
              localStorage.setItem(ADMIN_PRODUCTS_KEY, mergedStr);
              console.log('⚡ Đồng bộ sản phẩm (gộp) từ Firebase.');
              window.dispatchEvent(new CustomEvent('gibor_products_updated', { detail: mergedProducts }));
            }
            if (remoteStr !== mergedStr) {
              dbProductsRef.set(mergedProducts);
            }
          } else {
            if (localProducts.length > 0) {
              dbProductsRef.set(localProducts);
            }
          }
        }, (error) => {
          console.warn('⚠️ Firebase Products read error:', error.message);
        });

        // 2. Đồng bộ Orders
        const dbOrdersRef = db.ref('orders');
        dbOrdersRef.on('value', (snapshot) => {
          const remoteOrders = snapshot.val();
          const localRaw = localStorage.getItem('gibor_orders');
          let localOrders = [];
          try {
            localOrders = localRaw ? JSON.parse(localRaw) : [];
          } catch(e) {}
          if (!Array.isArray(localOrders)) localOrders = [];

          if (remoteOrders && Array.isArray(remoteOrders)) {
            const mergedOrders = mergeOrders(localOrders, remoteOrders);
            const mergedStr = JSON.stringify(mergedOrders);
            const remoteStr = JSON.stringify(remoteOrders);

            if (localRaw !== mergedStr) {
              localStorage.setItem('gibor_orders', mergedStr);
              console.log('⚡ Đồng bộ đơn hàng (gộp) từ Firebase.');
              window.dispatchEvent(new CustomEvent('gibor_orders_updated', { detail: mergedOrders }));
            }
            if (remoteStr !== mergedStr) {
              dbOrdersRef.set(mergedOrders);
            }
          } else {
            if (localOrders.length > 0) {
              dbOrdersRef.set(localOrders);
            }
          }
        }, (error) => {
          console.warn('⚠️ Firebase Orders read error:', error.message);
        });

        // 3. Đồng bộ Users (Tài khoản)
        const dbUsersRef = db.ref('users');
        dbUsersRef.on('value', (snapshot) => {
          const remoteUsers = snapshot.val();
          const localRaw = localStorage.getItem('gibor_users');
          let localUsers = [];
          try {
            localUsers = localRaw ? JSON.parse(localRaw) : [];
          } catch(e) {}
          if (!Array.isArray(localUsers)) localUsers = [];

          if (remoteUsers && Array.isArray(remoteUsers)) {
            const mergedUsers = mergeUsers(localUsers, remoteUsers);
            const mergedStr = JSON.stringify(mergedUsers);
            const remoteStr = JSON.stringify(remoteUsers);

            if (localRaw !== mergedStr) {
              localStorage.setItem('gibor_users', mergedStr);
              console.log('⚡ Đồng bộ tài khoản (gộp) từ Firebase.');
              window.dispatchEvent(new CustomEvent('gibor_users_updated', { detail: mergedUsers }));
              
              // Kiểm tra xem tài khoản đang đăng nhập có bị khóa không
              const currentUser = UserManager.getCurrentUser();
              if (currentUser) {
                const myAccount = mergedUsers.find(u => u && String(u.id) === String(currentUser.id));
                if (myAccount) {
                  if (myAccount.status === 'locked') {
                    alert('Tài khoản của bạn đã bị khóa bởi quản trị viên.');
                    UserManager.logout();
                    window.location.reload();
                  } else {
                    UserManager.setCurrentUser(myAccount);
                  }
                }
              }
            }
            if (remoteStr !== mergedStr) {
              dbUsersRef.set(mergedUsers);
            }
          } else {
            if (localUsers.length > 0) {
              dbUsersRef.set(localUsers);
            }
          }
        }, (error) => {
          console.warn('⚠️ Firebase Users read error:', error.message);
        });

        // 4. Đồng bộ payOS configs
        const dbPayosRef = db.ref('payos_configs');
        dbPayosRef.on('value', (snapshot) => {
          const remoteConfig = snapshot.val();
          if (remoteConfig && typeof remoteConfig === 'object') {
            console.log('⚡ Đồng bộ cấu hình payOS từ Firebase.');
            Object.keys(remoteConfig).forEach(key => {
              const suffix = key === 'default' ? '' : '_' + key;
              const conf = remoteConfig[key];
              if (conf) {
                if (conf.clientId) localStorage.setItem("gibor_payos_client_id" + suffix, conf.clientId);
                if (conf.apiKey) localStorage.setItem("gibor_payos_api_key" + suffix, conf.apiKey);
                if (conf.checksumKey) localStorage.setItem("gibor_payos_checksum_key" + suffix, conf.checksumKey);
                if (conf.mockToggle) localStorage.setItem("gibor_payos_mock_toggle" + suffix, conf.mockToggle);
              }
            });
            window.dispatchEvent(new CustomEvent('gibor_payos_config_updated'));
          } else {
            // Nếu trên Firebase chưa có cấu hình payOS nhưng local có, đẩy lên
            const localConfig = {};
            let hasLocal = false;
            
            // Đọc cấu hình mặc định (default)
            const defClientId = localStorage.getItem("gibor_payos_client_id");
            if (defClientId) {
              hasLocal = true;
              localConfig["default"] = {
                clientId: defClientId,
                apiKey: localStorage.getItem("gibor_payos_api_key") || "",
                checksumKey: localStorage.getItem("gibor_payos_checksum_key") || "",
                mockToggle: localStorage.getItem("gibor_payos_mock_toggle") || "true",
                updatedAt: new Date().toISOString()
              };
            }
            
            // Đọc cấu hình theo từng chi nhánh nếu có trong localStorage
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("gibor_payos_client_id_")) {
                const branchId = key.replace("gibor_payos_client_id_", "");
                if (branchId) {
                  hasLocal = true;
                  localConfig[branchId] = {
                    clientId: localStorage.getItem("gibor_payos_client_id_" + branchId) || "",
                    apiKey: localStorage.getItem("gibor_payos_api_key_" + branchId) || "",
                    checksumKey: localStorage.getItem("gibor_payos_checksum_key_" + branchId) || "",
                    mockToggle: localStorage.getItem("gibor_payos_mock_toggle_" + branchId) || "true",
                    updatedAt: new Date().toISOString()
                  };
                }
              }
            }
            
            if (hasLocal) {
              dbPayosRef.set(localConfig);
            }
          }
        }, (error) => {
          console.warn('⚠️ Firebase payOS config read error:', error.message);
        });
        
      } catch (err) {
        console.warn('⚠️ Lỗi khởi tạo Firebase Database Sync:', err.message);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebaseSync);
} else {
  initFirebaseSync();
}

const UserManager = {
  ensureDefaultAdmin() {
    const users = this.getUsers();
    let changed = false;

    // 1. Quản lý tài khoản Admin tối cao
    let adminUser = users.find(u => u && u.id === "admin-001");
    if (!adminUser) {
      adminUser = {
        id: "admin-001",
        username: "admin",
        lastName: "Quản trị",
        firstName: "Admin",
        displayName: "Quản trị Admin",
        email: "admin@giborcoffee.com",
        phone: "0000000000",
        password: "123",
        role: "admin",
        status: "active",
        provider: "local",
        permissions: ["*"],
        createdAt: new Date().toISOString()
      };
      users.push(adminUser);
      changed = true;
    } else {
      // Đảm bảo mật khẩu admin là 123 và hoạt động
      if (adminUser.password !== "123" || adminUser.role !== "admin" || adminUser.status !== "active") {
        adminUser.password = "123";
        adminUser.role = "admin";
        adminUser.status = "active";
        changed = true;
      }
    }

    // 2. Danh sách 15 quản lý chi nhánh
    const branchManagersDef = [
      { branchId: "hcm1", username: "ql_hcm1", name: "GIBOR Lê Trọng Tấn", email: "ql-hcm1@giborcoffee.com", phone: "0901000001", password: "GiborHCM1@2026" },
      { branchId: "hcm2", username: "ql_hcm2", name: "GIBOR Nguyễn Huệ", email: "ql-hcm2@giborcoffee.com", phone: "0901000002", password: "GiborHCM2@2026" },
      { branchId: "hcm3", username: "ql_hcm3", name: "GIBOR Võ Văn Tần", email: "ql-hcm3@giborcoffee.com", phone: "0901000003", password: "GiborHCM3@2026" },
      { branchId: "hcm4", username: "ql_hcm4", name: "GIBOR Xa lộ Hà Nội", email: "ql-hcm4@giborcoffee.com", phone: "0901000004", password: "GiborHCM4@2026" },
      { branchId: "hcm5", username: "ql_hcm5", name: "GIBOR Điện Biên Phủ", email: "ql-hcm5@giborcoffee.com", phone: "0901000005", password: "GiborHCM5@2026" },
      { branchId: "hn1", username: "ql_hn1", name: "GIBOR Trần Duy Hưng", email: "ql-hn1@giborcoffee.com", phone: "0902000001", password: "GiborHN1@2026" },
      { branchId: "hn2", username: "ql_hn2", name: "GIBOR Láng Hạ", email: "ql-hn2@giborcoffee.com", phone: "0902000002", password: "GiborHN2@2026" },
      { branchId: "hn3", username: "ql_hn3", name: "GIBOR Bạch Mai", email: "ql-hn3@giborcoffee.com", phone: "0902000003", password: "GiborHN3@2026" },
      { branchId: "hn4", username: "ql_hn4", name: "GIBOR Hoàng Hoa Thám", email: "ql-hn4@giborcoffee.com", phone: "0902000004", password: "GiborHN4@2026" },
      { branchId: "hn5", username: "ql_hn5", name: "GIBOR Nguyễn Văn Cừ", email: "ql-hn5@giborcoffee.com", phone: "0902000005", password: "GiborHN5@2026" },
      { branchId: "dn1", username: "ql_dn1", name: "GIBOR Võ Nguyên Giáp", email: "ql-dn1@giborcoffee.com", phone: "0903000001", password: "GiborDN1@2026" },
      { branchId: "dn2", username: "ql_dn2", name: "GIBOR Bạch Đằng", email: "ql-dn2@giborcoffee.com", phone: "0903000002", password: "GiborDN2@2026" },
      { branchId: "dn3", username: "ql_dn3", name: "GIBOR Nguyễn Văn Linh", email: "ql-dn3@giborcoffee.com", phone: "0903000003", password: "GiborDN3@2026" },
      { branchId: "dn4", username: "ql_dn4", name: "GIBOR Tôn Đức Thắng", email: "ql-dn4@giborcoffee.com", phone: "0903000004", password: "GiborDN4@2026" },
      { branchId: "dn5", username: "ql_dn5", name: "GIBOR Cách Mạng Tháng Tám", email: "ql-dn5@giborcoffee.com", phone: "0903000005", password: "GiborDN5@2026" },
    ];

    branchManagersDef.forEach(manager => {
      const managerId = `branch-manager-${manager.branchId}`;
      let existingManager = users.find(u => u && (u.id === managerId || u.username === manager.username));

      if (!existingManager) {
        // Nếu chưa có, thêm mới tài khoản
        const newManager = {
          id: managerId,
          username: manager.username,
          lastName: "Quản lý",
          firstName: manager.name,
          displayName: `Quản lý ${manager.name}`,
          email: manager.email,
          phone: manager.phone,
          password: manager.password,
          role: "branch_manager",
          branchId: manager.branchId,
          status: "active",
          provider: "email",
          permissions: [`branch:${manager.branchId}`],
          createdAt: new Date().toISOString()
        };
        users.push(newManager);
        changed = true;
      } else {
        // Nếu đã có, kiểm tra và cập nhật lại mật khẩu và thông tin cho khớp tuyệt đối
        let itemChanged = false;
        if (existingManager.password !== manager.password) { existingManager.password = manager.password; itemChanged = true; }
        if (existingManager.email !== manager.email) { existingManager.email = manager.email; itemChanged = true; }
        if (existingManager.role !== "branch_manager") { existingManager.role = "branch_manager"; itemChanged = true; }
        if (existingManager.branchId !== manager.branchId) { existingManager.branchId = manager.branchId; itemChanged = true; }
        if (existingManager.status !== "active") { existingManager.status = "active"; itemChanged = true; }
        if (existingManager.firstName !== manager.name) { existingManager.firstName = manager.name; itemChanged = true; }
        if (existingManager.displayName !== `Quản lý ${manager.name}`) { existingManager.displayName = `Quản lý ${manager.name}`; itemChanged = true; }

        if (itemChanged) {
          changed = true;
        }
      }
    });

    if (changed) {
      this.saveUsers(users);
      console.log("Đã đồng bộ hóa dữ liệu tài khoản quản trị và chi nhánh mặc định.");
    }
  },

  /**
   * Lấy danh sách tất cả người dùng từ localStorage
   * @returns {Array} Mảng các đối tượng user
   */
  getUsers() {
    try {
      const users = localStorage.getItem("gibor_users");
      const parsed = users ? JSON.parse(users) : [];
      return (Array.isArray(parsed) ? parsed : []).filter(u => u !== null && u !== undefined);
    } catch (e) {
      return [];
    }
  },

  /**
   * Lưu danh sách người dùng vào localStorage
   * @param {Array} users - Mảng người dùng
   */
  saveUsers(users) {
    const cleanUsers = (users || []).filter(u => u !== null && u !== undefined);
    localStorage.setItem("gibor_users", JSON.stringify(cleanUsers));
    
    // Đồng bộ lên Firebase
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        firebase.database().ref('users').set(cleanUsers);
      } catch (e) {
        console.error('Lỗi khi đồng bộ users lên Firebase:', e);
      }
    }
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} param0
   * @param {string} param0.lastName - Họ
   * @param {string} param0.firstName - Tên
   * @param {string} param0.email - Email
   * @param {string} param0.phone - Số điện thoại
   * @param {string} param0.password - Mật khẩu
   * @returns {Object} { success, message, user }
   */
  register({ lastName, firstName, email, phone, password }) {
    const users = this.getUsers();

    // Kiểm tra email đã tồn tại chưa (bất kể đăng ký bằng cách nào)
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      // Kiểm tra xem tài khoản này đăng ký bằng phương thức nào
      if (existingUser.provider === "google") {
        return { 
          success: false, 
          message: "Email này đã được đăng ký bằng tài khoản Google. Vui lòng đăng nhập bằng Google." 
        };
      } else if (existingUser.provider === "github") {
        return { 
          success: false, 
          message: "Email này đã được đăng ký bằng tài khoản GitHub. Vui lòng đăng nhập bằng GitHub." 
        };
      } else {
        return { 
          success: false, 
          message: "Email đã được dùng để đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác." 
        };
      }
    }

    // Kiểm tra mật khẩu tối thiểu 6 ký tự
    if (password.length < 6) {
      return {
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      };
    }

    const newUser = {
      id: Date.now(),
      username: email.split('@')[0], // Generate a default username from email
      lastName: lastName,
      firstName: firstName,
      displayName: (lastName + " " + firstName).trim(),
      email: email,
      phone: phone,
      password: password,
      role: "user",
      status: "active",
      permissions: [],
      provider: "email", // Đánh dấu đăng ký bằng email/password
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Tự động đăng nhập sau khi đăng ký
    this.setCurrentUser(newUser);

    return { success: true, message: "Đăng ký thành công!", user: newUser };
  },

  /**
   * Đăng nhập
   * @param {string} loginId
   * @param {string} password
   * @returns {Object} { success, message, user }
   */
  login(loginId, password) {
    const users = this.getUsers();
    // Allow login by email or username
    const user = users.find(
      (u) => (u.email === loginId || u.username === loginId) && u.password === password,
    );

    if (!user) {
      return {
        success: false,
        message: "Thông tin đăng nhập hoặc mật khẩu không đúng.",
      };
    }
    
    // Check if locked
    if (user.status === "locked") {
      return {
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      };
    }

    // Normalize old users
    if (!user.role) user.role = "user";
    if (!user.status) user.status = "active";
    if (!user.permissions) user.permissions = [];

    this.setCurrentUser(user);
    return {
      success: true,
      message: "Đăng nhập thành công!",
      user: user,
    };
  },

  /**
   * Lưu thông tin user đang đăng nhập (không lưu password)
   * @param {Object} user
   */
  setCurrentUser(user) {
    const safeUser = {
      id: user.id,
      lastName: user.lastName,
      firstName: user.firstName,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      username: user.username,
      role: user.role || "user",
      status: user.status || "active",
      permissions: user.permissions || [],
      provider: user.provider,
      branchId: user.branchId || ""
    };
    localStorage.setItem("gibor_current_user", JSON.stringify(safeUser));
  },

  /**
   * Lấy thông tin user đang đăng nhập
   * @returns {Object|null}
   */
  getCurrentUser() {
    const user = localStorage.getItem("gibor_current_user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Kiểm tra quyền Admin
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Ràng buộc an toàn và tương thích ngược hoàn hảo
    return user.role === "admin" && user.status !== "locked";
  },
  
  /**
   * Kiểm tra role
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },
  
  /**
   * Chặn truy cập trang admin nếu không đủ quyền
   */
  requireAdmin() {
    if (!this.isAdmin()) {
      alert("Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập bằng tài khoản admin và mật khẩu tương ứng.");
      window.location.href = "login.html";
    }
  },

  /**
   * Đăng xuất
   */
  logout() {
    localStorage.removeItem("gibor_current_user");
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Cập nhật thông tin cá nhân (họ, tên, email, sđt)
   * @param {Object} updates - { lastName, firstName, email, phone }
   * @returns {Object} { success, message }
   */
  updateProfile(updates) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Chưa đăng nhập." };

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx === -1)
      return { success: false, message: "Không tìm thấy tài khoản." };

    // Nếu đổi email → kiểm tra email mới chưa ai dùng
    if (updates.email && updates.email !== users[idx].email) {
      if (
        users.find((u) => u.email === updates.email && u.id !== currentUser.id)
      ) {
        return {
          success: false,
          message: "Email mới đã được dùng bởi tài khoản khác.",
        };
      }
    }

    // Cập nhật các trường
    if (updates.lastName !== undefined) users[idx].lastName = updates.lastName;
    if (updates.firstName !== undefined)
      users[idx].firstName = updates.firstName;
    if (updates.email !== undefined) users[idx].email = updates.email;
    if (updates.phone !== undefined) users[idx].phone = updates.phone;
    users[idx].displayName = (
      users[idx].lastName +
      " " +
      users[idx].firstName
    ).trim();

    this.saveUsers(users);
    this.setCurrentUser(users[idx]);

    return {
      success: true,
      message: "Cập nhật thông tin thành công!",
      user: users[idx],
    };
  },

  /**
   * Đổi mật khẩu
   * @param {string} oldPassword - Mật khẩu cũ
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Object} { success, message }
   */
  updatePassword(oldPassword, newPassword) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Chưa đăng nhập." };

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx === -1)
      return { success: false, message: "Không tìm thấy tài khoản." };

    // Xác minh mật khẩu cũ
    if (users[idx].password !== oldPassword) {
      return { success: false, message: "Mật khẩu cũ không đúng." };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      };
    }

    users[idx].password = newPassword;
    this.saveUsers(users);

    return { success: true, message: "Đổi mật khẩu thành công!" };
  },

  /**
   * Đặt lại mật khẩu (dành cho Quên mật khẩu)
   * @param {string} email - Email của tài khoản
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Object} { success, message }
   */
  resetPassword(email, newPassword) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1)
      return { success: false, message: "Email không tồn tại trong hệ thống." };

    if (newPassword.length < 6) {
      return {
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      };
    }

    users[idx].password = newPassword;
    this.saveUsers(users);

    return { success: true, message: "Lấy lại mật khẩu thành công!" };
  },

  /**
   * Đăng nhập/Đăng ký bằng Google (Firebase Auth)
   * Kiểm tra email đã tồn tại chưa:
   * - Nếu đã có trong localStorage → đăng nhập (nhưng kiểm tra provider)
   * - Nếu chưa có → tạo tài khoản mới
   * @param {Object} googleUser - { displayName, email, photoURL, uid }
   * @returns {Object} { success, message, user, isNew }
   */
  loginWithGoogle(googleUser) {
    const users = this.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());

    if (user) {
      // Email đã tồn tại - kiểm tra provider
      if (user.provider === "email" && !user.googleUid) {
        // Tài khoản đã đăng ký bằng email/password thông thường
        return {
          success: false,
          message: "Email này đã được đăng ký bằng tài khoản thông thường. Vui lòng đăng nhập bằng email và mật khẩu.",
          user: null,
          isNew: false,
        };
      }
      
      // Đã có tài khoản Google hoặc đã liên kết → đăng nhập
      user.googleUid = googleUser.uid;
      user.photoURL = googleUser.photoURL || user.photoURL;
      user.provider = user.provider || "google"; // Cập nhật provider nếu chưa có
      
      // Cập nhật lại thông tin
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        this.saveUsers(users);
      }
      
      this.setCurrentUser(user);
      return {
        success: true,
        message: "Đăng nhập thành công!",
        user,
        isNew: false,
      };
    }

    // Chưa có tài khoản → tạo mới
    const nameParts = (googleUser.displayName || "Google User")
      .trim()
      .split(" ");
    const firstName = nameParts.pop();
    const lastName = nameParts.join(" ");

    const newUser = {
      id: Date.now(),
      lastName: lastName,
      firstName: firstName,
      displayName: googleUser.displayName || "Google User",
      email: googleUser.email,
      phone: "",
      password: "", // Không có password cho tài khoản Google
      googleUid: googleUser.uid,
      photoURL: googleUser.photoURL || "",
      provider: "google",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return {
      success: true,
      message: "Đăng ký thành công!",
      user: newUser,
      isNew: true,
    };
  },

  /**
   * Đăng nhập/đăng ký bằng GitHub (Firebase Auth)
   * Kiểm tra email đã tồn tại chưa:
   * - Nếu đã có trong localStorage → đăng nhập (nhưng kiểm tra provider)
   * - Nếu chưa có → tạo tài khoản mới
   */
  loginWithGithub(githubUser) {
    const users = this.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === githubUser.email.toLowerCase());

    if (user) {
      // Email đã tồn tại - kiểm tra provider
      if (user.provider === "email" && !user.githubUid) {
        // Tài khoản đã đăng ký bằng email/password thông thường
        return {
          success: false,
          message: "Email này đã được đăng ký bằng tài khoản thông thường. Vui lòng đăng nhập bằng email và mật khẩu.",
          user: null,
          isNew: false,
        };
      }
      
      // Đã có tài khoản GitHub hoặc đã liên kết → đăng nhập
      user.githubUid = githubUser.uid;
      user.photoURL = githubUser.photoURL || user.photoURL;
      user.provider = user.provider || "github"; // Cập nhật provider nếu chưa có
      
      // Cập nhật lại thông tin
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        this.saveUsers(users);
      }
      
      this.setCurrentUser(user);
      return {
        success: true,
        message: "Đăng nhập thành công!",
        user,
        isNew: false,
      };
    }

    // Chưa có tài khoản tương ứng → tạo mới
    const nameParts = (githubUser.displayName || "GitHub User")
      .trim()
      .split(" ");
    const firstName = nameParts.pop();
    const lastName = nameParts.join(" ");

    const newUser = {
      id: Date.now(),
      lastName: lastName,
      firstName: firstName,
      displayName: githubUser.displayName || "GitHub User",
      email: githubUser.email,
      phone: "",
      password: "", // Không có password cho tài khoản GitHub
      githubUid: githubUser.uid,
      photoURL: githubUser.photoURL || "",
      provider: "github",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return {
      success: true,
      message: "Đăng ký thành công!",
      user: newUser,
      isNew: true,
    };
  },
};

/**
 * Quản lý điểm tích lũy - lưu vào localStorage theo userId
 * Quy tắc: 1.000đ = 1 điểm (tích), 1 điểm = 10đ (dùng)
 */
const PointsManager = {
  /**
   * Lấy điểm hiện tại của user đang đăng nhập
   * @returns {number}
   */
  getPoints() {
    const user = UserManager.getCurrentUser();
    if (!user) return 0;
    const allPoints = JSON.parse(localStorage.getItem("gibor_points") || "{}");
    return allPoints[user.id] || 0;
  },

  /**
   * Cập nhật điểm cho user hiện tại
   * @param {number} points - Số điểm mới
   */
  setPoints(points) {
    const user = UserManager.getCurrentUser();
    if (!user) return;
    const allPoints = JSON.parse(localStorage.getItem("gibor_points") || "{}");
    allPoints[user.id] = Math.max(0, Math.floor(points));
    localStorage.setItem("gibor_points", JSON.stringify(allPoints));
  },

  /**
   * Cộng điểm (sau khi thanh toán)
   * @param {number} amount - Tổng tiền đơn hàng (VNĐ)
   * @returns {number} Số điểm được cộng
   */
  earnPoints(amount) {
    const earned = Math.floor(amount / 1000);
    this.setPoints(this.getPoints() + earned);
    return earned;
  },

  /**
   * Trừ điểm (khi sử dụng)
   * @param {number} points - Số điểm muốn dùng
   * @returns {boolean}
   */
  usePoints(points) {
    const current = this.getPoints();
    if (points > current) return false;
    this.setPoints(current - points);
    return true;
  },

  /**
   * Tính số tiền giảm từ điểm
   * @param {number} points - Số điểm dùng
   * @returns {number} Số tiền giảm (VNĐ) — 1 điểm = 10đ
   */
  pointsToMoney(points) {
    return points * 10;
  },

  /**
   * Tính số điểm nhận được từ tổng tiền
   * @param {number} amount - Tổng tiền (VNĐ)
   * @returns {number} Số điểm
   */
  moneyToPoints(amount) {
    return Math.floor(amount / 1000);
  },
};

/**
 * Quản lý lịch sử đơn hàng - lưu vào localStorage
 */
const OrderManager = {
  /**
   * Lấy tất cả đơn hàng của user hiện tại
   * @returns {Array}
   */
  getOrders() {
    try {
      const currentUser = UserManager.getCurrentUser();
      if (!currentUser) return [];
      const allOrders = JSON.parse(localStorage.getItem("gibor_orders") || "[]");
      return (Array.isArray(allOrders) ? allOrders : [])
        .filter(o => o !== null && o !== undefined)
        .filter((o) => o.userId === currentUser.id);
    } catch (e) {
      return [];
    }
  },

  /**
   * Lưu đơn hàng mới
   * @param {Object} order - { code, items, total, payment, shipping, date }
   */
  saveOrder(order) {
    try {
      const currentUser = UserManager.getCurrentUser();
      const allOrders = JSON.parse(localStorage.getItem("gibor_orders") || "[]");
      const cleanOrders = (Array.isArray(allOrders) ? allOrders : []).filter(o => o !== null && o !== undefined);
      
      cleanOrders.push({
        ...order,
        userId: currentUser ? currentUser.id : "guest",
        userName: currentUser ? currentUser.displayName : (order.customer ? order.customer.name : "Khách vãng lai"),
        createdAt: new Date().toISOString(),
        status: order.status || "Đã ghi nhận", // Tự động gán trạng thái mặc định
      });
      localStorage.setItem("gibor_orders", JSON.stringify(cleanOrders));
      
      // Đồng bộ lên Firebase
      if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('orders').set(cleanOrders);
      }
    } catch (e) {
      console.error("Lỗi lưu đơn hàng:", e);
    }
  },
};

// Initialize default admin
if (typeof UserManager !== 'undefined') {
  UserManager.ensureDefaultAdmin();
}

/* 
========================================================================================

                                KẾT THÚC CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
