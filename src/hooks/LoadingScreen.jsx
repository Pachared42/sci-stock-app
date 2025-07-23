import React from "react";
import { Box } from "@mui/material";

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <img
        src="/logo-sci-dark.svg"
        alt="logo"
        width={150}
        height={150}
        style={{ animation: "popFade 1.5s ease forwards infinite" }}
      />

      <style>{`
        @keyframes popFade {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `}</style>
    </Box>
  );
}
