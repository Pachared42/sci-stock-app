import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useAuth } from "../context/AuthProvider";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";

import {
  getStudentApplications,
  approveStudentApplication,
  rejectStudentApplication,
  deleteApprovedApplication,
} from "../api/registerStudentEmployeeApi";

const headCells = [
  { id: "firstName", label: "ชื่อ", width: "15%" },
  { id: "lastName", label: "นามสกุล", width: "15%" },
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

export default function EnhancedTable() {
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
            studentId: item.studentId,
            scheduleImg: item.schedule || null,
            contactInfo: item.contactInfo,
            status: item.status,
          }));

        const approved = (data || [])
          .filter((item) => item.status === "อนุมัติ")
          .map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            studentId: item.studentId,
            scheduleImg: item.schedule || null,
            contactInfo: item.contactInfo,
            status: item.status,
          }));

        setPendingRows(pending);
        setApprovedRows(approved);
      } catch (err) {
        alert(err.message);
      }
    }

    load();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");
      const result = await approveStudentApplication(id, token);
      alert("อนุมัติเรียบร้อย: " + result.message);
      setRows((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");
      const result = await rejectStudentApplication(id, token);
      alert("ไม่อนุมัติเรียบร้อย: " + result.message);
      setRows((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteApproved = async (id) => {
    try {
      if (!token) return alert("Token ไม่พบ กรุณา login ใหม่");
      const result = await deleteApprovedApplication(id, token);
      alert("ลบเรียบร้อย: " + result.message);
      setApprovedRows((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
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
                        {row.studentId}
                      </TableCell>

                      <TableCell sx={{ px: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSchedule(row.scheduleImg);
                          }}
                        >
                          ดูตาราง
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

      {/* Dialog popup ตารางสอน */}
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
              borderRadius: 6,
              p: { xs: 1, md: 1.5 },
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle>ตารางสอน</DialogTitle>

        <DialogContent
          sx={{
            borderTop: "none",
            borderBottom: "none",
            px: { xs: 1, md: 1.5 },
            pb: 1.5,
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
              {approvedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีรายการนักศึกษาอนุมัติ
                  </TableCell>
                </TableRow>
              ) : (
                approvedRows.map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

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
                        {row.studentId}
                      </TableCell>

                      <TableCell sx={{ px: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSchedule(row.scheduleImg);
                          }}
                        >
                          ดูตาราง
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

                      <TableCell sx={{ px: 2, whiteSpace: "nowrap" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "inline-block",
                            px: 1.2,
                            py: 0.6,
                            backgroundColor: theme.palette.success.light,
                            color: theme.palette.common.black,
                            borderRadius: 2,
                            fontWeight: 500,
                            textAlign: "center",
                            minWidth: 60,
                          }}
                        >
                          อนุมัติแล้ว
                        </Typography>

                        {/* ปุ่มลบ */}
                        <Button
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApproved(row.id);
                          }}
                        >
                          ลบข้อมูล
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
    </Box>
  );
}
