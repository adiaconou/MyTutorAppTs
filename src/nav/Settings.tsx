import React, { useState } from "react";
import { Box, Slider, Typography, Divider } from "@mui/material";
import MyDropDown from "../components/MyDropDown";
// import { GoogleCloudDatastoreDataAccess } from "../dataAccess/googleCloudDatastoreDataAccess";

const Settings: React.FC = () => {
  // const dataAccess = new GoogleCloudDatastoreDataAccess('projectId');
  const fixedUserId = "adiaconou";

  // State to hold the current value of the slider
  const [languageProficiency, setLanguageProficiency] = useState<number>(5); // Default value
  const [languageChoice, setLanguageChoice] = useState<string>("gr");

  // Handle slider value change
  const handleLanguageProficiencyChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    setLanguageProficiency(newValue as number);
  };

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
        <MyDropDown />
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
