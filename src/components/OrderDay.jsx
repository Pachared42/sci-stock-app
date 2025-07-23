import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function OrderDay() {
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setOrders(data);
        const total = data.reduce((sum, order) => sum + order.totalPrice, 0);
        setTotalSales(total);
      } catch (error) {
        console.error(error);
      }
    }
    fetchOrders();
  }, []);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 1 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "primary.main",
        }}
      >
        ยอดขายวันนี้: {totalSales.toLocaleString()} บาท
      </Typography>

      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 500, color: "text.secondary" }}
      >
        รายการคำสั่งซื้อ
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          ยังไม่มีคำสั่งซื้อในวันนี้
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>ชื่อลูกค้า</TableCell>
                <TableCell align="right">ราคารวม (บาท)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell align="right">
                    {order.totalPrice.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
