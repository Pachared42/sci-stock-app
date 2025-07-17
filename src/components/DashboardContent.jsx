import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";

export default function DashboardContent() {
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
    <Box sx={{ p: { xs: 2, md: 4 } }}>
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
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <List disablePadding>
            {orders.map((order, index) => (
              <React.Fragment key={order.id}>
                <ListItem sx={{ px: 3, py: 2 }}>
                  <ListItemText
                    primary={`Order #${order.id}`}
                    secondary={`ลูกค้า: ${
                      order.customerName
                    } - รวม: ${order.totalPrice.toLocaleString()} บาท`}
                  />
                </ListItem>
                {index !== orders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
