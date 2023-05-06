import React, { useEffect, useState } from "react";
import TextFieldView from "./TextFieldView";
import ChatMessageListView from "./ChatMessageListView";
import { Box } from "@mui/material";
import useViewModel from "./ChatFormViewModel";

interface ChatFormViewProps {
  systemPrompt?: string;
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log("Window dimensions: " + windowDimensions.height);
  return windowDimensions;
}


const ChatFormView: React.FC<ChatFormViewProps> = ({ systemPrompt }) => {

  const {
    messages,
   // viewportHeight,
    id,
    isLoading,
    loadChatSession,
    updateViewportSize,
    handleTextSubmit
  } = useViewModel();

  const { height: viewportHeight } = useWindowDimensions();

  /*
  useEffect(() => {
    window.addEventListener("resize", updateViewportSize);
    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);
*/
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
        <ChatMessageListView messages={messages} />
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
        <TextFieldView onSubmit={handleTextSubmit} />
      </Box>
    </Box>
  );
};

export default ChatFormView;
