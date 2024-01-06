import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";
import Loading from "../components/common/Loading";

/*
  This view is displayed when a user begins a new chat session.
  This will prompt the user for what they want to practice.
*/
const NewSessionView: React.FC = () => {
  const[userSettings, setUserSettings] = useState<UserSettings>();
  const { isLoading, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const userSettingsService = new UserSettingsService();

  // TODO: Move to view model
  useEffect(() => {
    const fetchUserSettings = async () => {
      const email = user?.email;
      const token = await getAccessTokenSilently();
      if (email) {
        // Need user settings to determine language and other settings
        // when creating a new chat session
        const userSettings: UserSettings | null = await userSettingsService.getUserSettings(
          email, token
        );

        // If is null, this is the first time the user has logged in
        if (!userSettings)  {
          navigate("/setup");
          return;
        } 

        setUserSettings(userSettings);
      }
    };

    fetchUserSettings();
  }, []);

  const redirectToChat = () => {
    navigate("/chat", { state: { value: 1, userSettings: userSettings } });
  };

  if (isLoading || !userSettings) {
    return <Loading />
  }
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        paddingTop: "16px",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "16px",
          width: "70%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Choose Practice</Typography>
        <Box mt={2}>
          <Button
            variant="contained"
            onClick={redirectToChat}
            sx={{ width: "200px" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Conversation
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            disabled
            sx={{ width: "200px" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Vocabulary
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            disabled
            sx={{ width: "200px" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Verb Conjugations
            </Typography>
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewSessionView;
