import * as React from "react";
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
import { visuallyHidden } from "@mui/utils";

import { fetchSalesToday } from "../api/orderSalesDay";

import { TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const headCells = [
  { id: "name", label: "ชื่อสินค้า", width: "30%" },
  { id: "img", label: "รูปภาพ", width: "25%" },
  { id: "barcode", label: "BARCODE", width: "20%" },
  { id: "price", label: "ราคา", width: "10%" },
  { id: "quantity", label: "จำนวน", width: "10%" },
  { id: "totalPrice", label: "ราคารวม", width: "15%" },
];

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
              "aria-label": "select all rows",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"left"}
            padding="normal"
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
  const { numSelected, date } = props;
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
          รายการขายวันที่ {date}
        </Typography>
      )}
    </Toolbar>
  );
}
EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
};

function SalesTableByDate({ date, rows }) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const theme = useTheme();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    <Paper sx={{ width: "100%", mb: 4 }}>
      <EnhancedTableToolbar numSelected={selected.length} date={date} />
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
          size={"medium"}
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
                borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)"
              },
            }}
          >
            {visibleRows.map((row, index) => {
              const isItemSelected = selected.indexOf(row.id) !== -1;
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
                    />
                  </TableCell>
                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    padding="none"
                    sx={{
                      width: "25%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      px: 1,
                    }}
                    title={row.name}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ width: "20%", whiteSpace: "nowrap", px: 1 }}>
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt={row.name}
                        style={{
                          maxHeight: 75,
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell sx={{ width: "20%", whiteSpace: "nowrap", px: 1 }}>
                    {row.barcode}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                  >
                    {row.price} บาท
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: "10%", whiteSpace: "nowrap", px: 1 }}
                  >
                    {row.quantity} ชิ้น
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: "15%", whiteSpace: "nowrap", px: 1 }}
                  >
                    {row.totalPrice} บาท
                  </TableCell>
                </TableRow>
              );
            })}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}

            {/* แถวสรุปราคารวมทั้งหมด */}
            <TableRow
              sx={{
                fontWeight: "500",
                color: "#000000",
                height: 60,
              }}
            >
              <TableCell
                padding="checkbox"
                sx={{ backgroundColor: "mediumseagreen", fontSize: "1.25rem" }}
              />
              <TableCell
                colSpan={4}
                align="right"
                sx={{
                  pr: 4.5,
                  fontWeight: "500",
                  color: "#000000",
                  backgroundColor: "mediumseagreen",
                  fontSize: "1rem",
                }}
              >
                รวมทั้งหมด
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  px: 1,
                  color: "#000000",
                  backgroundColor: "mediumseagreen",
                  fontSize: "1rem",
                }}
              >
                {visibleRows.reduce((sum, row) => sum + (row.quantity || 0), 0)}{" "}
                ชิ้น
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  px: 1,
                  color: "#000000",
                  backgroundColor: "mediumseagreen",
                  fontSize: "1rem",
                }}
              >
                {visibleRows
                  .reduce((sum, row) => sum + (row.totalPrice || 0), 0)
                  .toFixed(2)}{" "}
                บาท
              </TableCell>
            </TableRow>
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
  );
}

export default function SalesTablesGroupByDate() {
  const [groupedData, setGroupedData] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchSalesToday();

        const tempGroup = {};

        res.sales_today.forEach((item) => {
          if (!item.sold_at) return;

          const date = new Date(item.sold_at).toISOString().split("T")[0];
          if (!tempGroup[date]) tempGroup[date] = {};

          if (tempGroup[date][item.barcode]) {
            tempGroup[date][item.barcode].quantity += item.quantity;
            tempGroup[date][item.barcode].totalPrice +=
              item.quantity * item.price;
          } else {
            tempGroup[date][item.barcode] = {
              id: `${date}-${item.barcode}`,
              name: item.product_name || "-",
              image_url: item.image_url || "",
              barcode: item.barcode || "-",
              price: item.price?.toFixed(2) || "-",
              quantity: item.quantity || 0,
              totalPrice: item.quantity * item.price || 0,
            };
          }
        });

        const finalGroup = {};
        Object.entries(tempGroup).forEach(([date, items]) => {
          finalGroup[date] = Object.values(items);
        });

        setGroupedData(finalGroup);
      } catch (error) {
        console.error("Error fetching sales_today:", error);
      }
    };

    fetchData();
  }, []);

  const formattedSelectedDate = selectedDate.format("YYYY-MM-DD");

  return (
    <Box sx={{ width: "100%", px: { xs: 0, md: 1.5, lg: 1.5, xl: 20 } }}>
      {/* Header บนสุด */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 1,
          px: 2,
        }}
      >
        <Typography variant="h5" fontWeight="500">
          ออเดอร์รายวัน
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="เลือกวันที่"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            views={["year", "month", "day"]}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  fontSize: "1rem",
                  minHeight: 56,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    minHeight: 50,
                    "& fieldset": {
                      borderColor: "primary.main",
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.dark",
                    },
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* แสดงตารางเฉพาะวันที่เลือก */}
      {groupedData[formattedSelectedDate] ? (
        <SalesTableByDate
          key={formattedSelectedDate}
          date={formattedSelectedDate}
          rows={groupedData[formattedSelectedDate]}
        />
      ) : (
        <Typography sx={{ textAlign: "center", mt: 6 }}>
          ไม่พบข้อมูลสำหรับวันที่ {formattedSelectedDate}
        </Typography>
      )}
    </Box>
  );
}
