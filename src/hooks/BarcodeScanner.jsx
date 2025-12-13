import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box, Button } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const scanningRef = useRef(true);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        scanningRef.current = true;

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
                if (result && scanningRef.current) {
                    scanningRef.current = false;

                    onDetected(result.getText());

                    // ⏱ debounce กันยิงซ้ำ
                    setTimeout(() => {
                        scanningRef.current = true;
                    }, 800);
                }
            }
        );

        return () => {
            reader.reset();
        };
    }, [onDetected]);

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
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
                    onClick={onClose}
                    sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                >
                    ปิดกล้อง
                </Button>
            </Box>
        </Box>
    );
}

export default BarcodeScanner;