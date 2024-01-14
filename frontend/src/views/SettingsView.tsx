import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Slider, Typography, Divider, SelectChangeEvent, Drawer } from "@mui/material";
import LanguageSelector from "../components/common/LanguageSelector";
import { UserSettingsService } from "../services/UserSettingsService";
import { UserSettings } from "../models/UserSettings";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUserSettings } from "../context/UserSettingsContext";
import { useLocation } from 'react-router-dom';

interface SettingsViewProps {
  drawerOpen: boolean;
  handleClose: () => void;
}

export default function SettingsView({
  drawerOpen,
  handleClose,
}: SettingsViewProps): JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [sourceLanguage, setSourceLanguage] = React.useState<string | undefined>(undefined);
  const [targetLanguage, setTargetLanguage] = React.useState<string | undefined>(undefined);
  const [languageProficiency, setLanguageProficiency] = React.useState<number | undefined>(undefined);
  
  const location = useLocation();
  const { user, getAccessTokenSilently } = useAuth0();
  const { userSettings } = useUserSettings();

  const userSettingsService = new UserSettingsService();

  function handleSourceLanguageChange(event: SelectChangeEvent<string>): void {
    const newSourceLanguage = event.target.value;
    setSourceLanguage(newSourceLanguage);
    setSettingsChanged(true);
    handleSaveSettings(newSourceLanguage, targetLanguage, languageProficiency);
  }

  function handleTargetLanguageChange(event: SelectChangeEvent<string>): void {
    const newTargetLanguage = event.target.value;
    setTargetLanguage(newTargetLanguage);
    setSettingsChanged(true);
    handleSaveSettings(sourceLanguage, newTargetLanguage, languageProficiency);
  }

  function handleLanguageProficiencyChange(event: Event, value: number | number[]): void {
    const newLanguageProficiency = value as number;
    setLanguageProficiency(newLanguageProficiency);
    setSettingsChanged(true);
    handleSaveSettings(sourceLanguage, targetLanguage, newLanguageProficiency);
  }

  function handleDrawerClose(): void {
    handleClose();
    if (settingsChanged){
      window.location.href = location.pathname;
    }
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
      onClose={handleDrawerClose}
      PaperProps={{
        style: {
          width: '100%',
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
          sx={{
            mb: 2,
            mt: 2,
            width: "90%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowBackIcon onClick={handleDrawerClose} />
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "24px",
              position: "absolute",
              left: "50%",
              transform: 'translateX(-50%)',
            }}
          >
            Settings
          </Typography>
          <div></div>
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