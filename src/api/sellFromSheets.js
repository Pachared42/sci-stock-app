const API_URL = import.meta.env.VITE_API_URL;

export async function loadProductsFromSheet(token, setProducts) {
  if (!token) throw new Error("No token provided");
  try {
    const res = await fetch(`${API_URL}/api/fromsheet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    setProducts(data.products || []);
  } catch (err) {
    console.error("loadProductsFromSheet error:", err);
    setProducts([]);
    throw err;
  }
}

export async function sellProduct(token, barcode, quantity = 1) {
  if (!token) throw new Error("No token provided");
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ barcode, quantity }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to sell product");
  }
  return true;
}

export async function refreshCache(token) {
  if (!token) throw new Error("No token provided");
  const res = await fetch(`${API_URL}/api/refresh-cache`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to refresh cache");
  }
  return true;
}
