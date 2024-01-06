import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Slider, Typography, Divider, Button, SelectChangeEvent, CircularProgress } from "@mui/material";
import LanguageSelector from "../components/common/LanguageSelector";
import useViewModel from "../viewmodels/SettingsViewModel";
import Loading from "../components/common/Loading";
import { UserSettingsService } from "../services/UserSettingsService";
import { UserSettings } from "../models/UserSettings";

const SettingsView: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [sourceLanguage, setSourceLanguage] = React.useState<string | undefined>(undefined);
  const [targetLanguage, setTargetLanguage] = React.useState<string | undefined>(undefined);
  const [languageProficiency, setLanguageProficiency] = React.useState<number | undefined>(undefined);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  
  const userSettingsService = new UserSettingsService();
  
  const {
    isLoading,
    userSettings,
    getUserSettings,
  } = useViewModel();

  useEffect(() => {
    const fetchSettings = async () => {
      if (user?.email && isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          getUserSettings(user.email, token);
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      } else {
        console.error("User email is not available");
      }
    };

    fetchSettings();
  }, [getAccessTokenSilently]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  function handleSourceLanguageChange(event: SelectChangeEvent<string>): void {
    setSourceLanguage(event.target.value);
  }

  function handleTargetLanguageChange(event: SelectChangeEvent<string>): void {
    setTargetLanguage(event.target.value);
  }

  function handleLanguageProficiencyChange(event: Event, value: number | number[]): void {
    setLanguageProficiency(value as number);
  }

  async function handleSaveSettings(): Promise<void> {

    setIsSaving(true);

    if (!user || !user.email) {
      console.error("User email is not available");
      return;
    }

    if (!userSettings) {
      console.error("Settings are not complete");
      return;
    }

    const settings: UserSettings = {
      userId: user.email,
      settings: {
        sourceLanguage: sourceLanguage || userSettings?.settings.sourceLanguage,
        languageChoice: targetLanguage || userSettings?.settings.languageChoice,
        languageProficiency: languageProficiency || userSettings?.settings.languageProficiency,
      }  
    };

    const token = await getAccessTokenSilently();
    await userSettingsService.updateUserSettings(settings, token);

    setIsSaving(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        paddingTop: "16px", // Optional padding from the top
        width: "100%",
      }}
    >
      <Box
        className="setting_pageTitle"
        sx={{ mb: 4, marginTop: "64px", width: "75%", }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
          Settings
        </Typography>
      </Box>
      <Box
        className="setting_languageChoice"
        sx={{ width: "75%" }}
      >
        <Divider
          sx={{
            width: "100%",
            marginBottom: "16px",
            mb: 4
          }}
        />

        <Typography sx={{ fontSize: "14px", mb: 2 }}>What language do you currently speak?</Typography>
        <LanguageSelector
          languageChoice={userSettings?.settings.sourceLanguage}
          handleLanguageChoiceChange={handleSourceLanguageChange}
        />
      </Box>
      <Box
        className="setting_languageChoice"
        sx={{ marginTop: "4px", width: "75%" }}
      >
        <Divider
          sx={{
            width: "100%",
            marginBottom: "16px",
            mt: 4,
            mb: 4
          }}
        />

        <Typography sx={{ fontSize: "14px", mb: 2 }}>What language do you want to learn?</Typography>
        <LanguageSelector
          languageChoice={userSettings?.settings.languageChoice}
          handleLanguageChoiceChange={handleTargetLanguageChange}
        />
      </Box>
      <Box
        className="setting_languageProficiency"
        sx={{ marginBottom: 2, flexGrow: 1, marginTop: "4px", width: "75%" }}
      >
        <Divider
          sx={{
            width: "100%",
            marginBottom: "16px",
            opacity: 0.2,
          }}
        />
        <Typography sx={{ fontSize: "14px" }}>What is your skill level?</Typography>
        <Box sx={{ width: "300px", marginTop: "10px" }}>
          <Slider
            value={userSettings?.settings.languageProficiency || 0}
            min={0}
            max={10}
            step={1}
            onChange={handleLanguageProficiencyChange}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "16px",
        }}
      >
    <Button variant="contained" color="primary" onClick={handleSaveSettings} disabled={isSaving}>
        Save
        {isSaving && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
    </Button>
      </Box>
    </Box>
  );
};

export default SettingsView;
