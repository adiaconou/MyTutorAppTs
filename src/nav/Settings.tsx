import React, { useState, useEffect } from "react";
import { Box, Slider, Typography, Divider } from "@mui/material";
import MyDropDown from "../components/MyDropDown";
import { SelectChangeEvent } from "@mui/material/Select";
import { UserSettings } from "../models/settingsModel";
import CircularProgress from '@mui/material/CircularProgress';

const Settings: React.FC = () => {
  const fixedUserId = "adiaconou";

  // State to hold the current value of the slider
  const [languageProficiency, setLanguageProficiency] = useState<number>(5); // Default value
  const [languageChoice, setLanguageChoice] = useState<string>("Greek");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handle slider value change
  const handleLanguageProficiencyChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    setLanguageProficiency(newValue as number);

    const userSettings: UserSettings = {
      userId: 'adiaconou',
      settings: {
        languageChoice: languageChoice,
        languageProficiency: newValue as number,
      },
    };

    updateUserSettings(userSettings);
  };

  const handleLanguageChoiceChange = (event: SelectChangeEvent<string>) => {
    setLanguageChoice(event.target.value);


    const userSettings: UserSettings = {
      userId: 'adiaconou',
      settings: {
        languageChoice: event.target.value,
        languageProficiency: languageProficiency,
      },
    };

    updateUserSettings(userSettings);
  };

  // Fetch user settings on component mount and update state values
  useEffect(() => {
    getUserSettings(fixedUserId).then((userSettings) => {
      if (userSettings && userSettings.settings) {
        setLanguageChoice(userSettings.settings.languageChoice);
        setLanguageProficiency(userSettings.settings.languageProficiency);
      }
      setIsLoading(false);
    });
  }, []); // Empty dependency array ensures this effect only runs on component mount

  async function getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const response = await fetch(
        `http://localhost:3001/user-settings/${userId}`
      );

      // Check if the response status code indicates success
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const userSettings: UserSettings = await response.json();
      console.log("userSettings: " + userSettings);
      return userSettings;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
  }

  async function updateUserSettings(userSettings: UserSettings): Promise<UserSettings | null> {
    try {
      const response = await fetch(`http://localhost:3001/user-settings/${userSettings.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSettings),
      });

      if (!response.ok) {
        throw new Error('Error updating user settings');
      }
      const updatedUserSettings: UserSettings = await response.json();
      return updatedUserSettings;

    } catch (error) {
      console.error(`Error attempting to update user settings: ${error}`);
      return null;
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
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
        paddingTop: "16px", // Optional padding from the top
        width: "100%",
      }}
    >
      <Box
        className="setting_pageTitle"
        sx={{ marginBottom: "30px", marginTop: "64px", width: "75%" }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
          Prompt Settings
        </Typography>
      </Box>
      <Box
        className="setting_languageChoice"
        sx={{ marginTop: "4px", width: "75%" }}
      >
        <Divider
          sx={{
            width: "100%",
            marginBottom: "16px",
            borderColor: "lightgrey",
            opacity: 0.2,
          }}
        />

        <Typography sx={{ fontSize: "14px" }}>Language</Typography>
        <MyDropDown
          languageChoice={languageChoice}
          handleLanguageChoiceChange={handleLanguageChoiceChange}
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
            borderColor: "lightgrey",
            opacity: 0.2,
          }}
        />
        <Typography sx={{ fontSize: "14px" }}>Language Proficiency</Typography>
        <Box sx={{ width: "300px", marginTop: "10px" }}>
          <Slider
            value={languageProficiency}
            min={0}
            max={10}
            step={1}
            onChange={handleLanguageProficiencyChange}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
