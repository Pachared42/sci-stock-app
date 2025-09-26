import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { registerAdmin } from "../api/registerAdminApi";

export default function RegisterAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    role: "admin",
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

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

  const handleSubmit = async () => {
    try {
      await registerAdmin(formData);
      alert("ลงทะเบียนผู้ดูแลระบบสำเร็จ");
    } catch (err) {
      alert(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}>
      <Typography
        variant="h5"
        fontWeight="500"
        color="text.primary"
        textAlign="left"
        mb={3}
      >
        ลงทะเบียนพนักงาน
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
              label="ชื่อผู้ใช้"
              name="username"
              type="text"
              onChange={handleChange}
              value={formData.username}
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
    </Box>
  );
}