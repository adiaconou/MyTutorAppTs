import React, { useEffect, useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessageList from "../components/chat/ChatMessageList";
import { Box } from "@mui/material";
import useViewModel from "../viewmodels/ChatViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation from react-router-dom
import Loading from "../components/common/Loading";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";

interface ChatViewProps {
  systemPrompt?: string;
}

const ChatView: React.FC<ChatViewProps> = () => {
  const navigate = useNavigate();
  const { user, isLoading, getAccessTokenSilently } = useAuth0();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const location = useLocation(); // Get the current URL location
  const userSettingsService = new UserSettingsService();

  const {
    messages,
    viewportHeight,
    id,
    waitingForMessageFromAI,
    userChatSession,
    loadChatSession,
    handleTextSubmit,
  } = useViewModel();

  // Check auth and load chat session on component mount
  useEffect(() => {
    console.log("ChatView useEffect", { id });

    // Can navigate to /chat through starting a new session,
    // in which location.state is available, or through
    // accessing chat history, in which case id is available.
    // Going directly to /chat in browswer should redirect.
    if (!id && !location.state) {
      navigate("/");
      return;
    }

    const fetchToken = async () => {
      if (!user?.email) {
        navigate("/login");
        return;
      }

      // These state values provided from NewChatSession flow to select
      // the practice topic.
      // TODO: Use these to clean up some of the code in the viewModel
      const stateValue = location.state?.value;

      // Redirect from NewSession creation will include user settings in the state
      let fetchedUserSettings = location.state?.userSettings as UserSettings;
      const token = await getAccessTokenSilently();

      // User settings not passed in if loading a chat from the history
      if (!fetchedUserSettings) {
        fetchedUserSettings = await userSettingsService.getUserSettings(user.email, token) as UserSettings;
      }

      setUserSettings(fetchedUserSettings);
      loadChatSession(fetchedUserSettings, token);
    };

    fetchToken();

  }, [id]);

  const handleUserTextSubmit = (text: string) => {
    if (!userSettings) {
      throw new Error("Missing UserSettings");
    }

    handleTextSubmit(text, userSettings);
  }

  // TODO: Hanlde userChatSession better.
  if (isLoading || !userChatSession) {
    return <Loading />
  }

  return (
    <Box
      className="ChatFormView_parent"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: `${viewportHeight}px`,
      }}
    >
      <Box
        className="ChatMessageListView_parent"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          width: "100%",
          maxWidth: "md",
          marginTop: '64px',
          borderRadius: 1,

          "&::-webkit-scrollbar": {
            width: "2px",
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "3px",
            backgroundColor: "#aaa",
          },
          "&::-webkit-scrollbar-track": {
            borderRadius: "3px",
            backgroundColor: "transparent",
          },
        }}
      >
        <ChatMessageList messages={messages} chatSession={userChatSession} waitingForMessageFromAI={waitingForMessageFromAI} />
      </Box>
      <Box
        className="TextFieldView_parent"
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 1,
          backgroundColor: "transparent",
          paddingBottom: "15px",
          paddingTop: "15px",
          width: "100%",
          maxWidth: "md",
          margin: "0 auto",
        }}
      >
        <ChatInput onSubmit={handleUserTextSubmit} disabled={waitingForMessageFromAI} />
      </Box>
    </Box>
  );
};

export default ChatView;
