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

export async function createProduct(category, product) {
  try {
    const response = await api.post(`/api/products/${category}`, product);
    return response.data;
  } catch (error) {
    console.error("Create failed:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateProduct(category, barcode, updatedProduct) {
  try {
    const response = await api.put(`/api/products/${category}/${barcode}`, updatedProduct);
    return response.data;
  } catch (error) {
    console.error("Update failed:", error.response?.data || error.message);
    throw error;
  }
}

export async function deleteProduct(category, barcode) {
  try {
    const response = await api.delete(`/api/products/${category}/${barcode}`);
    return response.data;
  } catch (error) {
    console.error("Delete failed:", error.response?.data || error.message);
    throw error;
  }
}




