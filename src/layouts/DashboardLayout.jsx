import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  Layers as LayersIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const NAVIGATION = [
  { segment: 'dashboard', title: 'Dashboard', icon: <DashboardIcon />, roles: ['admin', 'superadmin'] },
  { segment: 'products', title: 'Products', icon: <ShoppingCartIcon />, roles: ['admin', 'superadmin'] },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    roles: ['superadmin'],
    children: [
      { segment: 'reports/sales', title: 'Sales', icon: <DescriptionIcon />, roles: ['superadmin'] },
      { segment: 'reports/traffic', title: 'Traffic', icon: <DescriptionIcon />, roles: ['superadmin'] },
    ],
  },
  { segment: 'integrations', title: 'Integrations', icon: <LayersIcon />, roles: ['superadmin'] },
];

const drawerWidth = 240;
const collapsedWidth = 72;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(!isMobile);
  const [expanded, setExpanded] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (segment) => {
    if (user?.role === 'admin') {
      navigate(`/admin/${segment}`);
    } else if (user?.role === 'superadmin') {
      navigate(`/superadmin/${segment}`);
    }
    if (isMobile) setOpen(false);
  };

  const toggleExpand = (segment) => {
    setExpanded((prev) => ({ ...prev, [segment]: !prev[segment] }));
  };

  const drawer = (
    <div className="h-full flex flex-col">
      <Toolbar className="justify-center">
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {NAVIGATION.filter((item) => item.roles.includes(user?.role)).map((item, index) => {
          const selected = location.pathname.includes(item.segment);
          if (item.children) {
            const isOpen = expanded[item.segment];
            return (
              <React.Fragment key={index}>
                <ListItem disablePadding className="block">
                  <ListItemButton
                    onClick={() => toggleExpand(item.segment)}
                    className="transition-all duration-200"
                    selected={selected}
                    sx={{ justifyContent: open ? 'initial' : 'center', px: 2.5 }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
                    {open && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children
                      .filter((child) => child.roles.includes(user?.role))
                      .map((child, cidx) => (
                        <ListItemButton
                          key={cidx}
                          sx={{ pl: open ? 6 : 2 }}
                          className="transition-all duration-150"
                          selected={location.pathname.includes(child.segment)}
                          onClick={() => handleNavigate(child.segment)}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.title} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                      ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <ListItem disablePadding key={index} className="block">
              <ListItemButton
                selected={selected}
                onClick={() => handleNavigate(item.segment)}
                sx={{ justifyContent: open ? 'initial' : 'center', px: 2.5 }}
                className="transition-all duration-200"
              >
                <ListItemIcon
                  sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const breadcrumbPaths = location.pathname.split('/').filter(Boolean);

  return (
    <Box className={`flex ${darkMode ? 'dark' : ''}`}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="primary"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          ml: `${open ? drawerWidth : collapsedWidth}px`,
        }}
      >
        <Toolbar className="justify-between">
          <div className="flex items-center gap-4">
            <Typography variant="h6" noWrap>
              SCI STOCK Dashboard
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <RouterLink to={`/${user?.role}`}>Home</RouterLink>
              {breadcrumbPaths.map((crumb, i) => {
                const to = `/${breadcrumbPaths.slice(0, i + 1).join('/')}`;
                return (
                  <RouterLink key={i} to={`/${user?.role}${to}`}>
                    {crumb.charAt(0).toUpperCase() + crumb.slice(1)}
                  </RouterLink>
                );
              })}
            </Breadcrumbs>
          </div>
          <div className="flex items-center gap-4">
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Typography variant="body2" className="mr-2">
              {user?.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" className="flex-grow p-3 mt-20 min-h-screen">
        <Outlet />
      </Box>
    </Box>
  );
}

DashboardLayout.propTypes = {
  window: PropTypes.func,
};
