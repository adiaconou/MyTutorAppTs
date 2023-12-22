import React, { useEffect, useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessageList from "../components/chat/ChatMessageList";
import { Box } from "@mui/material";
import useViewModel from "../viewmodels/ChatViewModel";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // Import useLocation from react-router-dom
import Loading from "../components/common/Loading";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";
import StarIcon from '@mui/icons-material/Star'; // Import StarIcon from MUI Icons
import StarBorderIcon from '@mui/icons-material/StarBorder'; // For un-selected state
import { Session } from "../models/Session";


interface ChatViewProps {
  systemPrompt?: string;
}

const ChatView: React.FC<ChatViewProps> = () => {
  const navigate = useNavigate();
  const { user, isLoading, getAccessTokenSilently } = useAuth0();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isStarSelected, setIsStarSelected] = useState(false);
  const location = useLocation(); // Get the current URL location
  const userSettingsService = new UserSettingsService();
  const { id } = useParams<{ id: string }>();

  const {
    messages,
    viewportHeight,
  //  id,
    waitingForMessageFromAI,
    userChatSession,
    saveChatSession,
    loadChatSession,
    handleTextSubmit,
  } = useViewModel();

  useEffect(() => {

  }, [id]);

  // Check auth and load chat session on component mount
  useEffect(() => {
    console.log("ChatView useEffect", { id });

    // Can navigate to /chat through starting a new session,
    // which passes a location.state value
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

      // Redirect from NewSession creation will include user settings in the state
      let userSettings = location.state?.userSettings as UserSettings;

      // If chat session is loaded from history, settings must be retrieved from server
      const token = await getAccessTokenSilently();
      if (!userSettings) {
        userSettings = await userSettingsService.getUserSettings(user.email, token) as UserSettings;
      }

      setUserSettings(userSettings);
      const chatSession = await loadChatSession(userSettings, token) as Session;


      if (chatSession && chatSession.isSaved) {
        console.log("SESSION IS SAVED");
        setIsStarSelected(true);
      } else {
  
        console.log("poopo", {userChatSession});
      }
    };

    fetchToken();

  }, [id]);

  const handleUserTextSubmit = (text: string) => {
    if (!userSettings) {
      throw new Error("Missing UserSettings");
    }

    handleTextSubmit(text, userSettings, isStarSelected);
  }

  const handleStarClick = () => {
    console.log("Star click event", { isStarSelected, id, userSettings });

    // Only allow changing the state if isStarSelected is currently false
    if (!isStarSelected) {
      setIsStarSelected(true);

      console.log("Star selected");
      if (userSettings) {
        console.log("Saving chat session...");
        saveChatSession(messages, userSettings);
      }
    } else {
      console.log("Star icon is disabled and cannot be reactivated");
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
