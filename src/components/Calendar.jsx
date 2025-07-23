import React, { useRef, useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import listPlugin from "@fullcalendar/list";

import "../theme/calendarStyles.css";

import {
  Card,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  ArrowBackIosRounded as ArrowBackIosRoundedIcon,
  ArrowForwardIosRounded as ArrowForwardIosRoundedIcon,
} from "@mui/icons-material";

const tagColors = {
  shipping: "#66bb6a",
  holiday: "#ef5350",
};

export default function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([
    { id: 1, title: "ทำงาน", date: "2025-07-22", tag: "shipping" },
    { id: 2, title: "ลางาน", date: "2025-07-23", tag: "holiday" },
  ]);

  const [currentTitle, setCurrentTitle] = useState("ปฏิทิน");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", tag: "meeting" });

  const calendarApi = () => calendarRef.current?.getApi();

  useEffect(() => {
    const updateTitle = () => {
      const api = calendarApi();
      if (api) setCurrentTitle(api.view.title);
    };
    setTimeout(updateTitle, 0);
  }, []);

  const handleNavigate = (action) => {
    const api = calendarApi();
    if (!api) return;
    api[action]();
    setCurrentTitle(api.view.title);
  };

  const handleAddOrUpdate = () => {
    if (!form.title || !form.date) return;

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...form } : e))
      );
      setAlert({ open: true, message: "แก้ไขการทำงานแล้ว", severity: "info" });
    } else {
      const newId = events.length ? Math.max(...events.map((e) => e.id)) + 1 : 1;
      setEvents([...events, { ...form, id: newId }]);
      setAlert({ open: true, message: "เพิ่มการทำงานแล้ว", severity: "success" });
    }

    setOpenDialog(false);
    setForm({ title: "", date: "", tag: "meeting" });
    setEditingEvent(null);
  };

  const handleEventClick = (info) => {
    const event = events.find((e) => e.id.toString() === info.event.id);
    if (!event) return;
    setForm({ title: event.title, date: event.date, tag: event.tag });
    setEditingEvent(event);
    setOpenDialog(true);
  };

  const handleEventDrop = (info) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id.toString() === info.event.id ? { ...e, date: info.event.startStr } : e
      )
    );
    setAlert({ open: true, message: "เลื่อนการทำงานแล้ว", severity: "info" });
  };

  const handleDeleteEvent = () => {
    setEvents((prev) => prev.filter((e) => e.id !== editingEvent.id));
    setAlert({ open: true, message: "ลบการทำงานแล้ว", severity: "error" });
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, interactionPlugin, listPlugin],
    locales: [thLocale],
    locale: "th",
    initialView: isMobile ? "listWeek" : "dayGridMonth",
    editable: true,
    selectable: true,
    droppable: true,
    height: "100%",
    expandRows: true,
    dayMaxEventRows: true,
    events: events.map((e) => ({ ...e, backgroundColor: tagColors[e.tag] })),
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
    select: (info) => {
      setForm({ title: "", date: info.startStr, tag: "meeting" });
      setEditingEvent(null);
      setOpenDialog(true);
    },
    views: { listWeek: { buttonText: "รายการสัปดาห์" } },
    headerToolbar: false,
    eventContent: (arg) => {
      const tag = arg.event.extendedProps.tag;
      const bgColor = tagColors[tag] || "#ccc";
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            background: bgColor,
            borderRadius: 2,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 500,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          &nbsp;{arg.event.title}
        </Box>
      );
    },
  }), [events, isMobile]);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 1 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight={500}
          sx={{ fontSize: isMobile ? "1.25rem" : undefined }}
        >
          ปฏิทินตารางงาน
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 3,
            minWidth: 0,
            padding: isMobile ? "4px 10px" : "6px 16px",
            fontSize: isMobile ? "0.9rem" : "1rem",
            fontWeight: 400,
            textTransform: "none",
            backgroundColor: "#42a5f5",
            color: "#fff",
          }}
        >
          เพิ่มการทำงาน
        </Button>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
          p: 0,
          backgroundColor: theme.palette.background.chartBackground,
        }}
      >
        <Box
          sx={{
            px: { xs: 1, sm: 2 },
            py: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => calendarApi()?.changeView("dayGridMonth")}>เดือน</Button>
            <Button size="small" variant="outlined" onClick={() => calendarApi()?.changeView("listWeek")}>สัปดาห์</Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={() => handleNavigate("prev")} sx={{ borderRadius: "50%", minWidth: 40, width: 40, height: 40, p: 0 }}>
              <ArrowBackIosRoundedIcon fontSize="small" />
            </Button>
            <Typography variant="h6" noWrap>{currentTitle}</Typography>
            <Button onClick={() => handleNavigate("today")} variant="contained" sx={{ borderRadius: 2, px: 2, fontSize: "0.9rem", backgroundColor: "#ef5350", color: "#fff" }}>วันนี้</Button>
            <Button onClick={() => handleNavigate("next")} sx={{ borderRadius: "50%", minWidth: 40, width: 40, height: 40, p: 0 }}>
              <ArrowForwardIosRoundedIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2, height: isMobile ? "calc(100vh - 220px)" : "calc(100vh - 260px)" }}>
          <FullCalendar ref={calendarRef} {...calendarOptions} />
        </Box>
      </Card>

      <Dialog fullScreen={isMobile} open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: isMobile ? 0 : 6, p: isMobile ? 1.5 : 2 } }}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {editingEvent ? "แก้ไขการทำงาน" : "เพิ่มการทำงาน"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField label="ชื่อพนักงาน" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} variant="outlined" placeholder="กรอกชื่อพนักงาน" autoFocus sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }} />
            <TextField label="วันที่" type="date" fullWidth value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }} />
            <TextField select label="หมวด" fullWidth value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}>
              <MenuItem value="shipping">ทำงาน</MenuItem>
              <MenuItem value="holiday">ลางาน</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {editingEvent && (
            <Button color="error" onClick={handleDeleteEvent} sx={{ mr: "auto" }} variant="outlined">
              ลบ
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleAddOrUpdate} sx={{ fontSize: isMobile ? "0.9rem" : "1rem", padding: isMobile ? "4px 10px" : "6px 16px", backgroundColor: theme.palette.background.ButtonDay, color: theme.palette.text.hint, "&:hover": { backgroundColor: theme.palette.background.ButtonDay } }}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}