import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  TablePagination,
  Paper,
  Snackbar,
  Dialog,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../context/AuthProvider";
import {
  sellStockOut,
  getProductByBarcode,
  createDailyPayment,
} from "../api/sellStockOutApi";
import BarcodeScanner from "../hooks/BarcodeScanner";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilized = array.map((el, idx) => [el, idx]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

const headCellsStockOut = [
  { id: "product_name", label: "ชื่อสินค้า", width: "20%" },
  { id: "image_url", label: "รูปภาพ", width: "15%" },
  { id: "barcode", label: "BARCODE", width: "15%" },
  { id: "cost", label: "ราคาทุน", width: "10%" },
  { id: "price", label: "ราคาขาย", width: "10%" },
  { id: "manage", label: "ตัดสต๊อกสินค้า", width: "30%" },
];

function EnhancedTableHeadStockOut({ order, orderBy, onRequestSort }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        {headCellsStockOut.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            sx={{
              width: headCell.width,
              whiteSpace: "nowrap",
              px: 2,
              backgroundColor: `${theme.palette.background.chartBackground} !important`,
            }}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ title }) {
  return (
    <Toolbar
      sx={{
        px: { xs: 1, sm: 2 },
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 1,
        position: { xs: "sticky", sm: "static" },
        top: 0,
        backgroundColor: "background.paper",
        zIndex: 1100,
      }}
    >
      <Typography sx={{ flex: "1 1 100%" }} variant="h6">
        {title}
      </Typography>
    </Toolbar>
  );
}

function StockOutPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const token = user?.token;

  const [barcode, setBarcode] = useState("");
  const [stockRows, setStockRows] = useState(() => {
    const stored = localStorage.getItem("stockOutItems");
    return stored ? JSON.parse(stored) : [];
  });

  const [dailyRows, setDailyRows] = useState(() => {
    const stored = localStorage.getItem("dailyPayments");
    return stored ? JSON.parse(stored) : [];
  });

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openCamera, setOpenCamera] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAddDailyRow = (name, price) => {
    const numPrice = Number(price);
    if (!name || isNaN(numPrice) || numPrice < 0) {
      setSnackbar({
        open: true,
        message: "กรุณากรอกชื่อรายการและราคาที่ถูกต้อง",
        severity: "error",
      });
      return;
    }

    const newRow = {
      id: Date.now(),
      item_name: name,
      item_price: numPrice,
    };

    setDailyRows((prev) => {
      const updated = [...prev, newRow];
      localStorage.setItem("dailyPayments", JSON.stringify(updated));
      return updated;
    });

    setSnackbar({
      open: true,
      message: `เพิ่มรายการ "${name}" ราคา ${numPrice} บาท สำเร็จ`,
      severity: "success",
    });
  };

  const handleConfirm = async (id) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "กรุณาเข้าสู่ระบบ",
        severity: "warning",
      });
      return;
    }

    const row = dailyRows.find((r) => r.id === id);
    if (!row) {
      setSnackbar({
        open: true,
        message: "ไม่พบรายการที่เลือก",
        severity: "error",
      });
      return;
    }

    const amount = Number(row.item_price);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: "ราคาของรายการไม่ถูกต้อง",
        severity: "error",
      });
      return;
    }

    try {
      const data = await createDailyPayment(token, {
        item_name: row.item_name,
        amount: amount,
        payment_date: new Date().toISOString().split("T")[0],
      });

      console.log("ยืนยันสำเร็จ:", data);

      setDailyRows((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        localStorage.setItem("dailyPayments", JSON.stringify(updated));
        return updated;
      });

      setSnackbar({
        open: true,
        message: `ยืนยันรายการ "${row.item_name}" ราคา ${amount} บาท สำเร็จ`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการยืนยัน",
        severity: "error",
      });
    }
  };

  const handleDeleteDailyRow = (id) => {
    setDailyRows((prev) => {
      const updated = prev.filter((row) => row.id !== id);
      localStorage.setItem("dailyPayments", JSON.stringify(updated));
      return updated;
    });

    setSnackbar({
      open: true,
      message: "ลบรายการเรียบร้อยแล้ว",
      severity: "success",
    });
  };

  const handleStockOut = async () => {
    if (!barcode) {
      setSnackbar({
        open: true,
        message: "กรุณากรอกบาร์โค้ด",
        severity: "warning",
      });
      return;
    }
    if (!token) {
      setSnackbar({
        open: true,
        message: "กรุณาเข้าสู่ระบบ",
        severity: "warning",
      });
      return;
    }

    try {
      const product = await getProductByBarcode(token, barcode);
      console.log(product.product_name);

      setStockRows((prev) => {
        const updated = [
          ...prev,
          {
            id: product.id,
            product_name: product.product_name,
            barcode: product.barcode,
            cost: product.cost,
            price: product.price,
            image_url: product.image_url,
            quantity: 0,
          },
        ];
        localStorage.setItem("stockOutItems", JSON.stringify(updated));
        return updated;
      });

      setSnackbar({
        open: true,
        message: `เพิ่มสินค้า "${product.product_name}" สำเร็จ`,
        severity: "success",
      });
      setBarcode("");
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการค้นหาสินค้า",
        severity: "error",
      });
    }
  };

  const handleQuantityChange = (barcodeVal, value) => {
    setStockRows((prevRows) =>
      prevRows.map((row) =>
        row.barcode === barcodeVal
          ? { ...row, quantity: value === "" ? "" : Number(value) }
          : row
      )
    );
  };

  const handleRemoveRow = (id) => {
    setStockRows((prev) => {
      const updated = prev.filter((row) => row.id !== id);
      localStorage.setItem("stockOutItems", JSON.stringify(updated));
      return updated;
    });

    setSnackbar({
      open: true,
      message: "ลบรายการสินค้าเรียบร้อยแล้ว",
      severity: "success",
    });
  };

  const handleDeductStock = async (id) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "กรุณาเข้าสู่ระบบ",
        severity: "warning",
      });
      return;
    }

    const product = stockRows.find((row) => row.id === id);
    if (!product) {
      setSnackbar({
        open: true,
        message: "ไม่พบสินค้าที่เลือก",
        severity: "error",
      });
      return;
    }

    if (!product.quantity || product.quantity <= 0) {
      setSnackbar({
        open: true,
        message: "กรุณากรอกจำนวนสินค้าที่ต้องการตัดสต๊อก",
        severity: "warning",
      });
      return;
    }

    try {
      const result = await sellStockOut(token, {
        barcode: product.barcode,
        quantity: product.quantity,
      });

      console.log("ตัดสต๊อกสำเร็จจาก API:", result);

      setStockRows((prev) => {
        const updated = prev.filter((row) => row.id !== id);
        localStorage.setItem("stockOutItems", JSON.stringify(updated));
        console.log("อัปเดต LocalStorage:", updated);
        return updated;
      });

      setSnackbar({
        open: true,
        message: `ตัดสต๊อกสินค้า "${product.product_name}" จำนวน ${product.quantity} ชิ้น สำเร็จ`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error จาก API:", err);
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการตัดสต๊อกสินค้า",
        severity: "error",
      });
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleStockRows = useMemo(
    () =>
      stableSort(stockRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [stockRows, order, orderBy, page, rowsPerPage]
  );

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 },
      }}
    >
      <Box sx={{ position: "relative", width: "100%" }}>
        <TextField
          label="กรอกบาร์โค้ด"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          fullWidth
          InputProps={{ sx: { borderRadius: 4 } }}
        />
        <Box>
          <Button
            variant="contained"
            onClick={() => setOpenCamera(true)}
            sx={{
              position: "absolute",
              top: "50%",
              right: 120,
              transform: "translateY(-50%)",
              zIndex: 10,
              borderRadius: 2,
            }}
          >
            <CameraAltIcon />
          </Button>
          <Button
            variant="contained"
            onClick={handleStockOut}
            disabled={!barcode}
            sx={{
              position: "absolute",
              top: "50%",
              right: 10,
              transform: "translateY(-50%)",
              zIndex: 10,
              whiteSpace: "nowrap",
              borderRadius: 2,
              backgroundColor: theme.palette.background.ButtonDay,
              color: theme.palette.text.hint,
            }}
          >
            ค้นหาสินค้า
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openCamera}
        onClose={() => setOpenCamera(false)}
        fullScreen
      >
        <BarcodeScanner
          onDetected={(code) => {
            setBarcode(code);
            setOpenCamera(false);
          }}
          onClose={() => setOpenCamera(false)}
        />
      </Dialog>

      {/* table */}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <EnhancedTableToolbar
            title="รายการสินค้าที่ตัดสต๊อก"
            sx={{ textAlign: "left" }}
          />

          <Typography variant="caption" sx={{ textAlign: "right", pr: 2 }}>
            แสดง {stockRows.length} รายการ
          </Typography>
        </Box>
        <TableContainer
          sx={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            overflowX: "auto",
            width: "100%",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              height: 6,
            },
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Table
            sx={{
              minWidth: { xs: "300%", sm: 850 },
              tableLayout: "fixed",
            }}
            stickyHeader
          >
            <EnhancedTableHeadStockOut
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />

            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)",
                },
              }}
            >
              {stockRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีรายการสินค้า
                  </TableCell>
                </TableRow>
              ) : (
                visibleStockRows.map((row, index) => (
                  <TableRow hover key={`${row.barcode}-${index}`}>
                    <TableCell>{row.product_name}</TableCell>
                    <TableCell>
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          style={{ width: 75, height: 75, objectFit: "cover" }}
                          alt={row.product_name}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{row.barcode}</TableCell>
                    <TableCell>{row.cost} บาท</TableCell>
                    <TableCell>{row.price} บาท</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TextField
                          type="number"
                          size="small"
                          value={row.quantity === "" ? "" : row.quantity ?? 0}
                          onChange={(e) =>
                            handleQuantityChange(row.barcode, e.target.value)
                          }
                          inputProps={{ min: 0 }}
                          sx={{
                            width: "80px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              padding: "2px 6px",
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "2.5px 6px",
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleDeductStock(row.id)}
                        >
                          ตัดสต๊อก
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRemoveRow(row.id)}
                          sx={{
                            borderRadius: 2,
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main,
                            "&:hover": {
                              backgroundColor: theme.palette.error.light,
                              color: "#fff",
                            },
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          ลบ
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            backgroundColor: theme.palette.background.chartBackground,
            py: 3,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={stockRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="แสดงต่อหน้า:"
            sx={{
              px: { xs: 1, sm: 2 },
              ".MuiTablePagination-spacer": { display: "none" },
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontSize: { xs: "0.8rem", sm: "1rem" },
                whiteSpace: "nowrap",
              },
              backgroundColor: "transparent",
              zIndex: 1100,
              minWidth: 300,
            }}
          />
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: { xs: "50%", sm: "70%", md: "100%" },
            mx: "auto",
            borderRadius: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StockOutPage;