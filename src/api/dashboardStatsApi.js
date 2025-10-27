import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchTotalProducts = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/dashboard/total`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงจำนวนสินค้าทั้งหมดไม่สำเร็จ:", error);
    throw error;
  }
};

export const fetchLowStockProducts = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/dashboard/low-stock`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงสินค้าที่ใกล้หมดไม่สำเร็จ:", error);
    throw error;
  }
};

export const fetchOutOfStockProducts = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/dashboard/out-of-stock`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงสินค้าที่หมดสต๊อกไม่สำเร็จ:", error);
    throw error;
  }
};

export const fetchMonthlySalesSummary = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/dashboard/sales-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงข้อมูลยอดขายรายวันไม่สำเร็จ:", error);
    throw error;
  }
};