import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Stack, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, CircularProgress, } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { uploadProducts } from "../api/productApi";

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
  { id: "product_name", label: "ชื่อสินค้า", width: "20%" },
  { id: "image_url", label: "รูปภาพ", width: "15%" },
  { id: "barcode", label: "BARCODE", width: "15%" },
  { id: "price", label: "ราคาขาย", width: "10%" },
  { id: "cost", label: "ราคาต้นทุน", width: "10%" },
  { id: "stock", label: "จำนวนสต็อก", width: "10%" },
  { id: "reorder_level", label: "สต็อกต่ำสุด", width: "10%" },
];

function EnhancedTableHead(props) {
  const theme = useTheme();
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

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
              px: 2,
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
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { title } = props;
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
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {title}
      </Typography>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
};

const UploadBox = ({ label, onFileChange, disabled, uploading }) => {
  const theme = useTheme();
  return (
    <Box width="100%">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 100,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          {label}
        </Typography>
      </Box>
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
          cursor: disabled ? "default" : "pointer",
          backgroundColor: theme.palette.background.Backgroundupload,
          "&:hover": {
            backgroundColor: disabled
              ? theme.palette.background.Backgroundupload
              : theme.palette.background.backgroundUploadHover,
            borderColor: disabled ? "rgba(153,153,153,0.2)" : "#888",
          },
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
            cursor: disabled ? "default" : "pointer",
          }}
          onChange={onFileChange}
          disabled={disabled}
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          color="#999"
          sx={{ userSelect: "none" }}
        >
          {uploading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                กำลังอัปโหลดไฟล์...
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon
                sx={{ fontSize: 80, marginBottom: 1, color: "#1565C0" }}
              />
              <Typography variant="body2" color="textSecondary">
                คลิกหรือวางไฟล์ที่นี่
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

function validateData(mappedData) {
  const errors = [];
  const barcodeSet = new Set();

  mappedData.forEach((item) => {
    const row = item.__row;

    if (!item.product_name) {
      errors.push(`แถว ${row} ขาดชื่อสินค้า`);
    }

    if (!item.barcode) {
      errors.push(`แถว ${row} ขาด BARCODE`);
    } else {
      if (barcodeSet.has(item.barcode)) {
        errors.push(`แถว ${row} Barcode ซ้ำ: ${item.barcode}`);
      } else {
        barcodeSet.add(item.barcode);
      }
    }

    ["price", "cost", "stock", "reorder_level"].forEach((field) => {
      const value = item[field];
      if (typeof value !== "number" || isNaN(value) || value < 0) {
        errors.push(`แถว ${row} ค่า ${field} ต้องเป็นตัวเลข ≥ 0`);
      }
    });
  });

  return errors;
}

function UploadProductsXlsx() {
  const theme = useTheme();
  const [data1, setData1] = useState([]);
  const [errors1, setErrors1] = useState([]);
  const [order1, setOrder1] = useState("asc");
  const [orderBy1, setOrderBy1] = useState("product_name");
  const [page1, setPage1] = useState(0);
  const [rowsPerPage1, setRowsPerPage1] = useState(25);
  const [uploading1, setUploading1] = useState(false);

  const [data2, setData2] = useState([]);
  const [errors2, setErrors2] = useState([]);
  const [order2, setOrder2] = useState("asc");
  const [orderBy2, setOrderBy2] = useState("product_name");
  const [page2, setPage2] = useState(0);
  const [rowsPerPage2, setRowsPerPage2] = useState(25);
  const [uploading2, setUploading2] = useState(false);

  const [data3, setData3] = useState([]);
  const [errors3, setErrors3] = useState([]);
  const [order3, setOrder3] = useState("asc");
  const [orderBy3, setOrderBy3] = useState("product_name");
  const [page3, setPage3] = useState(0);
  const [rowsPerPage3, setRowsPerPage3] = useState(25);
  const [uploading3, setUploading3] = useState(false);

  const [data4, setData4] = useState([]);
  const [errors4, setErrors4] = useState([]);
  const [order4, setOrder4] = useState("asc");
  const [orderBy4, setOrderBy4] = useState("product_name");
  const [page4, setPage4] = useState(0);
  const [rowsPerPage4, setRowsPerPage4] = useState(25);
  const [uploading4, setUploading4] = useState(false);

  const [data5, setData5] = useState([]);
  const [errors5, setErrors5] = useState([]);
  const [order5, setOrder5] = useState("asc");
  const [orderBy5, setOrderBy5] = useState("product_name");
  const [page5, setPage5] = useState(0);
  const [rowsPerPage5, setRowsPerPage5] = useState(25);
  const [uploading5, setUploading5] = useState(false);

  function handleUpload(setData, setErrors, setPage, setUploading, category) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          setErrors([]);
          setUploading(true);

          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (
            (category === "dried_food" &&
              !sheetName.toLowerCase().includes("แห้ง")) ||
            (category === "soft_drink" &&
              !sheetName.toLowerCase().includes("เครื่องดื่ม")) ||
            (category === "stationery" &&
              !sheetName.toLowerCase().includes("เครื่องเขียน")) ||
            (category === "fresh_food" &&
              !sheetName.toLowerCase().includes("แช่แข็ง")) ||
            (category === "snack" &&
              !sheetName.toLowerCase().includes("ขนม"))
          ) {
            setErrors([`ไฟล์นี้ไม่ตรงกับประเภทสินค้า (${sheetName})`]);
            setUploading(false);
            return;
          }

          const mappedData = jsonData.map((row, index) => ({
            product_name: row["ชื่อสินค้า"]
              ? String(row["ชื่อสินค้า"]).trim()
              : "",
            barcode: row["BARCODE"] ? String(row["BARCODE"]).trim() : "",
            price: Number(row["ราคาขาย"]) || 0,
            cost: Number(row["ราคาต้นทุน"]) || 0,
            stock: Number(row["จำนวนสต็อก"]) || 0,
            reorder_level: Number(row["สต็อกต่ำสุด"]) || 0,
            image_url: row["รูปภาพ"] || "",
            __row: index + 2,
          }));

          const errors = validateData(mappedData);
          if (errors.length > 0) {
            setErrors(errors);
            setUploading(false);
            return;
          }

          await uploadProducts(
            category,
            mappedData.map(({ __row, ...rest }) => rest)
          );
          setData(mappedData);
          setPage(0);
        } catch (error) {
          setErrors([error.message || "Unknown error"]);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsBinaryString(file);
    };
  }

  function TableComponent({
    title,
    rows,
    errors,
    order,
    orderBy,
    page,
    rowsPerPage,
    setOrder,
    setOrderBy,
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
          <EnhancedTableToolbar title={title} />
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
                order={order}
                orderBy={orderBy}
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
                    <TableCell colSpan={7} align="center">
                      ยังไม่มีรายการสินค้า
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((row, index) => {
                    const labelId = `enhanced-table-row-${index}`;
                    const keyValue = row.id ?? row.barcode ?? index;
                    return (
                      <TableRow hover key={keyValue} tabIndex={-1}>
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
                          title={row.product_name}
                        >
                          {row.product_name}
                        </TableCell>
                        <TableCell sx={{ width: "15%", px: 1 }}>
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
                        <TableCell sx={{ width: "10%", px: 1 }}>
                          {row.stock} ชิ้น
                        </TableCell>
                        <TableCell sx={{ width: "10%", px: 1 }}>
                          {row.reorder_level} ชิ้น
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {emptyRows > 0 && rows.length > 0 && (
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
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 },
      }}
    >
      <Typography variant="h5" gutterBottom>
        อัปโหลดไฟล์สินค้า .xlsx
      </Typography>

      <Stack direction="column" spacing={10} justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="สินค้าประเภทแห้ง"
            onFileChange={handleUpload(
              setData1,
              setErrors1,
              setPage1,
              setUploading1,
              "dried_food"
            )}
            disabled={uploading1}
            uploading={uploading1}
          />
          <TableComponent
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">ข้อมูลประเภทแห้ง</Typography>
                <Typography variant="caption">
                  แสดง {data1.length} รายการ
                </Typography>
              </Box>
            }
            rows={data1}
            errors={errors1}
            order={order1}
            orderBy={orderBy1}
            page={page1}
            rowsPerPage={rowsPerPage1}
            setOrder={setOrder1}
            setOrderBy={setOrderBy1}
            setPage={setPage1}
            setRowsPerPage={setRowsPerPage1}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="สินค้าประเภทเครื่องดื่ม"
            onFileChange={handleUpload(
              setData2,
              setErrors2,
              setPage2,
              setUploading2,
              "soft_drink"
            )}
            disabled={uploading2}
            uploading={uploading2}
          />
          <TableComponent
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">ข้อมูลประเภทเครื่องดื่ม</Typography>
                <Typography variant="caption">
                  แสดง {data1.length} รายการ
                </Typography>
              </Box>
            }
            rows={data2}
            errors={errors2}
            order={order2}
            orderBy={orderBy2}
            page={page2}
            rowsPerPage={rowsPerPage2}
            setOrder={setOrder2}
            setOrderBy={setOrderBy2}
            setPage={setPage2}
            setRowsPerPage={setRowsPerPage2}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="สินค้าประเภทเครื่องเขียน"
            onFileChange={handleUpload(
              setData3,
              setErrors3,
              setPage3,
              setUploading3,
              "stationery"
            )}
            disabled={uploading3}
            uploading={uploading3}
          />
          <TableComponent
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">ข้อมูลประเภทเครื่องเขียน</Typography>
                <Typography variant="caption">
                  แสดง {data1.length} รายการ
                </Typography>
              </Box>
            }
            rows={data3}
            errors={errors3}
            order={order3}
            orderBy={orderBy3}
            page={page3}
            rowsPerPage={rowsPerPage3}
            setOrder={setOrder3}
            setOrderBy={setOrderBy3}
            setPage={setPage3}
            setRowsPerPage={setRowsPerPage3}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="สินค้าประเภทแช่แข็ง"
            onFileChange={handleUpload(
              setData4,
              setErrors4,
              setPage4,
              setUploading4,
              "fresh_food"
            )}
            disabled={uploading4}
            uploading={uploading4}
          />
          <TableComponent
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">ข้อมูลประเภทแช่แข็ง</Typography>
                <Typography variant="caption">
                  แสดง {data1.length} รายการ
                </Typography>
              </Box>
            }
            rows={data4}
            errors={errors4}
            order={order4}
            orderBy={orderBy4}
            page={page4}
            rowsPerPage={rowsPerPage4}
            setOrder={setOrder4}
            setOrderBy={setOrderBy4}
            setPage={setPage4}
            setRowsPerPage={setRowsPerPage4}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UploadBox
            label="สินค้าประเภทขนม"
            onFileChange={handleUpload(
              setData5,
              setErrors5,
              setPage5,
              setUploading5,
              "snack"
            )}
            disabled={uploading5}
            uploading={uploading5}
          />
          <TableComponent
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">ข้อมูลประเภทขนม</Typography>
                <Typography variant="caption">
                  แสดง {data1.length} รายการ
                </Typography>
              </Box>
            }
            rows={data5}
            errors={errors5}
            order={order5}
            orderBy={orderBy5}
            page={page5}
            rowsPerPage={rowsPerPage5}
            setOrder={setOrder5}
            setOrderBy={setOrderBy5}
            setPage={setPage5}
            setRowsPerPage={setRowsPerPage5}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default UploadProductsXlsx;
