import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Typography, Card } from "@mui/material";
import Loading from "../components/common/Loading";
import ChatInput from "../components/chat/ChatInput";
import conversationImage from '../assets/background/conversation_image2.png';
import vocabImage from '../assets/background/vocab_background.png';
import { useUserSettings } from '../context/UserSettingsContext';

/*
  This view is displayed when a user begins a new chat session.
  This will prompt the user for what they want to practice.
*/
const NewSessionView: React.FC = () => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const { isLoading } = useAuth0();
  const navigate = useNavigate();
  const { userSettings, isSettingsLoading } = useUserSettings();

  useEffect(() => {
    console.log("useEffect NewSessionView", { userSettings, isLoading });
    setViewportWidth(window.outerWidth * .6);
  }, []);

  const redirectToChat = () => {
    console.log("User Settings", { userSettings });
    navigate("/chat", { state: { value: 1, userSettings: userSettings } });
  };

  function handleTextSubmit(inputValue: string): void {
    console.log("blah");
  }

  if (isLoading || !userSettings) {
    return <Loading />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexGrow: 1,
        paddingTop: "64px",
        width: "100%",
        height: window.innerHeight,
      }}
    >
      <Box
        sx={{
          width: `${viewportWidth}px`,
          height: `${viewportWidth * .5}px`,
          mt: 4,
          maxWidth: '300px',
          maxHeight: '200px',
        }}
      >
        <Card
          elevation={3}
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            borderRadius: 3,
            backgroundImage: `url(${conversationImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
          onClick={redirectToChat}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Conversation</Typography>
        </Card>
      </Box>
      <Box
        sx={{
          width: `${viewportWidth}px`,
          height: `${viewportWidth * .5}px`,
          maxWidth: '300px',
          maxHeight: '200px',
          mt: 4,
        }}
      >
        <Card
          elevation={3}
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            borderRadius: 3,
            backgroundImage: `url(${vocabImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Vocabulary</Typography>
        </Card>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          paddingBottom: "15px",
          paddingTop: "15px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <ChatInput onSubmit={handleTextSubmit} disabled={true} />
      </Box>
    </Box>
  );
};

export default NewSessionView;
