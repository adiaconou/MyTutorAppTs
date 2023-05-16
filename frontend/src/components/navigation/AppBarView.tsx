import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import NavigationMenuView from "./NavigationMenuView";
import useViewModel from "./AppBarViewModel";
import { useAuth0 } from "@auth0/auth0-react";

interface AppBarViewProps {
  sx?: {
    position?: string;
    top?: number;
    zIndex?: number;
    width?: string;
  };
}

const AppBarView: React.FC<AppBarViewProps> = ({ sx }) => {
  const { handleMenuClick, handleClose, getDrawerOpen } = useViewModel();
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ ...sx, minHeight: "50px" }}>
        <Toolbar sx={{ justifyContent: "flex-start" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuClick}
          >
            <MenuIcon sx={{ fontSize: "2rem"}} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <NavigationMenuView
        drawerOpen={getDrawerOpen()}
        handleClose={handleClose}
      />
    </Box>
  );
};

export default AppBarView;