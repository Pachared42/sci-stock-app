import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { alpha, useTheme } from "@mui/material/styles";
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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { visuallyHidden } from "@mui/utils";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { fetchProductsByCategory } from "../api/productApi";

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
          สินค้าทุกประเภท
        </Typography>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function EnhancedTable() {
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
  const theme = useTheme();

  useEffect(() => {
    const categories = ["dried_food", "soft_drink", "stationery"];

    const loadAllData = async () => {
      try {
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
            item.reorder_level
          )
        );
        setRows(formatted);
      } catch (err) {
        console.error("โหลดสินค้าทั้งหมดล้มเหลว:", err);
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

  // Edit dialog
  const handleEdit = (row) => {
    setEditRow(row);
    setEditValues(row);
  };

  const handleDialogChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDialogSave = () => {
    setRows((prevRows) =>
      prevRows.map((r) => (r.id === editRow.id ? { ...editValues } : r))
    );
    setEditRow(null);
  };

  const handleDialogClose = () => {
    setEditRow(null);
  };

  // Delete dialog
  const handleDeleteConfirm = () => {
    setRows((prev) => prev.filter((r) => r.id !== deleteRow.id));
    setSelected((prev) => prev.filter((id) => id !== deleteRow.id));
    setDeleteRow(null);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
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
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
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
                  <TableCell colSpan={9} align="center">
                    ยังไม่มีรายการสินค้า
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
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
                          width: "20%",
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
                        sx={{ width: "15%", whiteSpace: "nowrap", px: 1 }}
                      >
                        <img
                          src={row.imgUrl}
                          alt={row.name}
                          style={{ width: 75 }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ width: "15%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.barcode}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.priceSell} บาท
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.priceCost} บาท
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.stockQty} ชิ้น
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.stockMin} ชิ้น
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "15%", whiteSpace: "nowrap", px: 1 }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
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
                          variant="contained"
                          color="error"
                          size="small"
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

      {/* Dialog แก้ไขสินค้า */}
      <Dialog
        open={!!editRow}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            p: { xs: 2, md: 3 },
            bgcolor: "background.paper",
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
          แก้ไขข้อมูลสินค้า
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
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="URL รูปภาพ"
              fullWidth
              value={editValues.imgUrl || ""}
              onChange={(e) => handleDialogChange("imgUrl", e.target.value)}
              placeholder="วาง URL รูปภาพที่นี่"
              variant="outlined"
              size="medium"
            />
            <TextField
              label="ชื่อสินค้า"
              fullWidth
              value={editValues.name || ""}
              onChange={(e) => handleDialogChange("name", e.target.value)}
              variant="outlined"
              size="medium"
            />
            <TextField
              label="BARCODE"
              fullWidth
              value={editValues.barcode || ""}
              onChange={(e) => handleDialogChange("barcode", e.target.value)}
              variant="outlined"
              size="medium"
            />
            <TextField
              label="ราคาขาย"
              fullWidth
              type="number"
              value={editValues.priceSell || ""}
              onChange={(e) => handleDialogChange("priceSell", e.target.value)}
              variant="outlined"
              size="medium"
            />
            <TextField
              label="ราคาต้นทุน"
              fullWidth
              type="number"
              value={editValues.priceCost || ""}
              onChange={(e) => handleDialogChange("priceCost", e.target.value)}
              variant="outlined"
              size="medium"
            />
            <TextField
              label="จำนวนสต็อก"
              fullWidth
              type="number"
              value={editValues.stockQty || ""}
              onChange={(e) => handleDialogChange("stockQty", e.target.value)}
              variant="outlined"
              size="medium"
            />
            <TextField
              label="สต็อกต่ำสุด"
              fullWidth
              type="number"
              value={editValues.stockMin || ""}
              onChange={(e) => handleDialogChange("stockMin", e.target.value)}
              variant="outlined"
              size="medium"
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
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ลบสินค้า */}
      <Dialog
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 3,
            bgcolor: "background.paper",
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
            onClick={() => {
              setRows((prev) => prev.filter((r) => r.id !== deleteRow.id));
              setSelected((prev) => prev.filter((id) => id !== deleteRow.id));
              setDeleteRow(null);
            }}
            sx={{
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
