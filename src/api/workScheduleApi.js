import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  return localStorage.getItem("token");
}

export async function fetchWorkSchedules() {
  const token = getAuthToken();

  try {
    const res = await axios.get(`${API_URL}/api/work-schedules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ดึงตารางเวลาทำงานไม่สำเร็จ:", error);
    throw error;
  }
}

export async function createWorkSchedule(data) {
  const token = getAuthToken();

  try {
    const res = await axios.post(`${API_URL}/api/work-schedules`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("สร้างตารางเวลาทำงานไม่สำเร็จ:", error);
    throw error;
  }
}

export async function updateWorkSchedule(id, data) {
  const token = getAuthToken();

  try {
    const res = await axios.put(`${API_URL}/api/work-schedules/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("อัปเดตตารางเวลาทำงานไม่สำเร็จ:", error);
    throw error;
  }
}

export async function deleteWorkSchedule(id) {
  const token = getAuthToken();

  try {
    const res = await axios.delete(`${API_URL}/api/work-schedules/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("ลบตารางเวลาทำงานไม่สำเร็จ:", error);
    throw error;
  }
}