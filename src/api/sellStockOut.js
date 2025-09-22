const API_URL = import.meta.env.VITE_API_URL;

export async function sellStockOut(token, stockOutData) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_URL}/api/sell-local`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stockOutData),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to sell product");
  }

  return data;
}

export async function getProductByBarcode(token, barcode) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_URL}/api/product/${barcode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "ไม่พบสินค้า");
  }

  const data = await res.json();

  if (!data.product_name) {
    throw new Error("Response missing product_name");
  }

  return data;
}

export async function getDailyPayments(token) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_URL}/api/daily-payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "ไม่สามารถดึงรายการได้");
  }

  const data = await res.json();
  return data;
}

export async function createDailyPayment(token, paymentData) {
  if (!token) throw new Error("No token provided");

  console.log("Sending daily payment:", paymentData);

  const res = await fetch(`${API_URL}/api/daily-payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    throw new Error(data.error || "ไม่สามารถสร้างรายการได้");
  }

  return data;
}

export async function deleteDailyPayment(token, id) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_URL}/api/daily-payments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    throw new Error(data.error || "ไม่สามารถลบรายการได้");
  }

  return data;
}


