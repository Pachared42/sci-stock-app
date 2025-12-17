import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function sellStockOut(token, stockOutData) {

  try {
    const res = await axios.post(`${API_URL}/api/sell-local`, stockOutData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("ตัดสต๊อกสินค้าไม่สำเร็จ:", error);
    throw error;
  }
}

export async function getProductByBarcode(token, barcode) {
  try {
    const res = await axios.get(`${API_URL}/api/product/${barcode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.data?.product_name) {
      throw new Error("ไม่พบสินค้า");
    }

    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("ไม่พบสินค้าตามบาร์โค้ดที่ระบุ");
    }

    throw new Error(
      error.response?.data?.message ||
      "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า"
    );
  }
}

export async function getDailyPayments(token) {

  try {
    const res = await axios.get(`${API_URL}/api/daily-payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงรายการจ่ายรายวันไม่สำเร็จ:", error);
    throw error;
  }
}

export async function createDailyPayment(token, paymentData) {

  try {
    const res = await axios.post(`${API_URL}/api/daily-payments`, paymentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("สร้างรายการจ่ายรายวันไม่สำเร็จ:", error);
    throw error;
  }
}

export async function deleteDailyPayment(token, id) {

  try {
    const res = await axios.delete(`${API_URL}/api/daily-payments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ลบรายการจ่ายรายวันไม่สำเร็จ:", error);
    throw error;
  }
}