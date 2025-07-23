import { createTheme } from "@mui/material/styles";

export const getAppTheme = (darkMode) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#f0f0f0" : "#333333",
        contrastText: darkMode ? "#1C252E" : "#1C252E",
      },
      background: {
        default: darkMode ? "#141A21" : "#ffffff",
        paper: darkMode ? "#141A21" : "#ffffff",
        chartBackground: darkMode ? "#1C252E" : "#F5F5F5",
        redDark: darkMode ? "#C73838" : "#C73838",
        purpleDark: darkMode ? "#652EA3" : "#652EA3",
        goldDark: darkMode ? "#A37500" : "#A37500",
        orangeDark: darkMode ? "#B8431A" : "#B8431A",
        tealDark: darkMode ? "#00796B" : "#00796B",
        blueDark: darkMode ? "#1565C0" : "#1565C0",
        brownDark: darkMode ? "#6D4C41" : "#6D4C41",
        deepPinkDark: darkMode ? "#C2185B" : "#C2185B",
        ButtonDay: darkMode ? "#F5F5F5" : "#1C252E",
        Backgroundupload: darkMode ? "#1C252E" : "#F5F5F5",
        backgroundUploadHover: darkMode ? "#283440" : "#F7F9FC",
      },
      text: {
        primary: darkMode ? "#E0E0E0" : "#2d2d2d",
        secondary: darkMode ? "#AAAAAA" : "#666666",
        disabled: darkMode ? "#ffffff" : "#f0f0f0",
        hint: darkMode ? "#1C252E" : "#F5F5F5",
      },
    },
    typography: {
      fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? "#141A21" : "#ffffff",
            backdropFilter: "blur(12px)",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: darkMode ? "#141A21" : "#ffffff",
            boxShadow: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            transition: "all 0.3s ease-in-out",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            backdropFilter: "blur(1px)",
            color: darkMode ? "#E0E0E0" : "#2d2d2d",
            boxShadow: "none",
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1C252E" : "#F5F5F5",
          },
        },
      },
    },
  });
