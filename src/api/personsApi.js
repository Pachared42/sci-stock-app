import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * @param {Object} details
 * @param {string} details.gmail
 * @param {string} details.password
 * @param {string} details.firstName
 * @param {string} details.lastName
 * @param {string|number} details.roleId
 * @param {File} [details.profileImage]
 * @param {string} token
 * @returns {Promise<Array>}
 */

export async function createUserRequest(details, token) {
  try {
    const formData = new FormData();
    formData.append("gmail", details.gmail);
    formData.append("password", details.password);
    formData.append("first_name", details.firstName);
    formData.append("last_name", details.lastName);
    formData.append("role_id", String(details.roleId));

    if (details.profileImage) {
      formData.append("profile_image", details.profileImage);
    }

    const res = await axios.post(`${API_URL}/api/users/requests`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "ไม่สามารถสร้างคำขอผู้ใช้ได้"
    );
  }
}

export async function verifyUserRequest(gmail, otp, token) {
  try {
    const res = await axios.post(
      `${API_URL}/api/users/requests/verify`,
      { gmail, otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ไม่สามารถยืนยัน OTP ได้");
  }
}

export async function fetchUsers(token) {
  try {
    const res = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data?.users || [];
  } catch (error) {
    const message =
      error.response?.data?.error || "ไม่สามารถดึงรายชื่อพนักงานได้";
    throw new Error(message);
  }
}

export async function updateUser(gmail, details, token) {
  const formData = new FormData();

  if (details.password) formData.append("password", details.password);
  if (details.firstName) formData.append("first_name", details.firstName);
  if (details.lastName) formData.append("last_name", details.lastName);
  if (details.roleId) formData.append("role_id", String(details.roleId));

  if (details.profileImage instanceof File) {
    formData.append("profile_image", details.profileImage);
  }

  const gmailEncoded = encodeURIComponent(gmail);

  const res = await axios.put(
    `${API_URL}/api/users/${gmailEncoded}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}

export async function deleteUser(gmail, token) {
  try {
    const gmailEncoded = encodeURIComponent(gmail);
    const res = await axios.delete(`${API_URL}/api/users/gmail/${gmailEncoded}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ไม่สามารถลบผู้ใช้ได้");
  }
}