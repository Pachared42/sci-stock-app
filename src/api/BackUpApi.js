import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function exportBackupSelected(token, tables = []) {
    const res = await axios.post(
        `${API_URL}/backup/export`,
        { tables },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            responseType: "blob",
        }
    );

    return res.data;
}

export async function restoreBackup(token, file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/backup/restore`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
}