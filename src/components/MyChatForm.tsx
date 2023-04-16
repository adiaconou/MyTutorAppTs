import React, { useState } from "react";
import MyTextField from "./MyTextField";
import MyChatWindow from "./MyChatWindow";
import { Box, Grid } from "@mui/material";
import promptGPT from "../services/openaiService";

interface Message {
  text: string;
  isUser: boolean;
}

const MyChatForm: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTextSubmit = (text: string) => {
    const userMessage: Message = { text, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const fetchResponse = async () => {
      const response = await promptGPT(text);
      if (response !== null) {
        const aiMessage: Message = { text: response, isUser: false };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }
    };

    fetchResponse();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
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
          
          '&::-webkit-scrollbar': {
            width: '6px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '3px',
            backgroundColor: '#aaa',
          },
          '&::-webkit-scrollbar-track': {
            borderRadius: '3px',
            backgroundColor: 'transparent',
          }, 
        }}
      >
        <MyChatWindow messages={messages} />
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
        <MyTextField messages={messages} onSubmit={handleTextSubmit} />
      </Box>
    </Box>
  );
};

export default MyChatForm;
