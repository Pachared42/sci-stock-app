import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  return localStorage.getItem("token");
}

export async function fetchWorkSchedules() {
  const token = getAuthToken();
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.get(`${API_URL}/api/work-schedules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ ดึงตารางเวลาทำงานไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ไม่สามารถดึงข้อมูลได้");
  }
}

export async function createWorkSchedule(data) {
  const token = getAuthToken();
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.post(`${API_URL}/api/work-schedules`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ สร้างตารางเวลาทำงานไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("สร้างข้อมูลไม่สำเร็จ");
  }
}

export async function updateWorkSchedule(id, data) {
  const token = getAuthToken();
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.put(`${API_URL}/api/work-schedules/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ อัปเดตตารางเวลาทำงานไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("อัปเดตข้อมูลไม่สำเร็จ");
  }
}

export async function deleteWorkSchedule(id) {
  const token = getAuthToken();
  if (!token) throw new Error("ไม่มี token");

  try {
    const res = await axios.delete(`${API_URL}/api/work-schedules/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ ลบตารางเวลาทำงานไม่สำเร็จ:", err);
    throw err.response?.data?.error || new Error("ลบข้อมูลไม่สำเร็จ");
  }
}