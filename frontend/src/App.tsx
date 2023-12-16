import React, { useEffect } from "react";
import "./App.css";
import ChatView from "./views/ChatView";
import AppBarView from "./components/navigation/AppBarView";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Route, Routes } from "react-router-dom";
import SettingsView from "./views/SettingsView";
import { UserSettings } from "./models/UserSettings";
import LoginView from "./views/LoginView";
import CallbackPageView from "./auth/CallbackPageView";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationGuard } from "./auth/authentication-guard";
import { UserSettingsService } from "./services/UserSettingsService";
import NewSessionView from "./views/NewSessionView";
import Loading from "./components/common/Loading";

const App: React.FC = () => {
  const { isLoading, user, getAccessTokenSilently } = useAuth0();
  const userSettingsService = new UserSettingsService();

  useEffect(() => {
    console.log("App useEffect", {isLoading});
    const fetchUserSettings = async () => {
      const email = user?.email;
      const token = await getAccessTokenSilently();

      if (email) {
        // Get UserSettings object from the backend
        const userSettings: UserSettings | null = await userSettingsService.getUserSettings(
          email, token
        );

        // If userSettings is not null, get the system prompt using the Gpt4Prompt static method
        if (!userSettings) {
          // Set default settings
          const userSettings: UserSettings = {
            userId: email,
            settings: {
              sourceLanguage: 'English',
              languageChoice: 'French',
              languageProficiency: 1,
            }
          };
          console.log("Setting settings...");
          await userSettingsService.updateUserSettings(userSettings, token);
        }
      }
    };

    // Call the async function
    if (!isLoading) {
      fetchUserSettings();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Box
        className="AppBarView_parent"
        sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}
      >
        <AppBarView />
        <Loading />
      </Box>);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        className="AppBarView_parent"
        sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}
      >
        <AppBarView />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        <Container
          maxWidth="md"
          sx={{ flexGrow: 1, paddingLeft: "0px", paddingRight: "0px" }}
        >
          <Routes>
            <Route path="/" element={<AuthenticationGuard component={NewSessionView} />} />
            <Route path="/chat" element={<AuthenticationGuard component={ChatView} />} />
            <Route path="/settings" element={<AuthenticationGuard component={SettingsView} />} />
            <Route path="/chat/:id" element={<AuthenticationGuard component={ChatView} />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/callback" element={<CallbackPageView />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default App;