import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ onDetected, continuous = true, delay = 800 }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);
    const timeoutRef = useRef(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128]);

        const reader = new BrowserMultiFormatReader(hints);
        readerRef.current = reader;

        reader.decodeFromConstraints(
            {
                video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
            },
            videoRef.current,
            async (result) => {
                if (!activeRef.current) return;
                if (!result || lockRef.current) return;

                lockRef.current = true;
                await onDetected(result.getText());

                if (!activeRef.current) return;

                if (continuous) {
                    timeoutRef.current = setTimeout(() => {
                        if (activeRef.current) lockRef.current = false;
                    }, delay);
                } else {
                    stopCamera();
                }
            }
        );

        const stopCamera = () => {
            readerRef.current?.reset();
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
                videoRef.current.srcObject = null;
            }
            clearTimeout(timeoutRef.current);
        };

        return () => {
            activeRef.current = false;
            stopCamera();
        };
    }, [onDetected, continuous, delay]);

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