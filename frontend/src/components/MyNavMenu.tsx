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
import { useNavigate } from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import HistoryIcon from "@mui/icons-material/History";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { UserChatSession } from "../models/UserChatSession";
import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

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

  // const apiUrl = process.env.APP_BACKEND_URL || "https://backend-dot-for-fun-153903.uc.r.appspot.com";
  const apiUrl = "http://localhost:3001";

  const [historyExpanded, setHistoryExpanded] = React.useState(false);
  const [historyItems, setHistoryItems] = useState<UserChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state variable to track loading status

  // Fetch chat sessions when the component is mounted
  useEffect(() => {
    const userId = "adiaconou"; // Replace with actual user ID
    const limit = 10; // Number of chat sessions per page
    getChatSessions(userId, limit);
  }, []);

  const toggleHistoryExpanded = () => {
    setHistoryExpanded(!historyExpanded);
  };

  // Function to get chat sessions
  const getChatSessions = async (userId: string, limit: number) => {
    try {
      const response = await fetch(
        `${apiUrl}/chatSessions/?userId=${encodeURIComponent(
          userId
        )}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions");
      }
      const sessions: UserChatSession[] = await response.json();
      setHistoryItems(sessions);
      setIsLoading(false); // Set loading status to false after data is fetched
    } catch (error) {
      console.error(`Error fetching chat sessions: ${error}`);
      setIsLoading(false); // Set loading status to false even if an error occurs
    }
  };

  // Function to handle the "New Chat" action
  const handleNewChat = () => {
    // Set sessionData to an empty string in sessionStorage
    sessionStorage.setItem('chatSessionId', '');
    
    // Navigate to the home page
    navigate("/");
    handleClose();
  };

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
  ];

  const username = "Alex Diaconou";

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
                sx={{ pl: 4 }}
                onClick={() => {
                  navigate(`/c/${session.id}`);
                  handleClose();
                }}
              >
                <ListItemText primary={session.summary} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
