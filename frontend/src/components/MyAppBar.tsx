import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MyNavMenu from './MyNavMenu';

interface MyAppBarProps {
  sx?: {
    position?: string;
    top?: number;
    zIndex?: number;
    width?: string;
  };
}

const MyAppBar: React.FC<MyAppBarProps> = ({ sx }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleMenuClick = () => {
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={sx}>
        <Toolbar sx={{ justifyContent: 'flex-start' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <MyNavMenu drawerOpen={drawerOpen} handleClose={handleClose} />
    </Box>
  );
};

export default MyAppBar;