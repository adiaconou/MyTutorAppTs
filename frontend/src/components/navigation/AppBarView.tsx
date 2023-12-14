import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import NavigationMenuView from "./NavigationMenuView";
import useViewModel from "./AppBarViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Avatar, Typography } from "@mui/material";

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
  const { isAuthenticated, user } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ ...sx, minHeight: "50px" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuClick}
          >
            <MenuIcon sx={{ fontSize: "2rem" }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My AI Tutor
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", height: "100%"}}>
            <Avatar src={user?.picture}>
              <AccountCircleIcon />
            </Avatar>
          </Box>
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
