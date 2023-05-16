import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BackendService } from "../../services/BackendService";
import promptGPT from "../../services/OpenaiService";
import { UserChatMessage } from "../../models/UserChatMessage";
import { useAuth0 } from "@auth0/auth0-react";

interface Message {
  text: string;
  isUser: boolean;
}

export default function ChatFormViewModel() {
  const { user } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const { height: viewportHeight } = useWindowDimensions();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [waitingForMessageFromAI, setWaitingForMessageFromAI] = useState(false);
  const backend = new BackendService();

  /***  Update window dimensions ***/
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

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    console.log("Window dimensions: " + windowDimensions.height);
    return windowDimensions;
  }

  /*** Clear chat messages and session data from the chat component ***/
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.setItem("chatSessionId", "");
  };

  /*** When the component loads, we check if there is a chat session id
   * in the session data. If it exists, we will load the chat history
   * for that chat session. If it doesn't exist, we will clear the messages
   * from the chat form because it should be a fresh chat session.
   ***/
  const loadChatSession = async (systemPrompt?: string) => {
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

  /*** Handle new messages submitted by the user through chat ***/
  const handleTextSubmit = async (text: string) => {

    if (messages.length == 0) {
      const newChatSessionId: string = await createChatSession(text);
      sessionStorage.setItem("chatSessionId", newChatSessionId);
    } else {
      await putNewMessage(text, "user");
    }

    const userMessage: Message = { text, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setWaitingForMessageFromAI(true);
    
    const fetchResponse = async () => {
      const response = await promptGPT(text, "user");
      if (response !== null) {
        const aiMessage: Message = { text: response, isUser: false };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

        await putNewMessage(response, "bot");
      }

      setWaitingForMessageFromAI(false);
    };

    fetchResponse();
  };

  /*** Store the new chat session record in the database ***/
  async function createChatSession(messageText: string) {
    if (user && user.email) {
      return backend.createChatSession(messageText, user.email);
    }

    throw Error("Cannot create chat session because user email is not available.");
    
  }

  /*** Store the last message in the database ***/
  async function putNewMessage(text: string, sender: string) {
    backend.putNewMessage(text, sender);
  }

  return {
    messages,
    viewportHeight,
    id,
    isLoading,
    waitingForMessageFromAI,
    loadChatSession,
    handleTextSubmit,
    useWindowDimensions,
  };
}
