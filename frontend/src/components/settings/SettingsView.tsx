import React, { useEffect } from "react";
import { Box, Slider, Typography, Divider } from "@mui/material";
import MyDropDown from "./LanguageChoiceDropDownView";
import CircularProgress from "@mui/material/CircularProgress";
import useViewModel from "./SettingsViewModel";
import { useAuth0 } from "@auth0/auth0-react";

const SettingsView: React.FC = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const {
    languageProficiency,
    languageChoice,
    isLoading,
    handleLanguageProficiencyChange,
    handleLanguageChoiceChange,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
        sx={{ marginBottom: "30px", marginTop: "64px", width: "75%", }}
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

export default SettingsView;
