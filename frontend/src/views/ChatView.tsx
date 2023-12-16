import React, { useEffect } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessageList from "../components/chat/ChatMessageList";
import { Box } from "@mui/material";
import useViewModel from "../viewmodels/ChatViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom"; // Import useLocation from react-router-dom
import Loading from "../components/common/Loading";
import { UserSettings } from "../models/UserSettings";

interface ChatViewProps {
  systemPrompt?: string;
}

const ChatView: React.FC<ChatViewProps> = () => {
  const { user, isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const location = useLocation(); // Get the current location

  const {
    messages,
    viewportHeight,
    id,
    isChatViewLoading,
    waitingForMessageFromAI,
    userChatSession,
    loadChatSession,
    handleTextSubmit,
  } = useViewModel();

  // Check auth and load chat session on component mount
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getAccessTokenSilently();
      if (!isAuthenticated || !user?.email) {
        //TODO: redirect user to login
        return;
      }

      // These state values provided from NewChatSession flow to select
      // the practice topic.
      // TODO: Use these to clean up some of the code in the viewModel
      const stateValue = location.state?.value;
      const userSettings = location.state?.userSettings as UserSettings;
      if (userSettings) {
        console.log("User settings: " + userSettings.userId);
      }

      loadChatSession(user?.email, token);
    };

    fetchToken();

  }, [id, isChatViewLoading]);

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
          // bgcolor: '#444654',
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
        <ChatInput onSubmit={handleTextSubmit} disabled={waitingForMessageFromAI} />
      </Box>
    </Box>
  );
};

export default ChatView;
