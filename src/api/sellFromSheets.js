const API_URL = import.meta.env.VITE_API_URL;

export async function fetchProductsFromSheet(token) {
  const res = await fetch(`${API_URL}/api/fromsheet`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("❌ Failed to fetch products");
  }

  const data = await res.json();
  return data; // ควรได้ { products: [...] }
}

// 🔹 ใช้ใน React เพื่อโหลดข้อมูลและเซตเข้า state
export async function loadProductsFromSheet(token, setProducts) {
  try {
    const data = await fetchProductsFromSheet(token);
    console.log("✅ ข้อมูลจาก /api/fromsheet:", data);

    if (Array.isArray(data.products)) {
      setProducts(data.products);
    } else {
      console.warn("⚠️ products ไม่เป็น array:", data);
      setProducts([]);
    }
  } catch (error) {
    console.error("❌ Error loading products:", error);
    setProducts([]);
  }
}

// 🔹 ฟังก์ชันรีเฟรชแคช
export async function refreshCache(token) {
  const res = await fetch(`${API_URL}/api/refresh-cache`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("❌ Failed to refresh cache");
  }

  return res.json();
}

// 🔹 ฟังก์ชันตัดสต๊อก/ขายสินค้า
export async function sellProduct(token, barcode, quantity = 1) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ barcode, quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "❌ ตัดสต๊อกไม่สำเร็จ");
  }

  return data;
}
