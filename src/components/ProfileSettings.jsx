import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { fetchUserProfile, updateUserProfile } from "../api/profileApi";

function UserProfileSettings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ state ต้องมี field ครบตั้งแต่แรก และใช้ชื่อเดียวกันทั้งไฟล์
  const [formData, setFormData] = useState({
    gmail: "",
    firstName: "",
    lastName: "",
    password: "",
    photoFile: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchUserProfile();

        setFormData({
          gmail: profile.gmail || "",
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          password: "",
          photoFile: null,
        });

        if (profile.profileImage) {
          setPhotoPreview(
            `data:image/jpeg;base64,${profile.profileImage}`
          );
        }
      } catch (err) {
        console.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ", err);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({
        open: true,
        message: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        severity: "error",
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "ไฟล์ต้องมีขนาดไม่เกิน 3MB",
        severity: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((prev) => ({
        ...prev,
        photoFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData.photoFile) {
        payload.profile_image = formData.photoFile;
      }

      await updateUserProfile(payload);

      setSnackbar({
        open: true,
        message: "อัปเดตโปรไฟล์สำเร็จ",
        severity: "success",
      });

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error ||
          "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
        severity: "error",
      });
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
        ตั้งค่าโปรไฟล์ส่วนตัว
      </Typography>

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
            flex: 1,
            bgcolor: theme.palette.background.chartBackground,
            borderRadius: 4,
            pt: 5,
            pb: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label htmlFor="photo-upload">
            <Box
              sx={{
                position: "relative",
                width: 200,
                height: 200,
                borderRadius: "50%",
                border: "1.8px dashed #666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 4,
                cursor: "pointer",
                overflow: "hidden",
                "&:hover .overlay": { opacity: 1 },
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
                      width: 170,
                      height: 170,
                      borderRadius: "50%",
                      backgroundColor: "rgba(240,240,240,0.85)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 28, color: "#666" }} />
                    <Typography variant="caption" color="#666">
                      อัปโหลดรูปใหม่
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    width: 170,
                    height: 170,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
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
            onChange={handleFileChange}
          />

          <Typography variant="caption" color="gray" mt={4} textAlign="center">
            อนุญาตเฉพาะไฟล์ .jpg, .png
            <br />
            ขนาดสูงสุด 3MB
          </Typography>
        </Box>

        {/* Form box */}
        <Box
          sx={{
            flex: 2,
            bgcolor: theme.palette.background.chartBackground,
            borderRadius: 4,
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Gmail"
              name="gmail"
              value={formData.gmail}
              InputProps={{
                readOnly: true,
                sx: {
                  borderRadius: 4,
                  bgcolor: "action.disabledBackground",
                },
              }}
            />

            <TextField
              fullWidth
              label="ชื่อ"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />

            <TextField
              fullWidth
              label="นามสกุล"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />

            <TextField
              fullWidth
              label="รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />
          </Box>

          <Box sx={{ mt: 4, textAlign: "right" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
              }}
            >
              บันทึกการตั้งค่า
            </Button>
          </Box>
        </Box>
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

export default UserProfileSettings;