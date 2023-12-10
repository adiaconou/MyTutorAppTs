import React, { useEffect } from "react";
import TextFieldView from "./TextFieldView";
import ChatMessageListView from "./ChatMessageListView";
import { Box } from "@mui/material";
import useViewModel from "./ChatFormViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom"; // Import useLocation from react-router-dom

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
    waitingForMessageFromAI,
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

      // StateValue is provided from the BeginChat flow to select
      // the practice topic.
      // TODO: This should only be required for new chat sessions
      const stateValue = location.state?.value;
      if (!stateValue) {
        //TODO: redirect user to BeginChatView to select a practice topic
        return;
      }

      loadChatSession(user?.email, token);
    };

    fetchToken();
    
  }, [id, isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
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
        <ChatMessageListView messages={messages} waitingForMessageFromAI={waitingForMessageFromAI} />
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
        <TextFieldView onSubmit={handleTextSubmit} disabled={waitingForMessageFromAI} />
      </Box>
    </Box>
  );
};

export default ChatView;
