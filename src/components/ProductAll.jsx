import { useState, useEffect, useMemo, } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { visuallyHidden } from "@mui/utils";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { forwardRef } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Skeleton from '@mui/material/Skeleton';

import {
  fetchProductsByCategory,
} from "../api/productApi";

function createData(
  id,
  name,
  imgUrl,
  barcode,
  priceSell,
  priceCost,
  stockQty,
  stockMin,
  category
) {
  return {
    id,
    name,
    imgUrl,
    barcode,
    priceSell,
    priceCost,
    stockQty,
    stockMin,
    category,
  };
}

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
  { id: "name", label: "ชื่อสินค้า", width: "15%" },
  { id: "img", label: "รูปภาพ", width: "15%" },
  { id: "barcode", label: "BARCODE", width: "15%" },
  { id: "priceSell", label: "ราคาขาย", width: "10%" },
  { id: "priceCost", label: "ราคาต้นทุน", width: "10%" },
  { id: "stockQty", label: "จำนวนสต็อก", width: "10%" },
  { id: "stockMin", label: "สต็อกต่ำสุด", width: "10%" },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: 48 }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all products",
            }}
          />
        </TableCell>
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
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected } = props;
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
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} เลือกแล้ว
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h5"
          id="tableTitle"
          component="div"
        >
          สินค้าทุกประเภท
        </Typography>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

function ProductAll() {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
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
        <EnhancedTableToolbar numSelected={selected.length} />
        <Box
          sx={{
            p: "24px 24px 4px 24px",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 3,
            backgroundColor: theme.palette.background.chartBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {/* ซ้าย: Filter Dropdown */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              justifyContent: "flex-start",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              size="ls"
              sx={{ px: 1.8, py: 1, borderRadius: 2.5 }}
              startIcon={<FilterListIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              fullWidth={false}
              variant="outlined"
            >
              {filter === "all" && "กรองทั้งหมด"}
              {filter === "lowStock" && "สินค้าเหลือน้อย"}
              {filter === "outOfStock" && "สินค้าหมด"}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={filterOpen}
              onClose={() => setFilterAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setFilter("all");
                  setFilterAnchorEl(null);
                }}
              >
                ทั้งหมด
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilter("lowStock");
                  setFilterAnchorEl(null);
                }}
              >
                สินค้าเหลือน้อย
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilter("outOfStock");
                  setFilterAnchorEl(null);
                }}
              >
                สินค้าหมด
              </MenuItem>
            </Menu>
          </Box>

          {/* ขวา: Search */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <TextField
              size="small"
              placeholder="ค้นหาชื่อหรือบาร์โค้ด..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: { xs: "100%", sm: 500 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ ml: 1 }} color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  px: 0.5,
                  py: 0.3,
                },
              }}
              inputProps={{
                style: {
                  fontWeight: 500,
                },
              }}
            />
          </Box>
        </Box>

        <TableContainer
          sx={{
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
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredRows.length}
            />
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)",
                },
              }}
            > {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <Skeleton animation="wave"
                      variant="rounded"
                      width={24}
                      height={24}
                      sx={{ m: 1.5 }}
                    />
                  </TableCell>

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
                <TableCell colSpan={8} align="center">
                  ยังไม่มีรายการสินค้า
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
                        <TableCell padding="checkbox" sx={{ width: 48 }}>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => handleClick(event, row.id)}
                          />
                        </TableCell>
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
                            style={{ width: 75 }}
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
                        <TableCell
                          align="left"
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          {row.stockQty} ชิ้น
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          {row.stockMin} ชิ้น
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}

              {emptyRows > 0 && rows.length > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={8} />
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

export default ProductAll;