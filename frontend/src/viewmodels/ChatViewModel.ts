import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserChatSessionsService } from "../services/UserChatSessionsService";
import { useAuth0 } from "@auth0/auth0-react";
import { UserChatMessagesService } from "../services/UserChatMessagesService";
import { v4 as uuidv4 } from "uuid";
import { BotConversationMessage } from "../models/BotConversationMessage";
import Gpt4Prompt from "../prompt/Gpt4Prompt";
import { UserSettingsService } from "../services/UserSettingsService";
import { Message } from "../models/Message";
import { OpenAIService } from "../services/OpenAIService";
import { UserChatMessage } from "../models/UserChatMessage";
import { Session } from "../models/Session";

export default function ChatViewModel() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const { height: viewportHeight } = useWindowDimensions();
  const { id } = useParams<{ id: string }>();
  const [isChatViewLoading, setIsChatViewLoading] = useState(true);
  const [waitingForMessageFromAI, setWaitingForMessageFromAI] = useState(false);
  const [userChatSession, setUserChatSession] = useState<Session>();
  const userChatMessagesService = new UserChatMessagesService();
  const userChatSessionsService = new UserChatSessionsService();
  const openAiService = new OpenAIService();
  const userSettings = new UserSettingsService();

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
  const loadChatSession = async (userEmail: string, token: string) => {

    clearMessages();

    try {
      // The user's settings are required to generate the initial AI prompt
      const settings = await userSettings.getUserSettings(userEmail, token);
      if (!settings) {
        //TODO: Handle this properly
        return;
      }

      setUserChatSession({sourceLanguage: settings.settings.sourceLanguage, targetLanguage: settings.settings.languageChoice});

      if (id) { // If id exists, it is not a new chat session so retrieve messages from the server
        sessionStorage.setItem("chatSessionId", id);
        console.log("Loading chat session " + id);
        // If the user is loading a previous chat session, we must
        // retrieve the chat session object to get the source and
        // target language since languages can change across sessions.
        const userChatSession = await userChatSessionsService.getChatSessionById(id, token);
        if (userChatSession) {
          setUserChatSession({sourceLanguage: userChatSession.sourceLanguage, targetLanguage: userChatSession.targetLanguage});
        }
        getMessages(id, 500);
      } else { // Start a new chat session
        console.log("Starting a new chat session...");
        setWaitingForMessageFromAI(true);

        sessionStorage.setItem("chatSessionId", "");

        // Get the initial user prompt to start the AI chat
        // TODO: The retrieved prompt should be conditional on stateValue
        const systemPrompt = Gpt4Prompt.getConversationPrompt(settings);
        const newChatSessionId: string = await createChatSession(
          systemPrompt,
          settings.settings.sourceLanguage,
          settings.settings.languageChoice);

        // Store the message in the session and the server
        sessionStorage.setItem("chatSessionId", newChatSessionId);

        // Update the URL to reference the new session id.
        // e.g. from /chat to /chat/{newChatSessionId}
        // This keeps from creating a new session again
        // if the user refreshes the page.
        const currentUrl = window.location.href;
        const newUrl = `${currentUrl}/${newChatSessionId}`;
        window.history.pushState(null, '', newUrl);

        setMessages((prevMessages) => [
          ...prevMessages,
          { displayableText: systemPrompt, rawText: systemPrompt, isUser: true, isVisibleToUser: false },
        ]);

        // Creating local array to store messages since setMessages
        // updates async and the new state won't be available here
        let currentMessages: Message[];
        currentMessages = [];
        currentMessages.push({ displayableText: systemPrompt, rawText: systemPrompt, isUser: true });

        // Send the prompt to the AI
        const response = await openAiService.prompt(currentMessages, token);
        if (response !== null) {
          const parsedJson = JSON.parse(response);
          const parsedMessage = new BotConversationMessage(
            parsedJson.botResponse,
            parsedJson.translatedBotResponse,
            parsedJson.options
          ).toChatString();

          setMessages((prevMessages) => [
            ...prevMessages,
            { displayableText: parsedMessage, rawText: response, isUser: false },
          ]);

          await putNewMessage(parsedMessage, response, "bot");
        }
        setWaitingForMessageFromAI(false);
      }
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
    } finally {
      setIsChatViewLoading(false);
    }
  };

  /*** Get message history for the chat session ***/
  const getMessages = async (chatSessionId: string, limit: number) => {
    const token = await getAccessTokenSilently();
    const messageList: UserChatMessage[] = await userChatMessagesService.getMessages(
      chatSessionId,
      limit,
      token
    );

    // Convert UserChatMessage[] to Message[]
    const mappedMessages: Message[] = messageList.map((message) => ({
      displayableText: message.displayableText,
      rawText: message.rawText,
      isUser: message.sender === "user",
      isVisibleToUser: message.isVisibleToUser,
    }));

    setMessages(mappedMessages);
    setIsChatViewLoading(false);
  };

  /*** Handle new messages submitted by the user through chat ***/
  const handleTextSubmit = async (text: string) => {
    // TODO: Handle this better. Application won't work
    // without user email.
    if (!user?.email) {
      return;
    }

    const token = await getAccessTokenSilently();
    const settings = await userSettings.getUserSettings(user?.email, token);
    if (!settings) {
      return; // Can't be here if there's no user settings
    }

    setUserChatSession({sourceLanguage: settings.settings.sourceLanguage, targetLanguage: settings.settings.languageChoice});

    // First user message of the session - only happens once per session
    if (messages.length === 0) {
      const newChatSessionId: string = await createChatSession(
        text,
        settings.settings.sourceLanguage,
        settings.settings.languageChoice);

      sessionStorage.setItem("chatSessionId", newChatSessionId);
    } else {
      await putNewMessage(text, text, "user");
    }

    const userMessage: Message = { displayableText: text, rawText: text, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const currentMessages = messages;
    currentMessages.push(userMessage);

    setWaitingForMessageFromAI(true);

    const fetchResponse = async () => {
      const response = await openAiService.prompt(currentMessages, token);

      if (response !== null) {
        const parsedJson = JSON.parse(response);
        const parsedMessage = new BotConversationMessage(
          parsedJson.botResponse,
          parsedJson.translatedBotResponse,
          parsedJson.options
        ).toChatString();
        const aiMessage: Message = { displayableText: parsedMessage, rawText: response, isUser: false };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        await putNewMessage(parsedMessage, response, "bot");
      }

      setWaitingForMessageFromAI(false);
    };

    fetchResponse();
  };

  /*** Store the new chat session record in the database ***/
  async function createChatSession(messageText: string, sourceLanguage: string, targetLanguage: string) {
    // The user and user.email objects must exist to create a chat session (or really do anything)
    if (!user || !user.email) {
      throw Error("Cannot create chat session because user email is not available.");
    }

    // Create a unique chatSessionId
    let chatSessionId = uuidv4();

    // Create UserChatMessage object. A chat session is only
    // created when a user sends the first message.
    const userChatMessage: UserChatMessage = {
      id: uuidv4(),
      chatSessionId: chatSessionId,
      displayableText: messageText,
      rawText: messageText,
      timestamp: new Date(),
      sender: "user",
      isVisibleToUser: false, // Initial prompt should not be visible to user in chat view
    };

    // Get the auth token to authorize the API call
    const token = await getAccessTokenSilently();

    // Send the request to the server
    return userChatSessionsService.createChatSession(user.email, chatSessionId, sourceLanguage, targetLanguage, userChatMessage, token);
  }

  /*** Store the last message in the database ***/
  async function putNewMessage(displayableText: string, rawText: string, sender: string, isVisibleToUser?: boolean) {
    // Get the chat session id from the browser session.
    // If it doesn't exist, we can't write the message.
    const chatSessionId = sessionStorage.getItem("chatSessionId");
    if (!chatSessionId) return;

    // Get auth access token so the request can be authorized
    const token = await getAccessTokenSilently();

    // Send the message
    userChatMessagesService.putNewMessage(displayableText, rawText, sender, chatSessionId, token, isVisibleToUser);
  }

  return {
    messages,
    viewportHeight,
    id,
    isChatViewLoading,
    waitingForMessageFromAI,
    userChatSession,
    loadChatSession,
    handleTextSubmit,
    useWindowDimensions,
  };
}
