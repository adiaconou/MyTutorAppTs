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

const App: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const backend = new BackendService();
  useEffect(() => {
    const fetchUserSettings = async () => {
      // Get UserSettings object from the backend
      const userSettings: UserSettings | null = await backend.getUserSettings(
        "adiaconou"
      );

      // If userSettings is not null, get the system prompt using the Gpt4Prompt static method
      if (userSettings) {
        const prompt = Gpt4Prompt.getSystemPrompt(userSettings);

        // Set the system prompt in the state
        setSystemPrompt(prompt);
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
          <AppBarView />
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
              <Route path="/" element={<ChatFormView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/c/:id" element={<ChatFormView />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
};

export default App;
