import React, { useCallback, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Snackbar,
    Alert,
    LinearProgress,
    FormControlLabel,
    Checkbox,
    Divider,
    Chip,
    useTheme,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from "react-dropzone";

// ✅ ตารางทั้งหมด (ใช้เป็นฐานสำหรับ selected)
const TABLES = [
    "users",
    "roles",
    "student_applications",
    "checkins",
    "dried_food",
    "fresh_food",
    "snack",
    "soft_drink",
    "stationery",
    "sales_today",
    "work_schedules",
    "daily_payments",
];

// ✅ จัดหมวดให้เป็นระเบียบ
const TABLE_GROUPS = [
    { title: "ผู้ใช้ / สิทธิ์", tables: ["users", "roles"] },
    { title: "นักศึกษา / เช็คอิน", tables: ["student_applications", "checkins"] },
    {
        title: "สต๊อกสินค้า",
        tables: ["dried_food", "fresh_food", "snack", "soft_drink", "stationery"],
    },
    {
        title: "งาน / การเงิน / ยอดขาย",
        tables: ["sales_today", "work_schedules", "daily_payments"],
    },
];

function BackUp() {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    // ✅ เลือกตารางสำหรับ Backup (default: เลือกทั้งหมด)
    const [selected, setSelected] = useState(() =>
        Object.fromEntries(TABLES.map((t) => [t, true]))
    );

    // ✅ สำหรับ Restore
    const [restoreFile, setRestoreFile] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnack = (message, severity = "success") =>
        setSnackbar({ open: true, message, severity });

    const selectedTables = useMemo(
        () => TABLES.filter((t) => selected[t]),
        [selected]
    );

    const toggleAll = (value) => {
        setSelected(Object.fromEntries(TABLES.map((t) => [t, value])));
    };

    const countSelectedInGroup = (tables) =>
        tables.filter((t) => selected[t]).length;

    const setGroup = (tables, value) => {
        setSelected((prev) => {
            const next = { ...prev };
            tables.forEach((t) => (next[t] = value));
            return next;
        });
    };

    // ✅ Backup: ส่ง tables ไปให้ backend แล้วโหลดไฟล์กลับมา
    const handleBackup = async () => {
        if (selectedTables.length === 0) {
            showSnack("โปรดเลือกอย่างน้อย 1 ตารางก่อนสำรองข้อมูล", "warning");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/backup/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tables: selectedTables }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "backup failed");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();

            window.URL.revokeObjectURL(url);

            showSnack("สำรองข้อมูลเรียบร้อยแล้ว", "success");
        } catch (err) {
            showSnack("เกิดข้อผิดพลาดในการสำรองข้อมูล", "error");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Dropzone Restore
    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles?.[0];
            if (!file) return;

            if (!file.name.toLowerCase().endsWith(".json")) {
                showSnack("กรุณาเลือกไฟล์ .json เท่านั้น", "error");
                return;
            }

            setRestoreFile(file);
            showSnack(`เลือกไฟล์แล้ว: ${file.name}`, "success");
        },
        [] // showSnack ไม่ต้องใส่ deps เพราะมันใช้ setState โดยตรง (ไม่พึ่งค่าเปลี่ยนแปลง)
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        maxFiles: 1,
    });

    const handleRestore = async () => {
        if (!restoreFile) {
            showSnack("โปรดเลือกไฟล์สำรองก่อน", "warning");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", restoreFile);

            const res = await fetch("/backup/restore", {
                method: "POST",
                body: formData,
                headers: {
                    // ❗ ห้ามใส่ Content-Type เองตอนส่ง FormData
                    // Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "restore failed");
            }

            showSnack("กู้คืนข้อมูลเรียบร้อยแล้ว", "success");
            setRestoreFile(null);
        } catch (err) {
            showSnack("เกิดข้อผิดพลาดในการกู้คืนข้อมูล", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}>
            <Typography variant="h5" fontWeight={500} color="text.primary" mb={2} mx={2}>
                สำรองและกู้คืนข้อมูล
            </Typography>

            <Stack spacing={3}>
                {/* Backup Card */}
                <Card sx={{ borderRadius: 4, bgcolor: theme.palette.background.chartBackground, }}>
                    <CardContent>
                        <Typography variant="h6" mb={1}>
                            สำรองข้อมูล (เลือกตารางได้)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            เลือกตารางที่ต้องการสำรอง แล้วกดปุ่มเพื่อดาวน์โหลดไฟล์ .json
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} alignItems="center">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => toggleAll(true)}
                                disabled={loading}
                            >
                                เลือกทั้งหมด
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => toggleAll(false)}
                                disabled={loading}
                            >
                                ไม่เลือกทั้งหมด
                            </Button>

                            <Chip
                                size="small"
                                label={`เลือกแล้ว: ${selectedTables.length}/${TABLES.length} ตาราง`}
                                sx={{ ml: 1 }}
                            />
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {/* ✅ แสดงแบบจัดหมวด + Grid */}
                        <Stack spacing={2.25}>
                            {TABLE_GROUPS.map((g) => {
                                const picked = countSelectedInGroup(g.tables);
                                const allPicked = picked === g.tables.length;

                                return (
                                    <Card key={g.title} sx={{ borderRadius: 3, border: "1.5px dashed rgba(153, 153, 153, 0.2)", }}>
                                        <CardContent sx={{ py: 2 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                gap={1}
                                                flexWrap="wrap"
                                                mb={1.5}
                                            >
                                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {g.title}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`${picked}/${g.tables.length} เลือกแล้ว`}
                                                        variant={picked ? "filled" : "outlined"}
                                                    />
                                                </Stack>

                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => setGroup(g.tables, true)}
                                                        disabled={loading || allPicked}
                                                    >
                                                        เลือกทั้งหมวด
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => setGroup(g.tables, false)}
                                                        disabled={loading || picked === 0}
                                                    >
                                                        ล้างทั้งหมวด
                                                    </Button>
                                                </Stack>
                                            </Stack>

                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: {
                                                        xs: "1fr",
                                                        sm: "1fr 1fr",
                                                        md: "1fr 1fr 1fr",
                                                    },
                                                    gap: 0.5,
                                                }}
                                            >
                                                {g.tables.map((t) => (
                                                    <FormControlLabel
                                                        key={t}
                                                        sx={{ m: 0, width: "100%" }}
                                                        control={
                                                            <Checkbox
                                                                checked={!!selected[t]}
                                                                onChange={(e) =>
                                                                    setSelected((prev) => ({ ...prev, [t]: e.target.checked }))
                                                                }
                                                                disabled={loading}
                                                            />
                                                        }
                                                        label={
                                                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                                                {t}
                                                            </Typography>
                                                        }
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>

                        {loading && <LinearProgress sx={{ my: 2 }} />}

                        <Stack direction="row" justifyContent="flex-end" mt={2}>
                            <Button
                                variant="contained"
                                startIcon={<BackupIcon />}
                                onClick={handleBackup}
                                disabled={loading}
                                sx={{
                                    marginTop: "10px",
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    backgroundColor: theme.palette.background.ButtonDay,
                                    color: theme.palette.text.hint,
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                สำรองข้อมูล (ดาวน์โหลดไฟล์)
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Restore Card */}
                <Card sx={{ borderRadius: 4, bgcolor: theme.palette.background.chartBackground, }}>
                    <CardContent>
                        <Typography variant="h6" mb={1}>
                            กู้คืนข้อมูล (อัปโหลดไฟล์)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            ลากไฟล์สำรอง (.json) มาวาง หรือกดเลือกไฟล์ แล้วกด “กู้คืนข้อมูล”
                            (คำเตือน: อาจทับข้อมูลปัจจุบัน)
                        </Typography>

                        {/* Dropzone */}
                        <Box {...getRootProps()}
                            sx={{
                                border: "1.5px dashed rgba(153, 153, 153, 0.2)",
                                borderRadius: 3,
                                minHeight: 200,
                                p: 2.5,
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all .2s ease",
                                bgcolor: isDragActive ? "action.hover" : "background.paper",

                                "&:hover": {
                                    border: "1.5px dashed rgba(153, 153, 153, 0.2)",
                                    backgroundColor: "action.hover",
                                }
                            }}>
                            <input {...getInputProps()} />
                            <FileUploadIcon sx={{ fontSize: 80, marginBottom: 1, color: "#10B981" }} />
                            <Typography variant="body1" fontWeight={500}>
                                {isDragActive ? "ปล่อยไฟล์เพื่ออัปโหลด..." : "ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                รองรับ 1 ไฟล์ (.json)
                            </Typography>

                            {restoreFile && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    ไฟล์ที่เลือก: <b>{restoreFile.name}</b> ({Math.round(restoreFile.size / 1024)} KB)
                                </Typography>
                            )}
                        </Box>

                        {loading && <LinearProgress sx={{ my: 2 }} />}

                        <Stack direction="row" spacing={1.5} mt={2} justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<RestoreIcon />}
                                onClick={handleRestore}
                                disabled={loading || !restoreFile}
                                sx={{
                                    marginTop: "10px",
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                กู้คืนข้อมูล
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => setRestoreFile(null)}
                                disabled={loading || !restoreFile}
                                sx={{
                                    marginTop: "10px",
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                ล้างไฟล์
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default BackUp;