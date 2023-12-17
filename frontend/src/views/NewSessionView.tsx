import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserSettingsService } from "../services/UserSettingsService";
import { UserSettings } from "../models/UserSettings";
import Loading from "../components/common/Loading";

/*
  This view is displayed when a user begins a new chat session.
  This will prompt the user for what they want to practice.
*/
const NewSessionView: React.FC = () => {
  const navigate = useNavigate();
  const[userSettings, setUserSettings] = useState<UserSettings>();
  const { isLoading, user, getAccessTokenSilently } = useAuth0();
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
        // and we set default values for the user's settings.
        // Later on, new login should take them through a wizard
        // to choose their settings.
        if (!userSettings)  {
          const defaultUserSettings: UserSettings = {
            userId: email,
            settings: {
              sourceLanguage: 'English',
              languageChoice: 'French',
              languageProficiency: 1,
            }
          };

          await userSettingsService.updateUserSettings(defaultUserSettings, token);
          setUserSettings(defaultUserSettings);
        } else {
          setUserSettings(userSettings);
        }
      }
    };

    fetchUserSettings();
  }, []);

  const redirectToChat = () => {
    navigate("/chat", { state: { value: 1, userSettings: userSettings } });
  };

  if (isLoading) {
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
        color: "white",
        paddingTop: "16px",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "16px",
          boxShadow: "0px 0px 10px 0px blue",
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
            color="primary"
            onClick={redirectToChat}
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Conversation
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            disabled
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Vocabulary
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            disabled
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
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
