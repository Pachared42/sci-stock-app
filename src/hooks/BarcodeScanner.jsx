import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function BarcodeScanner({ onDetected, continuous = true, delay = 800 }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lockRef = useRef(false);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        reader.decodeFromConstraints(
            {
                video: { facingMode: { ideal: "environment" } },
            },
            videoRef.current,
            async (result) => {
                if (!result || lockRef.current) return;

                lockRef.current = true;
                await Promise.resolve(onDetected(result.getText()));

                if (continuous) {
                    setTimeout(() => (lockRef.current = false), delay);
                }
            }
        );

        return () => {
            reader.reset();
            const video = videoRef.current;
            video?.srcObject?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    return (
        <video
            ref={videoRef}
            playsInline
            muted
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }}
        />
    );
}


export default BarcodeScanner;