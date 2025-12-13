import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box, Button } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);

    useEffect(() => {
        if (readerRef.current) return; // ❗ กัน StrictMode

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        reader.decodeFromConstraints(
            {
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            },
            videoRef.current,
            (result) => {
                if (result && !lockRef.current) {
                    lockRef.current = true;

                    onDetected(result.getText());

                    // debounce ยิงซ้ำ
                    setTimeout(() => {
                        lockRef.current = false;
                    }, 800);
                }
            }
        );

        return () => {
            // ❌ อย่า reset ที่นี่
        };
    }, [onDetected]);

    const handleClose = () => {
        readerRef.current?.reset(); // ✅ reset เฉพาะตอนกดปิด
        readerRef.current = null;
        onClose();
    };

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "black" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* ปุ่มปิดกล้อง */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 24,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleClose}
                    sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                >
                    ปิดกล้อง
                </Button>
            </Box>
        </Box>
    );
}

export default BarcodeScanner;