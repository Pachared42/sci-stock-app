import * as React from "react";
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
import { visuallyHidden } from "@mui/utils";
import { TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import { fetchSalesToday, fetchDailyExpenses } from "../api/orderSalesDay";

// const headCells = [
//   { id: "name", label: "ชื่อสินค้า", width: "16%" },
//   { id: "img", label: "รูปภาพ", width: "12%" },
//   { id: "quantity", label: "จำนวน", width: "12%" },
//   { id: "cost_price", label: "ราคาต้นทุน/ชิ้น", width: "12%" },
//   { id: "price", label: "ราคาขาย/ชิ้น", width: "12%" },
//   { id: "profit_per_item", label: "กำไร/ชิ้น", width: "12%" },
//   { id: "total_profit", label: "รวมกำไร", width: "12%" },
//   { id: "totalPrice", label: "ราคาขายรวม", width: "12%" },
// ];

const headCells = [
  { id: "name", label: "ชื่อสินค้า", width: "50%" },
  { id: "img", label: "รูปภาพ", width: "25%" },
  { id: "quantity", label: "จำนวน", width: "25%" },
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
          รายการตัดสต๊อกวันที่ {date}
        </Typography>
      )}
    </Toolbar>
  );
}
EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
};

function SalesTableByDate({ date, rows, dailyExpenses }) {
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

  const topProducts = [...rows]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  const totalSales = rows.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const totalCost = rows.reduce(
    (sum, r) => sum + (r.cost_price || 0) * r.quantity,
    0
  );
  const totalProfit = totalSales - totalCost;

  const filteredExpenses = dailyExpenses.filter((e) => e.date === date);
  const totalDailyPayments = filteredExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const formattedSelectedDate = new Date(date).toISOString().split("T")[0];

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
      <EnhancedTableToolbar numSelected={selected.length} date={date} />
      {/* --- Grid บนหัวตาราง --- */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {/* Top 3 Products */}
        {/* <Paper
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.chartBackground,
            flex: "1 1 25%",
            minWidth: "300px",
            borderRadius: 5.5,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={1}
            sx={{ fontSize: "1.25rem" }}
          >
            สินค้าขายดี 3 อันดับแรก
          </Typography>
          {topProducts.length > 0 ? (
            topProducts.map((p) => (
              <Typography key={p.id}>
                {p.name} - {p.quantity} ชิ้น
              </Typography>
            ))
          ) : (
            <Typography>ไม่มีข้อมูลสินค้า</Typography>
          )}
        </Paper> */}

        {/* Daily Expenses */}
        {/* <Paper
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.chartBackground,
            flex: "1 1 25%",
            minWidth: "300px",
            borderRadius: 5.5,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={1}
            sx={{ fontSize: "1.25rem" }}
          >
            รายจ่ายรายวัน
          </Typography>

          {dailyExpenses.length > 0 ? (
            dailyExpenses
              .filter(
                (e) => dayjs(e.payment_date).format("YYYY-MM-DD") === date
              )
              .map((item) => (
                <Typography key={item.id}>
                  {item.item_name} - {item.amount} บาท
                </Typography>
              ))
          ) : (
            <Typography>ไม่มีข้อมูลรายจ่ายวันนี้</Typography>
          )}
        </Paper> */}
      </Box>

      {/* --- ตารางเดิม --- */}
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
          sx={{ minWidth: { xs: "250%", sm: 850 }, tableLayout: "fixed" }}
          size="medium"
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
                    sx={{ px: 1 }}
                  >
                    {row.name}
                  </TableCell>

                  <TableCell sx={{ px: 1 }}>
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

                  <TableCell sx={{ px: 1 }}>
                    {Number(row.quantity || 0)} ชิ้น
                  </TableCell>

                  {/* <TableCell sx={{ px: 1 }}>
                    {row.cost_price.toFixed(2)} บาท
                  </TableCell>

                  <TableCell sx={{ px: 1 }}>
                    {row.price.toFixed(2)} บาท
                  </TableCell>

                  <TableCell sx={{ px: 1 }}>
                    {(row.price - row.cost_price).toFixed(2)} บาท
                  </TableCell>

                  <TableCell sx={{ px: 1 }}>
                    {((row.price - row.cost_price) * row.quantity).toFixed(2)}{" "}
                    บาท
                  </TableCell>

                  <TableCell sx={{ px: 1 }}>
                    {row.totalPrice.toFixed(2)} บาท
                  </TableCell> */}
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={9} />
              </TableRow>
            )}
            {/* แถวสรุปราคารวมทั้งหมด */}
            {/* <TableRow sx={{ fontWeight: 500, height: 50 }}>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: "rgba(60, 179, 113, 0.5)",
                  fontSize: "1.25rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              />
              <TableCell
                colSpan={7}
                align="right"
                sx={{
                  pr: 4.5,
                  fontWeight: 500,
                  backgroundColor: "rgba(60, 179, 113, 0.5)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                ยอดขายรวมทั้งหมด
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  px: 1,
                  backgroundColor: "rgba(60, 179, 113, 0.5)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                {rows
                  .reduce((sum, row) => sum + (row.totalPrice || 0), 0)
                  .toFixed(2)}{" "}
                บาท
              </TableCell>
            </TableRow> */}

            {/* แถวสรุปรวมกำไร */}
            {/* <TableRow sx={{ fontWeight: 500, height: 50 }}>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: "rgba(30, 144, 255, 0.4)",
                  fontSize: "1.25rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              />
              <TableCell
                colSpan={7}
                align="right"
                sx={{
                  pr: 4.5,
                  fontWeight: 500,
                  backgroundColor: "rgba(30, 144, 255, 0.4)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                กำไรรวมทั้งหมด
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  px: 1,
                  backgroundColor: "rgba(30, 144, 255, 0.4)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                {rows
                  .reduce(
                    (sum, row) =>
                      sum +
                      ((Number(row.price) || 0) -
                        (Number(row.cost_price) || 0)) *
                        (Number(row.quantity) || 0),
                    0
                  )
                  .toFixed(2)}{" "}
                บาท
              </TableCell>
            </TableRow> */}

            {/* แถวสรุปรายจ่ายทั้งหมด */}
            {/* <TableRow sx={{ fontWeight: 500, height: 50 }}>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: "rgba(255, 99, 71, 0.4)",
                  fontSize: "1.25rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              />
              <TableCell
                colSpan={7}
                align="right"
                sx={{
                  pr: 4.5,
                  fontWeight: 500,
                  backgroundColor: "rgba(255, 99, 71, 0.4)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                รายจ่ายรวมทั้งหมด
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  px: 1,
                  backgroundColor: "rgba(255, 99, 71, 0.4)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                {dailyExpenses
                  .filter(
                    (e) =>
                      e.payment_date.split("T")[0] === formattedSelectedDate
                  )
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                  .toFixed(2)}{" "}
                บาท
              </TableCell>
            </TableRow> */}

            {/* แถวสรุปกำไรสุทธิทั้งหมด */}
            {/* <TableRow sx={{ fontWeight: 600, height: 70 }}>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: "rgba(218, 165, 32, 0.5)",
                  fontSize: "1.25rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              />
              <TableCell
                colSpan={7}
                align="right"
                sx={{
                  pr: 4.5,
                  fontWeight: 500,
                  backgroundColor: "rgba(218, 165, 32, 0.5)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                กำไรสุทธิทั้งหมด
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  px: 1,
                  backgroundColor: "rgba(218, 165, 32, 0.5)",
                  fontSize: "1rem",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                {(() => {
                  const totalProfit = rows.reduce(
                    (sum, row) =>
                      sum +
                      ((Number(row.price) || 0) -
                        (Number(row.cost_price) || 0)) *
                        (Number(row.quantity) || 0),
                    0
                  );
                  const totalExpense = dailyExpenses
                    .filter(
                      (e) =>
                        e.payment_date.split("T")[0] === formattedSelectedDate
                    )
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                  const netProfit = totalProfit - totalExpense;

                  return netProfit.toFixed(2) + " บาท";
                })()}
              </TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
      {/* --- Pagination --- */}
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
      {/* <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Paper
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: theme.palette.background.chartBackground,
            flex: "1 1 15%",
            minWidth: "220px",
            borderRadius: 5,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={1}
            sx={{ fontSize: "1.25rem" }}
          >
            ยอดขายรวม
          </Typography>
          <Typography fontWeight={500}>{totalSales.toFixed(2)} บาท</Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: theme.palette.background.chartBackground,
            flex: "1 1 15%",
            minWidth: "220px",
            borderRadius: 5,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={1}
            sx={{ fontSize: "1.25rem" }}
          >
            รายจ่ายรวม
          </Typography>
          <Typography fontWeight={500}>
            {(() => {
              const totalDailyPayments = dailyExpenses
                .filter(
                  (e) => e.payment_date.split("T")[0] === formattedSelectedDate
                )
                .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

              return totalDailyPayments.toFixed(2) + " บาท";
            })()}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: theme.palette.background.chartBackground,
            flex: "1 1 15%",
            minWidth: "220px",
            borderRadius: 5,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={1}
            sx={{ fontSize: "1.25rem" }}
          >
            กำไรสุทธิ
          </Typography>
          <Typography fontWeight={500}>
            {(() => {
              const totalRevenue = rows.reduce(
                (sum, row) =>
                  sum +
                  ((Number(row.price) || 0) - (Number(row.cost_price) || 0)) *
                    (Number(row.quantity) || 0),
                0
              );

              const totalExpenses = dailyExpenses
                .filter(
                  (e) => e.payment_date.split("T")[0] === formattedSelectedDate
                )
                .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

              const totalProfit = totalRevenue - totalExpenses;

              return totalProfit.toFixed(2) + " บาท";
            })()}
          </Typography>
        </Paper>
      </Box> */}
    </Paper>
  );
}

