/* 
========================================================================================

                                    CODE BỞI TRẦN GIA BẢO

========================================================================================
*/

// GỬI CONTACT
const contactForm = document.getElementById("contactForm");
const modal = document.getElementById("myModal");
const closeBtn = document.querySelector(".closeBtn");

if (contactForm) {
  // submit callback: Kiểm tra tính hợp lệ của biểu mẫu, giả lập gửi dữ liệu trong 1.5 giây, tạo và tải xuống file JSON chứa thông tin liên hệ, sau đó hiển thị modal thông báo thành công.
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. KIỂM TRA HỢP LỆ
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const btn = contactForm.querySelector(".btn-send");
    const originalText = btn.innerText;

    // 2. LẤY DỮ LIỆU FORM
    const formData = new FormData(contactForm);

    const contactData = {
      hoTen: formData.get("fullname") || "",
      email: formData.get("email") || "",
      soDienThoai: formData.get("phone") || "",
      boPhan: formData.get("department") || "Customer Support",
      loiNhan: formData.get("message") || "",
      thoiGianGui: new Date().toLocaleString("vi-VN"),
    };

    // 3. HIỆU ỨNG ĐANG GỬI
    btn.innerText = "Đang gửi...";
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";

    // 4. GỬI DỮ LIỆU QUA FORMSPREE
    fetch("https://formspree.io/f/mkolwbbk", {
      method: "POST",
      body: JSON.stringify({
        name: contactData.hoTen,
        email: contactData.email,
        phone: contactData.soDienThoai,
        department: contactData.boPhan,
        message: contactData.loiNhan
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // 5. LƯU VÀO LOCALSTORAGE
        const messages = JSON.parse(localStorage.getItem("gibor_contact_messages") || "[]");
        messages.push(contactData);
        localStorage.setItem("gibor_contact_messages", JSON.stringify(messages));

        // 6. HIỂN THỊ POPUP THÔNG BÁO
        if (typeof showGiborPopup === "function") {
          showGiborPopup({
            type: "success",
            title: "Gửi thành công!",
            message: "Cảm ơn bạn đã gửi lời nhắn. GIBOR COFFEE sẽ phản hồi bạn trong thời gian sớm nhất!",
            confirmText: "Đồng ý"
          });
        } else if (modal) {
          modal.style.display = "block";
        }

        // 8. RESET FORM
        contactForm.reset();
      } else {
        throw new Error("Form submission failed");
      }
    })
    .catch(error => {
      console.error(error);
      if (typeof showGiborPopup === "function") {
        showGiborPopup({
          type: "error",
          title: "Gửi thất bại",
          message: "Đã xảy ra lỗi trong quá trình gửi lời nhắn. Vui lòng thử lại sau.",
          confirmText: "Đóng"
        });
      } else {
        alert("Đã xảy ra lỗi trong quá trình gửi lời nhắn. Vui lòng thử lại sau.");
      }
    })
    .finally(() => {
      // 7. KHÔI PHỤC NÚT
      btn.innerText = originalText;
      btn.style.opacity = "1";
      btn.style.pointerEvents = "all";
    });
  });
}

// ĐÓNG MODAL
if (closeBtn && modal) {
  // closeBtn.onclick: Ẩn modal thông báo thành công khi người dùng click vào nút đóng.
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

// window.onclick: Ẩn modal thông báo thành công khi người dùng click ra vùng bên ngoài của modal.
window.onclick = (event) => {
  if (modal && event.target === modal) {
    modal.style.display = "none";
  }
};

/* 
========================================================================================

                                KẾT THÚC CODE BỞI TRẦN GIA BẢO

========================================================================================
*/
