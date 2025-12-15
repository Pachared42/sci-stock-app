import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ onDetected, continuous = true, delay = 1000, active = true }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);
    const timeoutRef = useRef(null);

    const startCamera = () => {
        if (readerRef.current) return; // ถ้าเปิดอยู่แล้ว

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
                await onDetected(result.getText());

                if (continuous) {
                    timeoutRef.current = setTimeout(() => {
                        lockRef.current = false;
                    }, delay);
                } else {
                    stopCamera();
                }
            }
        );
    };

    const stopCamera = () => {
        readerRef.current?.reset();
        readerRef.current = null;

        const video = videoRef.current;
        if (video?.srcObject) {
            video.srcObject.getTracks().forEach((t) => t.stop());
            video.srcObject = null;
        }

        clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        if (active) {
            startCamera();
        } else {
            stopCamera();
        }

        // cleanup on unmount
        return () => stopCamera();
    }, [active]); // watch prop active

    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            <video
                ref={videoRef}
                playsInline
                muted
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    backgroundColor: "black",
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
}


export default BarcodeScanner;