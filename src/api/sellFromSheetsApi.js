import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function loadProductsFromSheet(token, setProducts) {
  if (!token) throw new Error("ไม่มี token");
  try {
    const res = await axios.get(`${API_URL}/api/fromsheet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data.products || []);
    return res.data;
  } catch (err) {
    console.error("❌ loadProductsFromSheet error:", err);
    setProducts([]);
    throw err;
  }
}

export async function sellProduct(token, barcode, quantity = 1) {
  if (!token) throw new Error("ไม่มี token");
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
  } catch (err) {
    console.error("❌ ขายสินค้าไม่สำเร็จ:", err);
    throw err;
  }
}

export async function refreshCache(token) {
  if (!token) throw new Error("ไม่มี token");
  try {
    await axios.get(`${API_URL}/api/refresh-cache`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (err) {
    console.error("❌ รีเฟรช cache ไม่สำเร็จ:", err);
    throw err;
  }
}