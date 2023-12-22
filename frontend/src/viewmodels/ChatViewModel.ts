import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserChatSessionsService } from "../services/UserChatSessionsService";
import { useAuth0 } from "@auth0/auth0-react";
import { UserChatMessagesService } from "../services/UserChatMessagesService";
import { v4 as uuidv4 } from "uuid";
import { BotConversationMessage } from "../models/BotConversationMessage";
import Gpt4Prompt from "../prompt/Gpt4Prompt";
import { Message } from "../models/Message";
import { OpenAIService } from "../services/OpenAIService";
import { UserChatMessage } from "../models/UserChatMessage";
import { Session } from "../models/Session";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";

export default function ChatViewModel() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const { height: viewportHeight } = useWindowDimensions();
  const [waitingForMessageFromAI, setWaitingForMessageFromAI] = useState(false);
  const [userChatSession, setUserChatSession] = useState<Session>();
  const userChatMessagesService = new UserChatMessagesService();
  const userChatSessionsService = new UserChatSessionsService();
  const userSettingsService = new UserSettingsService();
  const { id } = useParams<{ id: string }>();
  const openAiService = new OpenAIService();
  const location = useLocation(); // Get the current URL location
  const navigate = useNavigate();

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

  /* 
    When the component loads, we check if there is a chat session id
    in the session data. If it exists, we will load the chat history
    for that chat session. If it doesn't exist, we will clear the messages
    from the chat form because it should be a fresh chat session.
  */
  const loadChatSession = async (): Promise<Session | undefined> => {
    console.log("Loading chat session", { id });
    // Can navigate to /chat through starting a new session,
    // which passes a location.state value
    // accessing chat history, in which case id is available.
    // Going directly to /chat in browswer should redirect.
    if (!id && !location.state) {
      navigate("/");
      return;
    }

    if (!user?.email) {
      navigate("/login");
      return;
    }

    setMessages([]);

    try {

      // No id in URL pram means this is a new chat session because
      // location.state is also set (user initiated new chat session)
      if (!id) {
        setWaitingForMessageFromAI(true);

        const newChatSession = await startNewChatSession(user.email);
        setUserChatSession(newChatSession);
        setMessages(newChatSession.messages);
        sessionStorage.setItem('messages', JSON.stringify(newChatSession.messages));
        sessionStorage.setItem("chatSessionId", newChatSession.id);

        // Update the url from /chat to /chat/{id}
        const newUrl = `${window.location.href}/${newChatSession.id}`;
        window.history.pushState(null, '', newUrl)

        setWaitingForMessageFromAI(false);
        return newChatSession;
      }

      // Check if this chat session id is saved
      const chatSession = await getChatSessionFromServer(id);
      if (chatSession) {
        sessionStorage.setItem("chatSessionId", id);
        setUserChatSession(chatSession);
        setMessages(chatSession.messages);
        return chatSession;
      } else { // not saved
        // Check browser session in case user just reloaded the page
        const chatSessionId = sessionStorage.getItem("chatSessionId");
        if (chatSessionId != id) {
          // user has accessed an invalid id (/chat/{id})
          navigate("/");
          return;
        }

        const chatSession = await getChatSessionFromBrowserSession(id, user.email);
        if (!chatSession) {
          navigate("/");
          return;
        }

        sessionStorage.setItem("chatSessionId", chatSession.id);
        setUserChatSession(chatSession);
        setMessages(chatSession.messages);
        return chatSession;
      }

    } catch (error) {
      console.error(`Error fetching data: ${error}`);
    }
  };

  /*
  If there is not an existing UserChatSession stored on the server
  or in the browser, this is a totally new conversation.
*/
  const startNewChatSession = async (email: string): Promise<Session> => {
    const token = await getAccessTokenSilently();
    let localUserSettings = location.state?.userSettings as UserSettings;
    if (!localUserSettings) {
      localUserSettings = await userSettingsService.getUserSettings(email, token) as UserSettings;
    }

    // Get the initial user prompt to start the AI chat
    // TODO: The retrieved prompt should be conditional on stateValue
    const systemPrompt = Gpt4Prompt.getConversationPrompt(localUserSettings);

    // Creating local array to store messages since setMessages
    // updates async and the new state won't be available here
    // and store the initial prompt message
    let currentMessages: Message[];
    currentMessages = [];
    currentMessages.push({
      displayableText: systemPrompt,
      rawText: systemPrompt,
      isUser: true,
      timestamp: new Date(),
      isVisibleToUser: false
    });

    // Send the prompt to the AI
    const response = await openAiService.prompt(currentMessages, token);
    // TODO: Handle error/null
    if (response !== null) {
      const parsedJson = JSON.parse(response);
      const parsedMessage = new BotConversationMessage(
        parsedJson.botResponse,
        parsedJson.translatedBotResponse,
        parsedJson.options
      ).toChatString();

      // Push the AI prompt response into the message array
      currentMessages.push({
        displayableText: parsedMessage,
        rawText: response,
        isUser: false,
        timestamp: new Date()
      });

    }

    // Update the URL to reference a new session id.
    // e.g. from /chat to /chat/{newChatSessionId}
    // This keeps from creating a new session again
    // if the user refreshes the page.
    const newSession = {
      id: uuidv4(),
      sourceLanguage: localUserSettings.settings.sourceLanguage,
      targetLanguage: localUserSettings.settings.languageChoice,
      isSaved: false,
      messages: currentMessages
    };

    return newSession;
  }

  /*
    Retrieve the user chat session and associated messages from the server.
    If there is not a stored user chat session for the id, return undefined.
  */
  const getChatSessionFromServer = async (id: string): Promise<Session | undefined> => {
    const token = await getAccessTokenSilently();
    const userChatSession = await userChatSessionsService.getChatSessionById(id, token);
    if (userChatSession) {
      const messages = await getMessages(userChatSession.id, 500);
      const newSession = {
        id: userChatSession.id,
        sourceLanguage: userChatSession.sourceLanguage,
        targetLanguage: userChatSession.targetLanguage,
        isSaved: true,
        messages: messages,
      };
      return newSession;
    }
    return undefined;
  };

  /*
    If the user has refreshed their page during a chat session,
    and has not saved the chat session to the server, we will
    try to retrieve the messages from the browser session instead.
  */
  const getChatSessionFromBrowserSession = async (id: string, email: string): Promise<Session | undefined> => {
    // Assuming you have defined a Message interface as above
    const storedMessages = JSON.parse(sessionStorage.getItem('messages') || '[]').map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })) as Message[];

    // TODO: Handle this better. Shouldn't be possible to not have user settings.
    const token = await getAccessTokenSilently();
    const localUserSettings = await userSettingsService.getUserSettings(email, token) as UserSettings;
    if (!localUserSettings) {
      // TODO: This should probably throw an exception since it's an invalid state
      return undefined;
    }

    const newSession = {
      id: id,
      sourceLanguage: localUserSettings.settings.sourceLanguage,
      targetLanguage: localUserSettings.settings.languageChoice,
      isSaved: false,
      messages: storedMessages,
    };

    return newSession;
  }

  /*** Get message history for the chat session ***/
  const getMessages = async (chatSessionId: string, limit: number): Promise<Message[]> => {
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
      timestamp: message.timestamp
    }));

    return mappedMessages;
  };

  /*** Handle new messages submitted by the user through chat ***/
  const submitUserMessage = async (text: string, saveMessages: boolean) => {
    setWaitingForMessageFromAI(true);

    // Assuming you have defined a Message interface as above
    const storedMessages = JSON.parse(sessionStorage.getItem('messages') || '[]').map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })) as Message[];
    const userMessage: Message = {
      displayableText: text,
      rawText: text,
      isUser: true,
      timestamp: new Date()
    };

    // Store user's message
    if (saveMessages) {
      await putNewMessage(text, text, "user", userMessage.timestamp);
    }

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    storedMessages.push(userMessage);
    // messages.push(userMessage);

    const token = await getAccessTokenSilently();
    const fetchResponse = async () => {
      const response = await openAiService.prompt(messages, token);

      if (response !== null) {
        const parsedJson = JSON.parse(response);
        const parsedMessage = new BotConversationMessage(
          parsedJson.botResponse,
          parsedJson.translatedBotResponse,
          parsedJson.options
        ).toChatString();

        const aiMessage: Message = {
          displayableText: parsedMessage,
          rawText: response,
          isUser: false,
          timestamp: new Date()
        };

        // messages.push(aiMessage);
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        storedMessages.push(aiMessage);
        // Store AI response to user's message
        if (saveMessages) {
          await putNewMessage(parsedMessage, response, "bot", aiMessage.timestamp);
        }
      }

      sessionStorage.setItem('messages', JSON.stringify(storedMessages));

      setWaitingForMessageFromAI(false);
    };

    fetchResponse();
  };

  /*** Store the new chat session record in the database ***/
  async function saveChatSession(messages: Message[], email: string) {
    // The user and user.email objects must exist to create a chat session (or really do anything)
    const sessionId = sessionStorage.getItem("chatSessionId");

    if (!user || !user.email || !sessionId) {
      throw Error("Cannot create chat session because user email is not available.");
    }

    // Create UserChatMessage object. A chat session is only
    // created when a user sends the first message.
    // Create an array of UserChatMessage objects
    const userChatMessages: UserChatMessage[] = messages.map(message => ({
      id: uuidv4(),
      chatSessionId: sessionId,
      displayableText: message.displayableText,
      rawText: message.rawText,
      timestamp: message.timestamp,
      sender: message.isUser ? "user" : "bot",
      isVisibleToUser: message.isVisibleToUser,
    }));

    // Get the auth token to authorize the API call
    const token = await getAccessTokenSilently();
    let localUserSettings = location.state?.userSettings as UserSettings;
    if (!localUserSettings) {
      localUserSettings = await userSettingsService.getUserSettings(email, token) as UserSettings;
    }

    // Send the request to the server
    userChatSessionsService.saveChatSession(
      user.email,
      sessionId,
      localUserSettings.settings.sourceLanguage,
      localUserSettings.settings.languageChoice,
      userChatMessages,
      token
    );
  }

  /*** Store the last message in the database ***/
  async function putNewMessage(displayableText: string, rawText: string, sender: string, timestamp: Date, isVisibleToUser?: boolean) {
    // Get the chat session id from the browser session.
    // If it doesn't exist, we can't write the message.
    const chatSessionId = sessionStorage.getItem("chatSessionId");
    if (!chatSessionId) return;

    // Get auth access token so the request can be authorized
    const token = await getAccessTokenSilently();

    // Send the message
    userChatMessagesService.putNewMessage(displayableText, rawText, sender, chatSessionId, token, timestamp, isVisibleToUser);
  }

  return {
    messages,
    viewportHeight,
    waitingForMessageFromAI,
    userChatSession,
    startNewChatSession,
    saveChatSession,
    loadChatSession,
    handleTextSubmit: submitUserMessage,
    useWindowDimensions,
  };
}
