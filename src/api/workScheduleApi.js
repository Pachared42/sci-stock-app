const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  return localStorage.getItem("token");
}

export async function fetchWorkSchedules() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/work-schedules`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("ไม่สามารถดึงข้อมูลได้: " + errorText);
  }

  return await res.json();
}

export async function createWorkSchedule(data) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/work-schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("สร้างข้อมูลไม่สำเร็จ: " + errorText);
  }

  return await res.json();
}

export async function updateWorkSchedule(id, data) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/work-schedules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("อัปเดตข้อมูลไม่สำเร็จ: " + errorText);
  }

  return await res.json();
}

export async function deleteWorkSchedule(id) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/work-schedules/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("ลบข้อมูลไม่สำเร็จ: " + errorText);
  }

  return await res.json();
}
