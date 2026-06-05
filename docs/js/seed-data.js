/*
  ========================================================================================

                    SEED DATA - DỮ LIỆU MẪU CHO DỰ ÁN GIBOR COFFEE SHOP
                    Tổng cộng: 100 bản ghi (30 users + 70 orders)

  ========================================================================================
  
  Cách sử dụng:
  1. Mở trang web bất kỳ của dự án (ví dụ index.html)
  2. Mở Console (F12 → Console)
  3. Gọi: seedAllData()    → Sinh toàn bộ dữ liệu
  4. Gọi: clearSeedData()  → Xóa toàn bộ dữ liệu seed (giữ lại admin + branch managers)
  
  Hoặc: Thêm <script src="js/seed-data.js"></script> vào file HTML trước </body>
        rồi mở trang → dữ liệu sẽ tự động được sinh.
*/

(function () {
  "use strict";

  // ===================== DANH SÁCH HỌ TÊN VIỆT NAM THỰC TẾ =====================
  const LAST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ",
    "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý",
    "Đoàn", "Tạ", "Mai", "Trịnh", "Đinh", "Lương", "Cao", "Tô"
  ];

  const MIDDLE_NAMES = [
    "Văn", "Thị", "Hữu", "Đức", "Minh", "Thanh", "Ngọc", "Quốc",
    "Hoàng", "Phương", "Anh", "Bảo", "Gia", "Xuân", "Thu", "Kim"
  ];

  const FIRST_NAMES_MALE = [
    "An", "Bình", "Cường", "Dũng", "Đạt", "Hải", "Hùng", "Khoa",
    "Long", "Minh", "Nam", "Phúc", "Quang", "Sơn", "Tâm", "Tuấn",
    "Vinh", "Trung", "Huy", "Kiên", "Thắng", "Đức", "Toàn", "Nhân"
  ];

  const FIRST_NAMES_FEMALE = [
    "Anh", "Chi", "Diễm", "Giang", "Hà", "Hạnh", "Hương", "Lan",
    "Linh", "Mai", "Ngân", "Nhung", "Oanh", "Phương", "Quyên", "Thảo",
    "Trang", "Trinh", "Vy", "Yến", "Ngọc", "Thùy", "Thanh", "Tuyết"
  ];

  // ===================== ĐỊA CHỈ THỰC TẾ =====================
  const STREETS_HCM = [
    "12 Nguyễn Trãi, Quận 1",
    "45 Lê Lợi, Quận 1",
    "78 Trần Hưng Đạo, Quận 5",
    "120 Cách Mạng Tháng Tám, Quận 3",
    "234 Lý Thường Kiệt, Quận 10",
    "56 Nguyễn Đình Chiểu, Quận 3",
    "89 Hai Bà Trưng, Quận 1",
    "150 Điện Biên Phủ, Bình Thạnh",
    "67 Phan Xích Long, Phú Nhuận",
    "330 Võ Văn Tần, Quận 3",
    "18 Nguyễn Thị Minh Khai, Quận 1",
    "201 Cộng Hòa, Tân Bình",
    "99 Lê Văn Sỹ, Quận 3",
    "45 Hoàng Văn Thụ, Tân Bình",
    "300 Nguyễn Văn Trỗi, Phú Nhuận"
  ];

  const STREETS_HN = [
    "15 Phố Huế, Hai Bà Trưng",
    "28 Bà Triệu, Hoàn Kiếm",
    "55 Láng Hạ, Đống Đa",
    "100 Trần Duy Hưng, Cầu Giấy",
    "72 Nguyễn Chí Thanh, Đống Đa",
    "33 Giải Phóng, Đống Đa",
    "210 Trường Chinh, Thanh Xuân",
    "8 Tràng Tiền, Hoàn Kiếm",
    "45 Kim Mã, Ba Đình",
    "88 Hoàng Hoa Thám, Ba Đình"
  ];

  const STREETS_DN = [
    "12 Bạch Đằng, Hải Châu",
    "45 Nguyễn Văn Linh, Thanh Khê",
    "78 Trần Phú, Hải Châu",
    "30 Lê Duẩn, Hải Châu",
    "55 Phan Châu Trinh, Hải Châu",
    "120 Điện Biên Phủ, Thanh Khê",
    "200 Võ Nguyên Giáp, Sơn Trà",
    "90 Ngô Quyền, Sơn Trà"
  ];

  // ===================== CHI NHÁNH =====================
  const BRANCHES = [
    { id: "hcm1", name: "GIBOR Lê Trọng Tấn", address: "140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP. Hồ Chí Minh" },
    { id: "hcm2", name: "GIBOR Nguyễn Huệ", address: "263 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh" },
    { id: "hcm3", name: "GIBOR Võ Văn Tần", address: "123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh" },
    { id: "hcm4", name: "GIBOR Xa lộ Hà Nội", address: "77 Xa lộ Hà Nội, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh" },
    { id: "hcm5", name: "GIBOR Điện Biên Phủ", address: "23 Điện Biên Phủ, Phường 15, Bình Thạnh, TP. Hồ Chí Minh" },
    { id: "hn1", name: "GIBOR Trần Duy Hưng", address: "81 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội" },
    { id: "hn2", name: "GIBOR Láng Hạ", address: "66 Láng Hạ, Láng Hạ, Đống Đa, Hà Nội" },
    { id: "hn3", name: "GIBOR Bạch Mai", address: "115 Bạch Mai, Bạch Mai, Hai Bà Trưng, Hà Nội" },
    { id: "hn4", name: "GIBOR Hoàng Hoa Thám", address: "632 Hoàng Hoa Thám, Vĩnh Phúc, Ba Đình, Hà Nội" },
    { id: "hn5", name: "GIBOR Nguyễn Văn Cừ", address: "334 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội" },
    { id: "dn1", name: "GIBOR Võ Nguyên Giáp", address: "567 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng" },
    { id: "dn2", name: "GIBOR Bạch Đằng", address: "453 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng" },
    { id: "dn3", name: "GIBOR Nguyễn Văn Linh", address: "638 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng" },
    { id: "dn4", name: "GIBOR Tôn Đức Thắng", address: "53 Tôn Đức Thắng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng" },
    { id: "dn5", name: "GIBOR Cách Mạng Tháng Tám", address: "55 Cách Mạng Tháng Tám, Khuê Trung, Cẩm Lệ, Đà Nẵng" },
  ];

  // ===================== SẢN PHẨM (lấy từ defaultProducts trong data.js) =====================
  const PRODUCTS = [
    { id: "p-1", name: "Cà phê đen", category: "Cà phê", price: 25000, img: "images/menu/capheden.jpg" },
    { id: "p-2", name: "Cà phê sữa", category: "Cà phê", price: 30000, img: "images/menu/caphesua.jpg" },
    { id: "p-3", name: "Bạc xỉu", category: "Cà phê", price: 32000, img: "images/menu/bacxiu.jpg" },
    { id: "p-4", name: "Cà phê muối", category: "Cà phê", price: 36000, img: "images/menu/caphemuoi.jpg" },
    { id: "p-5", name: "Matcha Latte", category: "Matcha", price: 40000, img: "images/menu/matchalatte.jpg" },
    { id: "p-6", name: "Matcha Dừa", category: "Matcha", price: 36000, img: "images/menu/matchadua.jpg" },
    { id: "p-7", name: "Matcha Dâu", category: "Matcha", price: 36000, img: "images/menu/matchadau.jpg" },
    { id: "p-9", name: "Trà Dâu", category: "Trà", price: 30000, img: "images/menu/tradau.jpg" },
    { id: "p-10", name: "Trà Vải", category: "Trà", price: 30000, img: "images/menu/travai.jpg" },
    { id: "p-12", name: "Trà Đào", category: "Trà", price: 28000, img: "images/menu/tradao.jpg" },
    { id: "p-13", name: "Trà Sữa Trân Châu Đường Đen", category: "Trà sữa", price: 30000, img: "images/menu/tranchauduongden.jpg" },
    { id: "p-14", name: "Trà Sữa Truyền Thống", category: "Trà sữa", price: 25000, img: "images/menu/truyenthong.jpg" },
    { id: "p-16", name: "Trà Sữa Caramel", category: "Trà sữa", price: 35000, img: "images/menu/trasuacaramel.jpg" },
    { id: "p-18", name: "Trà Sữa Kem Cheese", category: "Trà sữa", price: 38000, img: "images/menu/trasuakemcheese.jpg" },
    { id: "p-19", name: "Trà Sữa Khoai Môn", category: "Trà sữa", price: 32000, img: "images/menu/trasuakhoaimon.jpg" },
    { id: "p-21", name: "Trà Sữa Pudding", category: "Trà sữa", price: 35000, img: "images/menu/trasuapudding.jpg" },
    { id: "p-23", name: "Bánh Cheesecake", category: "Bánh ngọt", price: 35000, img: "images/menu/cheesecake.jpg" },
    { id: "p-25", name: "Bánh Bông Lan Kem Tươi", category: "Bánh ngọt", price: 30000, img: "images/menu/bonglankemtuoi.jpg" },
    { id: "p-27", name: "Bánh Brownie Socola", category: "Bánh ngọt", price: 40000, img: "images/menu/brownie.jpg" },
    { id: "p-29", name: "Bánh Tiramisu", category: "Bánh ngọt", price: 35000, img: "images/menu/tiramisu.jpg" },
    { id: "p-31", name: "Combo 1", category: "Combo", price: 55000, img: "images/menu/combo1.jpg" },
    { id: "p-33", name: "Combo 3", category: "Combo", price: 60000, img: "images/menu/combo3.jpg" },
    { id: "p-35", name: "Combo 5", category: "Combo", price: 45000, img: "images/menu/combo5.jpg" },
    { id: "p-38", name: "Combo 8", category: "Combo", price: 55000, img: "images/menu/combo8.jpg" },
  ];

  const TOPPINGS = [
    { name: "Trân châu đen", price: 5000 },
    { name: "Trân châu trắng", price: 5000 },
    { name: "Thạch trái cây", price: 5000 },
    { name: "Thạch dừa", price: 5000 },
    { name: "Pudding", price: 5000 },
    { name: "Kem cheese", price: 10000 },
  ];

  const SIZES = ["S", "M", "L"];
  const SUGAR_LEVELS = ["0%", "25%", "50%", "75%", "100%"];
  const ICE_LEVELS = ["0%", "25%", "50%", "75%", "100%"];
  const ORDER_STATUSES = ["Đã ghi nhận", "Đang xử lý", "Đang giao", "Hoàn tất", "Đã hủy", "Chờ thanh toán"];
  const PAYMENT_METHODS = ["Thanh toán khi nhận hàng", "Chuyển khoản"];
  const SHIPPING_METHODS = ["Giao hàng", "Uống tại quán"];
  const NOTES = [
    "", "", "", // Nhiều đơn không có ghi chú
    "Ít đá", "Nhiều đá", "Không đường", "Ít ngọt",
    "Thêm sữa", "Đá riêng", "Nóng", "Để ấm",
    "Không whipping cream", "Thêm shot espresso",
    "Uống liền không cần trang trí", "Gói riêng từng món"
  ];

  // ===================== HÀM TIỆN ÍCH =====================
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randPhone() {
    const prefixes = ["090", "091", "093", "094", "096", "097", "098", "070", "079", "077", "076", "078", "032", "033", "034", "035", "036", "037", "038", "039", "056", "058"];
    return randItem(prefixes) + String(randInt(1000000, 9999999));
  }

  function randDate(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return new Date(start + Math.random() * (end - start));
  }

  function generateOrderCode() {
    return "GIBOR-" + randInt(100000, 999999);
  }

  // ===================== SINH 30 USERS =====================
  function generateUsers() {
    const users = [];
    const usedEmails = new Set();

    // Đảm bảo không trùng email với admin và branch managers
    usedEmails.add("admin@giborcoffee.com");
    for (let i = 1; i <= 5; i++) {
      usedEmails.add(`ql-hcm${i}@giborcoffee.com`);
      usedEmails.add(`ql-hn${i}@giborcoffee.com`);
      usedEmails.add(`ql-dn${i}@giborcoffee.com`);
    }

    for (let i = 1; i <= 1000; i++) {
      const isFemale = Math.random() > 0.5;
      const lastName = randItem(LAST_NAMES);
      const middleName = isFemale ? randItem(["Thị", "Ngọc", "Phương", "Thu", "Thanh", "Kim"]) : randItem(["Văn", "Hữu", "Đức", "Minh", "Quốc", "Hoàng"]);
      const firstName = isFemale ? randItem(FIRST_NAMES_FEMALE) : randItem(FIRST_NAMES_MALE);
      const displayName = `${lastName} ${middleName} ${firstName}`;

      // Tạo email duy nhất
      let email;
      let attempt = 0;
      do {
        const emailBase = firstName.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d").replace(/Đ/g, "D");
        const domain = randItem(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]);
        email = `${emailBase}${randInt(10, 999)}@${domain}`;
        attempt++;
      } while (usedEmails.has(email.toLowerCase()) && attempt < 100);
      usedEmails.add(email.toLowerCase());

      // Đa dạng provider
      let provider, password, googleUid, githubUid, photoURL;
      const providerRand = Math.random();
      if (providerRand < 0.6) {
        // 60% đăng ký bằng email
        provider = "email";
        password = randItem(["abc123", "123456", "password1", "gibor2026", "coffee@123", "matkhau1", "cafeGIBOR", "hello123"]);
        googleUid = undefined;
        githubUid = undefined;
        photoURL = "";
      } else if (providerRand < 0.85) {
        // 25% đăng ký bằng Google
        provider = "google";
        password = "";
        googleUid = `google-uid-${Date.now()}-${i}`;
        githubUid = undefined;
        photoURL = `https://lh3.googleusercontent.com/a/default-user=${i}`;
      } else {
        // 15% đăng ký bằng GitHub
        provider = "github";
        password = "";
        googleUid = undefined;
        githubUid = `github-uid-${Date.now()}-${i}`;
        photoURL = `https://avatars.githubusercontent.com/u/${randInt(10000, 99999)}`;
      }

      // Đa dạng trạng thái: 90% active, 10% locked
      const status = Math.random() < 0.9 ? "active" : "locked";

      // Ngày tạo: từ 01/01/2026 đến 05/06/2026
      const createdAt = randDate("2026-01-01", "2026-06-05");

      const user = {
        id: Date.now() + i * 1000 + randInt(1, 999),
        username: email.split("@")[0],
        lastName: `${lastName} ${middleName}`,
        firstName: firstName,
        displayName: displayName,
        email: email,
        phone: randPhone(),
        password: password,
        role: "user",
        status: status,
        permissions: [],
        provider: provider,
        createdAt: createdAt.toISOString(),
      };

      if (googleUid) user.googleUid = googleUid;
      if (githubUid) user.githubUid = githubUid;
      if (photoURL) user.photoURL = photoURL;

      users.push(user);
    }

    return users;
  }

  // ===================== SINH 3000 ORDERS =====================
  function generateOrders(users) {
    const orders = [];
    const activeUsers = users.filter(u => u.status === "active");

    for (let i = 1; i <= 3000; i++) {
      const user = randItem(activeUsers);

      // Xác định phân khúc đơn hàng để bám sát thực tế (Đơn nhỏ, Đơn vừa, Đơn lớn, Đơn cực lớn)
      const segmentRand = Math.random();
      let numItems = 1;
      let maxQtyPerItem = 1;

      if (segmentRand < 0.55) {
        // 55% Đơn nhỏ (1 món, 1 ly: 25k - 45k)
        numItems = 1;
        maxQtyPerItem = 1;
      } else if (segmentRand < 0.85) {
        // 30% Đơn vừa (1-2 món, tổng 1-3 ly: 50k - 120k)
        numItems = randInt(1, 2);
        maxQtyPerItem = randInt(1, 2);
      } else if (segmentRand < 0.97) {
        // 12% Đơn lớn (2-4 món, tổng 3-8 ly: 150k - 350k)
        numItems = randInt(2, 4);
        maxQtyPerItem = randInt(1, 3);
      } else {
        // 3% Đơn cực lớn (Party/Nhóm đông: 4-6 món, tổng 8-15 ly: 400k - 1000k)
        numItems = randInt(4, 6);
        maxQtyPerItem = randInt(2, 4);
      }

      const items = [];
      const usedProducts = new Set();

      for (let j = 0; j < numItems; j++) {
        let product;
        let attempts = 0;
        do {
          product = randItem(PRODUCTS);
          attempts++;
        } while (usedProducts.has(product.id) && attempts < 20);
        usedProducts.add(product.id);

        const size = randItem(SIZES);
        let sizePrice = product.price;
        if (size === "M") sizePrice += 5000;
        if (size === "L") sizePrice += 10000;

        // 40% có topping (chỉ áp dụng cho đồ uống)
        const hasToppings = product.category !== "Bánh ngọt" && Math.random() < 0.4;
        const toppings = [];
        if (hasToppings) {
          const numToppings = randInt(1, 2);
          const shuffledToppings = [...TOPPINGS].sort(() => Math.random() - 0.5);
          for (let t = 0; t < numToppings; t++) {
            toppings.push(shuffledToppings[t]);
            sizePrice += shuffledToppings[t].price;
          }
        }

        const quantity = randInt(1, maxQtyPerItem);

        items.push({
          name: product.name,
          image: product.img,
          size: product.category === "Bánh ngọt" ? "Mặc định" : size,
          price: sizePrice,
          sugar: product.category === "Bánh ngọt" ? "Mặc định" : randItem(SUGAR_LEVELS),
          ice: product.category === "Bánh ngọt" ? "Mặc định" : randItem(ICE_LEVELS),
          toppings: product.category === "Bánh ngọt" ? [] : toppings,
          note: randItem(NOTES),
          comboItems: [],
          quantity: quantity,
        });
      }

      // Tính subtotal
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Phương thức giao hàng
      const shippingMethod = randItem(SHIPPING_METHODS);
      let shipping = 0;
      let branch = null;

      if (shippingMethod === "Uống tại quán") {
        // Chọn chi nhánh ngẫu nhiên
        branch = randItem(BRANCHES);
        shipping = 0;
      } else {
        // Giao hàng: phí 30k, miễn phí nếu >= 200k
        shipping = subtotal >= 200000 ? 0 : 30000;
      }

      // Mã giảm giá (30% đơn có mã giảm giá)
      let discount = 0;
      let couponCode = "";
      const hasCoupon = Math.random() < 0.3;
      if (hasCoupon) {
        const couponType = randInt(1, 3);
        if (couponType === 1) {
          couponCode = "GIBOR10";
          discount = Math.min(Math.floor(subtotal * 0.1), 50000);
        } else if (couponType === 2) {
          couponCode = "GIBOR20K";
          discount = 20000;
        } else {
          couponCode = "FREESHIP";
          shipping = 0;
        }
      }

      // Điểm tích lũy sử dụng (20% đơn dùng điểm)
      let pointsDiscount = 0;
      if (Math.random() < 0.2) {
        pointsDiscount = randInt(1, 50) * 100; // 100đ - 5000đ
        if (pointsDiscount > subtotal) pointsDiscount = 0;
      }

      const total = Math.max(0, subtotal + shipping - discount - pointsDiscount);

      // Phương thức thanh toán
      const payment = randItem(PAYMENT_METHODS);

      // Trạng thái đơn hàng - đảm bảo đa dạng đủ các loại theo tỷ lệ phần trăm
      let status;
      const statusRand = Math.random();
      if (statusRand < 0.65) status = "Hoàn tất";        // 65% đơn hoàn tất (để doanh thu cao và thực tế)
      else if (statusRand < 0.75) status = "Đang xử lý"; // 10% đơn đang xử lý
      else if (statusRand < 0.82) status = "Đang giao";  // 7% đơn đang giao
      else if (statusRand < 0.90) status = "Đã ghi nhận"; // 8% đơn đã ghi nhận
      else if (statusRand < 0.95) status = "Đã hủy";     // 5% đơn đã hủy
      else status = "Chờ thanh toán";            // 5% đơn chờ thanh toán

      // Trạng thái thanh toán dựa trên trạng thái đơn
      let paymentStatus;
      if (status === "Hoàn tất") {
        paymentStatus = "Đã thanh toán";
      } else if (status === "Đã hủy") {
        paymentStatus = "Đã hủy";
      } else if (status === "Chờ thanh toán") {
        paymentStatus = "Chưa thanh toán";
      } else if (payment === "Chuyển khoản" && Math.random() < 0.7) {
        paymentStatus = "Đã thanh toán";
      } else {
        paymentStatus = "Chưa thanh toán";
      }

      // Thông tin khách hàng
      let customerAddress;
      const branchCityCode = branch ? branch.id.substring(0, 2) : "";
      if (shippingMethod === "Giao hàng") {
        customerAddress = randItem([...STREETS_HCM, ...STREETS_HN, ...STREETS_DN]);
      } else {
        customerAddress = branch ? branch.address : "";
      }

      // Ngày đặt: trải đều từ 01/01/2026 đến 05/06/2026
      const createdAt = randDate("2026-01-01", "2026-06-05");

      const order = {
        code: generateOrderCode(),
        userId: user.id,
        userName: user.displayName,
        items: items,
        customer: {
          name: user.displayName,
          phone: user.phone,
          email: user.email,
          address: customerAddress,
        },
        branch: branch ? { id: branch.id, name: branch.name, address: branch.address } : null,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        pointsDiscount: pointsDiscount,
        total: total,
        payment: payment,
        paymentStatus: paymentStatus,
        shippingMethod: shippingMethod,
        couponCode: couponCode,
        status: status,
        createdAt: createdAt.toISOString(),
      };

      orders.push(order);
    }

    // Sắp xếp theo ngày tạo
    orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return orders;
  }

  // ===================== SINH ĐIỂM TÍCH LŨY =====================
  function generatePoints(users, orders) {
    const pointsMap = {};

    // Tính điểm từ đơn hàng hoàn tất
    orders.forEach(order => {
      if (order.status === "Hoàn tất") {
        const earned = Math.floor(order.total / 1000);
        if (!pointsMap[order.userId]) pointsMap[order.userId] = 0;
        pointsMap[order.userId] += earned;
      }
    });

    // Thêm điểm ngẫu nhiên cho các user chưa có đơn hoàn tất (mô phỏng tích điểm từ trước)
    users.forEach(user => {
      if (!pointsMap[user.id] && Math.random() < 0.5) {
        pointsMap[user.id] = randInt(0, 500);
      }
    });

    return pointsMap;
  }

  // ===================== HÀM CHÍNH: SEED DỮ LIỆU =====================
  function seedAllData() {
    console.log("🌱 Bắt đầu sinh dữ liệu mẫu cho GIBOR Coffee Shop...");

    // 1. Lấy dữ liệu hiện tại
    let existingUsers = [];
    let existingOrders = [];
    let existingPoints = {};

    try {
      existingUsers = JSON.parse(localStorage.getItem("gibor_users") || "[]");
      if (!Array.isArray(existingUsers)) existingUsers = [];
    } catch (e) {
      existingUsers = [];
    }

    try {
      existingOrders = JSON.parse(localStorage.getItem("gibor_orders") || "[]");
      if (!Array.isArray(existingOrders)) existingOrders = [];
    } catch (e) {
      existingOrders = [];
    }

    try {
      existingPoints = JSON.parse(localStorage.getItem("gibor_points") || "{}");
    } catch (e) {
      existingPoints = {};
    }

    // 2. Sinh dữ liệu mới
    const newUsers = generateUsers();
    const newOrders = generateOrders(newUsers);
    const newPoints = generatePoints(newUsers, newOrders);

    // 3. Gộp dữ liệu (giữ nguyên dữ liệu cũ)
    const allUsers = [...existingUsers.filter(u => u !== null && u !== undefined), ...newUsers];
    const allOrders = [...existingOrders.filter(o => o !== null && o !== undefined), ...newOrders];
    const allPoints = { ...existingPoints, ...newPoints };

    // 4. Lưu vào localStorage
    localStorage.setItem("gibor_users", JSON.stringify(allUsers));
    localStorage.setItem("gibor_orders", JSON.stringify(allOrders));
    localStorage.setItem("gibor_points", JSON.stringify(allPoints));

    // 5. Thống kê
    console.log("✅ Đã sinh dữ liệu mẫu thành công!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Users mới:     ${newUsers.length} (Tổng: ${allUsers.length})`);
    console.log(`   ├─ Email:      ${newUsers.filter(u => u.provider === "email").length}`);
    console.log(`   ├─ Google:     ${newUsers.filter(u => u.provider === "google").length}`);
    console.log(`   ├─ GitHub:     ${newUsers.filter(u => u.provider === "github").length}`);
    console.log(`   ├─ Active:     ${newUsers.filter(u => u.status === "active").length}`);
    console.log(`   └─ Locked:     ${newUsers.filter(u => u.status === "locked").length}`);
    console.log(`📦 Orders mới:    ${newOrders.length} (Tổng: ${allOrders.length})`);
    console.log(`   ├─ Hoàn tất:       ${newOrders.filter(o => o.status === "Hoàn tất").length}`);
    console.log(`   ├─ Đang xử lý:     ${newOrders.filter(o => o.status === "Đang xử lý").length}`);
    console.log(`   ├─ Đang giao:      ${newOrders.filter(o => o.status === "Đang giao").length}`);
    console.log(`   ├─ Đã ghi nhận:    ${newOrders.filter(o => o.status === "Đã ghi nhận").length}`);
    console.log(`   ├─ Đã hủy:         ${newOrders.filter(o => o.status === "Đã hủy").length}`);
    console.log(`   ├─ Chờ thanh toán: ${newOrders.filter(o => o.status === "Chờ thanh toán").length}`);
    console.log(`   ├─ COD:            ${newOrders.filter(o => o.payment === "Thanh toán khi nhận hàng").length}`);
    console.log(`   ├─ Banking:        ${newOrders.filter(o => o.payment === "Chuyển khoản").length}`);
    console.log(`   ├─ Giao hàng:      ${newOrders.filter(o => o.shippingMethod === "Giao hàng").length}`);
    console.log(`   └─ Tại quán:       ${newOrders.filter(o => o.shippingMethod === "Uống tại quán").length}`);
    console.log(`⭐ Points:        ${Object.keys(newPoints).length} users có điểm`);

    const totalRevenue = newOrders
      .filter(o => o.status === "Hoàn tất")
      .reduce((sum, o) => sum + o.total, 0);
    console.log(`💰 Doanh thu (Hoàn tất): ${totalRevenue.toLocaleString("vi-VN")}đ`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 Reload trang (F5) để xem dữ liệu trong hệ thống admin.");

    return {
      users: newUsers,
      orders: newOrders,
      points: newPoints,
      summary: {
        totalUsers: allUsers.length,
        totalOrders: allOrders.length,
        newUsers: newUsers.length,
        newOrders: newOrders.length,
      }
    };
  }

  // ===================== HÀM XÓA DỮ LIỆU SEED =====================
  function clearSeedData() {
    console.log("🗑️ Đang xóa dữ liệu seed...");

    // Giữ lại admin và branch managers
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem("gibor_users") || "[]");
      if (!Array.isArray(users)) users = [];
    } catch (e) {
      users = [];
    }

    const protectedUsers = users.filter(u => {
      if (!u) return false;
      return (
        String(u.id) === "admin-001" ||
        String(u.id).startsWith("branch-manager-") ||
        String(u.role) === "admin" ||
        String(u.role) === "branch_manager"
      );
    });

    localStorage.setItem("gibor_users", JSON.stringify(protectedUsers));
    localStorage.setItem("gibor_orders", JSON.stringify([]));
    localStorage.setItem("gibor_points", JSON.stringify({}));

    console.log(`✅ Đã xóa dữ liệu seed! Giữ lại ${protectedUsers.length} tài khoản hệ thống.`);
    console.log("💡 Reload trang (F5) để áp dụng.");
  }

  // ===================== EXPORT GLOBAL =====================
  window.seedAllData = seedAllData;
  window.clearSeedData = clearSeedData;

  // ===================== TỰ ĐỘNG CHẠY =====================
  // Kiểm tra nếu chưa có dữ liệu seed thì tự động sinh
  document.addEventListener("DOMContentLoaded", function () {
    try {
      const users = JSON.parse(localStorage.getItem("gibor_users") || "[]");
      const regularUsers = (Array.isArray(users) ? users : []).filter(u => {
        if (!u) return false;
        return u.role !== "admin" && u.role !== "branch_manager";
      });

      // Tự động seed lại nếu phát hiện chỉ có dữ liệu mẫu cũ (dưới 100 users)
      if (regularUsers.length < 100) {
        console.log("📋 Phát hiện dữ liệu mẫu cũ hoặc trống. Tự động dọn dẹp và sinh 1000 khách hàng & 3000 đơn hàng...");
        clearSeedData();
        seedAllData();
      } else {
        console.log(`📋 Đã có ${regularUsers.length} user thực tế. Bỏ qua auto-seed.`);
        console.log("💡 Gọi seedAllData() trong Console để thêm dữ liệu mới.");
        console.log("💡 Gọi clearSeedData() để xóa dữ liệu và seed lại.");
      }
    } catch (e) {
      console.error("Lỗi kiểm tra dữ liệu:", e);
    }
  });
})();
