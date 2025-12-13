import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box, Button } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lastScanRef = useRef("");

    useEffect(() => {
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
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            },
            videoRef.current,
            (result) => {
                if (!result) return;

                const text = result.getText();

                // ✅ กันสแกนซ้ำถี่เกิน
                if (text === lastScanRef.current) return;

                lastScanRef.current = text;
                onDetected(text);

                setTimeout(() => {
                    lastScanRef.current = "";
                }, 800);
            }
        );

        return () => {
            reader.reset(); // ✅ reset เฉพาะตอนปิด dialog
        };
    }, [onDetected]);

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
                }}
            />

            {/* ปุ่มปิดกล้อง */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 24,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button
                    variant="contained"
                    color="error"
                    onClick={onClose}
                    sx={{ borderRadius: 3, px: 4 }}
                >
                    ปิดกล้อง
                </Button>
            </Box>
        </Box>
    );
}

export default BarcodeScanner;