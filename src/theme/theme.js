import { createTheme } from "@mui/material/styles";

export const getAppTheme = (darkMode) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#f0f0f0" : "#0d0c22",
        contrastText: darkMode ? "#181E27" : "#181E27",
      },
      background: {
        default: darkMode ? "#0C1014" : "#ffffff",
        paper: darkMode ? "#0C1014" : "#ffffff",
        chartBackground: darkMode ? "#141A21" : "#F5F5F5",
        redDark: darkMode ? "#EF5350" : "#E53935",
        purpleDark: darkMode ? "#9575CD" : "#7E57C2",
        goldDark: darkMode ? "#FFB300" : "#FFA000",
        orangeDark: darkMode ? "#FB8C00" : "#F57C00",
        tealDark: darkMode ? "#26A69A" : "#00897B",
        blueDark: darkMode ? "#42A5F5" : "#1E88E5",
        brownDark: darkMode ? "#8D6E63" : "#6D4C41",
        deepPinkDark: darkMode ? "#EC407A" : "#D81B60",
        ButtonDay: darkMode ? "#F5F5F5" : "#0d0c22",
        Backgroundupload: darkMode ? "#141A21" : "#F5F5F5",
        backgroundUploadHover: darkMode ? "#1E252D" : "#F7F9FC",
        backgroundColorCloudUpload: darkMode ? "#0d0c22" : "#F7F9FC",
      },
      text: {
        primary: darkMode ? "#E0E0E0" : "#2d2d2d",
        secondary: darkMode ? "#AAAAAA" : "#666666",
        disabled: darkMode ? "#ffffff" : "#f0f0f0",
        hint: darkMode ? "#141A21" : "#F5F5F5",
      },
    },
    typography: {
      fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? "#0C1014" : "#ffffff",
            backdropFilter: "blur(12px)",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: darkMode ? "#0C1014" : "#ffffff",
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
            backgroundColor: darkMode ? "#141A21" : "#F5F5F5",
          },
        },
      },
    },
  });
