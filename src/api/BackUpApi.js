import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const auth = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

// ดึงทีละตาราง: backend คืน { table, data }
async function backupTable(token, table) {
    const res = await axios.get(
        `${API_URL}/api/superadmin/backup/${encodeURIComponent(table)}`,
        auth(token)
    );
    return res.data; // { table, data }
}

// export หลายตาราง (รวมไฟล์เองฝั่ง FE แล้วคืนเป็น Blob)
export async function exportBackupSelected(token, tables = []) {
    const out = {};

    for (const t of tables) {
        const res = await backupTable(token, t);
        out[res.table] = res.data;
    }

    return new Blob([JSON.stringify(out, null, 2)], {
        type: "application/json",
    });
}

// import-data: backend รับ { table, data }
async function importTable(token, table, data) {
    const res = await axios.post(
        `${API_URL}/api/superadmin/import-data`,
        { table, data },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    return res.data;
}

// restore จากไฟล์ .json (รองรับ 2 รูปแบบ)
// 1) { "users":[...], "roles":[...] }  (ไฟล์รวมหลายตาราง)
// 2) { "table":"users", "data":[...] } (ไฟล์ backup ทีละตารางจาก backend)
export async function restoreBackup(token, file) {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // แบบไฟล์: { table, data }
    if (parsed && typeof parsed === "object" && parsed.table && Array.isArray(parsed.data)) {
        return importTable(token, parsed.table, parsed.data);
    }

    // แบบไฟล์รวม: { users:[], roles:[], ... }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("รูปแบบไฟล์ไม่ถูกต้อง");
    }

    let total = 0;
    for (const [table, data] of Object.entries(parsed)) {
        if (!Array.isArray(data)) continue;
        await importTable(token, table, data);
        total += data.length;
    }

    return { message: "restore สำเร็จ", rows: total };
}