import React, { useEffect } from "react";
import TextFieldView from "./TextFieldView";
import ChatView from "./ChatView";
import { Box } from "@mui/material";
import useViewModel from "./ChatFormViewModel";

interface ChatFormViewProps {
  systemPrompt?: string;
}

const ChatFormView: React.FC<ChatFormViewProps> = ({ systemPrompt }) => {

  const {
    messages,
    viewportHeight,
    id,
    isLoading,
    loadChatSession,
    updateViewportSize,
    handleTextSubmit
  } = useViewModel();

  useEffect(() => {
    window.addEventListener("resize", updateViewportSize);
    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
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
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: `${viewportHeight}px`,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          backgroundColor: "transparent",
          width: "100%",
          maxWidth: "md",
          marginTop: "64px",
          // bgcolor: '#444654',
          borderRadius: 2,

          "&::-webkit-scrollbar": {
            width: "6px",
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
        <ChatView messages={messages} />
      </Box>
      <Box
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
        <TextFieldView onSubmit={handleTextSubmit} />
      </Box>
    </Box>
  );
};

export default ChatFormView;
