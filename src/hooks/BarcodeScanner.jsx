import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({
    onDetected,
    continuous = true, // 🔥 โหมดสแกนต่อเนื่อง
    delay = 800,       // กันสแกนซ้ำตัวเดิม
}) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);
    const timeoutRef = useRef(null);

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
            async (result) => {
                if (!result || lockRef.current) return;

                lockRef.current = true;

                const barcode = result.getText();
                await Promise.resolve(onDetected(barcode));

                if (continuous) {
                    timeoutRef.current = setTimeout(() => {
                        lockRef.current = false; // 🔓 ปลดล็อก → สแกนต่อ
                    }, delay);
                } else {
                    stopCamera();
                }
            }
        );

        return () => {
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        readerRef.current?.reset();

        const video = videoRef.current;
        if (video?.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
            video.srcObject = null;
        }

        clearTimeout(timeoutRef.current);
    };

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <video
                ref={videoRef}
                playsInline
                muted
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    clipPath: "inset(25% 10% 25% 10%)",
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
}

export default BarcodeScanner;