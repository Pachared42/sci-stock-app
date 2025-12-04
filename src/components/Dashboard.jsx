import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import shapeSquare from "../assets/shape-square.svg";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  YAxis,
  LabelList,
} from "recharts";
import {
  fetchTotalProducts,
  fetchLowStockProducts,
  fetchOutOfStockProducts,
  fetchMonthlySalesSummary,
} from "../api/dashboardStatsApi";

function Dashboard() {
  const theme = useTheme();
  const token = localStorage.getItem("token");

  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockCategoryData, setLowStockCategoryData] = useState([]);
  const [outOfStockCategoryData, setOutOfStockCategoryData] = useState([]);
  const [salesSummaryData, setSalesSummaryData] = useState([]);
  const [monthlySalesTotal, setMonthlySalesTotal] = useState(0);

  const dashboardRef = useRef(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // สินค้าทั้งหมด
        const totalData = await fetchTotalProducts(token);
        setTotalProducts(totalData?.["จำนวนสินค้าทั้งหมด"] ?? 0);

        // สินค้าทั้งหมด - แยกตามประเภท
        const catObj = totalData?.["จำนวนสินค้าตามประเภท"] ?? {};
        const catArray = Object.entries(catObj).map(([key, value]) => ({
          category: key,
          total: value,
        }));
        setCategoryData(catArray);

        // สินค้าใกล้หมดสต๊อก - แบบรวม
        const lowDataA = await fetchLowStockProducts(token);
        const lowStockObjA = lowDataA?.["สินค้าใกล้หมดสต๊อก"] ?? {};
        let lowCountA = 0;
        Object.values(lowStockObjA).forEach((arr) => {
          if (Array.isArray(arr)) lowCountA += arr.length;
        });
        setLowStockCount(lowCountA);

        // สินค้าใกล้หมดสต๊อก - แยกตามประเภท
        const lowDataB = await fetchLowStockProducts(token);
        const lowStockObjB = lowDataB?.["สินค้าใกล้หมดสต๊อก"] ?? {};
        let lowCountB = 0;
        const lowCategoryArray = Object.entries(lowStockObjB).map(
          ([key, arr]) => {
            const count = Array.isArray(arr) ? arr.length : 0;
            lowCountB += count;
            return { category: key, total: count };
          }
        );
        setLowStockCount(lowCountB);
        setLowStockCategoryData(lowCategoryArray);

        // สินค้าหมดสต๊อก - แบบรวม
        const outDataA = await fetchOutOfStockProducts(token);
        const outStockObjA = outDataA?.["สินค้าหมดสต๊อก"] ?? {};
        let outCountA = 0;
        Object.values(outStockObjA).forEach((arr) => {
          if (Array.isArray(arr)) outCountA += arr.length;
        });
        setOutOfStockCount(outCountA);

        // สินค้าหมดสต๊อก - แยกตามประเภท
        const outDataB = await fetchOutOfStockProducts(token);
        const outStockObjB = outDataB?.["สินค้าหมดสต๊อก"] ?? {};
        let outCountB = 0;
        const outCategoryArray = Object.entries(outStockObjB).map(
          ([key, arr]) => {
            const count = Array.isArray(arr) ? arr.length : 0;
            outCountB += count;
            return { category: key, total: count };
          }
        );
        setOutOfStockCount(outCountB);
        setOutOfStockCategoryData(outCategoryArray);

        const salesRes = await fetchMonthlySalesSummary(token);
        const month1ySales = salesRes?.["ยอดขายรายเดือนทั้งหมด"] ?? [];
        const totalSales = salesRes?.["ยอดขายรวมทั้งหมด"] ?? 0;

        setSalesSummaryData(month1ySales);
        setMonthlySalesTotal(totalSales);
      } catch (err) {
        console.error("โหลดข้อมูลแดชบอร์ดไม่สำเร็จ:", err);
      }
    };

    if (token) loadDashboardData();
  }, [token]);

  const statCards = useMemo(
    () => [
      {
        label: "สินค้าทั้งหมดในสต็อก",
        value: totalProducts,
        icon: <InventoryIcon sx={{ fontSize: 40 }} />,
        color: theme.palette.primary.contrastText,
        background: theme.palette.background.tealDark,
      },
      {
        label: "สินค้ากำลังจะหมด",
        value: lowStockCount,
        icon: <WarningAmberIcon sx={{ fontSize: 40 }} />,
        color: theme.palette.primary.contrastText,
        background: theme.palette.background.blueDark,
      },
      {
        label: "สินค้าหมดสต็อก",
        value: outOfStockCount,
        icon: <RemoveShoppingCartIcon sx={{ fontSize: 40 }} />,
        color: theme.palette.primary.contrastText,
        background: theme.palette.background.deepPinkDark,
      },
    ],
    [
      theme.palette,
      theme.palette.background,
      totalProducts,
      lowStockCount,
      outOfStockCount,
    ]
  );

  const salesData = useMemo(() => {
    if (!salesSummaryData || salesSummaryData.length === 0) return [];

    return salesSummaryData.map((item) => ({
      month: item.month,
      sales: item.total_sales,
    }));
  }, [salesSummaryData]);

  return (
    <Box
      ref={dashboardRef}
      sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}
    >
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
                aspectRatio: { xs: "2", sm: "1.5", md: "1" },
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
                      color: "#fff",
                      p: 2,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                      fontWeight: 600,
                      mt: 0.5,
                      letterSpacing: 0.5,
                      color: "#fff",
                    }}
                  >
                    {card.value}{" "}
                    {card.label === "สินค้ากำลังจะหมด" ||
                    card.label === "สินค้าหมดสต็อก"
                      ? "รายการ"
                      : "ชิ้น"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>

      {/* ยอดขายรายเดือน */}
      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 1,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 500,
              mb: 4,
              mt: 4,
              textAlign: "center",
            }}
          >
            ยอดขายรายเดือน
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2.5"
                vertical={false}
                stroke={theme.palette.text.secondary}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
                labelFormatter={(label) => `เดือน ${label}`}
                formatter={(value) => [
                  `฿${Number(value).toLocaleString()}`,
                  "ยอดขาย",
                ]}
              />
              <Line
                type="monomial"
                dataKey="sales"
                name="ยอดขาย"
                stroke={theme.palette.background.goldDark}
                strokeWidth={5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* สินค้าทั้งหมดแต่ละประเภท */}
      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 1,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 500, mb: 4, mt: 4, textAlign: "center" }}
          >
            สินค้าทั้งหมดในสต๊อกแต่ละประเภท
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2.5"
                vertical={false}
                stroke={theme.palette.text.secondary}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="category"
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.08)" }}
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
                formatter={(value) => [`${value} ชิ้น`, "จำนวนสินค้า"]}
              />
              <Bar
                dataKey="total"
                name="จำนวนสินค้า"
                fill={theme.palette.background.tealDark}
                radius={[10, 10, 0, 0]}
                barSize={50}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  fill={theme.palette.text.primary}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* สินค้าใกล้หมดแต่ละประเภท */}
      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 1,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 500, mb: 4, mt: 4, textAlign: "center" }}
          >
            สินค้าใกล้หมดในสต๊อกแต่ละประเภท
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={lowStockCategoryData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2.5"
                vertical={false}
                stroke={theme.palette.text.secondary}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="category"
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.08)" }}
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
                formatter={(value) => [`${value} รายการ`, "จำนวนสินค้าใกล้หมด"]}
              />
              <Bar
                dataKey="total"
                name="ใกล้หมด"
                fill={theme.palette.background.blueDark}
                radius={[10, 10, 0, 0]}
                barSize={50}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  fill={theme.palette.text.primary}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* สินค้าหมดแต่ละประเภท */}
      <Box mt={2}>
        <Card
          sx={{
            borderRadius: 5,
            p: 1,
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 500, mb: 4, mt: 4, textAlign: "center" }}
          >
            สินค้าหมดในสต๊อกแต่ละประเภท
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={outOfStockCategoryData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2.5"
                vertical={false}
                stroke={theme.palette.text.secondary}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="category"
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.08)" }}
                contentStyle={{
                  borderRadius: 15,
                  backgroundColor: theme.palette.background.paper,
                  border: "none",
                  boxShadow: "none",
                  textAlign: "center",
                }}
                formatter={(value) => [`${value} รายการ`, "จำนวนสินค้าหมด"]}
              />
              <Bar
                dataKey="total"
                name="หมด"
                fill={theme.palette.background.deepPinkDark}
                radius={[10, 10, 0, 0]}
                barSize={50}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  fill={theme.palette.text.primary}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;
