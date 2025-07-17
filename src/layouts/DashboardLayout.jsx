import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import ReactLogo from "../assets/react.svg";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";
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
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  CalendarMonth as CalendarMonthIcon,
  ShoppingBasket as ShoppingBasketIcon,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  Layers as LayersIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  VerifiedUser as VerifiedUserIcon,
  UploadFile as UploadFileIcon,
  Category as CategoryIcon,
  LocalDrink as LocalDrinkIcon,
  AcUnit as AcUnitIcon,
  Fastfood as FastfoodIcon,
  Create as CreateIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  CookieRounded as CookieRoundedIcon,
  FoodBankRounded as FoodBankRoundedIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { groups } from "../context/groups";

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
    title: "รายงานขาย",
    icon: <ShoppingBasketIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "user-management",
    title: "จัดการผู้ใช้งาน",
    icon: <PeopleIcon />,
    roles: ["admin", "superadmin"],
    group: "upload",
    children: [
      {
        segment: "reports/sales",
        title: "สมัครแอดมิน",
        icon: <PersonAddIcon />,
        roles: ["superadmin"],
      },
      {
        segment: "reports/traffic",
        title: "อนุมัติพนักงาน",
        icon: <VerifiedUserIcon />,
        roles: ["admin", "superadmin"],
      },
    ],
  },
  {
    segment: "upload-products",
    title: "อัพโหลดสินค้า",
    icon: <UploadFileIcon />,
    roles: ["superadmin"],
    group: "upload",
  },
  {
    segment: "dry-category",
    title: "ประเภทแห้ง",
    icon: <FoodBankRoundedIcon />,
    roles: ["superadmin"],
    group: "product",
  },
  {
    segment: "drink-category",
    title: "ประเภทเครื่องดื่ม",
    icon: <LocalDrinkIcon />,
    roles: ["superadmin"],
    group: "product",
  },
  {
    segment: "frozen-category",
    title: "ประเภทแช่แข็ง",
    icon: <AcUnitIcon />,
    roles: ["superadmin"],
    group: "product",
  },
  {
    segment: "snack-category",
    title: "ประเภทขนม",
    icon: <CookieRoundedIcon />,
    roles: ["superadmin"],
    group: "product",
  },
  {
    segment: "stationery-category",
    title: "ประเภทเครื่องเขียน",
    icon: <CreateIcon />,
    roles: ["superadmin"],
    group: "product",
  },
  {
    segment: "admin-management",
    title: "จัดการแอดมิน",
    icon: <AdminPanelSettingsIcon />,
    roles: ["superadmin"],
    group: "management",
  },
  {
    segment: "staff-management",
    title: "จัดการพนักงาน",
    icon: <PeopleIcon />,
    roles: ["superadmin"],
    group: "management",
  },
];

