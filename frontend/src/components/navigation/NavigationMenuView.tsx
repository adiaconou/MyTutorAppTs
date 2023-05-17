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
import { useNavigate } from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import HistoryIcon from "@mui/icons-material/History";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLayoutEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import useViewModel from "./NavigationMenuViewModel";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth0 } from "@auth0/auth0-react";
import { format } from "date-fns";
import DeleteIcon from "@mui/icons-material/Delete";
import { BackendService } from "../../services/BackendService";

interface MenuItem {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}

interface NavigationMenuViewProps {
  drawerOpen: boolean;
  handleClose: () => void;
}

export default function NavigationMenuView({
  drawerOpen,
  handleClose,
}: NavigationMenuViewProps): JSX.Element {
  const { logout, user, isAuthenticated, isLoading } = useAuth0();
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const {
    historyExpanded,
    historyItems,
    // isLoading,
    getChatSessions,
    handleNewChat,
    toggleHistoryExpanded,
    userName,
  } = useViewModel();

  const backendService = new BackendService();

  // Get access to the useHistory hook from react-router-dom
  const navigate = useNavigate();

  useLayoutEffect(() => {
    console.log("User object: " + user);
    if (user?.email) {
      // getChatSessions(15, sessionStorage.getItem("email"));
      getChatSessions(15, user.email);
    }
    console.log(
      "Mounting nav menu: " +
        user?.email +
        " name: " +
        user?.name +
        " isAuthenticated: " +
        isAuthenticated
    );
  }, [user, isAuthenticated]);

  // Items for the navigation menu
  const menuItems: MenuItem[] = [
    {
      label: "New Chat",
      icon: <ChatBubbleIcon />,
      onClick: () => {
        navigate("/");
        handleClose();
        handleNewChat();
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
    {
      label: "Logout",
      icon: <LogoutIcon />, // replace this with your actual logout icon
      onClick: () =>
        logout({
          logoutParams: {
            returnTo: window.location.origin + "/login",
          },
        }),
    },
  ];

  if (isLoading) {
    // Render a loading spinner or message while data is being fetched
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        <Avatar sx={{ marginRight: "8px" }} src={user?.picture}>
          <AccountCircleIcon />
        </Avatar>
        <Typography variant="h6">{userName}</Typography>
      </Box>

      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={item.label} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        <ListItem button onClick={toggleHistoryExpanded}>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="History" />
          {historyExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={historyExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {historyItems.map((session) => (
              <ListItem
                button
                key={session.id}
                sx={{
                  pl: 4,
                  transition: "opacity 0.3s",
                  opacity: deletingSessionId === session.id ? 0 : 1,
                }}
                onClick={() => {
                  navigate(`/c/${session.id}`);
                  handleClose();
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "14px" }}>
                      {format(
                        new Date(session.createdAt),
                        "MM/dd/yyyy HH:mm:ss"
                      )}
                    </Typography>
                  }
                />
                <DeleteIcon
                  fontSize="small"
                  onClick={async (event) => {
                    event.stopPropagation(); // To prevent the ListItem click event from being triggered
                    // Set deletingSessionId
                    setDeletingSessionId(session.id);
                    // Call deleteChatSession and then refresh chat history
                    await backendService.deleteChatSession(session.id);
                    if (user?.email) {
                      getChatSessions(15, user.email);
                    }
                    // Unset deletingSessionId
                    setDeletingSessionId(null);
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
