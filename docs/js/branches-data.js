/* 
========================================================================================

                                    CODE BỞI NGUYỄN THẾ ANH

========================================================================================
*/

(function () {
  "use strict";

  // Danh sách gốc 15 chi nhánh với tọa độ GPS thực tế.
  const BRANCH_BASE_LIST = [
    {
      id: "hcm1",
      cityCode: "hcm",
      cityName: "TP. Hồ Chí Minh",
      district: "Tân Phú",
      name: "GIBOR Lê Trọng Tấn",
      address: "140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP. Hồ Chí Minh",
      image: "images/Branch/TPHCM2.jpg",
      lat: 10.812239,
      lng: 106.627685
    },
    {
      id: "hcm2",
      cityCode: "hcm",
      cityName: "TP. Hồ Chí Minh",
      district: "Quận 1",
      name: "GIBOR Nguyễn Huệ",
      address: "263 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      image: "images/Branch/TPHCM1.jpg",
      lat: 10.774163,
      lng: 106.703774
    },
    {
      id: "hcm3",
      cityCode: "hcm",
      cityName: "TP. Hồ Chí Minh",
      district: "Quận 3",
      name: "GIBOR Võ Văn Tần",
      address: "123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh",
      image: "images/Branch/TPHCM3.jpg",
      lat: 10.777937,
      lng: 106.690827
    },
    {
      id: "hcm4",
      cityCode: "hcm",
      cityName: "TP. Hồ Chí Minh",
      district: "TP. Thủ Đức",
      name: "GIBOR Xa lộ Hà Nội",
      address: "77 Xa lộ Hà Nội, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
      image: "images/Branch/TPHCM4.jpg",
      lat: 10.803738,
      lng: 106.732381
    },
    {
      id: "hcm5",
      cityCode: "hcm",
      cityName: "TP. Hồ Chí Minh",
      district: "Bình Thạnh",
      name: "GIBOR Điện Biên Phủ",
      address: "23 Điện Biên Phủ, Phường 15, Bình Thạnh, TP. Hồ Chí Minh",
      image: "images/Branch/TPHCM5.jpg",
      lat: 10.800312,
      lng: 106.708892
    },
    {
      id: "hn1",
      cityCode: "hn",
      cityName: "Hà Nội",
      district: "Cầu Giấy",
      name: "GIBOR Trần Duy Hưng",
      address: "81 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội",
      image: "images/Branch/HANOI1.jpg",
      lat: 21.010415,
      lng: 105.800109
    },
    {
      id: "hn2",
      cityCode: "hn",
      cityName: "Hà Nội",
      district: "Đống Đa",
      name: "GIBOR Láng Hạ",
      address: "66 Láng Hạ, Láng Hạ, Đống Đa, Hà Nội",
      image: "images/Branch/HANOI2.jpg",
      lat: 21.015705,
      lng: 105.814529
    },
    {
      id: "hn3",
      cityCode: "hn",
      cityName: "Hà Nội",
      district: "Hai Bà Trưng",
      name: "GIBOR Bạch Mai",
      address: "115 Bạch Mai, Bạch Mai, Hai Bà Trưng, Hà Nội",
      image: "images/Branch/HANOI3.jpg",
      lat: 20.999676,
      lng: 105.849646
    },
    {
      id: "hn4",
      cityCode: "hn",
      cityName: "Hà Nội",
      district: "Ba Đình",
      name: "GIBOR Hoàng Hoa Thám",
      address: "632 Hoàng Hoa Thám, Vĩnh Phúc, Ba Đình, Hà Nội",
      image: "images/Branch/HANOI4.jpg",
      lat: 21.041678,
      lng: 105.808298
    },
    {
      id: "hn5",
      cityCode: "hn",
      cityName: "Hà Nội",
      district: "Long Biên",
      name: "GIBOR Nguyễn Văn Cừ",
      address: "334 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội",
      image: "images/Branch/HANOI5.jpg",
      lat: 21.048592,
      lng: 105.877864
    },
    {
      id: "dn1",
      cityCode: "dn",
      cityName: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      name: "GIBOR Võ Nguyên Giáp",
      address: "567 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
      image: "images/Branch/DANANG2.jpg",
      lat: 16.052601,
      lng: 108.245842
    },
    {
      id: "dn2",
      cityCode: "dn",
      cityName: "Đà Nẵng",
      district: "Hải Châu",
      name: "GIBOR Bạch Đằng",
      address: "453 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng",
      image: "images/Branch/DANANG1.jpg",
      lat: 16.074321,
      lng: 108.223847
    },
    {
      id: "dn3",
      cityCode: "dn",
      cityName: "Đà Nẵng",
      district: "Hải Châu",
      name: "GIBOR Nguyễn Văn Linh",
      address: "638 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng",
      image: "images/Branch/DANANG3.jpg",
      lat: 16.059495,
      lng: 108.213264
    },
    {
      id: "dn4",
      cityCode: "dn",
      cityName: "Đà Nẵng",
      district: "Liên Chiểu",
      name: "GIBOR Tôn Đức Thắng",
      address: "53 Tôn Đức Thắng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng",
      image: "images/Branch/DANANG4.jpg",
      lat: 16.071537,
      lng: 108.156475
    },
    {
      id: "dn5",
      cityCode: "dn",
      cityName: "Đà Nẵng",
      district: "Cẩm Lệ",
      name: "GIBOR Cách Mạng Tháng Tám",
      address: "55 Cách Mạng Tháng Tám, Khuê Trung, Cẩm Lệ, Đà Nẵng",
      image: "images/Branch/DANANG5.jpg",
      lat: 16.022986,
      lng: 108.209356
    },
  ];

  const BRANCH_IMAGE_BY_CITY = {
    hcm: "images/banner/hero-bg.jpg",
    hn: "images/about/about1.jpg",
    dn: "images/about/about2.jpg",
  };

  const BRANCH_CONTACT_BY_CITY = {
    hcm: { phone: "0909 999 999", email: "hcm@giborcoffee.com" },
    hn: { phone: "024 3999 0999", email: "hanoi@giborcoffee.com" },
    dn: { phone: "0236 3888 999", email: "danang@giborcoffee.com" },
  };

  function createDescriptions(branch) {
    const shortDescription =
      "Không gian ấm cúng tại " +
      branch.district +
      ", phù hợp làm việc nhanh, gặp gỡ bạn bè và thư giãn cuối ngày.";

    const fullDescription =
      branch.name +
      " là điểm dừng chân quen thuộc của khách hàng tại khu vực " +
      branch.district +
      ". Chi nhánh được thiết kế theo tinh thần tối giản, ấm áp, tập trung vào trải nghiệm cà phê sạch, phục vụ nhanh và thân thiện. Đây là nơi phù hợp để làm việc cá nhân, gặp đối tác hoặc tận hưởng khoảng nghỉ nhẹ nhàng giữa nhịp sống đô thị.";

    return { shortDescription, fullDescription };
  }

  function createMapEmbedUrl(address) {
    return (
      "https://www.google.com/maps?q=" +
      encodeURIComponent(address) +
      "&output=embed"
    );
  }

  function normalizeText(text) {
    return (text || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function getStoredBranches() {
    try {
      const stored = localStorage.getItem("gibor_branches");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // KIỂM TRA PHIÊN BẢN CŨ: Nếu các phần tử chưa có trường 'lat', ta cần reset lại từ file JS mới
          const hasLat = parsed.some(b => typeof b.lat !== "undefined");
          if (hasLat) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("Lỗi đọc branches từ localStorage:", e);
    }

    // Khởi sinh dữ liệu ban đầu từ danh sách mới có toạ độ GPS
    const initialBranches = BRANCH_BASE_LIST.map((branch, index) => {
      const contact = BRANCH_CONTACT_BY_CITY[branch.cityCode] || {};
      const descriptions = createDescriptions(branch);
      return {
        ...branch,
        order: index + 1,
        image: branch.image || BRANCH_IMAGE_BY_CITY[branch.cityCode] || "images/logo/logo.jpg",
        shortDescription: descriptions.shortDescription,
        fullDescription: descriptions.fullDescription,
        contactPhone: contact.phone || "",
        contactEmail: contact.email || "",
        mapEmbedUrl: createMapEmbedUrl(branch.address),
      };
    });
    localStorage.setItem("gibor_branches", JSON.stringify(initialBranches));
    return initialBranches;
  }

  function cloneBranch(branch) {
    return branch ? { ...branch } : null;
  }

  // Khởi tạo biến toàn cục để đồng bộ tương thích ngược
  window.GIBOR_BRANCHES = getStoredBranches().map(cloneBranch);

  window.GIBOR_BRANCH_UTILS = {
    all() {
      return getStoredBranches().map(cloneBranch);
    },
    getByCity(cityCode) {
      const list = getStoredBranches();
      return list.filter(b => b.cityCode === cityCode).map(cloneBranch);
    },
    getById(branchId) {
      const list = getStoredBranches();
      const branch = list.find(b => b.id === branchId);
      return cloneBranch(branch);
    },
    search(keyword, cityCode) {
      const normalizedKeyword = normalizeText(keyword);
      const list = getStoredBranches();
      const filteredList = cityCode && cityCode !== "all"
        ? list.filter(b => b.cityCode === cityCode)
        : list;

      if (!normalizedKeyword) return filteredList.map(cloneBranch);

      return filteredList
        .filter((branch) => {
          const haystack = normalizeText(
            [
              branch.name,
              branch.address,
              branch.cityName,
              branch.district,
              branch.shortDescription,
            ].join(" "),
          );
          return haystack.includes(normalizedKeyword);
        })
        .map(cloneBranch);
    },
    save(branches) {
      const cleanList = (branches || []).filter(Boolean);
      localStorage.setItem("gibor_branches", JSON.stringify(cleanList));
      window.GIBOR_BRANCHES = cleanList.map(cloneBranch);
    },
    add(branch) {
      const list = getStoredBranches();
      const id = branch.id || `br-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const descriptions = createDescriptions(branch);
      const cityNameMap = {
        hcm: "TP. Hồ Chí Minh",
        hn: "Hà Nội",
        dn: "Đà Nẵng"
      };

      const newBranch = {
        id: id,
        cityCode: branch.cityCode || "hcm",
        cityName: cityNameMap[branch.cityCode] || branch.cityName || "TP. Hồ Chí Minh",
        district: branch.district || "",
        name: branch.name || "Chi nhánh mới",
        address: branch.address || "",
        image: branch.image || "images/logo/logo.jpg",
        shortDescription: branch.shortDescription || descriptions.shortDescription,
        fullDescription: branch.fullDescription || descriptions.fullDescription,
        contactPhone: branch.contactPhone || "",
        contactEmail: branch.contactEmail || "",
        mapEmbedUrl: branch.mapEmbedUrl || createMapEmbedUrl(branch.address || ""),
        order: list.length + 1
      };

      list.push(newBranch);
      this.save(list);
      return newBranch;
    },
    update(branchId, updatedBranch) {
      const list = getStoredBranches();
      const index = list.findIndex(b => b.id === branchId);
      if (index === -1) return false;

      const current = list[index];
      const cityNameMap = {
        hcm: "TP. Hồ Chí Minh",
        hn: "Hà Nội",
        dn: "Đà Nẵng"
      };
      
      const newCityCode = updatedBranch.cityCode || current.cityCode;
      
      list[index] = {
        ...current,
        ...updatedBranch,
        cityCode: newCityCode,
        cityName: cityNameMap[newCityCode] || updatedBranch.cityName || current.cityName,
        mapEmbedUrl: updatedBranch.mapEmbedUrl || (updatedBranch.address ? createMapEmbedUrl(updatedBranch.address) : current.mapEmbedUrl)
      };

      this.save(list);
      return true;
    },
    delete(branchId) {
      const list = getStoredBranches();
      const filtered = list.filter(b => b.id !== branchId);
      if (filtered.length === list.length) return false;
      
      // Cập nhật lại số thứ tự (order)
      filtered.forEach((b, idx) => {
        b.order = idx + 1;
      });

      this.save(filtered);
      return true;
    }
  };
})();
/* 
========================================================================================

                                    KẾT THÚC CODE BỞI NGUYỄN THẾ ANH

========================================================================================
*/