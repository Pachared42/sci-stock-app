import React, { useState, useEffect, useMemo, forwardRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, Typography, Paper, Snackbar, Skeleton } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { visuallyHidden } from "@mui/utils";

import {
  fetchProductsByCategory,
} from "../api/productApi";

function createData(id, name, imgUrl, barcode, priceSell, priceCost, stockQty, stockMin, category) { return { id, name, imgUrl, barcode, priceSell, priceCost, stockQty, stockMin, category }; }

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: "name", label: "ชื่อพนักงาน", width: "20%" },
  { id: "checkIn", label: "เช็คอินเข้า", width: "15%" },
  { id: "checkOut", label: "เช็คเอ้าท์ออก", width: "15%" },
  { id: "checkInImage", label: "รูปเช็คอินเข้า", width: "25%" },
  { id: "checkOutImage", label: "รูปเช็คเอ้าท์ออก", width: "25%" },
];

function EnhancedTableHead(props) {
  const {
    order,
    orderBy,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, whiteSpace: "nowrap", px: 1 }}
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

function EnhancedTableToolbar(props) {
  return (
    <Toolbar
      sx={{
        px: { xs: 1, sm: 2 },
        flexWrap: "wrap",
        justifyContent: { xs: "center", sm: "space-between" },
        gap: 1,
        position: { xs: "sticky", sm: "static" },
        top: 0,
        backgroundColor: "background.paper",
        zIndex: 1100,
      }}
    >
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h5"
        id="tableTitle"
        component="div"
      >
        ข้อมูลพนักงานเช็คอินทั้งหมด
      </Typography>
    </Toolbar>
  );
}

function EmployeeCheckInList() {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  useEffect(() => {
    const categories = ["dried_food", "soft_drink", "stationery", "snack", "fresh_food"];

    const loadAllData = async () => {
      try {
        setLoading(true);
        const allData = await Promise.all(
          categories.map((category) => fetchProductsByCategory(category))
        );
        const merged = allData.flat();

        const formatted = merged.map((item, index) =>
          createData(
            index + 1,
            item.product_name,
            item.image_url,
            item.barcode,
            item.price,
            item.cost,
            item.stock,
            item.reorder_level,
            item.category
          )
        );
        setRows(formatted);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "ไม่สามารถโหลดข้อมูลสินค้าได้",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Select All
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Select single row
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // Sort
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      if (
        filter === "lowStock" &&
        !(row.stockQty > 0 && row.stockQty < row.stockMin)
      ) {
        return false;
      }
      if (filter === "outOfStock" && row.stockQty > 0) {
        return false;
      }

      if (!search) {
        return true;
      }

      const nameMatch = row.name.toLowerCase().includes(search);
      const barcodeMatch = String(row.barcode).toLowerCase().includes(search);

      return nameMatch || barcodeMatch;
    });
  }, [rows, filter, searchText]);

  // --- ฟังก์ชันช่วยตรวจสอบสต็อกต่ำและหมด ---
  const isOutOfStock = (product) => product.stockQty === 0;
  const isLowStock = (product) => product.stockQty > 0 && product.stockQty <= 10;

  // --- การคำนวณแถวว่างสำหรับ pagination ---
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  // --- แถวที่แสดงตามหน้าปัจจุบัน (คำนวณ sort + pagination) ---
  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, rows]
  );

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        px: { xs: 0, md: 1.5, lg: 1.5, xl: 20 },
      }}
    >
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar />

        <TableContainer
          sx={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
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
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "2px dashed rgba(153, 153, 153, 0.3)",
                },
              }}
            > {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="text" width="100%" />
                  </TableCell>

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="rounded" width={100} height={50} />
                  </TableCell>

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="text" width="100%" />
                  </TableCell>

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="text" width="100%" />
                  </TableCell>

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="text" width="100%" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ยังไม่มีรายการเช็คชื่อ
                </TableCell>
              </TableRow>
            ) : /* กรณีข้อมูลมีแล้วแต่กรองแล้วไม่มีข้อมูลแสดง */
              filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    ไม่มีสินค้าตามเงื่อนไขที่เลือก
                  </TableCell>
                </TableRow>
              ) : (
                // แสดงแถวสินค้า filtered + sort + pagination
                filteredRows
                  .sort(getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = selected.includes(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{
                          cursor: "pointer",
                          bgcolor: isOutOfStock(row)
                            ? "rgba(255, 0, 0, 0.30)"
                            : isLowStock(row)
                              ? "rgba(255, 165, 0, 0.30)"
                              : "inherit",
                        }}
                      >
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            px: 1,
                          }}
                          title={row.name}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          <img
                            src={row.imgUrl}
                            alt={row.name}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          {row.barcode}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          {row.priceSell} บาท
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          {row.priceCost} บาท
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}

              {emptyRows > 0 && rows.length > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
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
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredRows.length}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
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

export default EmployeeCheckInList;