import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  InputAdornment,
  Fade,
} from "@mui/material";

import { useAuth } from "../context/AuthProvider";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchIcon from "@mui/icons-material/Search";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Avatar from "@mui/material/Avatar";

import {
  createUserRequest,
  verifyUserRequest,
  fetchUsers,
  updateUser,
  deleteUser,
} from "../api/personsApi";

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

const headCellsAdmin = [
  { id: "first_name", label: "ชื่อ", width: "20%" },
  { id: "last_name", label: "นามสกุล", width: "20%" },
  { id: "email", label: "อีเมล", width: "25%" },
  { id: "profileimage_img", label: "รูปโปรไฟล์", width: "15%" },
  { id: "manage", label: "จัดการข้อมูล", width: "20%" },
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
        {headCellsAdmin.map((headCell) => (
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
          ข้อมูลเจ้าของร้านทั้งหมด
        </Typography>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

function AdminTable() {
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
  const [newAdmin, setNewAdmin] = useState({
    profileimage: "/AvatarAdmin.png",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [searchText, setSearchText] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [reload, setReload] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const token = user?.token;
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const filteredRows = rows;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchUsers(token);
        if (!isMounted) return;
        const admins = Array.isArray(data)
          ? data.filter((user) => user.roleId === 2)
          : [];

        const mappedRows = admins.map((item, index) => ({
          id: index + 1,
          gmail: item.gmail,
          firstName: item.firstName,
          lastName: item.lastName,
          profileImage: item.profileImage
            ? `data:image/png;base64,${item.profileImage}`
            : null,
          roleId: item.roleId,
        }));

        setRows(mappedRows);
      } catch (err) {
        console.error("โหลดเจ้าของร้านล้มเหลว:", err);
        setRows([]);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [reload, token]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  useEffect(() => {
    const saved = localStorage.getItem("adminPendingOtp");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNewAdmin(parsed.newAdmin);
      setShowOtpForm(parsed.showOtpForm);
    }
  }, []);

  const handleAddAdmin = async () => {
    try {
      if (
        !newAdmin.firstName ||
        !newAdmin.lastName ||
        !newAdmin.email ||
        !newAdmin.password
      ) {
        setSnackbar({
          open: true,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
          severity: "error",
        });
        return;
      }

      if (newAdmin.password !== newAdmin.confirmPassword) {
        setSnackbar({
          open: true,
          message: "รหัสผ่านไม่ตรงกัน",
          severity: "error",
        });
        return;
      }

      let file = newAdmin.profileimageFile;
      if (!file) {
        const response = await fetch("/AvatarAdmin.png");
        const blob = await response.blob();
        file = new File([blob], "AvatarAdmin.png", { type: blob.type });
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
        gmail: newAdmin.email,
        password: newAdmin.password,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        roleId: 2,
        profileimage: base64Image,
      };

      const result = await createUserRequest(payload, token);

      setSnackbar({
        open: true,
        message: result.message || "เพิ่มเจ้าของร้านสำเร็จ!",
        severity: "success",
      });

      setOpenAddDialog(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการเพิ่มเจ้าของร้าน",
        severity: "error",
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otp.length !== 6) {
        setSnackbar({
          open: true,
          message: "กรุณากรอกรหัส OTP ให้ครบ 6 หลัก",
          severity: "info",
        });
        return;
      }

      const result = await verifyUserRequest(newAdmin.email, otp, token);
      console.log("ยืนยัน OTP สำเร็จ:", result);
      setSnackbar({
        open: true,
        message: "เพิ่มเจ้าของร้านสำเร็จ",
        severity: "success",
      });
      setOpenAddDialog(false);
      setShowOtpForm(false);
      setNewAdmin({
        profileimage: "/AvatarAdmin.png",
        profileimageFile: null,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setOtp("");
      localStorage.removeItem("adminPendingOtp");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
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
    setEditValues({
      gmail: row.gmail || "",
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      roleId: row.roleId,
      profileImage: row.profileImage || "",
      profileImageFile: null,
      password: "",
    });
  };

  const handleDialogChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDialogSave = async () => {
    try {
      const updatedUser = {
        password: editValues.password || undefined,
        firstName: editValues.firstName,
        lastName: editValues.lastName,
        roleId: editValues.roleId,
        profileImage: editValues.profileImageFile,
      };

      await updateUser(editValues.gmail, updatedUser, token);

      setSnackbar({
        open: true,
        message: "อัปเดตข้อมูลเจ้าของร้านสำเร็จ",
        severity: "success",
      });

      setEditRow(null);
      setReload((r) => !r);
      navigate(location.pathname, { replace: true });
    } catch (error) {
      console.error("❌ Error updating user:", error);
      setSnackbar({
        open: true,
        message: "ไม่สามารถอัปเดตผู้ใช้ได้",
        severity: "error",
      });
    }
  };

  const handleDialogClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditRow(null);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deleteRow || !deleteRow.gmail) return;

    try {
      await deleteUser(deleteRow.gmail, token);

      setDeleteRow(null);
      setReload((r) => !r);
      navigate(location.pathname, { replace: true });

      setSnackbar({
        open: true,
        message: "ลบเจ้าของร้านสำเร็จ",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "❌ Error deleting user:",
        error.response?.data || error.message
      );

      setSnackbar({
        open: true,
        message: error.message || "ไม่สามารถลบผู้ใช้ได้",
        severity: "error",
      });
    }
  };

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
              placeholder="ค้นหาชื่อหรืออีเมล..."
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
            <Box sx={{ bgcolor: theme.palette.background.chartBackground }}>
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
                  "&:hover": {
                    backgroundColor: theme.palette.background.ButtonDay,
                  },
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                เพิ่มเจ้าของร้าน
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
            >
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    ยังไม่มีรายการเจ้าของร้าน
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    ไม่มีเจ้าของร้านตามเงื่อนไขที่เลือก
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows
                  .sort(getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
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
                      >
                        {/* Checkbox */}
                        <TableCell padding="checkbox" sx={{ width: 48 }}>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => handleClick(event, row.id)}
                          />
                        </TableCell>

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
                            px: 1,
                          }}
                          title={row.firstName}
                        >
                          {row.firstName}
                        </TableCell>

                        {/* นามสกุล */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.lastName}
                        </TableCell>

                        {/* อีเมล */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.gmail}
                        </TableCell>

                        {/* รูปโปรไฟล์ */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          <img
                            src={row.profileImage || "/AvatarAdmin.png"}
                            alt={row.firstName}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        </TableCell>

                        {/* จัดการข้อมูล */}
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

      {/* Dialog เพิ่มเจ้าของร้านใหม่ */}
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
            fontWeight: "500",
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: { xs: 2, md: 3 },
            pt: 0,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          เพิ่มเจ้าของร้านใหม่
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
          {!showOtpForm && (
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
                  {newAdmin.profileimage ? (
                    <>
                      <Avatar
                        src={newAdmin.profileimage}
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
                    </>
                  ) : (
                    <Box
                      className="overlay"
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.3s ease",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                    >
                      <AddPhotoAlternateIcon
                        sx={{ fontSize: 28, color: "#666" }}
                      />
                      <Typography variant="caption" color="#666">
                        อัปโหลดรูป
                      </Typography>
                    </Box>
                  )}
                </Box>
              </label>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
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
                    setNewAdmin((prev) => ({
                      ...prev,
                      profileimage: reader.result,
                      profileimageFile: file,
                    }));

                    setSnackbar({
                      open: true,
                      message: "อัปโหลดรูปภาพสำเร็จ",
                      severity: "success",
                    });
                  };
                  reader.readAsDataURL(file);
                }}
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
          )}

          {/* ฟอร์มเพิ่มเจ้าของร้าน */}
          {!showOtpForm && (
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
                value={newAdmin.firstName}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
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
                value={newAdmin.lastName}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
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
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                }
                variant="outlined"
                size="medium"
                inputProps={{ autoComplete: "new-email" }}
                InputProps={{ sx: { borderRadius: 4 } }}
              />

              <TextField
                label="รหัสผ่าน"
                type="password"
                fullWidth
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                variant="outlined"
                size="medium"
                inputProps={{ autoComplete: "new-password" }}
                InputProps={{ sx: { borderRadius: 4 } }}
              />
              <TextField
                label="ยืนยันรหัสผ่าน"
                type="password"
                fullWidth
                value={newAdmin.confirmPassword}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                variant="outlined"
                size="medium"
                InputProps={{ sx: { borderRadius: 4 } }}
              />
            </Box>
          )}

          {/* ฟอร์ม OTP */}
          {showOtpForm && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" color="primary">
                กรอกรหัส OTP
              </Typography>
              <TextField
                label="OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) setOtp(value);
                }}
                type="tel"
                inputProps={{ maxLength: 6 }}
                variant="outlined"
                size="medium"
                InputProps={{ sx: { borderRadius: 4 } }}
                sx={{ maxWidth: 200 }}
              />
            </Box>
          )}
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

          {!showOtpForm ? (
            <Button
              onClick={handleAddAdmin}
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: theme.palette.background.ButtonDay,
                color: theme.palette.text.hint,
              }}
            >
              เพิ่มเจ้าของร้าน
            </Button>
          ) : (
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              color="success"
            >
              ยืนยัน OTP
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog แก้ไขข้อมูลเจ้าของร้าน */}
      <Dialog
        open={!!editRow}
        onClose={handleDialogClose}
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
            fontWeight: "500",
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            pb: 2,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          แก้ไขข้อมูลเจ้าของร้าน
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
          {/* รูปโปรไฟล์ */}
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 250 },
              overflow: "hidden",
              borderRadius: 6,
              mb: { xs: 3, md: 0 },
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: "100%", md: 250 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
              }}
            >
              <label htmlFor="photo-upload">
                <Box
                  sx={{
                    position: "relative",
                    width: 200,
                    height: 200,
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
                  {editValues.profileImage ? (
                    <>
                      <Avatar
                        src={editValues.profileImage}
                        sx={{ width: "100%", height: "100%" }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: "absolute",
                          width: 170,
                          height: 170,
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
                    </>
                  ) : (
                    <Box
                      className="overlay"
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.3s ease",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                    >
                      <AddPhotoAlternateIcon
                        sx={{ fontSize: 28, color: "#666" }}
                      />
                      <Typography variant="caption" color="#666">
                        อัปโหลดรูป
                      </Typography>
                    </Box>
                  )}
                </Box>
              </label>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
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

                  handleDialogChange("profileImageFile", file);
                  handleDialogChange("profileImage", URL.createObjectURL(file));
                }}
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
          </Box>

          {/* ฟอร์ม */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* Gmail แสดงเฉยๆ */}
            <TextField
              label="อีเมล"
              fullWidth
              value={editValues.gmail || ""}
              InputProps={{
                readOnly: true,
                sx: { borderRadius: 4, bgcolor: "action.disabledBackground" },
              }}
            />

            {/* ชื่อ */}
            <TextField
              label="ชื่อ"
              fullWidth
              value={editValues.firstName || ""}
              onChange={(e) => handleDialogChange("firstName", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />

            {/* นามสกุล */}
            <TextField
              label="นามสกุล"
              fullWidth
              value={editValues.lastName || ""}
              onChange={(e) => handleDialogChange("lastName", e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{ sx: { borderRadius: 4 } }}
            />

            {/* Password (เพิ่มใหม่) */}
            <TextField
              label="รหัสผ่านใหม่"
              name="new_password"
              type="password"
              fullWidth
              value={editValues.password || ""}
              onChange={(e) => handleDialogChange("password", e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
              autoComplete="new-password"
              inputProps={{ autoComplete: "new-password" }}
              InputProps={{ sx: { borderRadius: 4 } }}
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

      {/* Dialog ลบเจ้าของร้าน */}
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
            ยืนยันการลบเจ้าของร้าน
          </DialogTitle>
          <DialogContent
            sx={{
              fontSize: "1rem",
              color: "text.secondary",
            }}
          >
            คุณต้องการลบเจ้าของร้าน <br />
            <Typography component="span" fontWeight="bold" color="error.main">
              {deleteRow?.gmail}
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
            onClick={handleDeleteUserConfirm}
            sx={{
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            ลบข้อมูล
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

export default AdminTable;
