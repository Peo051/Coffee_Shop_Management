/* 
========================================================================================

                                    CODE BỞI TRẦN GIA BẢO

========================================================================================
*/
// Reveal timeline cards on scroll
const observerOptions = { threshold: 0.25 };
// callback trong IntersectionObserver: Tự động thêm class 'active' cho các phần tử timeline khi chúng hiển thị tối thiểu 25% trên màn hình.
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, observerOptions);

document
  .querySelectorAll(".about-timeline-item")
  .forEach((item) => observer.observe(item));

/* 
========================================================================================

                                KẾT THÚC CODE BỞI TRẦN GIA BẢO

========================================================================================
*/
