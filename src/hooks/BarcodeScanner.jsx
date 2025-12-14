import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
    BarcodeFormat,
    DecodeHintType,
} from "@zxing/library";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function BarcodeScanner({ onDetected, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const scannedRef = useRef(false);

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
                if (result && !scannedRef.current) {
                    scannedRef.current = true;

                    const barcode = result.getText();
                    onDetected(barcode); // ✅ แค่แจ้ง parent

                    reader.reset(); // หยุดกล้องพอ
                }
            }
        );

        return () => {
            reader.reset();
        };
    }, []);

    const handleClose = () => {
        readerRef.current?.reset();
        onClose?.(); // ✅ ใช้เฉพาะตอนผู้ใช้กดปิด
    };

    return (
        <Box sx={{ position: "relative", width: "100%" }}>
            <IconButton
                onClick={handleClose}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                }}
            >
                <CloseIcon />
            </IconButton>

            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    clipPath: "inset(25% 10% 25% 10%)",
                }}
            />
        </Box>
    );
}


export default BarcodeScanner;