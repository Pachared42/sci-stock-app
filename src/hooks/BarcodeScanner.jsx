import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ active, onDetected }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const scannedRef = useRef(false);

    useEffect(() => {
        if (!active) return;

        scannedRef.current = false;

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

                    // ❗ หยุดกล้องก่อน
                    reader.reset();

                    // ส่งค่าอย่างเดียว
                    onDetected(result.getText());
                }
            }
        );

        return () => {
            reader.reset();
        };
    }, [active, onDetected]);

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