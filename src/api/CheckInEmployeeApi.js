import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function checkInEmployee(token, photoFile) {
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
        const res = await axios.post(
            `${API_URL}/api/checkin`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("ไม่สามารถบันทึกข้อมูลเช็คอินได้", error);
        throw error;
    }
}

export async function checkOutEmployee(token, photoFile) {
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
        const res = await axios.post(
            `${API_URL}/api/checkout`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("ไม่สามารถบันทึกข้อมูลเช็คเอาท์ได้", error);
        throw error;
    }
}

export async function getCheckinStatus(token) {
    try {
        const res = await axios.get(
            `${API_URL}/api/checkin/status`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("ไม่สามารถตรวจสอบสถานะเช็คอินได้", error);
        throw error;
    }
}