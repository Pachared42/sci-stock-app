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
                    scanningRef.current = false; // กันยิงซ้ำ
                    onDetected(result.getText());

                    // 🔑 restart scanner หลัง 700ms (ไม่ปิดกล้อง)
                    setTimeout(() => {
                        scanningRef.current = true;
                    }, 700);
                }
            }
        );

        return () => {
            reader.reset(); // 🔥 สำคัญมาก
        };
    }, [onDetected]);

    const handleClose = () => {
        scanningRef.current = false;
        readerRef.current?.reset(); // ปิด stream จริง
        onClose();
    };

    return (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "black" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* ปุ่มปิดกล้อง */}
            <Box sx={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center" }}>
                <Button variant="contained" color="error" onClick={handleClose}>
                    ปิดกล้อง
                </Button>
            </Box>
        </Box>
    );
}

export default BarcodeScanner;