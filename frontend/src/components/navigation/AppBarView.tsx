import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import NavigationMenuView from "./NavigationMenuView";
import useViewModel from "./AppBarViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Avatar, Typography } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsView from "../../views/SettingsView";

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
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = React.useState(false);

  const handleClick = () => {
    setIsSettingsDrawerOpen(!isSettingsDrawerOpen);
  };

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
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuClick}
          >
            <Avatar src={user?.picture}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My AI Tutor
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <IconButton onClick={handleClick}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <NavigationMenuView
        drawerOpen={getDrawerOpen()}
        handleClose={handleClose}
      />
      <SettingsView
        drawerOpen={isSettingsDrawerOpen}
        handleClose={() => setIsSettingsDrawerOpen(false)}
      />
    </Box>
  );
};

export default AppBarView;
