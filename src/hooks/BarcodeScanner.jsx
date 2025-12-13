import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
    BarcodeFormat,
    DecodeHintType,
} from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
    ]);

    const reader = new BrowserMultiFormatReader(hints);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();

        reader.decodeFromConstraints(
            {
                video: {
                    facingMode: { ideal: "environment" }, // กล้องหลัง
                    focusMode: "continuous",               // autofocus
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            },
            videoRef.current,
            (result) => {
                if (result) {
                    onDetected(result.getText());
                    reader.reset();
                }
            }
        );

        return () => reader.reset();
    }, []);

    return (
        <Box sx={{ width: "100%", p: 2 }}>
            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    objectFit: "cover",
                    clipPath: "inset(25% 10% 25% 10%)",
                }}
            />
        </Box>
    );
}

export default BarcodeScanner;