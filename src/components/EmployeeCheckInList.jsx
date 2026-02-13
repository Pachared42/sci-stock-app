import React, { useEffect, useMemo, useState, forwardRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
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
  Snackbar,
  Skeleton,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { visuallyHidden } from "@mui/utils";

// ✅ หัวตารางตามที่ต้องการ
const headCells = [
  { id: "name", label: "ชื่อพนักงาน", width: "20%" },
  { id: "checkIn", label: "เช็คอินเข้า", width: "15%" },
  { id: "checkOut", label: "เช็คเอ้าท์ออก", width: "15%" },
  { id: "checkInImage", label: "รูปเช็คอินเข้า", width: "25%" },
  { id: "checkOutImage", label: "รูปเช็คเอ้าท์ออก", width: "25%" },
];

// ✅ sort helpers
function descendingComparator(a, b, orderBy) {
  if (b?.[orderBy] < a?.[orderBy]) return -1;
  if (b?.[orderBy] > a?.[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        {headCells.map((h) => (
          <TableCell
            key={h.id}
            sortDirection={orderBy === h.id ? order : false}
            sx={{ width: h.width, whiteSpace: "nowrap", px: 1 }}
          >
            <TableSortLabel
              active={orderBy === h.id}
              direction={orderBy === h.id ? order : "asc"}
              onClick={createSortHandler(h.id)}
            >
              {h.label}
              {orderBy === h.id ? (
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

function EnhancedTableToolbar() {
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
      <Typography sx={{ flex: "1 1 100%" }} variant="h5" id="tableTitle" component="div">
        ข้อมูลพนักงานเช็คอินทั้งหมด
      </Typography>
    </Toolbar>
  );
}

function EmployeeCheckInList() {
  const theme = useTheme();

  // ✅ rows โครงสร้างที่ใช้จริงในตารางนี้
  // { id, name, checkIn, checkOut, checkInImage, checkOutImage }
  const [rows, setRows] = useState([]);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // setRows([
        //  { id: 1, name: "พชร", checkIn: "08:30", checkOut: "17:10", checkInImage: "url", checkOutImage: "url" }
        // ]);

        setRows([]);
      } catch (err) {
        setSnackbar({ open: true, message: "ไม่สามารถโหลดข้อมูลเช็คอินได้", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage]
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%", overflow: "hidden", px: { xs: 0, md: 1.5, lg: 1.5, xl: 20 } }}>
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
            "&::-webkit-scrollbar": { height: 6 },
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Table
            sx={{
              minWidth: { xs: "300%", sm: 850 },
              tableLayout: "fixed",
            }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />

            <TableBody
              sx={{
                "& .MuiTableCell-root": { borderBottom: "2px dashed rgba(153, 153, 153, 0.3)" },
              }}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {headCells.map((h) => (
                      <TableCell key={h.id} sx={{ px: 1 }}>
                        <Skeleton animation="wave" variant="text" width="100%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    ยังไม่มีรายการเช็คชื่อ
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ px: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.name}
                    </TableCell>

                    <TableCell sx={{ px: 1, whiteSpace: "nowrap" }}>
                      {row.checkIn || "-"}
                    </TableCell>

                    <TableCell sx={{ px: 1, whiteSpace: "nowrap" }}>
                      {row.checkOut || "-"}
                    </TableCell>

                    <TableCell sx={{ px: 1 }}>
                      {row.checkInImage ? (
                        <img
                          src={row.checkInImage}
                          alt="check-in"
                          style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 10 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell sx={{ px: 1 }}>
                      {row.checkOutImage ? (
                        <img
                          src={row.checkOutImage}
                          alt="check-out"
                          style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 10 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {emptyRows > 0 && rows.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={headCells.length} />
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
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
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
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
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
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
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