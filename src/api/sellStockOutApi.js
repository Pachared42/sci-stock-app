import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function sellStockOut(token, stockOutData) {
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.post(`${API_URL}/api/sell-local`, stockOutData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ ขายสินค้าไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ขายสินค้าไม่สำเร็จ");
  }
}

export async function getProductByBarcode(token, barcode) {
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.get(`${API_URL}/api/product/${barcode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.product_name) throw new Error("ข้อมูลสินค้าไม่สมบูรณ์");
    return res.data;
  } catch (err) {
    console.error("❌ ดึงสินค้าไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ไม่พบสินค้า");
  }
}

export async function getDailyPayments(token) {
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.get(`${API_URL}/api/daily-payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ ดึงรายการจ่ายรายวันไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ไม่สามารถดึงรายการได้");
  }
}

export async function createDailyPayment(token, paymentData) {
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.post(`${API_URL}/api/daily-payments`, paymentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ สร้างรายการจ่ายรายวันไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ไม่สามารถสร้างรายการได้");
  }
}

export async function deleteDailyPayment(token, id) {
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.delete(`${API_URL}/api/daily-payments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ ลบรายการจ่ายรายวันไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ไม่สามารถลบรายการได้");
  }
}


