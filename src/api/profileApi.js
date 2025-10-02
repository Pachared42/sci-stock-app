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
    if (profileData.first_name) formData.append("first_name", profileData.first_name);
    if (profileData.last_name) formData.append("last_name", profileData.last_name);
    if (profileData.password) formData.append("password", profileData.password);
    if (profileData.profile_image) formData.append("profile_image", profileData.profile_image);

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