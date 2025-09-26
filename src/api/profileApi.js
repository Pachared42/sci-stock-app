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