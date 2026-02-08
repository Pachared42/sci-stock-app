import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert,
} from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { checkInEmployee, checkOutEmployee, getCheckinStatus } from "../api/CheckInEmployeeApi";
import "../theme/calendarStyles.css";

function CheckInEmployee() {
    const theme = useTheme();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const token = localStorage.getItem("token");

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    useEffect(() => {
        getCheckinStatus(token).then(res => {
            setIsCheckedIn(res.checked_in);
        });
    }, []);

    const handleCheckIn = async () => {
        if (!photo) {
            setSnackbar({ open: true, severity: "warning", message: "กรุณาเลือกรูป" });
            return;
        }

        try {
            setLoading(true);
            await checkInEmployee(token, photo);
            setIsCheckedIn(true);
            setPhoto(null);
            setSnackbar({ open: true, severity: "success", message: "เช็คอินสำเร็จ" });
        } catch (err) {
            setSnackbar({
                open: true,
                severity: "error",
                message: err.response?.data?.error || "เช็คอินไม่สำเร็จ",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!photo) {
            setSnackbar({ open: true, severity: "warning", message: "กรุณาเลือกรูป" });
            return;
        }

        try {
            setLoading(true);
            await checkOutEmployee(token, photo);
            setIsCheckedIn(false);
            setPhoto(null);
            setSnackbar({ open: true, severity: "success", message: "เช็คเอาท์สำเร็จ" });
        } catch (err) {
            setSnackbar({
                open: true,
                severity: "error",
                message: err.response?.data?.error || "เช็คเอาท์ไม่สำเร็จ",
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
                เช็คชื่อเข้าทำงาน
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    width: "100%",
                    mx: "auto",
                }}
            >
                {/* Upload Photo */}
                <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                        minHeight: 350,
                        borderRadius: 5,
                        border: "1.5px dashed rgba(153, 153, 153, 0.2)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                        position: "relative",
                        backgroundImage: photo ? `url(${URL.createObjectURL(photo)})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: theme.palette.background.Backgroundupload,
                        color: photo ? "transparent" : "text.secondary",
                        "&:hover": {
                            backgroundColor: loading
                                ? theme.palette.background.Backgroundupload
                                : theme.palette.background.backgroundUploadHover,
                            borderColor: loading ? "rgba(153,153,153,0.2)" : "#888",
                        },
                    }}
                >
                    {!photo && (
                        <>
                            <AddPhotoAlternateIcon sx={{ fontSize: 80, marginBottom: 1, color: "#10B981" }} />
                            <Typography variant="body2" color="textSecondary">
                                อัปโหลดรูปถ่าย
                            </Typography>
                        </>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>


                {/* Buttons */}
                <Stack spacing={2}>
                    {!isCheckedIn ? (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={handleCheckIn}
                            disabled={loading}
                            fullWidth
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontSize: "0.9rem",
                                fontWeight: "500",
                            }}
                        >
                            เช็คอิน
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            onClick={handleCheckOut}
                            disabled={loading}
                            fullWidth
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontSize: "0.9rem",
                                fontWeight: "500",
                            }}
                        >
                            เช็คเอาท์
                        </Button>
                    )}
                </Stack>

            </Box>


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

export default CheckInEmployee;