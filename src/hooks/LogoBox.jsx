import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logoLight from "../assets/logo-sci-light.svg";
import logoDark from "../assets/logo-sci-dark.svg";

function LogoBox() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        pt: 4,
        px: 2,
        pb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "none",
      }}
    >
      <img
        src={isDark ? logoLight : logoDark}
        alt="Logo"
        style={{ maxHeight: 50, width: "auto" }}
      />
    </Box>
  );
}

export default LogoBox;