function SalesTablesGroupByDate() {
  const [groupedData, setGroupedData] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [dailyExpenses, setDailyExpenses] = React.useState([]);
  const [topProducts, setTopProducts] = React.useState([]);
  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sales
        const salesRes = await fetchSalesToday();

        // จัดกลุ่มตามวันที่
        const tempGroup = {};
        salesRes.sales_today.forEach((item) => {
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
              price: item.price != null ? Number(item.price) : 0,
              cost_price: item.cost != null ? Number(item.cost) : 0,
              quantity: item.quantity || 0,
              totalPrice: (item.price || 0) * (item.quantity || 0),
            };
          }
        });

        // แปลง object เป็น array
        const finalGroup = {};
        Object.entries(tempGroup).forEach(([date, items]) => {
          finalGroup[date] = Object.values(items);
        });
        setGroupedData(finalGroup);

        // คำนวณ Top 3 products จากยอดขายรวม
        const allProducts = Object.values(tempGroup).flatMap((items) =>
          Object.values(items)
        );
        const sortedProducts = allProducts
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 3);
        setTopProducts(sortedProducts);

        // Fetch daily expenses
        const expensesRes = await fetchDailyExpenses();
        setDailyExpenses(expensesRes.daily_expenses || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formattedSelectedDate = selectedDate.format("YYYY-MM-DD");

  return (
    <Box sx={{ width: "100%", px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 } }}>
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
                size: "large",
                variant: "outlined",
                sx: (theme) => ({
                  bgcolor: "background.paper",
                  borderRadius: 6,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    "& input": {
                      color: theme.palette.text.primary,
                    },
                  },
                }),
              },
              day: {
                sx: (theme) => ({
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main + " !important",
                    color:
                      theme.palette.mode === "light"
                        ? "#fff"
                        : "#000 !important",
                  },
                  "&.MuiPickersDay-today": {
                    border: `1px solid ${theme.palette.primary.main}`,
                  },
                }),
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
          dailyExpenses={dailyExpenses}
        />
      ) : (
        <Typography sx={{ textAlign: "center", mt: 6 }}>
          ไม่พบข้อมูลสำหรับวันที่ {formattedSelectedDate}
        </Typography>
      )}
    </Box>
  );
}

export default SalesTablesGroupByDate;
