import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  Box,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { login as apiLogin } from "../api/authService";
import { submitStudentApplication } from "../api/studentApplicationService";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";
import Aurora from "../theme/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../hooks/LoadingScreen";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (isLocked) {
      setSnackbar({
        open: true,
        message: `บัญชีนี้ถูกล็อกชั่วคราว เหลือเวลาอีก ${Math.floor(
          remainingTime / 60
        )} นาที ${remainingTime % 60} วินาที`,
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiLogin(email, password);
      login(data);

      setLoginAttempts(0);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("isLocked");
      localStorage.removeItem("lockedUntil");

      if (data.role === "superadmin") navigate("/superadmin/dashboard");
      else if (data.role === "admin") navigate("/admin/dashboard");
      else if (data.role === "employee")
        navigate("/employee/camera-stockout");
      else {
        setSnackbar({
          open: true,
          message: "สิทธิ์ของผู้ใช้นี้ไม่ถูกต้อง",
          severity: "error",
        });
      }
    } catch {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        const lockUntil = Date.now() + 10 * 60 * 1000;
        localStorage.setItem("isLocked", "true");
        localStorage.setItem("lockedUntil", lockUntil);
        setRemainingTime(600);

        setSnackbar({
          open: true,
          message: "คุณพยายามเข้าสู่ระบบเกิน 5 ครั้ง กรุณาลองใหม่ในภายหลัง",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: `อีเมลหรือรหัสผ่านไม่ถูกต้อง (เหลืออีก ${5 - newAttempts
            } ครั้ง)`,
          severity: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [loginAttempts, setLoginAttempts] = useState(
    parseInt(localStorage.getItem("loginAttempts")) || 0
  );
  const [isLocked, setIsLocked] = useState(
    localStorage.getItem("isLocked") === "true"
  );
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const lockedUntil = parseInt(localStorage.getItem("lockedUntil"));

    if (lockedUntil && Date.now() < lockedUntil) {
      setIsLocked(true);
      setRemainingTime(Math.floor((lockedUntil - Date.now()) / 1000));

      const timer = setInterval(() => {
        const timeLeft = Math.floor((lockedUntil - Date.now()) / 1000);
        if (timeLeft <= 0) {
          clearInterval(timer);
          setIsLocked(false);
          setLoginAttempts(0);
          setRemainingTime(0);
          localStorage.removeItem("isLocked");
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lockedUntil");
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, []);

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    gmail: "",
    studentId: "",
    contact: "",
    file: null,
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setRegisterData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmitRegister = (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    requestAnimationFrame(async () => {
      try {
        await new Promise((r) => setTimeout(r, 300));
        const res = await submitStudentApplication(registerData);

        setSnackbar({
          open: true,
          message: "สมัครนักศึกษาขอเป็นพนักงานสำเร็จ",
          severity: "success",
        });

        setRegisterData({
          firstName: "",
          lastName: "",
          gmail: "",
          studentId: "",
          contact: "",
          file: null,
        });
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: err.response?.data?.error || "เกิดข้อผิดพลาดในการสมัคร",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  if (isPageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#060010" }}
    >
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#1E3A8A", "#3B82F6", "#F97316"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.0}
        />
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: { xs: "50%", sm: "70%", md: "100%" },
            mx: "auto",
            borderRadius: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#060010",
            }}
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <Paper
          elevation={0}
          className="w-full max-w-md rounded-3xl"
          sx={{
            backgroundColor: "transparent",
            backdropFilter: "blur(100px)",
            fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
            padding: { xs: 3, sm: 4 },
            margin: { xs: 3, sm: 4 },
            borderRadius: 8,
            width: "100%",
            maxWidth: 480,
            boxShadow: "none",
          }}
        >
          <Stack spacing={3} alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="h4"
                fontWeight={600}
                className="text-[#fff] text-center"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "2rem", xl: "2.5rem" } }}
              >
                {isRegister ? "ลงทะเบียนพนักงาน" : "ระบบบริหารร้านค้า"}
              </Typography>
              <Box
                component="img"
                src="/logo-sci-light.svg"
                alt="SCI Logo"
                sx={{ width: 35, height: 35 }}
              />
            </Box>
          </Stack>

          <AnimatePresence mode="wait">
            {!isRegister ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.18,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <form onSubmit={handleSubmitLogin}>
                  <Stack spacing={3}>
                    <TextField
                      label="อีเมล"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                      autoComplete="email"
                      sx={textFieldStyle}
                    />
                    <TextField
                      label="รหัสผ่าน"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      autoComplete="current-password"
                      sx={textFieldStyle}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isLoading}
                      sx={{
                        ...buttonStyle,
                        "&.Mui-disabled": {
                          backgroundColor: "#9999",
                          color: "#000 !important",
                        },
                      }}
                    >
                      {isLoading ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={1}
                        >
                          <CircularProgress
                            size={20}
                            thickness={6}
                            sx={{ color: "#000" }}
                          />
                          กำลังเข้าสู่ระบบ
                        </Box>
                      ) : (
                        "เข้าสู่ระบบ"
                      )}
                    </Button>

                    {isLocked && (
                      <Typography
                        color="error"
                        sx={{ mt: 2, textAlign: "center" }}
                      >
                        บัญชีถูกล็อก กรุณารออีก {Math.floor(remainingTime / 60)}{" "}
                        นาที {remainingTime % 60} วินาที
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ccc",
                        textAlign: "center",
                      }}
                    >
                      ต้องการเป็นพนักงาน?{" "}
                      <span
                        onClick={() => setIsRegister(true)}
                        style={{
                          textDecoration: "underline",
                          color: "#fff",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        สมัครเป็นพนักงาน
                      </span>
                    </Typography>
                  </Stack>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  duration: 0.18,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <form onSubmit={handleSubmitRegister}>
                  <Stack spacing={1.5}>
                    <TextField
                      name="firstName"
                      label="ชื่อ"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      fullWidth
                      sx={textFieldStyle}
                      required
                    />
                    <TextField
                      name="lastName"
                      label="นามสกุล"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      fullWidth
                      sx={textFieldStyle}
                      required
                    />
                    <TextField
                      name="gmail"
                      label="Gmail"
                      type="email"
                      value={registerData.gmail}
                      onChange={handleRegisterChange}
                      fullWidth
                      sx={textFieldStyle}
                      required
                    />
                    <TextField
                      name="studentId"
                      label="เลขประจำตัวนักศึกษา"
                      value={registerData.studentId}
                      onChange={handleRegisterChange}
                      fullWidth
                      sx={textFieldStyle}
                      required
                    />
                    <TextField
                      name="contact"
                      label="ช่องทางการติดต่อ (เบอร์โทรหรือไลน์)"
                      value={registerData.contact}
                      onChange={handleRegisterChange}
                      fullWidth
                      sx={textFieldStyle}
                      required
                    />

                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderRadius: 4,
                        color: "#fff",
                        borderColor: "#fff",
                        px: 3,
                        py: 1.8,
                      }}
                    >
                      อัปโหลดตารางสอน
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>

                    {registerData.file && (
                      <Typography variant="body2" sx={{ color: "#ccc" }}>
                        ไฟล์ที่เลือก: {registerData.file.name}
                      </Typography>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isLoading}
                      sx={{
                        ...buttonStyle,
                        "&.Mui-disabled": {
                          backgroundColor: "#9999",
                          color: "#000 !important",
                        },
                      }}
                    >
                      {isLoading ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={1}
                        >
                          <CircularProgress
                            size={20}
                            thickness={6}
                            sx={{ color: "#000" }}
                          />
                          กำลังส่งแบบฟอร์ม
                        </Box>
                      ) : (
                        "สมัครนักศึกษาเป็นพนักงาน"
                      )}
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ccc",
                        textAlign: "center",
                      }}
                    >
                      มีบัญชีแล้ว?{" "}
                      <span
                        onClick={() => setIsRegister(false)}
                        style={{
                          textDecoration: "underline",
                          color: "#fff",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.target.style.color = "#90caf9")}
                        onMouseLeave={(e) => (e.target.style.color = "#fff")}
                      >
                        เข้าสู่ระบบ
                      </span>
                    </Typography>
                  </Stack>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </div>
    </div>
  );
}

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 4,
    "& .MuiOutlinedInput-notchedOutline": {
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #fff",
    },
    color: "#fff",
  },
  "& .MuiInputLabel-root": { color: "#ccc" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
  "& input": { caretColor: "#fff", color: "#fff" },
};

const buttonStyle = {
  py: 2,
  fontSize: "1.1rem",
  fontWeight: "bold",
  borderRadius: 4,
  backgroundColor: "#fff",
  color: "#000 !important",
  letterSpacing: 1,
  textTransform: "uppercase",
  "&:hover": { backgroundColor: "#bbb" },
  "&.Mui-disabled": {
    backgroundColor: "#999",
  },
};

export default LoginPage;
