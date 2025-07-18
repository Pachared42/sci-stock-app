import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./context/AuthProvider";

import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";

const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;



