/* 
========================================================================================

                                   CODE BỞI TRẦN DƯƠNG GIA BẢO

========================================================================================
*/
const crypto = require('crypto');

module.exports = async (req, res) => {
  // Thiết lập các CORS Headers cho phép client-side từ mọi Origin gửi request đến API này
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Xử lý các request tiền kiểm (Preflight Request - OPTIONS) từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ràng buộc phương thức gửi yêu cầu bắt buộc phải là POST
  if (req.method !== 'POST') {
    return res.status(405).json({ code: "45", message: "Method Not Allowed" });
  }

  try {
    // Phân rã (destructuring) các thông tin giao dịch được gửi lên từ Client
    const { amount, description, orderCode, returnUrl, cancelUrl, items } = req.body;

    // Xác thực đầu vào: Yêu cầu các tham số bắt buộc không được để trống
    if (!amount || !description || !orderCode || !returnUrl || !cancelUrl) {
      return res.status(400).json({
        code: "400",
        message: "Thiếu thông tin bắt buộc để tạo thanh toán (amount, description, orderCode, returnUrl, cancelUrl)."
      });
    }

    // Lấy thông tin tài khoản Merchant payOS từ biến môi trường (Environment Variables) cấu hình trên Vercel
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    // Kiểm tra xem máy chủ đã được thiết lập đầy đủ API Keys chưa
    if (!clientId || !apiKey || !checksumKey) {
      return res.status(500).json({
        code: "500",
        message: "Chưa cấu hình biến môi trường PAYOS trên Vercel."
      });
    }

    // 1. Sắp xếp các tham số và tạo mã chữ ký bảo mật (signature):
    // Theo tài liệu kỹ thuật của payOS, các tham số bắt buộc phải được sắp xếp theo thứ tự bảng chữ cái alphabet
    // và ghép nối dạng query string để làm căn cứ sinh HMAC-SHA256
    const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    
    // Sử dụng module 'crypto' có sẵn của Node.js để tính toán chữ ký bảo mật
    const signature = crypto
      .createHmac('sha256', checksumKey) // Khởi tạo thuật toán HMAC-SHA256 với checksumKey của cửa hàng
      .update(rawData) // Đưa dữ liệu thô vào
      .digest('hex'); // Xuất kết quả dạng chuỗi thập lục phân (hex)

    // 2. Gửi yêu cầu HTTP POST trực tiếp đến API Endpoint của cổng thanh toán payOS:
    // Thao tác này chạy ở backend, giúp tránh hoàn toàn các lỗi về chính sách chia sẻ tài nguyên (CORS) trên trình duyệt
    const payosResponse = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId, // Header định danh client
        "x-api-key": apiKey // Header khóa API merchant
      },
      body: JSON.stringify({
        orderCode: Number(orderCode), // Mã đơn hàng phải ở dạng số
        amount: Number(amount), // Số tiền giao dịch phải ở dạng số
        description,
        cancelUrl,
        returnUrl,
        signature, // Mã chữ ký vừa tính toán để payOS xác thực dữ liệu không bị thay đổi dọc đường
        items: items || [] // Danh sách chi tiết các món hàng (tùy chọn)
      })
    });

    // Nhận kết quả phản hồi từ cổng payOS và trả về cho Client-side
    const result = await payosResponse.json();
    return res.status(payosResponse.status).json(result);
  } catch (error) {
    // Xử lý các ngoại lệ khi kết nối hoặc lỗi cú pháp
    console.error("Lỗi xử lý tạo thanh toán payOS:", error);
    return res.status(500).json({ code: "99", message: error.message });
  }
};
