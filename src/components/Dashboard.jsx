import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import shapeSquare from "../assets/shape-square.svg";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const theme = useTheme();

  const statCards = useMemo(() => [
    {
      label: "ออเดอร์วันนี้",
      value: "0",
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.redDark,
    },
    {
      label: "รายได้ต่อวัน",
      value: "0",
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.purpleDark,
    },
    {
      label: "รายได้ต่อเดือน",
      value: "0",
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.goldDark,
    },
    {
      label: "รายได้ต่อปี",
      value: "0",
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.orangeDark,
    },
    {
      label: "สินค้าในสต็อก",
      value: "0",
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.tealDark,
    },
    {
      label: "สินค้ากำลังจะหมด",
      value: "0",
      icon: <WarningAmberIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.blueDark,
    },
    {
      label: "สินค้าหมดสต็อก",
      value: "0",
      icon: <RemoveShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.contrastText,
      background: theme.palette.background.deepPinkDark,
    },
  ], [theme.palette, theme.palette.background]);
  
  const salesData = useMemo(() => [
    { month: "ม.ค.", sales: 0 },
    { month: "ก.พ.", sales: 50 },
    { month: "มี.ค.", sales: 0 },
    { month: "เม.ย.", sales: 250 },
    { month: "พ.ค.", sales: 300 },
    { month: "มิ.ย.", sales: 222 },
    { month: "ก.ค.", sales: 350 },
    { month: "ส.ค.", sales: 90 },
    { month: "ก.ย.", sales: 320 },
    { month: "ต.ค.", sales: 290 },
    { month: "พ.ย.", sales: 310 },
    { month: "ธ.ค.", sales: 370 },
  ], []);
  
  const sales = useMemo(() => [
    { month: "ม.ค.", inbound: 50, outbound: 30 },
    { month: "ก.พ.", inbound: 70, outbound: 45 },
    { month: "มี.ค.", inbound: 60, outbound: 40 },
    { month: "เม.ย.", inbound: 90, outbound: 65 },
    { month: "พ.ค.", inbound: 80, outbound: 70 },
    { month: "มิ.ย.", inbound: 95, outbound: 85 },
    { month: "ก.ค.", inbound: 70, outbound: 60 },
    { month: "ส.ค.", inbound: 85, outbound: 75 },
    { month: "ก.ย.", inbound: 90, outbound: 80 },
    { month: "ต.ค.", inbound: 75, outbound: 70 },
    { month: "พ.ย.", inbound: 80, outbound: 75 },
    { month: "ธ.ค.", inbound: 10, outbound: 90 },
  ], []);  

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}>
      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        {statCards.map((card, index) => (
          <Box key={index}>
            <Card
              sx={{
                borderRadius: 5,
                aspectRatio: {
                  xs: "2",
                  sm: "1.5",
                  md: "1",
                },
                backgroundColor: card.background,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: -20,
                  width: 380,
                  height: 380,
                  zIndex: 0,
                  opacity: 0.5,
                  backgroundColor: card.color,
                  filter: "brightness(1)",
                  mask: `url(${shapeSquare}) center center / cover no-repeat`,
                  WebkitMask: `url(${shapeSquare}) center center / cover no-repeat`,
                }}
              />

              <CardContent sx={{ zIndex: 1 }}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                >
                  <Box
                    sx={{
                      bgcolor: card.color,
                      color: "#ffffff",
                      p: 2,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "none",
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    color="text.disabled"
                    sx={{ fontWeight: 500, mb: 0.5 }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      mt: 0.5,
                      letterSpacing: 0.5,
                      color: "#ffffff",
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>

      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 4,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "500", mb: 4, textAlign: "center" }}
          >
            ยอดขายรายเดือน
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                horizontal={true}
                stroke="#333333"
                strokeDasharray={3}
              />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                padding={{ left: 10, right: 5 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="ยอดขาย"
                stroke="#C2185B"
                strokeWidth={5}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 4,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "500", mb: 4, textAlign: "center" }}
          >
            สินค้าเข้า-ออกรายเดือน
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={sales}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                horizontal={true}
                stroke="#333333"
                strokeDasharray="3"
              />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                padding={{ left: 10, right: 5 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
              />
              <Line
                type="monotone"
                dataKey="inbound"
                name="สินค้าเข้า"
                stroke="#1976d2"
                strokeWidth={5}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="outbound"
                name="สินค้าออก"
                stroke={theme.palette.error.main}
                strokeWidth={5}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default React.memo(Dashboard);
