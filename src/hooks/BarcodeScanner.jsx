import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({
    onDetected,
    continuous = true,
    delay = 800,
}) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);
    const timeoutRef = useRef(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;

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
                if (!activeRef.current) return;     // 🔥 สำคัญมาก
                if (!result || lockRef.current) return;

                lockRef.current = true;

                await Promise.resolve(onDetected(result.getText()));

                if (!activeRef.current) return;

                if (continuous) {
                    timeoutRef.current = setTimeout(() => {
                        if (activeRef.current) {
                            lockRef.current = false;
                        }
                    }, delay);
                } else {
                    stopCamera();
                }
            }
        );

        return () => {
            activeRef.current = false; // 🔥 ตัด callback ทันที
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        readerRef.current?.reset();

        const video = videoRef.current;
        if (video?.srcObject) {
            video.srcObject.getTracks().forEach((t) => t.stop());
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
                    backgroundColor: "black",
                }}
            />
        </Box>
    );
}

export default BarcodeScanner;