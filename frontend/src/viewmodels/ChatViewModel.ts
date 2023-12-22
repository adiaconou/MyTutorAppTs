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
import { UserChatSession } from "../models/UserChatSession";
import { UserSettingsService } from "../services/UserSettingsService";

export default function ChatViewModel() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const { height: viewportHeight } = useWindowDimensions();
  const { id } = useParams<{ id: string }>();
  const [waitingForMessageFromAI, setWaitingForMessageFromAI] = useState(false);
  const [userChatSession, setUserChatSession] = useState<Session>();
  const userChatMessagesService = new UserChatMessagesService();
  const userChatSessionsService = new UserChatSessionsService();
  const userSettingsService = new UserSettingsService();

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

  /*** Clear chat messages and session data from the chat component ***/
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.setItem("chatSessionId", "");
  };

  const getChatSessionFromServer = async (id: string): Promise<Session | undefined> => {
    // If the user is loading a previous chat session, we must
    // retrieve the chat session object to get the source and
    // target language since languages can change across sessions.
    const token = await getAccessTokenSilently();
    const userChatSession = await userChatSessionsService.getChatSessionById(id, token);
    if (userChatSession) {
      console.log("Get chat session from server");
      const newSession = {
        sourceLanguage: userChatSession.sourceLanguage,
        targetLanguage: userChatSession.targetLanguage,
        isSaved: true
      };
      getMessages(id, 500);
      return newSession;
    }
  };

  /*
  const getChatSessionFromBrowserSession = async (id: string): Promise<Session | undefined> => {
    if (!user?.email) {
      navigate("/login");
      return;
    }

    // The id in the URL param needs to match the id stored in session
    const chatSessionId = sessionStorage.getItem("chatSessionId");
    if (chatSessionId != id) {
      navigate("/");
      return;
    }

    // Assuming you have defined a Message interface as above
    const storedMessages = JSON.parse(sessionStorage.getItem('messages') || '[]').map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })) as Message[];

    console.log("Getting messages from session", { storedMessages });

    // Redirect from NewSession creation will include user settings in the state
    let userSettings = location.state?.userSettings as UserSettings;

    const token = await getAccessTokenSilently();

    if (!userSettings) {
      userSettings = await userSettingsService.getUserSettings(user.email, token) as UserSettings;
    }

    const newSession = {
      sourceLanguage: userSettings.settings.sourceLanguage,
      targetLanguage: userSettings.settings.languageChoice,
      isSaved: false
    };
    setUserChatSession(newSession);
    setMessages(storedMessages);
    return undefined;
  }
*/
  const startChatSession = async () => {
    if (!user?.email) {
      navigate("/login");
      return;
    }

    // There is an id in the URL params (/chat/{id})
    // Get the UserChatSession from the DB if it exists
    let chatSession: Session | undefined;
    let chatSessionId: string | null;
    if (id) {
      chatSession = await getChatSessionFromServer(id); // get the id if it's in URL params /chat/{id}
    } else if (location.state != null) {
      chatSessionId = sessionStorage.getItem("chatSessionId"); // check if Id is
    }


    // Can navigate to /chat through starting a new session,
    // which passes a location.state value
    // accessing chat history, in which case id is available.
    // Going directly to /chat in browswer should redirect.
    if (!id && !location.state) {
      navigate("/");
      return;
    }
  };

  /*** When the component loads, we check if there is a chat session id
   * in the session data. If it exists, we will load the chat history
   * for that chat session. If it doesn't exist, we will clear the messages
   * from the chat form because it should be a fresh chat session.
   ***/
  const loadChatSession = async (userSettings: UserSettings, token: string): Promise<Session | undefined> => {
    clearMessages();

    try {
      if (id) { // If id exists, it is not a new chat session so retrieve messages from the server
        const chatSession = await getChatSessionFromServer(id);

        if (chatSession) {
          sessionStorage.setItem("chatSessionId", id);
          setUserChatSession(chatSession);
          return chatSession;
        } else {
          // TODO: Add check to ensure the ID from the URL param is in the browser session
          
          // Assuming you have defined a Message interface as above
          const storedMessages = JSON.parse(sessionStorage.getItem('messages') || '[]').map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })) as Message[];
          console.log("Getting messages from session", { storedMessages });
          const newSession = {
            sourceLanguage: userSettings.settings.sourceLanguage,
            targetLanguage: userSettings.settings.languageChoice,
            isSaved: false
          };
          setUserChatSession(newSession);
          setMessages(storedMessages);
          return newSession;
        }
      } else { // Start a new chat session
        console.log("new session");
        const newSession = {
          sourceLanguage: userSettings.settings.sourceLanguage,
          targetLanguage: userSettings.settings.languageChoice,
          isSaved: false
        };

        setUserChatSession(newSession);
        setWaitingForMessageFromAI(true);
        sessionStorage.setItem("chatSessionId", "");

        // Get the initial user prompt to start the AI chat
        // TODO: The retrieved prompt should be conditional on stateValue
        const systemPrompt = Gpt4Prompt.getConversationPrompt(userSettings);

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

        // Update the URL to reference a new session id.
        // e.g. from /chat to /chat/{newChatSessionId}
        // This keeps from creating a new session again
        // if the user refreshes the page.
        let newChatSessionId = uuidv4();
        const newUrl = `${window.location.href}/${newChatSessionId}`;
        window.history.pushState(null, '', newUrl)
        sessionStorage.setItem("chatSessionId", newChatSessionId);

        // Send the prompt to the AI
        const response = await openAiService.prompt(currentMessages, token);
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

          setMessages(currentMessages);
          console.log("Storing messages in session");
          sessionStorage.setItem('messages', JSON.stringify(currentMessages));
        }
        setWaitingForMessageFromAI(false);
        return newSession;
      }
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
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
      timestamp: message.timestamp
    }));

    console.log("Mapped messages", { mappedMessages });
    setMessages(mappedMessages);
  };

  /*** Handle new messages submitted by the user through chat ***/
  const submitUserMessage = async (text: string, userSettings: UserSettings, saveMessages: boolean) => {
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

      console.log("SETTINGGGG MESSAGESSS", { storedMessages });
      sessionStorage.setItem('messages', JSON.stringify(storedMessages));

      setWaitingForMessageFromAI(false);
    };

    fetchResponse();
  };

  /*** Store the new chat session record in the database ***/
  async function saveChatSession(messages: Message[], userSettings: UserSettings) {
    // The user and user.email objects must exist to create a chat session (or really do anything)
    const sessionId = sessionStorage.getItem("chatSessionId");

    console.log("1", { sessionId, messages });
    if (!user || !user.email || !sessionId) {
      throw Error("Cannot create chat session because user email is not available.");
    }
    console.log("2");
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

    console.log("3");
    // Get the auth token to authorize the API call
    const token = await getAccessTokenSilently();

    console.log("Saving messages...", { userChatMessages });

    // Send the request to the server
    userChatSessionsService.saveChatSession(
      user.email,
      sessionId,
      userSettings.settings.sourceLanguage,
      userSettings.settings.languageChoice,
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
    id,
    waitingForMessageFromAI,
    userChatSession,
    loadChatSession,
    saveChatSession,
    handleTextSubmit: submitUserMessage,
    useWindowDimensions,
  };
}
