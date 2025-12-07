import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Grid,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Toolbar,
    TablePagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { createDailyPayment } from "../api/sellStockOutApi";
import { useAuth } from "../context/AuthProvider";

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

function stableSort(array, comparator) {
    const stabilized = array.map((el, idx) => [el, idx]);
    stabilized.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
}

const headCellsDailyPayment = [
    { id: "item_name", label: "รายการ", width: "60%" },
    { id: "item_price", label: "ราคา", width: "20%" },
    { id: "item_manage", label: "จัดการ", width: "20%" },
];

function EnhancedTableHeadDailyPayment({ order, orderBy, onRequestSort }) {
    const theme = useTheme();
    const createSortHandler = (property) => (event) =>
        onRequestSort(event, property);

    return (
        <TableHead>
            <TableRow>
                {headCellsDailyPayment.map((headCell) => (
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
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({ title }) {
    return (
        <Toolbar
            sx={{
                px: { xs: 1, sm: 2 },
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                position: { xs: "sticky", sm: "static" },
                top: 0,
                backgroundColor: "background.paper",
                zIndex: 1100,
            }}
        >
            <Typography sx={{ flex: "1 1 100%" }} variant="h6">
                {title}
            </Typography>
        </Toolbar>
    );
}

function FlexCost() {
    const theme = useTheme();
    const { user } = useAuth();
    const token = user?.token;

    const [icePrice, setIcePrice] = useState("10");
    const [otherName, setOtherName] = useState("");
    const [otherPrice, setOtherPrice] = useState("");
    const [dailyPayment, setDailyPayment] = useState("50");

    const [dailyRows, setDailyRows] = useState(() => {
        const stored = localStorage.getItem("dailyPayments");
        return stored ? JSON.parse(stored) : [];
    });

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("item_name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // เพิ่มรายการจ่าย
    const handleAddDailyRow = (name, price) => {
        const numPrice = Number(price);
        if (!name || isNaN(numPrice) || numPrice <= 0) {
            return showSnackbar("กรุณากรอกข้อมูลให้ถูกต้อง", "error");
        }

        const newRow = {
            id: Date.now(),
            item_name: name,
            item_price: numPrice,
        };

        setDailyRows((prev) => {
            const updated = [...prev, newRow];
            localStorage.setItem("dailyPayments", JSON.stringify(updated));
            return updated;
        });

        showSnackbar(`เพิ่มรายการ "${name}" สำเร็จ`);
    };

    // ยืนยันรายการ
    const handleConfirm = async (id) => {
        const row = dailyRows.find((r) => r.id === id);
        if (!row) return showSnackbar("ไม่พบรายการ", "error");

        try {
            const data = await createDailyPayment(token, {
                item_name: row.item_name,
                amount: Number(row.item_price),
                payment_date: new Date().toISOString().split("T")[0],
            });

            setDailyRows((prev) => {
                const updated = prev.filter((r) => r.id !== id);
                localStorage.setItem("dailyPayments", JSON.stringify(updated));
                return updated;
            });

            showSnackbar(`ยืนยันรายการ "${row.item_name}" สำเร็จ`);
        } catch (err) {
            showSnackbar(err.message || "เกิดข้อผิดพลาด", "error");
        }
    };

    const handleDeleteDailyRow = (id) => {
        setDailyRows((prev) => {
            const updated = prev.filter((row) => row.id !== id);
            localStorage.setItem("dailyPayments", JSON.stringify(updated));
            return updated;
        });

        showSnackbar("ลบรายการสำเร็จ");
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) =>
        setRowsPerPage(parseInt(event.target.value, 10));

    const visibleDailyRows = useMemo(
        () =>
            stableSort(dailyRows, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [dailyRows, order, orderBy, page, rowsPerPage]
    );

    return (
        <Box sx={{ width: "100%", px: { xs: 0, sm: 2, md: 1.5, xl: 20 } }}>
            {/* 3 กล่องบน */}
            <Grid
                container
                spacing={2}
                sx={{ justifyContent: "center", flexWrap: "wrap" }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        justifyContent: "center",
                    }}
                >
                    {/* ค่าจ้างรายวัน */}
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.chartBackground,
                            borderRadius: 4,
                            width: { xs: "100%", sm: "33%" },
                            minWidth: 280,
                        }}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            เงินค่าจ้างรายวันพนักงาน
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="กรอกเงินค่าจ้างรายวัน"
                            size="small"
                            value={dailyPayment}
                            onChange={(e) => setDailyPayment(e.target.value)}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                            }}
                            InputProps={{ sx: { borderRadius: 2, height: 40 } }}
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                min: 0,
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            disabled={
                                !dailyPayment ||
                                isNaN(Number(dailyPayment)) ||
                                Number(dailyPayment) <= 0
                            }
                            onClick={() => {
                                handleAddDailyRow("ค่าจ้างรายวัน", dailyPayment);
                                setDailyPayment("");
                            }}
                            sx={{
                                borderRadius: 2,
                                color: theme.palette.text.hint,
                                height: 40,
                            }}
                        >
                            เพิ่ม
                        </Button>
                    </Paper>

                    {/* ค่าน้ำแข็ง */}
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.chartBackground,
                            borderRadius: 4,
                            width: { xs: "100%", sm: "33%" },
                            minWidth: 280,
                        }}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            ค่าน้ำแข็ง
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="กรอกค่าน้ำแข็ง"
                            size="small"
                            value={icePrice}
                            onChange={(e) => setIcePrice(e.target.value)}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                            }}
                            InputProps={{ sx: { borderRadius: 2, height: 40 } }}
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                min: 0,
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            disabled={
                                !icePrice || isNaN(Number(icePrice)) || Number(icePrice) <= 0
                            }
                            onClick={() => {
                                handleAddDailyRow("ค่าน้ำแข็ง", icePrice);
                                setIcePrice("");
                            }}
                            sx={{
                                borderRadius: 2,
                                color: theme.palette.text.hint,
                                height: 40,
                            }}
                        >
                            เพิ่ม
                        </Button>
                    </Paper>

                    {/* อื่นๆ */}
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.chartBackground,
                            borderRadius: 4,
                            width: { xs: "100%", sm: "33%" },
                            minWidth: 280,
                        }}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            อื่นๆ
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="ระบุชื่อรายการ"
                            size="small"
                            value={otherName}
                            onChange={(e) => setOtherName(e.target.value)}
                            sx={{ mb: 1.6 }}
                            InputProps={{ sx: { borderRadius: 2, height: 40 } }}
                        />

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="กรอกราคา"
                                size="small"
                                value={otherPrice}
                                onChange={(e) => setOtherPrice(e.target.value)}
                                onKeyDown={(e) => {
                                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                }}
                                InputProps={{ sx: { borderRadius: 2, height: 40 } }}
                                inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    min: 0,
                                }}
                            />

                            <Button
                                variant="contained"
                                disabled={
                                    !otherName ||
                                    !otherPrice ||
                                    isNaN(Number(otherPrice)) ||
                                    Number(otherPrice) <= 0
                                }
                                onClick={() => {
                                    handleAddDailyRow(otherName, otherPrice);
                                    setOtherName("");
                                    setOtherPrice("");
                                }}
                                sx={{
                                    borderRadius: 2,
                                    color: theme.palette.text.hint,
                                    whiteSpace: "nowrap",
                                    px: 3,
                                    height: 40,
                                }}
                            >
                                เพิ่ม
                            </Button>
                        </Box>
                    </Paper>
                </Box>

            </Grid>

            {/* ตารางรายการ */}
            <Paper sx={{ width: "100%", mt: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <EnhancedTableToolbar
                        title="รายการจ่ายรายวัน"
                        sx={{ textAlign: "left" }}
                    />

                    <Typography variant="caption" sx={{ textAlign: "right", pr: 2 }}>
                        แสดง {dailyRows.length} รายการ
                    </Typography>
                </Box>

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
                    }}>
                    <Table stickyHeader>
                        <EnhancedTableHeadDailyPayment
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />

                        <TableBody
                            sx={{
                                "& .MuiTableCell-root": {
                                    borderBottom: "0.3px dashed rgba(153, 153, 153, 0.3)",
                                },
                            }}>
                            {visibleDailyRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        ยังไม่มีรายการ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleDailyRows.map((row) => (
                                    <TableRow hover key={row.id}>
                                        <TableCell>{row.item_name}</TableCell>
                                        <TableCell>{row.item_price} บาท</TableCell>

                                        <TableCell sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="success"
                                                onClick={() => handleConfirm(row.id)}
                                            >
                                                ยืนยัน
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteDailyRow(row.id)}
                                            >
                                                ลบ
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                        count={dailyRows.length}
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
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
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

export default FlexCost;