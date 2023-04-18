import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import { Navigate, useNavigate } from "react-router-dom";

interface MenuItem {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}

interface MyNavMenuProps {
  drawerOpen: boolean;
  handleClose: () => void;
}

export default function MyNavMenu({
  drawerOpen,
  handleClose,
}: MyNavMenuProps): JSX.Element {
  // Get access to the useHistory hook from react-router-dom
  const navigate = useNavigate();

  // Items for the navigation menu
  const menuItems: MenuItem[] = [
    {
      label: "Chat",
      icon: <HomeIcon />,
      onClick: () => {
        navigate("/");
        handleClose();
      },
    },
    {
      label: "Prompt Settings",
      icon: <SettingsIcon />,
      onClick: () => {
        navigate("/settings");
        handleClose();
      },
    },
  ];

  const username = "Alex Diaconou";

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={drawerOpen}
      onClose={handleClose}
      sx={{
        width: "240px",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "240px",
          boxSizing: "border-box",
        },
      }}
    >
      {/* Header with profile icon and username */}
      <Box sx={{ display: "flex", alignItems: "center", padding: "16px" }}>
        <Avatar sx={{ marginRight: "8px" }}>
          <AccountCircleIcon />
        </Avatar>
        <Typography variant="h6">{username}</Typography>
      </Box>

      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={item.label} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}