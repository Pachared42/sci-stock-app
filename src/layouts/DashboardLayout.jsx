import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans";
import LogoBox from "../hooks/LogoBox";
import ProfilePanel from "../components/ProfilePanel";
import { getAppTheme } from "../theme/theme";

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
  LunchDining as LunchDiningIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon,
  ManageAccounts as ManageAccountsIcon,
  AssignmentInd as AssignmentIndIcon,
  UploadFileRounded as UploadFileRoundedIcon,
  ShoppingBag as ShoppingBagIcon,
  Inventory2Rounded as Inventory2RoundedIcon,
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
    icon: <ShoppingBagIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "stock-out",
    title: "ตัดสต๊อก",
    icon: <Inventory2RoundedIcon />,
    roles: ["admin", "superadmin"],
    group: "main",
  },
  {
    segment: "sales-day",
    title: "ออเดอร์รายวัน",
    icon: <AssignmentTurnedInRoundedIcon />,
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
        icon: <PeopleIcon />,
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
    segment: "dried-category",
    title: "ประเภทแห้ง",
    icon: <FoodBankRoundedIcon />,
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
    icon: <CreateIcon />,
    roles: ["admin", "superadmin"],
    group: "product",
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
              ? "rgba(20, 26, 33, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
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
                ? "rgba(20, 26, 33, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
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
                zIndex: theme.zIndex.modal + 1000,
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
          sx={{
            position: "fixed",
            zIndex: theme.zIndex.modal + 1001,
          }}
          PaperProps={{
            sx: {
              width: 300,
              paddingTop: "64px",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(20, 26, 33, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              zIndex: theme.zIndex.modal + 1002,
              borderLeft: darkMode
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.05)",
            },
          }}
        >
          {true && <ProfilePanel />}

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(20, 26, 33, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              p: 2.5,
              zIndex: theme.zIndex.modal + 1003,
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
