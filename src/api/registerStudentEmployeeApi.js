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
    console.error("ดึงข้อมูลคำขอพนักงานนักศึกษาล้มเหลว:", error);
    throw error;
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
    console.error("อนุมัติคำขอพนักงานนักศึกษาล้มเหลว:", error);
    throw error;
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
    console.error("ปฏิเสธคำขอพนักงานนักศึกษาล้มเหลว:", error);
    throw error;
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
    console.error("ลบคำขอพนักงานนักศึกษาที่อนุมัติแล้วล้มเหลว:", error);
    throw error;
  }
}

export async function checkOrAddEmployee(data, token) {

  try {
    const res = await axios.post(
      `${API_URL}/api/employees/check-or-add`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("ตรวจสอบหรือเพิ่มพนักงานล้มเหลว:", error);
    throw error;
  }
}

export async function deleteEmployeeByGmail(gmail, token) {

  try {
    const res = await axios.delete(
      `${API_URL}/api/employees/${encodeURIComponent(gmail)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("ลบพนักงานล้มเหลว:", error);
    throw error;
  }
}
