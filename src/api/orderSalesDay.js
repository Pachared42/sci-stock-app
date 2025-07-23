import api from "./axiosInstance";

export async function fetchSalesToday() {
  try {
    const response = await api.get("/api/sales_today");
    return response.data;
  } catch (error) {
    throw error;
  }
}
