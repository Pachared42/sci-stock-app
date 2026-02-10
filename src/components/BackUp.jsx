import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Snackbar,
    Alert,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";

function BackUp() {
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleBackup = async () => {
        try {
            setLoading(true);
            // TODO: เรียก API backup
            setSnackbar({
                open: true,
                message: "สำรองข้อมูลเรียบร้อยแล้ว",
                severity: "success",
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: "เกิดข้อผิดพลาดในการสำรองข้อมูล",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            setLoading(true);
            // TODO: เรียก API restore
            setSnackbar({
                open: true,
                message: "กู้คืนข้อมูลเรียบร้อยแล้ว",
                severity: "success",
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: "เกิดข้อผิดพลาดในการกู้คืนข้อมูล",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}>
            <Typography
                variant="h5"
                fontWeight={500}
                color="text.primary"
                mb={2}
                mx={2}
            >
                สำรองและกู้คืนข้อมูล
            </Typography>

            <Stack spacing={3} maxWidth={600}>
                {/* Backup Card */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" mb={1}>
                            สำรองข้อมูล (Backup)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            ใช้สำหรับสำรองข้อมูลทั้งหมดของระบบ เพื่อป้องกันข้อมูลสูญหาย
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<BackupIcon />}
                            onClick={handleBackup}
                            disabled={loading}
                        >
                            สำรองข้อมูล
                        </Button>
                    </CardContent>
                </Card>

                {/* Restore Card */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" mb={1}>
                            กู้คืนข้อมูล (Restore)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            ใช้สำหรับกู้คืนข้อมูลจากไฟล์สำรอง (ควรใช้งานด้วยความระมัดระวัง)
                        </Typography>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<RestoreIcon />}
                            onClick={handleRestore}
                            disabled={loading}
                        >
                            กู้คืนข้อมูล
                        </Button>
                    </CardContent>
                </Card>
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
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