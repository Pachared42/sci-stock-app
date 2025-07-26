import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
} from "@mui/material";

export default function StockOutPage() {
    const [barcode, setBarcode] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleStockOut = async () => {
        try {
            setError(null);
            setResult(null);
            const res = await fetch(`/api/stock-out`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ barcode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "ตัดสต๊อกไม่สำเร็จ");
            setResult(data);
            setBarcode("");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ width: "100%", overflow: "hidden", px: { xs: 0, md: 1.5, lg: 1.5, xl: 20 } }}>
            <Typography variant="h5" gutterBottom>
                ตัดสต๊อกสินค้า
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="กรอกบาร์โค้ด"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    fullWidth
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        onClick={handleStockOut}
                        disabled={!barcode}
                    >
                        ตัดสต๊อก
                    </Button>
                </Box>
            </Stack>

            {result && (
                <Alert severity="success" sx={{ mt: 3 }}>
                    ตัดสต๊อกเรียบร้อย: {result.name} จำนวน {result.quantity}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
}