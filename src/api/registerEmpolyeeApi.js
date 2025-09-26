import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getStudentApplications(token, status) {
  let url = `${API_URL}/api/employees/applications`;
  if (status) {
    url += `?status=${encodeURIComponent(status)}`;
  }

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "โหลดข้อมูลไม่สำเร็จ");
  }
}

export async function approveStudentApplication(id, token) {
  try {
    const res = await axios.put(
      `${API_URL}/api/employees/applications/${id}?action=approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ไม่สามารถอนุมัติได้");
  }
}

export async function rejectStudentApplication(id, token) {
  try {
    const res = await axios.put(
      `${API_URL}/api/employees/applications/${id}?action=reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ไม่สามารถไม่อนุมัติได้");
  }
}

export async function deleteApprovedApplication(id, token) {
  try {
    const res = await axios.delete(
      `${API_URL}/api/employees/applications/approved/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ไม่สามารถลบข้อมูลได้");
  }
}