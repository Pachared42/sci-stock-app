import api from "./axiosInstance";

export async function fetchProductsByCategory(category) {
  try {
    const response = await api.get(`/api/products/${category}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function uploadProducts(category, products) {
  try {
    const response = await api.post(`/api/products/${category}/bulk`, products);
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
}




