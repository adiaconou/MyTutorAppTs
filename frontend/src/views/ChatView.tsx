import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/common/Loading";
import { Box } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import useViewModel from "../viewmodels/ChatViewModel";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatInput from "../components/chat/ChatInput";

const ChatView: React.FC = () => {
  const { isLoading } = useAuth0();

  const {
    messages,
    viewportHeight,
    waitingForMessageFromAI,
    userChatSession,
    authToken,
    saveChatSession,
    submitMessage,
  } = useViewModel();

  const handleTextSubmit = async (text: string) => {
    await submitMessage(text);
  }

  const handleStarClick = async () => {
    if (userChatSession && !userChatSession.isSaved) {
      await saveChatSession(messages);
    }
  };

  // TODO: Handle userChatSession better.
  if (isLoading || !userChatSession || !authToken) {
    return <Loading />;
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
        <ChatMessageList
          messages={messages}
          chatSession={userChatSession}
          waitingForMessageFromAI={waitingForMessageFromAI}
        />
      </Box>
      <Box
        sx={{
          position: "relative",
          paddingBottom: "15px",
          paddingTop: "15px",
          width: "100%",
          maxWidth: "md",
          margin: "0 auto",
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {userChatSession.isSaved ? (
          <StarIcon sx={{
            position: "absolute",
            bottom: "100%",
            left: "8%",
            transform: "translateX(-50%)",
            color: "gold",
            cursor: "not-allowed",
            opacity: 0.5, // Reduce opacity to indicate it's disabled
          }} />
        ) : (
          <StarBorderIcon sx={{
            position: "absolute",
            bottom: "100%",
            left: "8%",
            transform: "translateX(-50%)",
            color: "gray",
            cursor: "pointer",
          }} onClick={handleStarClick} />
        )}
        <ChatInput onSubmit={handleTextSubmit} disabled={waitingForMessageFromAI} />
      </Box>
    </Box>
  );
};

export default ChatView;
