import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { login as apiLogin } from "../api/authService";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-x-hidden bg-gradient-to-tr from-orange-300 via-orange-200 to-orange-100"
    >
      <Paper
        elevation={18}
        className="w-full max-w-md rounded-3xl"
        sx={{
          backgroundColor: "transparent",
          fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
          boxShadow: "none",
          padding: { xs: 3, sm: 4 },
          borderRadius: 6,
          width: "100%",
          maxWidth: 450,
        }}
      >
        <Stack spacing={3} alignItems="center" mb={4}>
          <LockOutlinedIcon sx={{ fontSize: 60, color: "#000000" }} />
          <Typography
            variant="h5"
            fontWeight={700}
            className="text-gray-800 text-center"
          >
            เข้าสู่ระบบ
          </Typography>
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, fontWeight: "bold", borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

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
                  borderRadius: 5,
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
                  borderRadius: 5,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 2,
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: 5,
                backgroundColor: "#000000",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#111111",
                },
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
