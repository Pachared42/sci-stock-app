import api from "./axiosInstance";

export async function fetchSalesToday() {

  try {
    const response = await api.get("/api/sales_today");
    return response.data;
  } catch (error) {
    console.error("ดึงข้อมูลยอดขายวันนี้ล้มเหลว:", error);
    throw error;
  }
}

export async function fetchDailyExpenses() {

  try {
    const response = await api.get("/api/expenses/today");
    return response.data;
  } catch (error) {
    console.error("ดึงข้อมูลค่าใช้จ่ายวันนี้ล้มเหลว:", error);
    throw error;
  }
}