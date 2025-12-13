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

        // จำกัด format → เร็ว + แม่น
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
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            },
            videoRef.current,
            (result) => {
                if (result && !scannedRef.current) {
                    scannedRef.current = true;

                    // 🔊 เสียง
                    try {
                        const ctx = new AudioContext();
                        const osc = ctx.createOscillator();
                        osc.frequency.value = 1200;
                        osc.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.08);
                    } catch { }

                    // 📳 สั่น
                    if (navigator.vibrate) navigator.vibrate(150);

                    onDetected(result.getText());
                    reader.reset();
                    onClose();
                }
            }
        );

        return () => reader.reset();
    }, [openCamera, onDetected, onClose]);

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "black" }}>
            {/* video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* overlay */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* กรอบเล็ง */}
                <Box
                    sx={{
                        width: "70%",
                        height: "25%",
                        border: "3px solid #00e676",
                        borderRadius: 2,
                        boxShadow: "0 0 12px #00e676",
                    }}
                />
            </Box>
        </Box>
    );
}

export default BarcodeScanner;