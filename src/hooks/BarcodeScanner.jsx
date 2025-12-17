import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Box } from "@mui/material";

function BarcodeScanner({ onDetected, continuous = true, delay = 800 }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

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

    reader
      .decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        videoRef.current,
        async (result) => {
          if (!activeRef.current) return;
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
      )
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(console.error);

    return () => {
      activeRef.current = false;
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    // ✅ วิธีที่ถูกต้อง
    controlsRef.current?.stop();
    controlsRef.current = null;

    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }

    clearTimeout(timeoutRef.current);
  };

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
