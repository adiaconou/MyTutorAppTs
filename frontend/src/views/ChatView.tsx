import React, { useEffect, useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessageList from "../components/chat/ChatMessageList";
import { Box } from "@mui/material";
import useViewModel from "../viewmodels/ChatViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface ChatViewProps {
  systemPrompt?: string;
}

const ChatView: React.FC<ChatViewProps> = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth0();
  const [isStarSelected, setIsStarSelected] = useState(false);

  const {
    messages,
    viewportHeight,
    waitingForMessageFromAI,
    userChatSession,
    saveChatSession,
    loadChatSession,
    handleTextSubmit,
  } = useViewModel();

  // Check auth and load chat session on component mount
  useEffect(() => {
    console.log("ChatView useEffect");

    const fetchToken = async () => {
      const chatSession = await loadChatSession();
      if (chatSession && chatSession.isSaved) {
        setIsStarSelected(true);
      }
    };

    fetchToken();

  }, []);

  const handleUserTextSubmit = (text: string) => {
    handleTextSubmit(text, isStarSelected);
  }

  const handleStarClick = () => {
    if (!user?.email) {
      navigate("/login");
      return;
    }
    // Only allow changing the state if isStarSelected is currently false
    if (!isStarSelected) {
      setIsStarSelected(true);
      saveChatSession(messages, user.email);
    }
  };

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
          position: "relative", // Set position as relative
          paddingBottom: "15px",
          paddingTop: "15px",
          width: "100%",
          maxWidth: "md",
          margin: "0 auto",
          // ... other existing styles ...
        }}
      >
        {isStarSelected ? (
          // Render the StarIcon with a disabled look
          <StarIcon sx={{
            position: "absolute",
            bottom: "100%",
            left: "8%",
            transform: "translateX(-50%)",
            color: "gold", // Change color to gray or any other to indicate disabled state
            cursor: "not-allowed", // Change cursor to indicate non-clickable
            opacity: 0.5, // Reduce opacity to indicate it's disabled
            // ... other styling as required ...
          }} />
        ) : (
          // Render the StarBorderIcon for the non-selected state
          <StarBorderIcon sx={{
            position: "absolute",
            bottom: "100%",
            left: "8%",
            transform: "translateX(-50%)",
            color: "gray",
            cursor: "pointer",
            // ... other styling as required ...
          }} onClick={handleStarClick} />
        )}
        <ChatInput onSubmit={handleUserTextSubmit} disabled={waitingForMessageFromAI} />
      </Box>
    </Box>
  );
};

export default ChatView;
