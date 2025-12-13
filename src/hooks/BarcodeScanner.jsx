import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ openCamera, onDetected }) {
    const videoRef = useRef(null);
    const scannedRef = useRef(false);

    useEffect(() => {
        if (!openCamera) return;

        scannedRef.current = false;

        const reader = new BrowserMultiFormatReader();

        reader.decodeFromConstraints(
            {
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            },
            videoRef.current,
            (result) => {
                if (result && !scannedRef.current) {
                    scannedRef.current = true;
                    reader.reset();              // ✅ หยุดกล้องก่อน
                    onDetected(result.getText()); // ✅ แค่ส่งค่า
                }
            }
        );

        return () => reader.reset();
    }, [openCamera, onDetected]);

    return (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "black" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
        </Box>
    );
}


export default BarcodeScanner;