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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";

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

const headCells = [
  { id: "product_name", label: "ชื่อสินค้า", width: "20%" },
  { id: "image_url", label: "รูปภาพ", width: "20%" },
  { id: "barcode", label: "BARCODE", width: "15%" },
  { id: "price", label: "ราคาขาย", width: "10%" },
  { id: "cost", label: "ราคาต้นทุน", width: "10%" },
  { id: "manage", label: "ตัดสต๊กอกสินค้า", width: "30%" },
];

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            sx={{
              width: headCell.width,
              whiteSpace: "nowrap",
              px: 1,
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
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

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
EnhancedTableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
};

export default function StockOutPage() {
  const theme = useTheme();
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
      setRows((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
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

  const visibleRows = useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [rows, order, orderBy, page, rowsPerPage]
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
        spacing={2}
        sx={{
          mt: 3,
          mb: 3,
          justifyContent: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          borderRadius: 4,
          p: 2,
          width: "100%",
        }}
      >
        {/* กล่องเงินค่าจ้างรายวันพนักงาน */}
        <Grid xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              pt: 4,
              pb: 4,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              เงินค่าจ้างรายวันพนักงาน
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="กรอกเงินค่าจ้างรายวัน"
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth>
              เพิ่ม
            </Button>
          </Paper>
        </Grid>

        {/* กล่องค่าน้ำแข็ง */}
        <Grid xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              pt: 4,
              pb: 4,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              ค่าน้ำแข็ง
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="กรอกราคา"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Button variant="contained" fullWidth>
              เพิ่ม
            </Button>
          </Paper>
        </Grid>

        {/* กล่องอื่นๆ */}
        <Grid xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              pt: 4,
              pb: 4,
              backgroundColor: theme.palette.background.chartBackground,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              อื่นๆ
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="ระบุชื่อ"
                size="small"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                type="number"
                placeholder="กรอกราคา"
                size="small"
                sx={{ flex: 1 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Button variant="contained">เพิ่ม</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* barcode input */}
      <Typography variant="h5" gutterBottom>
        ตัดสต๊อกสินค้า
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ position: "relative", width: "100%" }}>
          <TextField
            label="กรอกบาร์โค้ด"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            fullWidth
            InputProps={{ sx: { borderRadius: 4 } }}
          />

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
            }}
          >
            ค้นหาสินค้า
          </Button>
        </Box>
      </Stack>

      {result && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ตัดสต๊อกเรียบร้อย: {result.product_name} จำนวน {result.quantity}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {/* table */}
      <Paper sx={{ width: "100%", mb: 2, mt: 4 }}>
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
            แสดง {rows.length} รายการ
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
            <EnhancedTableHead
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
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีรายการสินค้า
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => (
                  <TableRow hover key={row.id ?? row.barcode ?? index}>
                    <TableCell
                      sx={{ width: "20%", px: 1 }}
                      title={row.product_name}
                    >
                      {row.product_name}
                    </TableCell>
                    <TableCell sx={{ width: "20%", px: 1 }}>
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt={row.product_name}
                          style={{
                            width: 75,
                            height: 75,
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell sx={{ width: "15%", px: 1 }}>
                      {row.barcode}
                    </TableCell>
                    <TableCell sx={{ width: "10%", px: 1 }}>
                      {row.price} บาท
                    </TableCell>
                    <TableCell sx={{ width: "10%", px: 1 }}>
                      {row.cost} บาท
                    </TableCell>
                    <TableCell sx={{ width: "30%", px: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={row.quantity || ""} // กำหนดค่าเริ่มต้น
                        onClick={(e) => e.stopPropagation()} // กันไม่ให้ไป trigger row click
                        onChange={(e) =>
                          handleQuantityChange(row.id, e.target.value)
                        } // ฟังก์ชันอัปเดตจำนวน
                        sx={{ width: "100px" }} // ปรับขนาดได้ตามต้องการ
                        inputProps={{ min: 0 }} // กันไม่ให้กรอกค่าติดลบ
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
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
    </Box>
  );
}
