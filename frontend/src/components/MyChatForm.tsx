import React, { useState, useEffect } from "react";
import MyTextField from "./MyTextField";
import MyChatWindow from "./MyChatWindow";
import { Box } from "@mui/material";
import { UserChatMessage } from "../models/UserChatMessage";
import { useParams } from "react-router-dom";
import promptGPT from "../services/OpenaiService";
import { BackendService } from "../services/BackendService";

interface Message {
  text: string;
  isUser: boolean;
}

interface MyChatFormProps {
  systemPrompt?: string;
}

const MyChatForm: React.FC<MyChatFormProps> = ({ systemPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const backend = new BackendService();

  useEffect(() => {
    window.addEventListener("resize", updateViewportSize);
    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  /*** When the component loads, we check if there is a chat session id
   * in the session data. If it exists, we will load the chat history
   * for that chat session. If it doesn't exist, we will clear the messages
   * from the chat form because it should be a fresh chat session.
   ***/
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          sessionStorage.setItem("chatSessionId", id);
          getMessages(id, 500);
          setIsLoading(false);
        } else {
          sessionStorage.setItem("chatSessionId", "");
          clearMessages();
          setIsLoading(false);

          // systemPrompt is an optional prop for the component which
          // is only passed in if this is a new chat session. This will
          // trigger the initial gpt system prompt to kick off the chat
          // session.
          if (systemPrompt) {
            const fetchResponse = async () => {
              const response = await promptGPT(systemPrompt, "system");
              if (response !== null) {
                const aiMessage: Message = { text: response, isUser: false };
                setMessages((prevMessages) => [...prevMessages, aiMessage]);
                await putNewMessage(response, "bot");
              }
            };

            fetchResponse();
          }
        }
      } catch (error) {
        console.error(`Error fetching data: ${error}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /***  Update viewport height ***/
  const updateViewportSize = () => {
    setViewportHeight(window.innerHeight);
  };

  /*** Clear chat messages and session data from the chat component ***/
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.setItem("chatSessionId", "");
  };

  /*** Get message history for the chat session ***/
  const getMessages = async (chatSessionId: string, limit: number) => {
    const messageList: UserChatMessage[] = await backend.getMessages(
      chatSessionId,
      limit
    );

    // Convert UserChatMessage[] to Message[]
    const mappedMessages: Message[] = messageList.map((message) => ({
      text: message.text,
      isUser: message.sender === "user",
    }));

    setMessages(mappedMessages);
    setIsLoading(false);
  };

  /*** Store the new chat session record in the database ***/
  async function createChatSession(messageText: string) {
    backend.createChatSession(messageText);
  }

  /*** Store the last message in the database ***/
  async function putNewMessage(text: string, sender: string) {
    backend.putNewMessage(text, sender);
  }

  /*** Handle new messages submitted by the user through chat ***/
  const handleTextSubmit = async (text: string) => {
    if (messages.length == 0) {
      await createChatSession(text);
    } else {
      await putNewMessage(text, "user");
    }

    const userMessage: Message = { text, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const fetchResponse = async () => {
      const response = await promptGPT(text, "user");
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
