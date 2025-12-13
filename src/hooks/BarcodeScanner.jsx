import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();

        reader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
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
                style={{ width: "100%", borderRadius: 8 }}
            />
        </Box>
    );
}

export default BarcodeScanner;