const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ code: "45", message: "Method Not Allowed" });
  }

  try {
    const { amount, description, orderCode, returnUrl, cancelUrl, items } = req.body;

    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!clientId || !apiKey || !checksumKey) {
      return res.status(500).json({
        code: "500",
        message: "Chưa cấu hình biến môi trường PAYOS trên Vercel."
      });
    }

    // 1. Sắp xếp các tham số và tạo signature
    const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const signature = crypto
      .createHmac('sha256', checksumKey)
      .update(rawData)
      .digest('hex');

    // 2. Gửi request trực tiếp đến payOS từ backend (không có lỗi CORS)
    const payosResponse = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        orderCode: Number(orderCode),
        amount: Number(amount),
        description,
        cancelUrl,
        returnUrl,
        signature,
        items: items || []
      })
    });

    const result = await payosResponse.json();
    return res.status(payosResponse.status).json(result);
  } catch (error) {
    console.error("Lỗi xử lý tạo thanh toán payOS:", error);
    return res.status(500).json({ code: "99", message: error.message });
  }
};
