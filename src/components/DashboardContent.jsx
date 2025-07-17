import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

export default function DashboardContent() {
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/today`,
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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        ยอดขายวันนี้: {totalSales.toLocaleString()} บาท
      </Typography>
      <Typography variant="h6" gutterBottom>
        รายการคำสั่งซื้อ
      </Typography>
      <List>
        {orders.map((order) => (
          <React.Fragment key={order.id}>
            <ListItem>
              <ListItemText
                primary={`Order #${order.id}`}
                secondary={`ลูกค้า: ${
                  order.customerName
                } - รวม: ${order.totalPrice.toLocaleString()} บาท`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
