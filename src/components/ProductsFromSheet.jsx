import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
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
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../context/AuthProvider";
import {
  loadProductsFromSheet,
  sellProduct,
  refreshCache,
} from "../api/sellFromSheets";

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

const headCells = [
  { id: "name", label: "ชื่อสินค้า", width: "30%" },
  { id: "img", label: "รูปภาพ", width: "25%" },
  { id: "barcode", label: "BARCODE", width: "30%" },
  { id: "price", label: "ราคา", width: "10%" },
  { id: "manage", label: "จัดการ", width: "15%" },
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
            inputProps={{ "aria-label": "select all items" }}
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

function EnhancedTableToolbar({ numSelected, onRefresh, loading }) {
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: "1 1 100%",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="h5" component="div">
            สินค้าจาก Google Sheets
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <Box
                component="span"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 16,
                    height: 16,
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                กำลังโหลด...
              </Box>
            ) : (
              "รีเฟรชข้อมูล"
            )}
          </Button>
        </Box>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default function EnhancedTable() {
  const theme = useTheme();
  const { user } = useAuth();
  const token = user?.token;
  const [products, setProducts] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [dense] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // React.useEffect(() => {
  //   if (!token) {
  //     console.warn("No token, skipping loadProductsFromSheet");
  //     return;
  //   }
  //   setLoading(true);
  //   loadProductsFromSheet(token, setProducts)
  //     .catch((err) => alert("โหลดข้อมูลล้มเหลว: " + err.message))
  //     .finally(() => setLoading(false));
  // }, [token]);

  React.useEffect(() => {
    setPage(0);
  }, [products]);

  const handleRefresh = () => {
    if (!token) {
      alert("ไม่พบ token สำหรับรีเฟรชข้อมูล");
      return;
    }
    setLoading(true);
    refreshCache(token)
      .then(() => loadProductsFromSheet(token, setProducts))
      .catch((err) => alert("รีเฟรชข้อมูลล้มเหลว: " + err.message))
      .finally(() => setLoading(false));
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = products.map((n, index) => n.id ?? `idx-${index}`);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const visibleRows = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    const productsWithId = products.map((p, index) => ({
      id: p.id != null ? p.id : `idx-${index}`,
      product_name: p.product_name ?? "",
      barcode: p.barcode ?? "",
      price: p.price ?? 0,
      image_url: p.image_url ? (
        <img
          src={p.image_url}
          alt={p.product_name ?? ""}
          style={{ maxWidth: "100%", maxHeight: 80, objectFit: "contain" }}
          loading="lazy"
        />
      ) : (
        "-"
      ),
      original: p,
    }));

    return productsWithId
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [products, order, orderBy, page, rowsPerPage]);

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (products?.length || 0))
      : 0;

  return (
    <Box sx={{ width: "100%", overflow: "hidden", px: { xs: 0, md: 1.5, lg: 1.5, xl: 20 } }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onRefresh={handleRefresh}
          loading={loading}
        />
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
              minWidth: { xs: "250%", sm: 850 },
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
              rowCount={products.length}
            />
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)",
                },
              }}
            >
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    ยังไม่มีรายการขาย
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row.id}-${index}`}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox" sx={{ width: 48 }}>
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        sx={{
                          width: "30%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 1,
                        }}
                        title={row.product_name}
                      >
                        {row.product_name}
                      </TableCell>
                      <TableCell
                        sx={{ width: "25%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.image_url}
                      </TableCell>
                      <TableCell
                        sx={{ width: "30%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.barcode}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                      >
                        {row.price} ราคา
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ width: "15%", whiteSpace: "nowrap", px: 1 }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!token) {
                              alert("ไม่พบ token สำหรับตัดสต๊อก");
                              return;
                            }
                            sellProduct(token, row.barcode, 1)
                              .then(() => {
                                alert("ตัดสต๊อกสำเร็จ");
                                loadProductsFromSheet(token, setProducts).catch(
                                  (err) =>
                                    alert("โหลดข้อมูลล้มเหลว: " + err.message)
                                );
                                // ล้างการเลือก
                                setSelected([]);
                              })
                              .catch((err) =>
                                alert("เกิดข้อผิดพลาด: " + err.message)
                              );
                          }}
                        >
                          ตัดสต๊อก
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {emptyRows > 0 && visibleRows.length > 0 && (
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={products.length}
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
