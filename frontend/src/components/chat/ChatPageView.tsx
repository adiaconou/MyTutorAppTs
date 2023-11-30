import React, { useEffect } from "react";
import TextFieldView from "./TextFieldView";
import ChatMessageListView from "./ChatMessageListView";
import { Box } from "@mui/material";
import useViewModel from "./ChatFormViewModel";
import { useAuth0 } from "@auth0/auth0-react";

interface ChatFormViewProps {
  systemPrompt?: string;
}

const ChatPageView: React.FC<ChatFormViewProps> = ({ systemPrompt }) => {
  const { user, isLoading, getAccessTokenSilently } = useAuth0();

  const {
    messages,
    viewportHeight,
    id,
    waitingForMessageFromAI,
    loadChatSession,
    handleTextSubmit,
  } = useViewModel();

  useEffect(() => {
    console.log("ChatPageView mounting: " + user?.email);
    if (systemPrompt) {
      loadChatSession(systemPrompt);
    } else {
      loadChatSession();
    }
  }, [id]);

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

export default ChatPageView;
