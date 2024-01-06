import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { SelectChangeEvent } from "@mui/material";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";

export default function SettingsViewModel() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [languageChoice, setLanguageChoice] = useState<string>("Greek");
  const [languageProficiency, setLanguageProficiency] = useState<number>(5);
  const { user, getAccessTokenSilently } = useAuth0();
  
  const userSettingsService = new UserSettingsService();

  const email = user?.email;

  /*** Retrieve the stored user settings when the SettingsView is first loaded ***/
  const getUserSettings = (userId: string, token: string): void => {
    userSettingsService
      .getUserSettings(userId, token)
      .then((userSettings) => {
        if (userSettings && userSettings.settings) {
          setLanguageChoice(userSettings.settings.languageChoice);
          setLanguageProficiency(userSettings.settings.languageProficiency);
          setUserSettings(userSettings);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user settings", error);
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
  const handleSourceLanguageChange = async (event: SelectChangeEvent<string>) => {
    if (!email) {
      throw Error("Email address is unavailable. User settings cannot be updated.");
    }

    const token = await getAccessTokenSilently();
    const currentUserSettings = await userSettingsService.getUserSettings(email, token);

    if (!currentUserSettings) {
      throw Error("User settings are unavailable. User settings cannot be updated.");
    }

    const updatedUserSettings: UserSettings = {
      userId: email,
      settings: {
        languageChoice: currentUserSettings.settings.languageChoice,
        languageProficiency: currentUserSettings.settings.languageProficiency,
        sourceLanguage: event.target.value,
      },
    };

    updateUserSettings(updatedUserSettings);
  };

  /*** Store the language choice update when a new selection is made from the drop down ***/
  const handleTargetLanguageChange = async (event: SelectChangeEvent<string>) => {
    if (!email) {
      throw Error("Email address is unavailable. User settings cannot be updated.");
    }

    const token = await getAccessTokenSilently();
    const currentUserSettings = await userSettingsService.getUserSettings(email, token);

    if (!currentUserSettings) {
      throw Error("User settings are unavailable. User settings cannot be updated.");
    }

    const updatedUserSettings: UserSettings = {
      userId: email,
      settings: {
        languageChoice: event.target.value,
        languageProficiency: currentUserSettings.settings.languageProficiency,
        sourceLanguage: currentUserSettings.settings.languageChoice,
      },
    };

    updateUserSettings(updatedUserSettings);
  };

  /*** Send the settings update request to the server ***/
  async function updateUserSettings(userSettings: UserSettings): Promise<void> {
    const token = await getAccessTokenSilently();
    userSettingsService.updateUserSettings(userSettings, token);
    setUserSettings(userSettings);
  }

  return {
    languageProficiency,
    languageChoice,
    isLoading,
    userSettings,
    handleLanguageProficiencyChange,
    handleSourceLanguageChange,
    handleTargetLanguageChange,
    getUserSettings,
  };
}
