import axiosInstance from "./axiosInstance";

export async function fetchUserProfile() {
  const token = localStorage.getItem("access_token");

  try {
    const response = await axiosInstance.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  const token = localStorage.getItem("access_token");

  try {
    const formData = new FormData();
    for (const key in profileData) {
      formData.append(key, profileData[key]);
    }

    const response = await axiosInstance.put("/auth/profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
