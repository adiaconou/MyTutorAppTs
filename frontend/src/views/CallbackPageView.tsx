import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import { UserSettingsService } from "../services/UserSettingsService";
import { UserSettings } from "../models/UserSettings";

const CallbackPageView = () => {
  const { isLoading, handleRedirectCallback, getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const [isCallbackHandled, setIsCallbackHandled] = useState(false);

  const navigate = useNavigate();

  const userSettingsService: UserSettingsService = new UserSettingsService();

  useEffect(() => {
    console.log("useEffect CallbackPageView", { user, isLoading, isAuthenticated });

    async function handleAuthCallback() {
      /*
      if (isLoading) {
        // Wait for loading to complete
        console.log("STILL LOADING");
        return;
      }

      if (!user) {
        // If no user is present, consider redirecting to login or handling it appropriately
        navigate('/login');
        return;
      }

      try {
        console.log("trying something weeee");
        const redirectResult = await handleRedirectCallback();

        setIsCallbackHandled(true);
        console.log("AppState:", redirectResult.appState);

        const userSettingsFromAppState = redirectResult.appState?.userSettings;
        if (userSettingsFromAppState) {
          const newUserSettings = { ...userSettingsFromAppState, userId: user.email };
          const token = await getAccessTokenSilently();
          await userSettingsService.updateUserSettings(newUserSettings, token);
          console.log("UserSettings updated successfully", { newUserSettings });
        }

        const redirectRoute = redirectResult.appState?.returnTo || '/';
        navigate(redirectRoute);
      } catch (error) {
        console.error("Error handling redirect callback:", error);
        navigate("/error"); // Redirect to an error page
      }
      */
    }
    console.log("handling auth callback");
    handleAuthCallback();
  }, [isLoading, user, isAuthenticated]);

  // Show loading while processing the callback
  if (isLoading) {
    console.log("LOADING....");
    return <Loading />;
  }

  console.log("RETURNING NULL");
  // Optionally, return null or a placeholder here since the component will redirect
  return null;
};

export default CallbackPageView;
