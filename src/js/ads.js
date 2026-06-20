/* 
========================================================================================

                                    CODE BỞI TRẦN GIA BẢO

========================================================================================
*/
const popup = document.getElementById("promoPopup");
const closeBtn = document.getElementById("closePopup");

// Chỉ khởi tạo popup khi trang hiện tại có markup quảng cáo.
if (popup && closeBtn) {
  // onload: Kiểm tra và hiển thị popup quảng cáo sau 1 giây nếu chưa được hiển thị trong phiên làm việc hiện tại.
  window.onload = function () {
    // Kiểm tra xem khách đã xem popup trong phiên này chưa
    if (!sessionStorage.getItem("popupShown")) {
      setTimeout(() => {
        popup.classList.add("show");
      }, 1000);
    }
  };

  // closePopupHandler: Thực hiện đóng popup quảng cáo, xóa class 'show' và ẩn phần tử sau hiệu ứng mờ 400ms.
  function closePopupHandler() {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 400);
  }

  closeBtn.onclick = closePopupHandler;

  // onclick: Đóng popup quảng cáo khi người dùng click vào vùng trống bên ngoài nội dung popup.
  window.onclick = function (event) {
    if (event.target == popup) {
      closePopupHandler();
    }
  };
}

// DOMContentLoaded callback: Ghi log xác nhận trang khuyến mãi đã tải xong cấu trúc DOM.
document.addEventListener("DOMContentLoaded", () => {
  console.log("Trang khuyến mãi đã sẵn sàng!");
  // Bạn có thể thêm các chức năng cho trang ads tại đây
});
