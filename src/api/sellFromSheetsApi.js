import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function loadProductsFromSheet(token, setProducts) {

  try {
    const res = await axios.get(`${API_URL}/api/fromsheet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data.products || []);
    return res.data;
  } catch (error) {
    console.error("โหลดสินค้าจาก Google ไม่สำเร็จ:", error);
    setProducts([]);
    throw error;
  }
}

export async function sellProduct(token, barcode, quantity = 1) {

  try {
    await axios.post(
      `${API_URL}/api/orders`,
      { barcode, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error) {
    console.error("ขายสินค้าไม่สำเร็จ:", error);
    throw error;
  }
}

export async function refreshCache(token) {
  
  try {
    await axios.get(`${API_URL}/api/refresh-cache`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error("รีเฟรชแคชไม่สำเร็จ:", error);
    throw error;
  }
}