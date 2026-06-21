/* 
========================================================================================

                                   CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
module.exports = async (req, res) => {
  // Thiết lập các CORS Headers cho phép client từ mọi Origin gọi API lấy trạng thái
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Xử lý request tiền kiểm OPTIONS từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ràng buộc phương thức yêu cầu bắt buộc phải là GET
  if (req.method !== 'GET') {
    return res.status(405).json({ code: "45", message: "Method Not Allowed" });
  }

  try {
    // Trích xuất mã đơn hàng (orderCode) từ Query String trên URL (?orderCode=...)
    const { orderCode } = req.query;
    
    // Yêu cầu mã đơn hàng không được để trống
    if (!orderCode) {
      return res.status(400).json({ code: "400", message: "Missing orderCode" });
    }

    // Lấy thông tin tài khoản Merchant payOS từ biến môi trường cấu hình trên Vercel
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;

    // Kiểm tra xem máy chủ đã được thiết lập đầy đủ API Keys chưa
    if (!clientId || !apiKey) {
      return res.status(500).json({
        code: "500",
        message: "Chưa cấu hình biến môi trường PAYOS trên Vercel."
      });
    }

    // Gửi yêu cầu HTTP GET trực tiếp đến cổng API của payOS để truy vấn chi tiết giao dịch
    // Endpoint: https://api-merchant.payos.vn/v2/payment-requests/{orderCode}
    const payosResponse = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${encodeURIComponent(orderCode)}`, {
      method: "GET",
      headers: {
        "x-client-id": clientId, // Header định danh client
        "x-api-key": apiKey // Header khóa API merchant
      }
    });

    // Nhận kết quả trạng thái từ payOS và trả về cho Client-side hiển thị
    const result = await payosResponse.json();
    return res.status(payosResponse.status).json(result);
  } catch (error) {
    // Xử lý các ngoại lệ khi xảy ra lỗi kết nối
    console.error("Lỗi lấy trạng thái thanh toán payOS:", error);
    return res.status(500).json({ code: "99", message: error.message });
  }
};
