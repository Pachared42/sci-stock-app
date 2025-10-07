import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
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
  Grid,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useAuth } from "../context/AuthProvider";
import {
  sellStockOut,
  getProductByBarcode,
  createDailyPayment,
} from "../api/sellStockOutApi";

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

const headCellsDailyPayment = [
  { id: "item_name", label: "รายการ", width: "60%" },
  { id: "item_price", label: "ราคา", width: "20%" },
  { id: "item_manage", label: "จัดการ", width: "20%" },
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

function EnhancedTableHeadDailyPayment({ order, orderBy, onRequestSort }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        {headCellsDailyPayment.map((headCell) => (
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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [icePrice, setIcePrice] = useState("10");
  const [otherName, setOtherName] = useState("");
  const [otherPrice, setOtherPrice] = useState("");
  const [dailyPayment, setDailyPayment] = useState("50");

  const [stockRows, setStockRows] = useState(() => {
    const stored = localStorage.getItem("stockOutItems");
    return stored ? JSON.parse(stored) : [];
  });

  const [dailyRows, setDailyRows] = useState(() => {
    const stored = localStorage.getItem("dailyPayments");
    return stored ? JSON.parse(stored) : [];
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddDailyRow = (name, price) => {
    const numPrice = Number(price);
    if (!name || isNaN(numPrice) || numPrice < 0) {
      showSnackbar("กรุณากรอกชื่อและจำนวนเงินที่ถูกต้อง", "error");
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

    showSnackbar(`เพิ่มรายการ "${name}" จำนวน ${numPrice} บาท แล้ว`, "success");

    if (name === "เงินค่าจ้างรายวันพนักงาน") setDailyPayment("");
    else if (name === "ค่าน้ำแข็ง") setIcePrice("");
    else setOtherName("");
    setOtherPrice("");
  };

  const handleConfirm = async (id) => {
    if (!token) return showSnackbar("กรุณาเข้าสู่ระบบ", "error");

    const row = dailyRows.find((r) => r.id === id);
    if (!row) return showSnackbar("ไม่พบข้อมูลรายการ", "error");

    const amount = Number(row.item_price);
    if (isNaN(amount) || amount <= 0)
      return showSnackbar("จำนวนเงินไม่ถูกต้อง", "error");

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

      showSnackbar(data.message || "ยืนยันรายการสำเร็จ!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteDailyRow = (id) => {
    setDailyRows((prev) => {
      const updated = prev.filter((row) => row.id !== id);
      localStorage.setItem("dailyPayments", JSON.stringify(updated));
      return updated;
    });

    showSnackbar("ลบรายการเรียบร้อยแล้ว", "info");
  };

  const handleStockOut = async () => {
    if (!barcode) {
      showSnackbar("กรุณากรอก barcode", "warning");
      return;
    }
    if (!token) {
      showSnackbar("กรุณาเข้าสู่ระบบ", "warning");
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

      showSnackbar(
        `เพิ่มสินค้า ${product.product_name} เรียบร้อยแล้ว`,
        "success"
      );
      setBarcode("");
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, "error");
    }
  };

  const handleQuantityChange = (barcode, value) => {
    setStockRows((prevRows) =>
      prevRows.map((row) =>
        row.barcode === barcode
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

    showSnackbar("ลบรายการเรียบร้อยแล้ว", "info");
  };

  const handleDeductStock = async (id) => {
    if (!token) {
      showSnackbar("กรุณาเข้าสู่ระบบ", "warning");
      return;
    }

    const product = stockRows.find((row) => row.id === id);
    if (!product) {
      showSnackbar("ไม่พบสินค้าในรายการ", "error");
      return;
    }

    if (!product.quantity || product.quantity <= 0) {
      showSnackbar("กรุณาใส่จำนวนที่จะตัดสต๊อก", "warning");
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

      showSnackbar(result.message || "ตัดสต๊อกสำเร็จ", "success");
    } catch (err) {
      console.error("Error จาก API:", err);
      showSnackbar(err.message || "เกิดข้อผิดพลาด", "error");
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

  const visibleDailyRows = useMemo(
    () =>
      stableSort(dailyRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [dailyRows, order, orderBy, page, rowsPerPage]
  );

  const visibleStockRows = useMemo(
    () =>
      stableSort(stockRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [stockRows, order, orderBy, page, rowsPerPage]
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 },
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          mt: 3,
          justifyContent: "center",
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {/* กล่องค่าจ้างรายวัน */}
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              px: 7.8,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom textAlign="center">
              เงินค่าจ้างรายวันพนักงาน
            </Typography>

            <TextField
              fullWidth
              placeholder="กรอกเงินค่าจ้างรายวัน"
              size="small"
              value={dailyPayment}
              onChange={(e) => setDailyPayment(e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              InputProps={{ sx: { borderRadius: 2, height: 40 } }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 0,
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              disabled={
                !dailyPayment ||
                isNaN(Number(dailyPayment)) ||
                Number(dailyPayment) <= 0
              }
              onClick={() => {
                handleAddDailyRow("ค่าจ้างรายวัน", dailyPayment);
                setDailyPayment("");
              }}
              sx={{
                borderRadius: 2,
                color: theme.palette.text.hint,
                height: 40,
              }}
            >
              เพิ่ม
            </Button>
          </Paper>
        </Grid>

        {/* กล่องค่าน้ำแข็ง */}
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              px: 7.8,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom textAlign="center">
              ค่าน้ำแข็ง
            </Typography>

            <TextField
              fullWidth
              placeholder="กรอกค่าน้ำแข็ง"
              size="small"
              value={icePrice}
              onChange={(e) => setIcePrice(e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              InputProps={{ sx: { borderRadius: 2, height: 40 } }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 0,
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              disabled={
                !icePrice || isNaN(Number(icePrice)) || Number(icePrice) <= 0
              }
              onClick={() => {
                handleAddDailyRow("ค่าน้ำแข็ง", icePrice);
                setIcePrice("");
              }}
              sx={{
                borderRadius: 2,
                color: theme.palette.text.hint,
                height: 40,
              }}
            >
              เพิ่ม
            </Button>
          </Paper>
        </Grid>

        {/* กล่องอื่นๆ */}
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              px: 7.8,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom textAlign="center">
              อื่นๆ
            </Typography>

            <TextField
              fullWidth
              placeholder="ระบุชื่อรายการ"
              size="small"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ sx: { borderRadius: 2, height: 40 } }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="กรอกราคา"
                size="small"
                value={otherPrice}
                onChange={(e) => setOtherPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                InputProps={{ sx: { borderRadius: 2, height: 40 } }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  min: 0,
                }}
              />
              <Button
                variant="contained"
                disabled={
                  !otherName ||
                  !otherPrice ||
                  isNaN(Number(otherPrice)) ||
                  Number(otherPrice) <= 0
                }
                onClick={() => {
                  handleAddDailyRow(otherName, otherPrice);
                  setOtherName("");
                  setOtherPrice("");
                }}
                sx={{
                  borderRadius: 2,
                  color: theme.palette.text.hint,
                  whiteSpace: "nowrap",
                  px: 3,
                  height: 40,
                }}
              >
                เพิ่ม
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", mb: 10 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <EnhancedTableToolbar
            title="รายการจ่ายรายวัน"
            sx={{ textAlign: "left" }}
          />

          <Typography variant="caption" sx={{ textAlign: "right", pr: 2 }}>
            แสดง {dailyRows.length} รายการ
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
            <EnhancedTableHeadDailyPayment
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
              {dailyRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    ยังไม่มีรายการ
                  </TableCell>
                </TableRow>
              ) : (
                visibleDailyRows.map((row, index) => (
                  <TableRow hover key={row.id ?? row.barcode ?? index}>
                    <TableCell title={row.item_name}>{row.item_name}</TableCell>
                    <TableCell>{row.item_price} บาท</TableCell>

                    {/* ปุ่มจัดการ */}
                    <TableCell sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleConfirm(row.id)}
                      >
                        ยืนยัน
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteDailyRow(row.id)}
                      >
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={3} />
                </TableRow>
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
            count={rows.length}
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

      <Stack spacing={2}>
        <Box sx={{ position: "relative", width: "100%" }}>
          <TextField
            label="กรอกบาร์โค้ด"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            fullWidth
            InputProps={{ sx: { borderRadius: 4 } }}
          />
          <Box sx={{ bgcolor: theme.palette.background.chartBackground }}>
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
                color: theme.palette.text.hint,
              }}
            >
              ค้นหาสินค้า
            </Button>
          </Box>
        </Box>
      </Stack>

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
            count={rows.length}
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
