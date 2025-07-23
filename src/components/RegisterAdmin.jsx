import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { registerAdmin } from "../api/registerAdmin";

export default function RegisterAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
    emailVerified: false,
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const handleDigitClick = (digit) => {
    const next = [...otpDigits];
    const idx = next.findIndex((d) => d === "");
    if (idx !== -1) {
      next[idx] = digit;
      setOtpDigits(next);
    }
  };

  const handleBackspace = () => {
    const next = [...otpDigits];
    const idx = next.findLastIndex((d) => d !== "");
    if (idx !== -1) {
      next[idx] = "";
      setOtpDigits(next);
    }
  };

  const handleCloseOtpDialog = () => {
    setOtpDialogOpen(false);
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const handleSubmitOtp = async () => {
    const fullCode = otpDigits.join("");
    if (fullCode === "123456") {
      try {
        await registerAdmin(formData);
        alert("ลงทะเบียนผู้ดูแลระบบสำเร็จ");
        handleCloseOtpDialog();
      } catch (err) {
        alert(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
      }
    } else {
      alert("OTP ไม่ถูกต้อง");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!formData.emailVerified) {
      setOtpDialogOpen(true);
    } else {
      submitWithoutOtp();
    }
  };

  const submitWithoutOtp = async () => {
    try {
      await registerAdmin(formData);
      alert("ลงทะเบียนผู้ดูแลระบบสำเร็จ");
    } catch (err) {
      alert(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 1 }}>
      {/* หัวข้อหลัก */}
      <Typography
        variant="h5"
        fontWeight="500"
        color="text.primary"
        textAlign="left"
        mb={3}
      >
        ลงทะเบียนผู้ดูแลระบบ
      </Typography>

      {/* กล่องหลักที่มี Upload กับ Form */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 4,
        }}
      >
        {/* Upload box */}
        <Box
          sx={{
            flex: "1",
            bgcolor: theme.palette.background.chartBackground,
            borderRadius: 4,
            pt: 10,
            pb: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label htmlFor="photo-upload">
            <Box
              sx={{
                position: "relative",
                width: 150,
                height: 150,
                borderRadius: "50%",
                border: "1.8px dashed #666666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 4,
                cursor: "pointer",
                overflow: "hidden",
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
            >
              {photoPreview ? (
                <>
                  <Avatar
                    src={photoPreview}
                    sx={{ width: "100%", height: "100%" }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      width: 125,
                      height: 125,
                      borderRadius: "50%",
                      backgroundColor: "rgba(240, 240, 240, 0.85)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 28, color: "#666" }} />
                    <Typography variant="caption" color="#666">
                      อัปโหลดรูป
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  className="overlay"
                  sx={{
                    width: 125,
                    height: 125,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <AddPhotoAlternateIcon sx={{ fontSize: 28, color: "#666" }} />
                  <Typography variant="caption" color="#666">
                    อัปโหลดรูป
                  </Typography>
                </Box>
              )}
            </Box>
          </label>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoUpload}
          />
          <Typography
            variant="caption"
            color="gray"
            textAlign="center"
            mb={2}
            fontSize={14}
          >
            อนุญาตเฉพาะไฟล์ .jpg, .png, <br /> ขนาดสูงสุด 1MB
          </Typography>
        </Box>

        {/* Form box */}
        <Box
          sx={{
            flex: "2",
            bgcolor: theme.palette.background.chartBackground,
            borderRadius: 4,
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3.5,
              width: "100%",
              flexGrow: 1,
            }}
          >
            <TextField
              fullWidth
              label="ชื่อ"
              name="firstName"
              onChange={handleChange}
              value={formData.firstName}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="นามสกุล"
              name="lastName"
              onChange={handleChange}
              value={formData.lastName}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
              sx={{
                gridColumn: "1 / -1",
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
              sx={{
                gridColumn: "1 / -1",
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 4,
              textAlign: "right",
              bgcolor: theme.palette.background.chartBackground,
              borderRadius: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              sx={{
                p: 1.5,
                fontSize: "1rem",
                fontWeight: "500",
                borderRadius: 3,
                color: theme.palette.text.hint,
              }}
            >
              ลงทะเบียนผู้ดูแลระบบ
            </Button>
          </Box>
        </Box>
      </Box>

      {/* OTP Dialog */}
      <Dialog
        open={otpDialogOpen}
        onClose={handleCloseOtpDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 4,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography mb={4} mt={2} fontSize={20}>
            กรุณากรอกเลข OTP 6 หลัก
          </Typography>
          <Box display="flex" justifyContent="center" gap={1} mb={2}>
            {otpDigits.map((digit, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  bgcolor: "background.chartBackground",
                }}
              >
                {digit}
              </Box>
            ))}
          </Box>

          <Box display="flex" justifyContent="center">
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              gap={2}
              mt={0.1}
              mb={2}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "ลบ", 0].map((val, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() =>
                    val === "ลบ"
                      ? handleBackspace()
                      : handleDigitClick(val.toString())
                  }
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    fontSize: "1.2rem",
                    fontWeight: "400",
                    minWidth: "unset",
                    padding: 0,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.chartBackground",
                    border: "none",
                  }}
                >
                  {val}
                </Button>
              ))}
            </Box>
          </Box>
          <DialogActions sx={{ p: 0 }}>
            <Button onClick={handleCloseOtpDialog}>ยกเลิก</Button>
            <Button
              variant="contained"
              onClick={handleSubmitOtp}
              disabled={otpDigits.includes("")}
            >
              ยืนยัน
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
