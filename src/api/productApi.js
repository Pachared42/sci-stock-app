import api from "./axiosInstance";

export async function fetchProductsByCategory(category) {
  try {
    const response = await api.get(`/api/products/${category}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

