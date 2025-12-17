import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  Fade,
  Skeleton,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

import {
  fetchProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productApi";
import { set } from "nprogress";

function createData(
  id,
  name,
  imgUrl,
  barcode,
  priceSell,
  priceCost,
  stockQty,
  stockMin
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
  { id: "manage", label: "จัดการสินค้า", width: "20%" },
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
          สินค้าประเภทเครื่องดื่ม
        </Typography>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

function SoftDrinkTable() {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [deleteRow, setDeleteRow] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    imgUrl: "",
    priceSell: "",
    priceCost: "",
    stockQty: "",
    stockMin: "",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsByCategory("soft_drink");
        const formatted = data.map((item, index) =>
          createData(
            index + 1,
            item.product_name,
            item.image_url,
            item.barcode,
            item.price,
            item.cost,
            item.stock,
            item.reorder_level
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
    loadData();
  }, [reload]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setEditValues(row);
  };

  const handleDialogChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDialogSave = async () => {
    try {
      const updatedPayload = {
        product_name: editValues.name,
        barcode: editValues.barcode,
        price: parseFloat(editValues.priceSell),
        cost: parseFloat(editValues.priceCost),
        stock: parseInt(editValues.stockQty, 10),
        reorder_level: parseInt(editValues.stockMin, 10),
        image_url: editValues.imgUrl,
      };

      await updateProduct("soft_drink", editValues.barcode, updatedPayload);

      setSnackbar({
        open: true,
        message: "แก้ไขสินค้าสำเร็จ",
        severity: "success",
      });

      setEditRow(null);
      setReload((r) => !r);
      navigate(location.pathname, { replace: true });
    } catch (error) {
      console.error(
        "Error updating product:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: "ไม่สามารถแก้ไขสินค้าได้",
        severity: "error",
      });
    }
  };

  const handleDialogClose = () => {
    setEditRow(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct("soft_drink", deleteRow.barcode);

      setDeleteRow(null);
      setReload((r) => !r);
      navigate(location.pathname, { replace: true });

      setSnackbar({
        open: true,
        message: "ลบสินค้าสำเร็จ",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "Error deleting product:",
        error.response?.data || error.message
      );

      setSnackbar({
        open: true,
        message: "ไม่สามารถลบสินค้าได้",
        severity: "error",
      });
    }
  };

  const handleAddProduct = async () => {
    const productPayload = {
      product_name: newProduct.name.trim(),
      barcode: newProduct.barcode.trim(),
      price: parseFloat(newProduct.priceSell),
      cost: parseFloat(newProduct.priceCost),
      stock: parseInt(newProduct.stockQty, 10) || 0,
      reorder_level: parseInt(newProduct.stockMin, 10) || 0,
      image_url:
        typeof newProduct.imgUrl === "string" ? newProduct.imgUrl.trim() : "",
    };

    if (
      !productPayload.product_name ||
      !productPayload.barcode ||
      isNaN(productPayload.price) ||
      isNaN(productPayload.cost)
    ) {
      setSnackbar({
        open: true,
        message:
          "กรุณากรอกชื่อสินค้า, barcode, ราคาขาย และราคาต้นทุนให้ถูกต้อง",
        severity: "warning",
      });
      return;
    }

    try {
      await createProduct("soft_drink", [productPayload]);

      setReload((r) => !r);
      navigate(location.pathname, { replace: true });

      setRows((prev) => [
        ...prev,
        {
          id: prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
          name: productPayload.product_name,
          barcode: productPayload.barcode,
          imgUrl: productPayload.image_url,
          priceSell: productPayload.price,
          priceCost: productPayload.cost,
          stockQty: productPayload.stock,
          stockMin: productPayload.reorder_level,
        },
      ]);

      setSnackbar({
        open: true,
        message: "เพิ่มสินค้าสำเร็จ",
        severity: "success",
      });

      setOpenAddDialog(false);
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data || error.message
      );

      setSnackbar({
        open: true,
        message: "ไม่สามารถเพิ่มสินค้าได้",
        severity: "error",
      });
    }
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

  const isOutOfStock = (product) => product.stockQty === 0;
  const isLowStock = (product) => product.stockQty > 0 && product.stockQty <= 10;
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
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
        px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 },
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

          {/* ขวา: Search + Add Button (แนวนอนบน desktop, แนวตั้งบน mobile) */}
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
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAddDialog(true)}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.ButtonDay,
                  color: theme.palette.text.hint,
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                เพิ่มสินค้าใหม่
              </Button>
            </Box>
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
              Array.from({ length: 5 }).map((_, i) => (
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
                      sx={{ mx: "auto" }}
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

                  <TableCell sx={{ textAlign: "left" }}>
                    <Skeleton animation="wave" variant="rounded" width={100} height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  ยังไม่มีรายการสินค้า
                </TableCell>
              </TableRow>
            ) : /* กรณีข้อมูลมีแล้วแต่กรองแล้วไม่มีข้อมูลแสดง */
              filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
                            whiteSpace: "normal",
                            overflow: "visible",
                            textOverflow: "break-word",
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
                        <TableCell
                          align="left"
                          sx={{ whiteSpace: "nowrap", px: 1 }}
                        >
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(row);
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteRow(row);
                            }}
                          >
                            ลบ
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}

              {/* แถวว่างเพิ่มความสูง เพื่อให้ความสูงตารางคงที่ */}
              {emptyRows > 0 && rows.length > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={9} />
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

      {/* Dialog เพิ่มสินค้าใหม่ */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
          paper: {
            sx: {
              borderRadius: 6,
              p: { xs: 2, md: 3 },
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "500",
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: 2,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          เพิ่มสินค้าใหม่ประเภทเครื่องดื่ม
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: { xs: "center", md: "flex-start" },
            pt: "24px !important",
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 320 },
              overflow: "hidden",
              borderRadius: 6,
              mb: { xs: 3, md: 0 },
            }}
          >
            {newProduct.imgUrl ? (
              <Box
                component="img"
                src={newProduct.imgUrl}
                alt={newProduct.name}
                sx={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 6,
                  border: "none",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  borderRadius: 6,
                  border: "1px dashed gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "gray",
                  fontStyle: "italic",
                  userSelect: "none",
                  gap: 1,
                }}
              >
                <ImageNotSupportedIcon fontSize="large" />
                ไม่มีรูปภาพ
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: "100%",
              minWidth: 0,
            }}
          >
            <TextField
              label="URL รูปภาพ"
              fullWidth
              value={newProduct.imgUrl}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, imgUrl: e.target.value }))
              }
              placeholder="วาง URL รูปภาพที่นี่"
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ชื่อสินค้า"
              fullWidth
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="BARCODE"
              fullWidth
              value={newProduct.barcode}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, barcode: e.target.value }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ราคาขาย"
              fullWidth
              type="number"
              value={newProduct.priceSell}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  priceSell: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ราคาต้นทุน"
              fullWidth
              type="number"
              value={newProduct.priceCost}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  priceCost: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="จำนวนสต็อก"
              fullWidth
              type="number"
              value={newProduct.stockQty}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, stockQty: e.target.value }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="สต็อกต่ำสุด"
              fullWidth
              type="number"
              value={newProduct.stockMin}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, stockMin: e.target.value }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: { xs: "center", md: "flex-end" },
            gap: 0.5,
            py: 2,
            px: { xs: 2, md: 3 },
          }}
        >
          <Button
            onClick={() => setOpenAddDialog(false)}
            color="inherit"
            variant="outlined"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: theme.palette.background.ButtonDay,
              color: theme.palette.text.hint,
              "&:hover": {
                backgroundColor: theme.palette.background.ButtonDay,
              },
            }}
          >
            ยืนยันเพิ่มสินค้า
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog แก้ไขสินค้า */}
      <Dialog
        open={!!editRow}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300} // ทำให้ทั้ง backdrop และ dialog ใช้เวลาเท่ากัน
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
          paper: {
            sx: {
              borderRadius: 6,
              p: { xs: 2, md: 3 },
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "500",
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: 2,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          แก้ไขข้อมูลสินค้าประเภทเครื่งองดื่ม
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: { xs: "center", md: "flex-start" },
            pt: "24px !important",
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 320 },
              overflow: "hidden",
              borderRadius: 6,
              mb: { xs: 3, md: 0 },
            }}
          >
            <Box
              component="img"
              src={editValues.imgUrl || ""}
              alt={editValues.name}
              sx={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                borderRadius: 6,
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: "100%",
              minWidth: 0,
            }}
          >
            <TextField
              label="URL รูปภาพ"
              fullWidth
              value={editValues.imgUrl || ""}
              onChange={(e) => handleDialogChange("imgUrl", e.target.value)}
              placeholder="วาง URL รูปภาพที่นี่"
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ชื่อสินค้า"
              fullWidth
              value={editValues.name || ""}
              onChange={(e) => handleDialogChange("name", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="BARCODE"
              fullWidth
              value={editValues.barcode || ""}
              onChange={(e) => handleDialogChange("barcode", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ราคาขาย"
              fullWidth
              type="number"
              value={editValues.priceSell || ""}
              onChange={(e) => handleDialogChange("priceSell", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="ราคาต้นทุน"
              fullWidth
              type="number"
              value={editValues.priceCost || ""}
              onChange={(e) => handleDialogChange("priceCost", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="จำนวนสต็อก"
              fullWidth
              type="number"
              value={editValues.stockQty || ""}
              onChange={(e) => handleDialogChange("stockQty", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
            <TextField
              label="สต็อกต่ำสุด"
              fullWidth
              type="number"
              value={editValues.stockMin || ""}
              onChange={(e) => handleDialogChange("stockMin", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: { xs: "center", md: "flex-end" },
            gap: 0.5,
            py: 2,
            px: { xs: 2, md: 3 },
          }}
        >
          <Button
            onClick={handleDialogClose}
            color="inherit"
            variant="outlined"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleDialogSave}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: theme.palette.background.ButtonDay,
              color: theme.palette.text.hint,
              "&:hover": {
                backgroundColor: theme.palette.background.ButtonDay,
              },
            }}
          >
            บันทึกการแก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
          paper: {
            sx: {
              borderRadius: 6,
              p: { xs: 2, md: 3 },
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Box sx={{ textAlign: "center", pb: 1 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 50, mb: 1 }} />
          <DialogTitle
            sx={{
              fontWeight: 600,
              fontSize: "1.4rem",
              color: "error.main",
              mb: 1,
            }}
          >
            ยืนยันการลบสินค้า
          </DialogTitle>
          <DialogContent
            sx={{
              fontSize: "1rem",
              color: "text.secondary",
            }}
          >
            คุณต้องการลบสินค้า <br />
            <Typography component="span" fontWeight="bold" color="error.main">
              {deleteRow?.name}
            </Typography>{" "}
            ใช่หรือไม่?
          </DialogContent>
        </Box>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 0.5,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="medium"
            onClick={() => setDeleteRow(null)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={handleDeleteConfirm}
            sx={{
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>

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

export default SoftDrinkTable;