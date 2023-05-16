import { useState } from "react";
import { UserSettings } from "../../models/UserSettings";
import { BackendService } from "../../services/BackendService";
import { SelectChangeEvent } from "@mui/material";

export default function SettingsViewModel() {
  const backend = new BackendService();

  const [languageProficiency, setLanguageProficiency] = useState<number>(5);
  const [languageChoice, setLanguageChoice] = useState<string>("Greek"); 

  // controls the spinner when the settings are being loaded
  const [isLoading, setIsLoading] = useState<boolean>(true);
   
  const email = sessionStorage.getItem("email");

  /*** Retrieve the stored user settings when the SettingsView is first loaded ***/
  const getUserSettings = (userId: string): void => {
    console.log("Getting user settings for " + userId);
    backend
      .getUserSettings(userId)
      .then((userSettings) => {
        if (userSettings && userSettings.settings) {
          setLanguageChoice(userSettings.settings.languageChoice);
          setLanguageProficiency(userSettings.settings.languageProficiency);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user settings:", error);
        setIsLoading(false);
      });
  };

  /*** Store the language proficiency update when the slider is adjusted ***/
  const handleLanguageProficiencyChange: (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => void = (event, newValue, activeThumb) => {

    if (!email) {
      throw Error("Email address is unavailable. User settings cannot be updated.");
    }

    setLanguageProficiency(newValue as number);

    const userPromptSettings: UserSettings = {
      userId: email,
      settings: {
        languageChoice: languageChoice,
        languageProficiency: newValue as number,
        sourceLanguage: "English",
      },
    };

    updateUserSettings(userPromptSettings);
  };

  /*** Store the language choice update when a new selection is made from the drop down ***/
  const handleLanguageChoiceChange = (event: SelectChangeEvent<string>) => {

    if (!email) {
      throw Error("Email address is unavailable. User settings cannot be updated.");
    }

    setLanguageChoice(event.target.value);

    const userSettings: UserSettings = {
      userId: email,
      settings: {
        languageChoice: event.target.value,
        languageProficiency: languageProficiency,
        sourceLanguage: "English",
      },
    };

    updateUserSettings(userSettings);
  };

  /*** Send the settings update request to the server ***/
  async function updateUserSettings(userSettings: UserSettings): Promise<void> {
    backend.updateUserSettings(userSettings);
  }

  return {
    languageProficiency,
    languageChoice,
    isLoading,
    handleLanguageProficiencyChange,
    handleLanguageChoiceChange,
    getUserSettings,
  };
}
