import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { GlobalStyles } from "@mui/material";
import {
    Card,
    CardContent,
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
    LocalShipping as LocalShippingIcon,
    BeachAccess as BeachAccessIcon,
} from "@mui/icons-material";

const tagColors = {
    shipping: "#66bb6a",
    holiday: "#ef5350",
};

const tagIcons = {
    shipping: <LocalShippingIcon sx={{ fontSize: 14, mr: 0.5 }} />,
    holiday: <BeachAccessIcon sx={{ fontSize: 14, mr: 0.5 }} />,
};

export default function CalendarPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
                prev.map((e) =>
                    e.id === editingEvent.id ? { ...e, ...form } : e
                )
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

    return (
        <>
            <GlobalStyles
                styles={{
                    /* สีเส้นขอบทั่วไป */
                    ".fc-theme-standard td, .fc-theme-standard th": {
                        borderColor: "rgba(0, 0, 0, 0.3) !important",
                    },

                    /* สีเส้นขอบซ้ายสุดของทุกแถว */
                    ".fc-theme-standard tr > td:first-of-type, .fc-theme-standard tr > th:first-of-type": {
                        borderLeftColor: "rgba(0, 0, 0, 0.3) !important",
                    },

                    /* สีเส้นขอบบนสุดของทุกคอลัมน์ */
                    ".fc-theme-standard tr:first-of-type > td, .fc-theme-standard tr:first-of-type > th": {
                        borderTopColor: "rgba(0, 0, 0, 0.3) !important",
                    },
                }}
            />


            <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
                <Box
                    sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography variant="h5" fontWeight={500}>
                        ปฏิทินตารางงาน
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            borderRadius: 3,
                            minWidth: 0,
                            padding: "6px 16px",
                            fontSize: "1rem",
                            fontWeight: 400,
                            textTransform: "none",
                            backgroundColor: "#42a5f5",
                            color: "#fff",
                        }}
                    >
                        เพิ่มการทำงาน
                    </Button>
                </Box>

                <Card sx={{
                    borderRadius: 4,
                    p: 2,
                    backgroundColor: theme.palette.background.chartBackground,
                }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Button
                            onClick={() => handleNavigate("prev")}
                            sx={{
                                borderRadius: "50%",
                                minWidth: 40,
                                width: 40,
                                height: 40,
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ArrowBackIosRoundedIcon />
                        </Button>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="h5">{currentTitle}</Typography>
                            <Button
                                onClick={() => handleNavigate("today")}
                                variant="contained"
                                sx={{
                                    borderRadius: 2,
                                    minWidth: 0,
                                    padding: "3px 18px",
                                    fontSize: "1rem",
                                    fontWeight: 400,
                                    textTransform: "none",
                                    backgroundColor: "#ef5350",
                                    color: "#fff",
                                }}
                            >
                                วันนี้
                            </Button>
                        </Stack>

                        <Button
                            onClick={() => handleNavigate("next")}
                            sx={{
                                borderRadius: "50%",
                                minWidth: 40,
                                width: 40,
                                height: 40,
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ArrowForwardIosRoundedIcon />
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            p: "16px 0 0",
                            borderRadius: 4,
                            boxShadow: "none",
                            transition: "all 0.3s ease-in-out",
                        }}
                    >
                        <FullCalendar
                            eventContent={(arg) => {
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
                                            fontSize: "0.8rem",
                                            fontWeight: 500,
                                            boxShadow: "none",
                                            backdropFilter: "blur(2px)",
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {tagIcons[tag]}&nbsp;{arg.event.title}
                                    </Box>
                                );
                            }}
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            locales={[thLocale]}
                            locale="th"
                            initialView="dayGridMonth"
                            editable={true}
                            droppable={true}
                            events={events.map((e) => ({ ...e, backgroundColor: tagColors[e.tag] }))}
                            selectable={true}
                            select={(info) => {
                                setForm({ title: "", date: info.startStr, tag: "meeting" });
                                setEditingEvent(null);
                                setOpenDialog(true);
                            }}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDrop}
                            headerToolbar={false}
                            footerToolbar={false}
                            height="auto"
                        />
                    </Box>
                </Card>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>{editingEvent ? "แก้ไขการทำงาน" : "เพิ่มการทำงาน"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="ชื่อพนักงาน"
                            fullWidth
                            margin="normal"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <TextField
                            label="วันที่"
                            type="date"
                            fullWidth
                            margin="normal"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            select
                            label="หมวด"
                            fullWidth
                            margin="normal"
                            value={form.tag}
                            onChange={(e) => setForm({ ...form, tag: e.target.value })}
                        >
                            <MenuItem value="shipping">ทำงาน</MenuItem>
                            <MenuItem value="holiday">ลางาน</MenuItem>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        {editingEvent && (
                            <Button color="error" onClick={handleDeleteEvent}>
                                ลบ
                            </Button>
                        )}
                        <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
                        <Button variant="contained" onClick={handleAddOrUpdate}>
                            บันทึก
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={alert.open}
                    autoHideDuration={3000}
                    onClose={() => setAlert({ ...alert, open: false })}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert severity={alert.severity}>{alert.message}</Alert>
                </Snackbar>
            </Box>
        </>);
}
