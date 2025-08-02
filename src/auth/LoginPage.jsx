import { useState } from "react";
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
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";

import Aurora from "../theme/Aurora";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await apiLogin(email, password);
      login(data);

      if (data.role === "superadmin") {
        navigate("/superadmin/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Unauthorized role");
      }
    } catch {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#060010" }}
    >
      {/* Aurora background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#1E3A8A", "#3B82F6", "#F97316"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.0}
        />
      </div>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%", fontWeight: "bold", borderRadius: 4, }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Login form */}
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
            maxWidth: 450,
            boxShadow: "none",
          }}
        >
          <Stack spacing={3} alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="h4"
                fontWeight={600}
                className="text-[#fff] text-center"
              >
                ระบบบริหารร้านค้า
              </Typography>
              <Box
                component="img"
                src="/logo-sci-light.svg"
                alt="SCI Logo"
                sx={{ width: 35, height: 35 }}
              />
            </Box>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="อีเมล"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                sx={{
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
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#fff",
                  },
                  "& input": {
                    caretColor: "#fff",
                    color: "#fff",
                  },
                }}
              />

              <TextField
                label="รหัสผ่าน"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                sx={{
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
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#fff",
                  },
                  "& input": {
                    caretColor: "#fff",
                    color: "#fff",
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 4,
                  backgroundColor: isLoading ? "#bbb !important" : "#fff",
                  color: "#000 !important",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#bbb",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#bbb",
                    color: "#000",
                  },
                }}
              >
                {isLoading ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress
                      size={20}
                      thickness={6}
                      sx={{
                        color: "#000",
                        mr: 1,
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                        },
                      }}
                    />
                    กำลังเข้าสู่ระบบ
                  </Box>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </Stack>
          </form>
        </Paper>
      </div>
    </div>
  );
}