const drawerWidth = 300;
const collapsedWidth = 150;
const appBarHeight = 64;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: darkMode ? "#90caf9" : "#333333",
          },
          background: {
            default: darkMode ? "#141A21" : "#f0f2f5",
            paper: darkMode ? "#1E252C" : "#ffffff",
          },
          text: {
            primary: darkMode ? "#E0E0E0" : "#2d2d2d",
            secondary: darkMode ? "#AAAAAA" : "#666666",
          },
        },
        typography: {
          fontFamily: '"Noto Sans Thai", "Noto Sans", sans-serif',
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: darkMode ? "#1A1F27" : "#ffffff",
                backdropFilter: "blur(12px)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                backgroundColor: darkMode ? "#1E252C" : "#ffffff",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: darkMode
                    ? "0 4px 20px rgba(0, 0, 0, 0.2)"
                    : "0 4px 12px rgba(0, 0, 0, 0.06)",
                },
              },
            },
          },
          MuiToolbar: {
            styleOverrides: {
              root: {
                backgroundColor: "transparent",
                backdropFilter: "blur(1px)",
                color: darkMode ? "#E0E0E0" : "#2d2d2d",
              },
            },
          },
        },
      }),
    [darkMode]
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  useEffect(() => setOpen(!isMobile), [isMobile]);
  const [expanded, setExpanded] = useState({});

  const handleNavigate = (segment) => {
    if (user?.role) navigate(`/${user.role}/${segment}`);
    if (isMobile) setOpen(false);
  };

  const toggleExpand = (segment) =>
    setExpanded((prev) => ({ ...prev, [segment]: !prev[segment] }));

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* โลโก้ด้านบน */}
      <Box
        sx={{
          p: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "none",
        }}
      >
        <img
          src={ReactLogo}
          alt="Logo"
          style={{ maxHeight: 50, width: "auto" }}
        />
      </Box>

      <List
        sx={{
          flexGrow: 1,
          px: open ? 1.5 : 1.5,
          pt: 0,
          pb: 0,
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
          // ซ่อนปุ่มลูกศร scrollbar (บน/ล่าง)
          "&::-webkit-scrollbar-button:vertical:start:decrement, &::-webkit-scrollbar-button:vertical:end:increment": {
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
              {/* หัวข้อกลุ่ม */}
              <Typography
                variant="subtitle2"
                sx={{
                  px: open ? 1 : 1,
                  pt: 1,
                  pb: 1,
                  color: theme.palette.text.secondary,
                  userSelect: "none",
                  fontWeight: "bold",
                }}
              >
                {label}
              </Typography>

              {/* รายการเมนูในกลุ่ม */}
              {itemsInGroup.map((item) => {
                const selected = location.pathname.includes(item.segment);
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
                          flexDirection: open ? "row" : "column",
                          alignItems: "center",
                          justifyContent: open ? "flex-start" : "center",
                          gap: open ? 1 : 0,
                          px: 2,
                          py: open ? 1 : 1.5,
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
                            primaryTypographyProps={{
                              fontSize: "1rem",
                            }}
                            sx={{
                              opacity: 1,
                              color: isSelected
                                ? theme.palette.primary.main
                                : "text.secondary",
                              whiteSpace: "nowrap",
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
                            .filter((child) => child.roles.includes(user?.role))
                            .map((child) => renderListItem(child, true))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  );
                }
                return renderListItem(item);
              })}

              {/* Divider ระหว่างกลุ่ม ยกเว้นกลุ่มสุดท้าย */}
              {index !== groups.length - 1 && (
                <Divider sx={{ mt: open ? 1 : 1, mx: open ? 0 : 1 }} />
              )}
            </Box>
          );
        })}
      </List>
    </Box>
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
            left: open ? drawerWidth : collapsedWidth,
            width: open
              ? `calc(100% - ${drawerWidth}px)`
              : `calc(100% - ${collapsedWidth}px)`,
            backgroundColor: darkMode
              ? "rgba(20, 26, 33, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
            color: theme.palette.text.primary,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: "none",
            transition: theme.transitions.create(["width", "left"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isMobile && (
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
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "50%",
                    boxShadow: 1,
                    zIndex: 10,
                    transition: "all 0.3s ease",
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
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="profile"
                onClick={() => openDrawer("profile")}
              >
                <AccountCircleIcon />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="settings"
                onClick={() => openDrawer("settings")}
                sx={{
                  animation: `${spin} 5s linear infinite`,
                }}
              >
                <SettingsIcon />
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
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            willChange: "width", // เพิ่มตรงนี้ช่วย browser optimize
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : collapsedWidth,
              overflowX: "hidden",
              willChange: "width", // เพิ่มตรงนี้เหมือนกัน
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={closeDrawer}
          PaperProps={{
            sx: {
              width: 320,
              p: 3,
              backdropFilter: "blur(6px)",
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerPanel === "profile" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                My Profile
              </Typography>
              <Typography>Email: {user?.email}</Typography>
              <Typography>Role: {user?.role}</Typography>
            </Box>
          )}
          {drawerPanel === "settings" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Coming soon... (ใส่ toggle ภาษา, theme, อื่น ๆ ได้ที่นี่)
              </Typography>
            </Box>
          )}
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
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
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
