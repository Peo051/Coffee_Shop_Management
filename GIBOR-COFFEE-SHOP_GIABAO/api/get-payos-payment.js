/**
 * GIBOR Coffee - API Serverless Lấy Trạng Thái Đơn Hàng payOS
 * Tác giả: Trần Dương Gia Bảo
 * 
 * Mô tả: API nhận mã đơn hàng orderCode từ client dưới dạng Query string, gửi yêu cầu kiểm tra trạng thái
 * thanh toán của giao dịch trực tiếp tới cổng payOS Merchant API bằng x-client-id và x-api-key được bảo mật ở backend.
 * 
 * Đầu vào (GET Query): orderCode
 * Đầu ra (JSON): Trạng thái thanh toán của đơn hàng (PAID, CANCELLED, PENDING,...) và các thông tin liên quan.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ code: "45", message: "Method Not Allowed" });
  }

  try {
    const { orderCode } = req.query;
    if (!orderCode) {
      return res.status(400).json({ code: "400", message: "Missing orderCode" });
    }

    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;

    if (!clientId || !apiKey) {
      return res.status(500).json({
        code: "500",
        message: "Chưa cấu hình biến môi trường PAYOS trên Vercel."
      });
    }

    const payosResponse = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${encodeURIComponent(orderCode)}`, {
      method: "GET",
      headers: {
        "x-client-id": clientId,
        "x-api-key": apiKey
      }
    });

    const result = await payosResponse.json();
    return res.status(payosResponse.status).json(result);
  } catch (error) {
    console.error("Lỗi lấy trạng thái thanh toán payOS:", error);
    return res.status(500).json({ code: "99", message: error.message });
  }
};
