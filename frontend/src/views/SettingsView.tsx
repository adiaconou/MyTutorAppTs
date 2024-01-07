import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Slider, Typography, Divider, Button, SelectChangeEvent, CircularProgress, Drawer } from "@mui/material";
import LanguageSelector from "../components/common/LanguageSelector";
import useViewModel from "../viewmodels/SettingsViewModel";
import Loading from "../components/common/Loading";
import { UserSettingsService } from "../services/UserSettingsService";
import { UserSettings } from "../models/UserSettings";

interface SettingsViewProps {
  drawerOpen: boolean;
  handleClose: () => void;
}

export default function SettingsView({
  drawerOpen,
  handleClose,
}: SettingsViewProps): JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
  const [sourceLanguage, setSourceLanguage] = React.useState<string | undefined>(undefined);
  const [targetLanguage, setTargetLanguage] = React.useState<string | undefined>(undefined);
  const [languageProficiency, setLanguageProficiency] = React.useState<number | undefined>(undefined);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const userSettingsService = new UserSettingsService();

  const {
    isLoading,
    userSettings,
    setUserSettings,
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
  }, [languageProficiency, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  function handleSourceLanguageChange(event: SelectChangeEvent<string>): void {
    const newSourceLanguage = event.target.value;
    setSourceLanguage(newSourceLanguage);
    handleSaveSettings(newSourceLanguage, targetLanguage, languageProficiency);
  }
  
  function handleTargetLanguageChange(event: SelectChangeEvent<string>): void {
    const newTargetLanguage = event.target.value;
    setTargetLanguage(newTargetLanguage);
    handleSaveSettings(sourceLanguage, newTargetLanguage, languageProficiency);
  }
  
  function handleLanguageProficiencyChange(event: Event, value: number | number[]): void {
    const newLanguageProficiency = value as number;
    setLanguageProficiency(newLanguageProficiency);
    handleSaveSettings(sourceLanguage, targetLanguage, newLanguageProficiency);
  }

  async function handleSaveSettings(
    newSourceLanguage: string | undefined,
    newTargetLanguage: string | undefined,
    newLanguageProficiency: number | undefined
  ): Promise<void> {

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
        sourceLanguage: newSourceLanguage || userSettings?.settings.sourceLanguage,
        languageChoice: newTargetLanguage || userSettings?.settings.languageChoice,
        languageProficiency: newLanguageProficiency || userSettings?.settings.languageProficiency,
      }
    };
    const token = await getAccessTokenSilently();
    await userSettingsService.updateUserSettings(settings, token);

    setIsSaving(false);
  }

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: '80%',
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          className="setting_pageTitle"
          sx={{
            mb: 2,
            mt: 2,
            width: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
            Settings
          </Typography>
        </Box>
        <Box
          className="setting_languageChoice"
          sx={{
            width: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Divider
            sx={{
              width: "100%",
              mb: 2
            }}
          />
          <Typography sx={{ fontSize: "14px", fontWeight: "bold", mb: 1 }}>Source Language</Typography>
          <LanguageSelector
            languageChoice={sourceLanguage || userSettings?.settings.sourceLanguage}
            handleLanguageChoiceChange={handleSourceLanguageChange}
          />
        </Box>
        <Box
          className="setting_languageChoice"
          sx={{
            marginTop: "4px",
            width: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Divider
            sx={{
              width: "100%",
              marginBottom: "16px",
              mt: 2,
              mb: 2
            }}
          />
          <Typography sx={{ fontSize: "14px", fontWeight: "bold", mb: 1 }}>Target Language</Typography>
          <LanguageSelector
            languageChoice={targetLanguage || userSettings?.settings.languageChoice}
            handleLanguageChoiceChange={handleTargetLanguageChange}
          />
        </Box>
        <Box
          className="setting_languageProficiency"
          sx={{
            marginBottom: 2,
            flexGrow: 1,
            marginTop: "4px",
            width: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider
            sx={{
              width: "100%",
              marginBottom: "16px",
              opacity: 0.2,
            }}
          />
          <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>Skill Level</Typography>
          <Box sx={{
            width: "200px",
            marginTop: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          >
            <Slider
              value={languageProficiency || userSettings?.settings.languageProficiency || 0}
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
        </Box>
      </Box>
    </Drawer>
  );
};