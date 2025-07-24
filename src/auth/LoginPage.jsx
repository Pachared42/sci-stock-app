import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { login as apiLogin } from "../api/authService";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";
import CircularProgress from "@mui/material/CircularProgress";

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
    <div className="min-h-screen flex items-center justify-center px-4 overflow-x-hidden bg-gradient-to-tr from-orange-300 via-orange-200 to-orange-100">
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
        <Stack spacing={3} alignItems="center" mb={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography
              variant="h4"
              fontWeight={600}
              className="text-gray-800 text-center"
            >
              ระบบบริหารจัดการ
            </Typography>
            <Box
              component="img"
              src="/logo-sci-dark.svg"
              alt="SCI Logo"
              sx={{ width: 35, height: 35 }}
            />
          </Box>
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
                  borderRadius: 4,
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#000000",
                },
                "& input": {
                  caretColor: "#000000",
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
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#000000",
                },
                "& input": {
                  caretColor: "#000000",
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
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: 4,
                backgroundColor: "#000000",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#111111",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
