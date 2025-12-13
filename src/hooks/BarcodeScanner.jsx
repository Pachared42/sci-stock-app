import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ openCamera, onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const scannedRef = useRef(false);

    useEffect(() => {
        if (!openCamera) return;

        scannedRef.current = false;

        // ✅ ตั้ง hints ที่ถูกใช้จริง
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.CODE_128,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        readerRef.current = reader;

        reader.decodeFromConstraints(
            {
                video: {
                    facingMode: { ideal: "environment" }, // กล้องหลัง
                    width: { ideal: 1920 },                // ความละเอียดช่วยเรื่องระยะ
                    height: { ideal: 1080 },
                },
            },
            videoRef.current,
            (result) => {
                if (result && !scannedRef.current) {
                    scannedRef.current = true;
                    onDetected(result.getText());
                    reader.reset();   // ปิดกล้อง
                    onClose();        // กลับหน้าเดิม
                }
            }
        );

        return () => {
            reader.reset(); // cleanup ป้องกันหน้าขาว
        };
    }, [openCamera, onDetected, onClose]);

    return (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "black" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    clipPath: "inset(30% 10% 30% 10%)",
                }}
            />
        </Box>
    );
}

export default BarcodeScanner;