import { useRef, useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import listPlugin from "@fullcalendar/list";

import "../theme/calendarStyles.css";

import { Card, Typography, useTheme, useMediaQuery, Box, Button } from "@mui/material";
import {
  ArrowBackIosRounded as ArrowBackIosRoundedIcon,
  ArrowForwardIosRounded as ArrowForwardIosRoundedIcon,
} from "@mui/icons-material";

import { fetchWorkSchedules } from "../api/workScheduleApi";

const tagColors = {
  shipping: "#1E88E5",
  holiday: "#E91E63",
};

function CalendarEmployee() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("ปฏิทิน");

  const calendarApi = () => calendarRef.current?.getApi();

  useEffect(() => {
    const updateTitle = () => {
      const api = calendarApi();
      if (api) setCurrentTitle(api.view.title);
    };
    setTimeout(updateTitle, 0);
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await fetchWorkSchedules();
        setEvents(data.map((e) => ({ ...e, date: e.date.slice(0, 10) })));
      } catch (err) {
        console.error("โหลดตารางงานไม่สำเร็จ:", err);
      }
    }
    loadEvents();
  }, []);

  const handleNavigate = (action) => {
    const api = calendarApi();
    if (!api) return;
    api[action]();
    setCurrentTitle(api.view.title);
  };

  const calendarOptions = useMemo(
    () => ({
      plugins: [dayGridPlugin, interactionPlugin, listPlugin],
      locales: [thLocale],
      locale: "th",
      initialView: isMobile ? "listWeek" : "dayGridMonth",

      // ✅ READ-ONLY
      editable: false,
      selectable: false,
      droppable: false,

      height: "100%",
      expandRows: true,
      dayMaxEventRows: true,

      events: events.map((e) => ({
        ...e,
        backgroundColor: tagColors[e.tag] || "#999",
        borderColor: "transparent",
      })),

      headerToolbar: false,

      views: {
        listWeek: {
          buttonText: "รายการสัปดาห์",
          dayHeaderFormat: { weekday: "long", day: "numeric", month: "short" },
          listDaySideFormat: false,
          eventMaxStack: 3,
        },
      },

      // ✅ กันคนคลิกแล้วทำอะไร (optional)
      eventClick: (info) => {
        info.jsEvent.preventDefault();
      },

      eventContent: (arg) => {
        const tag = arg.event.extendedProps.tag;
        const bgColor = tagColors[tag] || "#999";
        const isListWeek = arg.view.type === "listWeek";

        return (
          <Box
            sx={{
              display: "block",
              px: isListWeek ? 2 : 1,
              py: isListWeek ? 1 : 0.5,
              background: bgColor,
              borderRadius: 2,
              color: "#fff",
              fontSize: isListWeek ? "1.05rem" : "1rem",
              fontWeight: 500,
              width: "100%",
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              cursor: "default",
              userSelect: "none",
              boxSizing: "border-box",
            }}
          >
            {arg.event.title}
          </Box>
        );
      },
    }),
    [events, isMobile]
  );

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 1.5, lg: 1.5, xl: 20 }, py: 1 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
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
      </Box>

      <Card sx={{ borderRadius: 4, p: 0, backgroundColor: theme.palette.background.chartBackground }}>
        <Box
          sx={{
            px: { xs: 1, sm: 2 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button onClick={() => handleNavigate("prev")} sx={{ borderRadius: "50%", minWidth: 40, width: 40, height: 40, p: 0 }}>
            <ArrowBackIosRoundedIcon fontSize="small" />
          </Button>

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 500,
              userSelect: "none",
            }}
          >
            {currentTitle}
          </Typography>

          <Button onClick={() => handleNavigate("next")} sx={{ borderRadius: "50%", minWidth: 40, width: 40, height: 40, p: 0 }}>
            <ArrowForwardIosRoundedIcon fontSize="small" />
          </Button>

          <Button
            onClick={() => handleNavigate("today")}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: "9px",
              py: "3px",
              fontSize: "0.9rem",
              backgroundColor: "#FF5630",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            วันนี้
          </Button>
        </Box>

        <Box sx={{ height: isMobile ? "calc(100vh - 220px)" : "calc(100vh - 200px)", overflowY: "auto" }}>
          <FullCalendar
            ref={calendarRef}
            {...calendarOptions}
            headerToolbar={false}
            dayMaxEvents={false}
            eventDisplay="block"
            slotEventOverlap={true}
            fixedWeekCount={false}
          />
        </Box>
      </Card>
    </Box>
  );
}

export default CalendarEmployee;