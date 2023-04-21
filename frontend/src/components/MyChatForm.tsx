import React, { useState, useEffect } from "react";
import MyTextField from "./MyTextField";
import MyChatWindow from "./MyChatWindow";
import { Box, Grid } from "@mui/material";
import promptGPT from "../services/openaiService";
import { UserChatSession } from "../models/UserChatSession";
import { v4 as uuidv4 } from "uuid";
import { UserChatMessage } from "../models/UserChatMessage";
import { useParams } from "react-router-dom";

 const apiUrl = process.env.APP_BACKEND_URL || "https://backend-dot-for-fun-153903.uc.r.appspot.com";
// const apiUrl = "http://localhost:3001";

interface Message {
  text: string;
  isUser: boolean;
}

const MyChatForm: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [sessionData, setSessionData] = useState<string>(() => {
    // Retrieve data from sessionStorage if available
    const chatSessionId = sessionStorage.getItem('chatSessionId');
    return chatSessionId ?? '';
  });

  // State to store retrieved chat sessions
  const [chatSessions, setChatSessions] = useState<UserChatSession[]>([]);

  const updateViewportSize = () => {
    setViewportHeight(window.innerHeight);
    // setViewportWidth(window.innerWidth);
  };

  const clearMessages = () => {
    setMessages([]);
    sessionStorage.setItem('chatSessionId', '');
  };

  // Function to get chat sessions
  const getMessages = async (chatSessionId: string, limit: number) => {
    try {
      const response = await fetch(
        `${apiUrl}/messages/?chatSessionId=${encodeURIComponent(
          chatSessionId
        )}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const messageList: UserChatMessage[] = await response.json();

      // Convert UserChatMessage[] to Message[]
      const mappedMessages: Message[] = messageList.map((message) => ({
        text: message.text,
        isUser: message.sender === "user",
      }));

      setMessages(mappedMessages);
      setIsLoading(false); // Set loading status to false after data is fetched
    } catch (error) {
      console.error(`Error fetching chat sessions: ${error}`);
      setIsLoading(false); // Set loading status to false even if an error occurs
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          sessionStorage.setItem("chatSessionId", id);
          getMessages(id, 500);
   
          setIsLoading(false);
        } else {
          sessionStorage.setItem("chatSessionId", '');
          clearMessages();
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error fetching data: ${error}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  async function createChatSession(messageText: string) {
    try {
      let chatSessionId = uuidv4();
      const session: UserChatSession = {
        id: chatSessionId,
        userId: "adiaconou",
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        summary: chatSessionId,
      };

      const initialMessage: UserChatMessage = {
        id: uuidv4(),
        chatSessionId: chatSessionId,
        text: messageText,
        timestamp: new Date(),
        sender: "user",
      };

      const requestBody = {
        session: {
          ...session,
          createdAt: session.createdAt.toISOString(),
          lastUpdatedAt: session.lastUpdatedAt.toISOString(),
        },
        initialMessage: {
          ...initialMessage,
          timestamp: initialMessage.timestamp.toISOString(),
        },
      };

      const response = await fetch(`${apiUrl}/chatSessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Response not ok");
      }

      sessionStorage.setItem("chatSessionId", session.id);
    } catch (error) {
      console.error(`Error attempting to update user chat: ${error}`);
    }
  }

  async function putNewMessage(text: string, sender: string) {
    try {
      const chatSessionId = sessionStorage.getItem("chatSessionId");
      console.log("Chat session id: " + chatSessionId);
      if (chatSessionId == null) {
        return;
      }

      const initialMessage: UserChatMessage = {
        id: uuidv4(),
        chatSessionId: chatSessionId,
        text: text,
        timestamp: new Date(),
        sender: sender,
      };

      const response = await fetch(`${apiUrl}/messages/${initialMessage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initialMessage),
      });

      if (!response.ok) {
        throw new Error("Response not ok");
      }
    } catch (error) {
      console.error(`Error attempting to update user chat: ${error}`);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", updateViewportSize);
    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  const handleTextSubmit = async (text: string) => {
    if (messages.length == 0) {
      await createChatSession(text);
    } else {
      await putNewMessage(text, "user");
    }

    const userMessage: Message = { text, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const fetchResponse = async () => {
      const response = await promptGPT(text);
      if (response !== null) {
        const aiMessage: Message = { text: response, isUser: false };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

        await putNewMessage(response, "bot");
      }
    };

    fetchResponse();
  };

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
