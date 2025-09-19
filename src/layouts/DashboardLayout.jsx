// =================== React & Hooks ===================
import React, { useState, useEffect, useMemo, } from "react";
import PropTypes from "prop-types";

// =================== React Router ===================
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// =================== MUI Core ===================
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  useMediaQuery,
  Button,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { keyframes } from "@mui/system";

// =================== MUI Icons ===================

// ---- เมนูนำทาง (Drawer / Navigation) ----
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

// ---- เปลี่ยนธีม (โหมดสว่าง / มืด) ----
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";

// ---- ผู้ใช้ / ผู้ดูแลระบบ ----
import {
  AccountCircle as AccountCircleIcon,
  ManageAccounts as ManageAccountsIcon,
  AssignmentInd as AssignmentIndIcon,
  Settings as SettingsIcon,
  RecentActors as RecentActorsIcon, 
} from "@mui/icons-material";

// ---- สินค้าและคลังสินค้า ----
import {
  ShoppingBasket as ShoppingBasketIcon,
  InsertPageBreak as InsertPageBreakIcon,
  UploadFileRounded as UploadFileRoundedIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";

// ---- หมวดอาหารและเครื่องดื่ม ----
import {
  LocalDrink as LocalDrinkIcon,
  RamenDining as RamenDiningIcon,
  LunchDining as LunchDiningIcon,
} from "@mui/icons-material";

// ---- แผนภูมิ / รายงาน / เอกสาร ----
import {
  AreaChart as AreaChartIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

// ---- เบ็ดเตล็ด ----
import {
  CalendarMonth as CalendarMonthIcon,
  PersonAdd as PersonAddIcon,
  DesignServices as DesignServicesIcon,
} from "@mui/icons-material";

// =================== ฟอนต์ ===================
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";

// =================== Context / Theme / Utils ===================
import { useAuth } from "../context/AuthProvider";
import { groups } from "../context/groups";
import { getAppTheme } from "../theme/theme";

// =================== Components ===================
import LogoBox from "../hooks/LogoBox";
import ProfilePanel from "../components/ProfilePanel";

const spinningIcon = (
  <SettingsIcon
    sx={{
      animation: 'spin 6s linear infinite',
      '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    }}
  />
);

const NAVIGATION = [
  {
    segment: "dashboard",
    title: "แดชบอร์ดสถิติ",
    icon: <AreaChartIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "calendar",
    title: "ตารางงาน",
    icon: <CalendarMonthIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "sales-report",
    title: "ตัดสต๊อกสินค้า เวอร์ชัน 2",
    icon: <InsertPageBreakIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "stock-out",
    title: "ตัดสต๊อกสินค้า",
    icon: <InsertPageBreakIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "sales-day",
    title: "ออเดอร์รายวัน",
    icon: <AssignmentIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "user-management",
    title: "จัดการพนักงาน",
    icon: <ManageAccountsIcon />,
    roles: ["admin", "superadmin"],
    group: "upload",
    children: [
      {
        segment: "staff-management",
        title: "อนุมัติพนักงาน",
        icon: <AssignmentIndIcon />,
        roles: ["admin", "superadmin"],
        group: "management",
      },
      {
        segment: "register-empolyee",
        title: "เพิ่มพนักงาน",
        icon: <PersonAddIcon />,
        roles: ["admin"],
        group: "management",
      },
      {
        segment: "empolyee-data",
        title: "ข้อมูลพนักงาน",
        icon: <RecentActorsIcon />,
        roles: ["admin"],
        group: "management",
      },
    ],
  },
  {
    segment: "upload-products",
    title: "อัพโหลดสินค้า .xlsx",
    icon: <UploadFileRoundedIcon />,
    roles: ["admin", "superadmin"],
    group: "upload",
  },
  {
    segment: "all-products",
    title: "สินค้าทั้งหมด",
    icon: <WarehouseIcon />,
    roles: ["admin", "superadmin"],
    group: "product",
  },
  {
    segment: "dried-category",
    title: "ประเภทแห้ง",
    icon: <RamenDiningIcon />,
    roles: ["admin", "superadmin"],
    group: "product",
  },
  {
    segment: "drink-category",
    title: "ประเภทเครื่องดื่ม",
    icon: <LocalDrinkIcon />,
    roles: ["admin", "superadmin"],
    group: "product",
  },
  // {
  //   segment: "fresh-category",
  //   title: "ประเภทแช่แข็ง",
  //   icon: <AcUnitIcon />,
  //   roles: ["admin", "superadmin"],
  //   group: "product",
  // },
  // {
  //   segment: "snack-category",
  //   title: "ประเภทขนม",
  //   icon: <CookieRoundedIcon />,
  //   roles: ["admin", "superadmin"],
  //   group: "product",
  // },
  {
    segment: "stationery-category",
    title: "ประเภทเครื่องเขียน",
    icon: <DesignServicesIcon />,
    roles: ["admin", "superadmin"],
    group: "product",
  },
  {
    segment: "profile-settings",
    title: "ตั้งค่าโปรไฟล์",
    icon: spinningIcon,
    roles: ["admin", "superadmin"],
    group: "profile",
  },
];

const drawerWidth = 300;
const collapsedWidth = 110;
const appBarHeight = 64;
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored !== null ? stored === "true" : false;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPanel, setDrawerPanel] = useState(null);

  const openDrawer = (content) => {
    setDrawerPanel(content);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerPanel(null);
  };

  const theme = useMemo(() => getAppTheme(darkMode), [darkMode]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [open, setOpen] = useState(!isMobile);
  useEffect(() => setOpen(!isMobile), [isMobile]);
  const [expanded, setExpanded] = useState({});

  const handleNavigate = (segment) => {
    if (user?.role) navigate(`/${user.role}/${segment}`);
    if (isMobile) setOpen(false);
  };

  const toggleExpand = (segment) =>
    setExpanded((prev) => ({ ...prev, [segment]: !prev[segment] }));

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const drawerContent = (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* LogoBox */}
        <LogoBox />

        <List
          sx={{
            flexGrow: 1,
            px: 1.5,
            pt: 0,
            pb: 1.5,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.1) transparent",
            "&::-webkit-scrollbar": {
              width: "6px",
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.0)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "rgba(0,0,0,0.4)",
            },
            "&::-webkit-scrollbar-button:vertical:start:decrement, &::-webkit-scrollbar-button:vertical:end:increment":
            {
              display: "none",
              width: 0,
              height: 0,
            },
          }}
        >
          {groups.map(({ id, label }, index) => {
            const itemsInGroup = NAVIGATION.filter(
              (item) => item.group === id && item.roles.includes(user?.role)
            );

            if (itemsInGroup.length === 0) return null;

            return (
              <Box key={id}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    px: 1,
                    pt: 1,
                    pb: 1,
                    color: theme.palette.text.secondary,
                    userSelect: "none",
                    fontWeight: "500",
                    fontSize: "0.75rem",
                  }}
                >
                  {label}
                </Typography>

                {itemsInGroup.map((item) => {
                  const isExpandable = !!item.children;
                  const isOpen = expanded[item.segment];

                  const renderListItem = (menuItem, isChild = false) => {
                    const isSelected = location.pathname.includes(
                      menuItem.segment
                    );

                    return (
                      <ListItem disablePadding key={menuItem.segment}>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() =>
                            isExpandable && !isChild
                              ? toggleExpand(menuItem.segment)
                              : handleNavigate(menuItem.segment)
                          }
                          sx={{
                            position: "relative",
                            flexDirection: open ? "row" : "column",
                            alignItems: "center",
                            justifyContent: open ? "flex-start" : "center",
                            gap: open ? 1 : 0,
                            px: 2,
                            py: open ? 1 : 2.5,
                            mb: 0.5,
                            ml: isChild && open ? 3 : 0,
                            borderRadius: 4,
                            backgroundColor: isSelected
                              ? theme.palette.action.selected
                              : "transparent",
                            transition: "all 0.25s ease",
                            minHeight: 50,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 36,
                              mb: open ? 0 : 0.5,
                              justifyContent: "center",
                              color: isSelected
                                ? theme.palette.primary.main
                                : "inherit",
                            }}
                          >
                            {menuItem.icon}
                          </ListItemIcon>

                          {open && (
                            <ListItemText
                              primary={menuItem.title}
                              primaryTypographyProps={{ fontSize: "1rem" }}
                              sx={{
                                opacity: 1,
                                color: isSelected
                                  ? theme.palette.primary.main
                                  : "text.secondary",
                                whiteSpace: "nowrap",
                              }}
                            />
                          )}

                          {!open && isExpandable && !isChild && (
                            <ExpandMore
                              fontSize="small"
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                color: theme.palette.text.secondary,
                              }}
                            />
                          )}

                          {isExpandable &&
                            !isChild &&
                            open &&
                            (isOpen ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                      </ListItem>
                    );
                  };

                  if (isExpandable) {
                    return (
                      <React.Fragment key={item.segment}>
                        {renderListItem(item)}

                        <Collapse in={isOpen} timeout={300}>
                          <List disablePadding>
                            {item.children
                              .filter((child) =>
                                child.roles.includes(user?.role)
                              )
                              .map((child) => renderListItem(child, true))}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    );
                  }

                  return renderListItem(item);
                })}

                {index !== groups.length - 1 && (
                  <Divider sx={{ mt: 1, mx: open ? 0 : 1 }} />
                )}
              </Box>
            );
          })}
        </List>
      </Box>
    </>
  );

  const breadcrumbPaths = location.pathname.split("/").filter(Boolean);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          elevation={0}
          position="fixed"
          color="transparent"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            height: appBarHeight,
            left: isMobile ? 0 : open ? drawerWidth : collapsedWidth,
            width: isMobile
              ? "100%"
              : open
                ? `calc(100% - ${drawerWidth}px)`
                : `calc(100% - ${collapsedWidth}px)`,
            backgroundColor: darkMode
              ? "rgba(12, 16, 20, 0.6)"
              : "rgba(255, 255, 255, 0.6)",
            color: theme.palette.text.primary,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "none",
            transition: theme.transitions.create(["width", "left"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isMobile ? (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => setOpen(true)}
                  size="large"
                  sx={{
                    ml: 0,
                  }}
                >
                  <LunchDiningIcon />
                </IconButton>
              ) : (
                <IconButton
                  edge="start"
                  aria-label={open ? "Collapse drawer" : "Expand drawer"}
                  onClick={() => setOpen(!open)}
                  sx={{
                    position: "absolute",
                    left: -3,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 30,
                    height: 30,
                    bgcolor: "background.paper",
                    transition: "background-color 0.2s ease, all 0.3s ease",
                    border: "0.5px solid",
                    borderColor: "divider",
                    borderRadius: "50%",
                    boxShadow: "none",
                    zIndex: 10,
                    "& svg": {
                      fontSize: 18,
                    },
                    "&:hover": {
                      bgcolor: "background.paper",
                    },
                  }}
                >
                  {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="toggle dark mode"
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  transition: "transform 0.4s ease",
                  transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                {darkMode ? (
                  <LightModeIcon
                    sx={{
                      animation: `${spin} 6s linear infinite`,
                      color: theme.palette.warning.main,
                    }}
                  />
                ) : (
                  <DarkModeIcon />
                )}
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="profile"
                onClick={() => openDrawer("profile")}
              >
                <AccountCircleIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: {
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(0,0,0,0.2)",
              },
            },
          }}
          sx={{
            zIndex: isMobile
              ? (theme) => theme.zIndex.modal + 2
              : (theme) => theme.zIndex.drawer,
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            overflowX: "hidden",
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : collapsedWidth,
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.standard,
                }),
              backgroundColor: darkMode
                ? "rgba(12, 16, 20, 0.98)"
                : "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRight: darkMode
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              overflowX: "hidden",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              px: open ? 0 : 0,
              transition: (theme) =>
                theme.transitions.create(["padding"], {
                  duration: theme.transitions.duration.standard,
                }),
            }}
          >
            {drawerContent}
          </Box>
        </Drawer>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={closeDrawer}
          variant="temporary"
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: {
                backdropFilter: "blur(6px)",
                zIndex: (theme) => theme.zIndex.modal + 1000, // สูงกว่า Drawer รอง
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
          sx={{
            position: "fixed",
            zIndex: (theme) => theme.zIndex.modal + 1001, // สูงกว่า Drawer รอง
          }}
          PaperProps={{
            sx: {
              width: 300,
              paddingTop: "64px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(12, 16, 20, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              zIndex: (theme) => theme.zIndex.modal + 1001, // สูงกว่า Drawer รอง
              borderLeft: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.05)",
              position: "fixed",
              right: 0,
              top: 0,
            },
          }}
        >
          {true && <ProfilePanel />}

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(12, 16, 20, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              p: 2.5,
              zIndex: (theme) => theme.zIndex.modal + 1003,
            }}
          >
            <Button
              sx={{
                p: 1.5,
                borderRadius: 3,
                backgroundColor: "#d32f2f",
                color: "#ffffff",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#9a0007",
                  boxShadow: "none",
                  transform: "none",
                },
                "&:active": {
                  backgroundColor: "#7b0000",
                },
                fontSize: "1rem",
                fontWeight: "500",
              }}
              variant="contained"
              fullWidth
              onClick={() => {
                logout();
                setTimeout(() => closeDrawer(), 200);
              }}
            >
              ออกจากระบบ
            </Button>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            mt: `${appBarHeight}px`,
            bgcolor: "background.default",
            willChange: "margin-left",
            transition: theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

DashboardLayout.propTypes = {
  window: PropTypes.func,
};
