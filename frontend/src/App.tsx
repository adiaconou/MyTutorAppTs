import React, { useEffect, useState } from "react";
import "./App.css";
import ChatFormView from "./components/chat/ChatFormView";
import AppBarView from "./components/navigation/AppBarView";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SettingsView from "./components/settings/SettingsView";
import Gpt4Prompt from "./prompt/Gpt4Prompt";
import { UserSettings } from "./models/UserSettings";
import { BackendService } from "./services/BackendService";
import { withAuthentication } from "./auth/withAuthentication";

const App: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const backend = new BackendService();

  const ProtectedChatFormView = withAuthentication(ChatFormView);
  const ProtectedSettingsView = withAuthentication(SettingsView);
  const ProtectedAppBarView = withAuthentication(AppBarView);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const email = sessionStorage.getItem("email");
      if (email) {
        // Get UserSettings object from the backend
        const userSettings: UserSettings | null = await backend.getUserSettings(email);
  
        // If userSettings is not null, get the system prompt using the Gpt4Prompt static method
        if (userSettings) {
          const prompt = Gpt4Prompt.getSystemPrompt(userSettings);
  
          // Set the system prompt in the state
          setSystemPrompt(prompt);
        }
      }
    };
  
    // Call the async function
    fetchUserSettings();
  }, []);

  return (
    <BrowserRouter>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box className="AppBarView_parent" sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}>
          <ProtectedAppBarView />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "center",
            // bgcolor: "purple",
          }}
        >
          <Container
            maxWidth="md"
            sx={{ flexGrow: 1, paddingLeft: "0px", paddingRight: "0px" }}
          >
            <Routes>
              <Route path="/" element={<ProtectedChatFormView />} />
              <Route path="/settings" element={<ProtectedSettingsView />} />
              <Route path="/c/:id" element={<ProtectedChatFormView />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
};

export default App;
