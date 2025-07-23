import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import PropTypes from "prop-types";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Stack,
  useMediaQuery,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Checkbox,
  Button,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  { id: "name", label: "ชื่อสินค้า", width: "20%" },
  { id: "imgUrl", label: "รูปภาพ", width: "15%" },
  { id: "barcode", label: "BARCODE", width: "15%" },
  { id: "priceSell", label: "ราคาขาย", width: "10%" },
  { id: "priceCost", label: "ราคาต้นทุน", width: "10%" },
  { id: "stockQty", label: "จำนวนสต็อก", width: "10%" },
  { id: "stockMin", label: "สต็อกต่ำสุด", width: "10%" },
  { id: "manage", label: "จัดการสินค้า", width: "15%" },
];

function EnhancedTableHead(props) {
  const theme = useTheme();
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
        <TableCell padding="checkbox" sx={{ width: 48, backgroundColor: `${theme.palette.background.chartBackground} !important`, }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all items",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            sx={{ width: headCell.width, whiteSpace: "nowrap", px: 1, backgroundColor: `${theme.palette.background.chartBackground} !important`, }}
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
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, title } = props;
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
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}
    </Toolbar>
  );
}
EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

const UploadBox = ({ label, onFileChange }) => {
  const theme = useTheme();
  return (
    <Box width="100%">
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box
        sx={{
          width: "100%",
          minHeight: 350,
          border: "1.5px dashed rgba(153, 153, 153, 0.2)",
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: "pointer",
          backgroundColor: theme.palette.background.Backgroundupload,
          "&:hover": {
            backgroundColor: theme.palette.background.backgroundUploadHover,
            borderColor: "#888",
          },
          mb: 1,
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{
            opacity: 0,
            position: "absolute",
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
          onChange={onFileChange}
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          color="#999"
          sx={{ userSelect: "none" }}
        >
          <CloudUploadIcon sx={{ fontSize: 80, marginBottom: 1 }} />
          <Typography variant="body2" color="textSecondary">
            คลิกหรือวางไฟล์ที่นี่
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default function UploadThreeTables() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleSave = (row) => {
    console.log("📥 กำลังบันทึกสินค้า:", row);
  };

  const [data1, setData1] = useState([]);
  const [errors1, setErrors1] = useState([]);
  const [order1, setOrder1] = useState("asc");
  const [orderBy1, setOrderBy1] = useState("name");
  const [selected1, setSelected1] = useState([]);
  const [page1, setPage1] = useState(0);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);

  const [data2, setData2] = useState([]);
  const [errors2, setErrors2] = useState([]);
  const [order2, setOrder2] = useState("asc");
  const [orderBy2, setOrderBy2] = useState("name");
  const [selected2, setSelected2] = useState([]);
  const [page2, setPage2] = useState(0);
  const [rowsPerPage2, setRowsPerPage2] = useState(5);

  const [data3, setData3] = useState([]);
  const [errors3, setErrors3] = useState([]);
  const [order3, setOrder3] = useState("asc");
  const [orderBy3, setOrderBy3] = useState("name");
  const [selected3, setSelected3] = useState([]);
  const [page3, setPage3] = useState(0);
  const [rowsPerPage3, setRowsPerPage3] = useState(5);

  const handleUpload = (setData, setErrors, resetPage) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const newErrors = [];
      const newRows = [];

      jsonData.forEach((row, index) => {
        if (!row["ชื่อสินค้า"] || !row["ราคาขาย"] || !row["BARCODE"]) {
          newErrors.push(
            `แถวที่ ${index + 2} ข้อมูลไม่ครบ (ชื่อสินค้า, ราคาขาย, BARCODE)`
          );
          return;
        }
        if (isNaN(Number(row["ราคาขาย"]))) {
          newErrors.push(`แถวที่ ${index + 2} ราคาขายไม่ใช่ตัวเลข`);
          return;
        }
        newRows.push(
          createData(
            Date.now() + index,
            row["ชื่อสินค้า"],
            row["รูปภาพ"] || "",
            row["BARCODE"],
            Number(row["ราคาขาย"]),
            Number(row["ราคาต้นทุน"]) || 0,
            Number(row["จำนวนสต็อก"]) || 0,
            Number(row["สต็อกต่ำสุด"]) || 0
          )
        );
      });

      setData(newRows);
      setErrors(newErrors);
      resetPage(0);
    };

    reader.readAsBinaryString(file);
  };

  function TableComponent({
    title,
    rows,
    errors,
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    setOrder,
    setOrderBy,
    setSelected,
    setPage,
    setRowsPerPage,
  }) {
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
      () =>
        [...rows]
          .sort(getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage, rows]
    );

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
      if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
      else if (selectedIndex === 0)
        newSelected = newSelected.concat(selected.slice(1));
      else if (selectedIndex === selected.length - 1)
        newSelected = newSelected.concat(selected.slice(0, -1));
      else if (selectedIndex > 0)
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      setSelected(newSelected);
    };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    return (
      <>
        {errors.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {errors.map((err, idx) => (
              <Alert severity="error" key={idx} sx={{ mb: 1 }}>
                {err}
              </Alert>
            ))}
          </Box>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} title={title} />
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
              size="medium"
              stickyHeader
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
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
                          {row.imgUrl ? (
                            <img
                              src={row.imgUrl}
                              alt={row.name}
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
                              alert(`แก้ไขสินค้า: ${row.name}`);
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(row);
                            }}
                          >
                            บันทึก
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {emptyRows > 0 && rows.length > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
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
      </>
    );
  }

  function TableComponent({
    title,
    rows,
    errors,
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    setOrder,
    setOrderBy,
    setSelected,
    setPage,
    setRowsPerPage,
    setData,
  }) {
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
      () =>
        [...rows]
          .sort(getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage, rows]
    );

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
      if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
      else if (selectedIndex === 0)
        newSelected = newSelected.concat(selected.slice(1));
      else if (selectedIndex === selected.length - 1)
        newSelected = newSelected.concat(selected.slice(0, -1));
      else if (selectedIndex > 0)
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      setSelected(newSelected);
    };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    return (
      <>
        {errors.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {errors.map((err, idx) => (
              <Alert severity="error" key={idx} sx={{ mb: 1 }}>
                {err}
              </Alert>
            ))}
          </Box>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} title={title} />
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
              size="medium"
              stickyHeader
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody sx={{
              "& .MuiTableCell-root": {
                borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)",
              },
            }}>
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
                          {row.imgUrl ? (
                            <img
                              src={row.imgUrl}
                              alt={row.name}
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
                              alert(`แก้ไขสินค้า: ${row.name}`);
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(row);
                            }}
                          >
                            บันทึก
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {emptyRows > 0 && rows.length > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
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
      </>
    );
  }

  return (
    <Box sx={{ px: { xs: 0, md: 25 } }}>
      <Typography variant="h5" gutterBottom>
        อัปโหลดไฟล์สินค้า .xlsx
      </Typography>

      <Stack direction="column" spacing={8} justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="ประเภทแห้ง"
            onFileChange={handleUpload(setData1, setErrors1, setPage1)}
          />
          <TableComponent
            title="ข้อมูลประเภทแห้ง"
            rows={data1}
            errors={errors1}
            order={order1}
            orderBy={orderBy1}
            selected={selected1}
            page={page1}
            rowsPerPage={rowsPerPage1}
            setOrder={setOrder1}
            setOrderBy={setOrderBy1}
            setSelected={setSelected1}
            setPage={setPage1}
            setRowsPerPage={setRowsPerPage1}
            setData={setData1}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="ประเภทเครื่องดื่ม"
            onFileChange={handleUpload(setData2, setErrors2, setPage2)}
          />
          <TableComponent
            title="ข้อมูลประเภทเครื่องดื่ม"
            rows={data2}
            errors={errors2}
            order={order2}
            orderBy={orderBy2}
            selected={selected2}
            page={page2}
            rowsPerPage={rowsPerPage2}
            setOrder={setOrder2}
            setOrderBy={setOrderBy2}
            setSelected={setSelected2}
            setPage={setPage2}
            setRowsPerPage={setRowsPerPage2}
            setData={setData2}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="ประเภทเครื่องเขียน"
            onFileChange={handleUpload(setData3, setErrors3, setPage3)}
          />
          <TableComponent
            title="ข้อมูลไฟล์ประเภทเครื่องเขียน"
            rows={data3}
            errors={errors3}
            order={order3}
            orderBy={orderBy3}
            selected={selected3}
            page={page3}
            rowsPerPage={rowsPerPage3}
            setOrder={setOrder3}
            setOrderBy={setOrderBy3}
            setSelected={setSelected3}
            setPage={setPage3}
            setRowsPerPage={setRowsPerPage3}
            setData={setData3}
          />
        </Box>
      </Stack>
    </Box>
  );
}