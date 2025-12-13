import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box, Button } from "@mui/material";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const streamRef = useRef(null);
    const scanningRef = useRef(true);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        scanningRef.current = true;

        reader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result) => {
                if (result && scanningRef.current) {
                    scanningRef.current = false;
                    onDetected(result.getText());

                    // 🔁 เปิดสแกนต่อหลัง 800ms
                    setTimeout(() => {
                        scanningRef.current = true;
                    }, 800);
                }
            }
        );

        return stopCamera;
    }, [onDetected]);

    const stopCamera = () => {
        scanningRef.current = false;

        if (readerRef.current) {
            readerRef.current.reset();
            readerRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "black", position: "relative" }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            <Box sx={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center" }}>
                <Button variant="contained" color="error" onClick={handleClose}>
                    ปิดกล้อง
                </Button>
            </Box>
        </Box>
    );
}

export default BarcodeScanner;