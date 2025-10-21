import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Box,
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
  Typography,
  Button,
  Fade,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Avatar,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DialogTitle from "@mui/material/DialogTitle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import TextField from "@mui/material/TextField";
import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption";

import { useAuth } from "../context/AuthProvider";
import {
  getStudentApplications,
  approveStudentApplication,
  rejectStudentApplication,
  deleteApprovedApplication,
  checkOrAddEmployee,
  deleteEmployeeByGmail,
} from "../api/registerStudentEmployeeApi";

import { updateUser } from "../api/personsApi";

const headCells = [
  { id: "firstName", label: "ชื่อ", width: "15%" },
  { id: "lastName", label: "นามสกุล", width: "15%" },
  { id: "gmail", label: "Gmail", width: "20%" },
  { id: "studentId", label: "เลขประจำตัวนักศึกษา", width: "20%" },
  { id: "schedule", label: "ตารางสอน", width: "15%" },
  { id: "contactInfo", label: "ช่องทางติดต่อ", width: "15%" },
  { id: "manage", label: "จัดการ", width: "20%" },
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
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              width: headCell.width,
              whiteSpace: "nowrap",
              px: 2,
              backgroundColor: `${theme.palette.background.chartBackground} !important`,
            }}
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

function ApproveStaff() {
  const [rows, setRows] = useState([]);
  const [pendingRows, setPendingRows] = useState([]);
  const [approvedRows, setApprovedRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("firstName");
  const [selected, setSelected] = useState([]);
  const [page] = useState(0);
  const [rowsPerPage] = useState(5);
  const theme = useTheme();
  const { user } = useAuth();
  const token = user?.token;
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    profileimage: "/AvatarUser.png",
    profileimageFile: null,
  });

  const handleOpenEditDialog = (employee) => {
    setSelectedEmployee({
      ...employee,
      email: employee.gmail,
    });
    setOpenEditDialog(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({
        open: true,
        message: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        severity: "error",
      });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "ไฟล์ต้องมีขนาดไม่เกิน 3MB",
        severity: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedEmployee((prev) => ({
        ...prev,
        profileimageFile: file,
        profileimage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditEmployee = async () => {
    try {
      if (!selectedEmployee.firstName || !selectedEmployee.lastName) {
        setSnackbar({
          open: true,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
          severity: "error",
        });
        return;
      }

      const payload = {
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        roleId: selectedEmployee.roleId,
        password: selectedEmployee.password,
        profileImage: selectedEmployee.profileimageFile,
      };

      const result = await updateUser(selectedEmployee.gmail, payload, token);

      setSnackbar({
        open: true,
        message: result.message,
        severity: "success",
      });

      setApprovedRows((prev) =>
        prev.map((row) =>
          row.id === selectedEmployee.id ? { ...row, ...selectedEmployee } : row
        )
      );

      setOpenEditDialog(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการแก้ไขพนักงาน",
        severity: "error",
      });
    }
  };

  const handleOpenAddDialog = (row) => {
    setSelectedEmployee(row);
    setNewEmployee({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.gmail,
      password: "",
      confirmPassword: "",
      showPassword: false,
      profileimage: row.profileimage || "",
      profileimageFile: null,
    });
    setOpenAddDialog(true);
  };

  const handleAddEmployee = async () => {
    try {
      if (
        !newEmployee.firstName ||
        !newEmployee.lastName ||
        !newEmployee.email ||
        !newEmployee.password
      ) {
        setSnackbar({
          open: true,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
          severity: "error",
        });
        return;
      }

      if (newEmployee.password !== newEmployee.confirmPassword) {
        setSnackbar({
          open: true,
          message: "รหัสผ่านไม่ตรงกัน",
          severity: "error",
        });
        return;
      }

      let file = newEmployee.profileimageFile;
      if (!file) {
        const response = await fetch("/AvatarUser.png");
        const blob = await response.blob();
        file = new File([blob], "AvatarUser.png", { type: blob.type });
      }

      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
        });

      const base64Image = await toBase64(file);

      const payload = {
        gmail: newEmployee.email,
        password: newEmployee.password,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        roleId: 3,
        profileimage: base64Image,
      };

      const result = await checkOrAddEmployee(payload, token);

      setSnackbar({
        open: true,
        message: result.message,
        severity: "success",
      });

      setApprovedRows((prev) =>
        prev.map((row) =>
          row.gmail === newEmployee.email ? { ...row, isEmployee: true } : row
        )
      );

      setOpenAddDialog(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    async function load() {
      try {
        if (!token) return;

        const data = await getStudentApplications(token);

        const pending = (data || [])
          .filter((item) => item.status === "รออนุมัติ")
          .map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            gmail: item.gmail,
            studentId: item.studentId,
            scheduleImg: item.schedule || null,
            contactInfo: item.contactInfo,
            status: item.status,
            isEmployee: item.isEmployee || false,
          }));

        const approved = (data || [])
          .filter((item) => item.status === "อนุมัติ")
          .map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            gmail: item.gmail,
            studentId: item.studentId,
            scheduleImg: item.schedule || null,
            contactInfo: item.contactInfo,
            status: item.status,
            isEmployee: item.isEmployee || false,
          }));

        setPendingRows(pending);
        setApprovedRows(approved);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
          severity: "error",
        });
      }
    }

    load();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      if (!token) {
        setSnackbar({
          open: true,
          message: "Token ไม่พบ กรุณา login ใหม่",
          severity: "error",
        });
        return;
      }

      const result = await approveStudentApplication(id, token);

      setSnackbar({
        open: true,
        message: result.message,
        severity: "success",
      });

      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: "อนุมัติ",
                isEmployee: result.student?.isEmployee || row.isEmployee,
              }
            : row
        )
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการอนุมัติ",
        severity: "error",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");

      const result = await rejectStudentApplication(id, token);

      setPendingRows((prev) => prev.filter((row) => row.id !== id));

      setSnackbar({
        open: true,
        message: `ไม่อนุมัติใบสมัครเรียบร้อยแล้ว`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการไม่อนุมัติ",
        severity: "error",
      });
    }
  };

  const handleDeleteApproved = async (id) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");
      const result = await deleteApprovedApplication(id, token);
      setSnackbar({
        open: true,
        message: result.message,
        severity: "success",
      });
      setApprovedRows((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error",
      });
    }
  };

  const handleDeleteStudentAndEmployee = async (gmail) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");

      const result = await deleteEmployeeByGmail(gmail, token);

      setSnackbar({
        open: true,
        message: result.message,
        severity: "success",
      });

      setApprovedRows((prev) => prev.filter((a) => a.gmail !== gmail));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการลบ",
        severity: "error",
      });
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const handleOpenSchedule = (imgUrl) => {
    setCurrentSchedule(imgUrl);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSchedule(null);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(5);

  const [approvedPage, setApprovedPage] = useState(0);
  const [approvedRowsPerPage, setApprovedRowsPerPage] = useState(5);

  const handlePendingPageChange = (event, newPage) => {
    setPendingPage(newPage);
  };
  const handlePendingRowsPerPageChange = (event) => {
    setPendingRowsPerPage(parseInt(event.target.value, 10));
    setPendingPage(0);
  };

  const handleApprovedPageChange = (event, newPage) => {
    setApprovedPage(newPage);
  };
  const handleApprovedRowsPerPageChange = (event) => {
    setApprovedRowsPerPage(parseInt(event.target.value, 10));
    setApprovedPage(0);
  };

  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%&*-_=+[]<>?";
    const allChars = upper + lower + numbers + special;

    let pass = "";
    const length = 10;

    for (let i = 0; i < length; i++) {
      pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return pass;
  };

  useEffect(() => {
    const pass = generateRandomPassword();
    setNewEmployee((prev) => ({
      ...prev,
      password: pass,
      confirmPassword: pass,
    }));
  }, []);

  const handleGeneratePassword = () => {
    const password = generateRandomPassword(10);
    setNewEmployee((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({
        open: true,
        message: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        severity: "error",
      });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "ไฟล์ต้องมีขนาดไม่เกิน 3MB",
        severity: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewEmployee((prev) => ({
        ...prev,
        profileimageFile: file,
        profileimage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        px: { xs: 0, sm: 2, md: 1.5, lg: 1.5, xl: 20 },
      }}
    >
      <Paper sx={{ width: "100%", mb: 10 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          title="นักศึกษา *รออนุมัติ*"
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
              minWidth: { xs: "300%", sm: 850 },
              tableLayout: "fixed",
            }}
            aria-labelledby="tableTitle"
            size={"medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
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
              {pendingRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีรายการนักศึกษาที่รออนุมัติ
                  </TableCell>
                </TableRow>
              ) : (
                pendingRows.map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover key={`pending-${row.id || index}`}>
                      {/* ชื่อ */}
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                        title={row.firstName}
                      >
                        {row.firstName}
                      </TableCell>

                      {/* นามสกุล */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.lastName}
                      </TableCell>

                      {/* Gmail */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.gmail}
                      </TableCell>

                      {/* เลขประจำตัวนักศึกษา */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.studentId}
                      </TableCell>

                      {/* ตารางสอน */}
                      <TableCell sx={{ px: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.background.ButtonDay,
                            color: theme.palette.text.hint,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSchedule(row.scheduleImg);
                          }}
                        >
                          ดูตารางสอน
                        </Button>
                      </TableCell>

                      {/* ช่องทางติดต่อ */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.contactInfo}
                      </TableCell>

                      {/* ปุ่มจัดการ */}
                      <TableCell sx={{ px: 2, whiteSpace: "nowrap" }}>
                        <Button
                          color="success"
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(row.id);
                          }}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(row.id);
                          }}
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
                        >
                          ไม่อนุมัติ
                        </Button>
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pendingRows.length}
            rowsPerPage={pendingRowsPerPage}
            page={pendingPage}
            onPageChange={handlePendingPageChange}
            onRowsPerPageChange={handlePendingRowsPerPageChange}
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

      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          title="นักศึกษา *อนุมัติแล้ว*"
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
            "&::-webkit-scrollbar": { height: 6 },
            backgroundColor: theme.palette.background.chartBackground,
          }}
        >
          <Table
            sx={{ minWidth: { xs: "300%", sm: 850 }, tableLayout: "fixed" }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
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
              {approvedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีรายการนักศึกษาอนุมัติ
                  </TableCell>
                </TableRow>
              ) : (
                approvedRows.map((row, index) => {
                  const labelId = `approved-${index}`;
                  return (
                    <TableRow hover key={`approved-${row.id || index}`}>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                        title={row.firstName}
                      >
                        {row.firstName}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.lastName}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.gmail}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.studentId}
                      </TableCell>

                      <TableCell sx={{ px: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.background.ButtonDay,
                            color: theme.palette.text.hint,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSchedule(row.scheduleImg);
                          }}
                        >
                          ดูตารางสอน
                        </Button>
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          px: 2,
                        }}
                      >
                        {row.contactInfo}
                      </TableCell>

                      <TableCell sx={{ px: 0 }}>
                        <Box sx={{ display: "flex", gap: 1, py: 0.5, px: 2 }}>
                          {!row.isEmployee ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenAddDialog(row)}
                              >
                                เพิ่มพนักงาน
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
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `ยืนยันการลบข้อมูลของ ${row.firstName}?`
                                    )
                                  ) {
                                    handleDeleteApproved(row.id);
                                  }
                                }}
                              >
                                ลบข้อมูล
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="contained"
                                color="info"
                                size="small"
                                onClick={() => handleOpenEditDialog(row)}
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
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `ยืนยันการลบข้อมูลของ ${row.firstName}?`
                                    )
                                  ) {
                                    handleDeleteStudentAndEmployee(row.gmail);
                                  }
                                }}
                              >
                                ลบพนักงาน
                              </Button>
                            </>
                          )}
                        </Box>
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={approvedRows.length}
            rowsPerPage={approvedRowsPerPage}
            page={approvedPage}
            onPageChange={handleApprovedPageChange}
            onRowsPerPageChange={handleApprovedRowsPerPageChange}
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

      {/* Dialog เพิ่มพนักงาน */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        disableEnforceFocus
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
            fontWeight: 500,
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: { xs: 2, md: 3 },
            pt: 0,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          เพิ่มพนักงานใหม่
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* รูปโปรไฟล์ */}
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 320 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: { xs: 3, md: 0 },
            }}
          >
            <label htmlFor="photo-upload">
              <Box
                sx={{
                  position: "relative",
                  width: 250,
                  height: 250,
                  borderRadius: "50%",
                  border: "3px dashed #666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover .overlay": { opacity: 1 },
                }}
              >
                {/* Avatar: ใช้ค่า profileimage ถ้าไม่มีจะใช้ default */}
                <Avatar
                  src={newEmployee.profileimage || "/AvatarUser.png"}
                  sx={{ width: "100%", height: "100%" }}
                />

                {/* Overlay สำหรับ hover */}
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    backgroundColor: "rgba(240,240,240,0.85)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 28, color: "#666" }} />
                  <Typography variant="caption" color="#666">
                    อัปโหลดรูป
                  </Typography>
                </Box>
              </Box>
            </label>

            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            <Typography
              variant="caption"
              color="gray"
              textAlign="center"
              mt={4}
            >
              อนุญาตเฉพาะไฟล์ .jpg, .png, <br /> ขนาดสูงสุด 3MB
            </Typography>
          </Box>

          {/* ฟอร์มเพิ่มพนักงาน */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: "100%",
              minWidth: 0,
              pt: { xs: 0, md: 1.5 },
            }}
          >
            <TextField
              label="ชื่อ"
              fullWidth
              value={newEmployee.firstName}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
            <TextField
              label="นามสกุล"
              fullWidth
              value={newEmployee.lastName}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
            <TextField
              label="อีเมล"
              fullWidth
              value={newEmployee.email}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4, bgcolor: "action.disabledBackground" },
                autoComplete: "new-email",
                readOnly: true,
              }}
            />
            <TextField
              label="รหัสผ่าน"
              type={newEmployee.showPassword ? "text" : "password"}
              fullWidth
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4 },
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0 }}>
                    <IconButton
                      onClick={() => {
                        const pass = generateRandomPassword();
                        setNewEmployee((prev) => ({
                          ...prev,
                          password: pass,
                          confirmPassword: pass,
                        }));
                      }}
                      edge="end"
                      sx={{ p: 0.8, mr: 0.5 }}
                    >
                      <EnhancedEncryptionIcon />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        setNewEmployee((prev) => ({
                          ...prev,
                          showPassword: !prev.showPassword,
                        }))
                      }
                      edge="end"
                      sx={{ p: 0.8, mr: 0 }}
                    >
                      {newEmployee.showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="ยืนยันรหัสผ่าน"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={newEmployee.confirmPassword}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ p: 0.8, mr: 0 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
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
            onClick={handleAddEmployee}
            variant="contained"
            color="primary"
          >
            เพิ่มพนักงาน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog แก้ไขพนักงาน */}
      <Dialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedEmployee(null);
        }}
        disableEnforceFocus
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
            fontWeight: 500,
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: { xs: 2, md: 3 },
            pt: 0,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          แก้ไขข้อมูลพนักงาน
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* รูปโปรไฟล์ */}
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 320 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: { xs: 3, md: 0 },
            }}
          >
            <label htmlFor="edit-photo-upload">
              <Box
                sx={{
                  position: "relative",
                  width: 250,
                  height: 250,
                  borderRadius: "50%",
                  border: "3px dashed #666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover .overlay": { opacity: 1 },
                }}
              >
                <Avatar
                  src={selectedEmployee?.profileimage || "/AvatarUser.png"}
                  sx={{ width: "100%", height: "100%" }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    backgroundColor: "rgba(240,240,240,0.85)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 28, color: "#666" }} />
                  <Typography variant="caption" color="#666">
                    อัปโหลดรูป
                  </Typography>
                </Box>
              </Box>
            </label>
            <input
              id="edit-photo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleEditFileChange}
            />
            <Typography
              variant="caption"
              color="gray"
              textAlign="center"
              mt={2}
            >
              อนุญาตเฉพาะไฟล์ .jpg, .png, <br /> ขนาดสูงสุด 3MB
            </Typography>
          </Box>

          {/* ฟอร์มแก้ไข */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: "100%",
              minWidth: 0,
              pt: { xs: 0, md: 1.5 },
            }}
          >
            <TextField
              label="ชื่อ"
              fullWidth
              value={selectedEmployee?.firstName || ""}
              onChange={(e) =>
                setSelectedEmployee((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
            <TextField
              label="นามสกุล"
              fullWidth
              value={selectedEmployee?.lastName || ""}
              onChange={(e) =>
                setSelectedEmployee((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
            <TextField
              label="อีเมล"
              fullWidth
              value={selectedEmployee?.email || ""}
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4, bgcolor: "action.disabledBackground" },
                readOnly: true,
              }}
            />
            <TextField
              label="รหัสผ่าน"
              type={selectedEmployee?.showPassword ? "text" : "password"}
              fullWidth
              value={selectedEmployee?.password || ""}
              onChange={(e) =>
                setSelectedEmployee((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4 },
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0 }}>
                    <IconButton
                      onClick={() => {
                        const pass = generateRandomPassword();
                        setSelectedEmployee((prev) => ({
                          ...prev,
                          password: pass,
                          confirmPassword: pass,
                        }));
                      }}
                      edge="end"
                      sx={{ p: 0.8, mr: 0.5 }}
                    >
                      <EnhancedEncryptionIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setSelectedEmployee((prev) => ({
                          ...prev,
                          showPassword: !prev.showPassword,
                        }))
                      }
                      edge="end"
                      sx={{ p: 0.8, mr: 0 }}
                    >
                      {selectedEmployee?.showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="ยืนยันรหัสผ่าน"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={selectedEmployee?.confirmPassword || ""}
              onChange={(e) =>
                setSelectedEmployee((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              variant="outlined"
              size="medium"
              InputProps={{
                sx: { borderRadius: 4 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ p: 0.8, mr: 0 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
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
            onClick={() => {
              setOpenEditDialog(false);
              setSelectedEmployee(null);
            }}
            color="inherit"
            variant="outlined"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleEditEmployee}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: theme.palette.background.ButtonDay,
              color: theme.palette.text.hint,
            }}
          >
            บันทึกการแก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* ตารางสอน */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={1}
        disableEnforceFocus={false}
        disableRestoreFocus={true}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
          paper: {
            sx: {
              borderRadius: 4,
              p: { xs: 1, md: 1 },
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogContent
          sx={{
            borderTop: "none",
            borderBottom: "none",
            px: { xs: 1, md: 1 },
            py: { xs: 1, md: 1 },
          }}
        >
          {currentSchedule ? (
            <Box
              component="img"
              src={currentSchedule}
              alt="ตารางสอน"
              sx={{ width: "100%", height: "auto" }}
            />
          ) : (
            <Typography>ไม่พบรูปภาพ</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            onClick={handleCloseDialog}
            autoFocus
          >
            ปิด
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

export default ApproveStaff;
