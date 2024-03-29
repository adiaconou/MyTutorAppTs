import React, { useState } from "react";
import { UserChatSession } from "../../models/UserChatSession";
import { useAuth0 } from "@auth0/auth0-react";
import { UserChatSessionsService } from "../../services/UserChatSessionsService";

export default function NavigationMenuViewModel() {
  const { user } = useAuth0();
  const [historyExpanded, setHistoryExpanded] = React.useState(false);
  const [historyItems, setHistoryItems] = useState<UserChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state variable to track loading status

  const userChatSessionsService = new UserChatSessionsService();

  const userName = user?.name;

  const toggleHistoryExpanded = () => {
    setHistoryExpanded(!historyExpanded);
  };

  // Function to get chat sessions
  const getChatSessions = async (limit: number, userId: string | null, token: string) => {
    if (userId !== undefined && userId !== null) {
      const sessions: UserChatSession[] = await userChatSessionsService.getChatSessions(userId, limit, token);
      setHistoryItems(sessions);
    } else {
      console.log("Cannot get chat sessions because email address (userId) is not set");
      setHistoryItems([]);
    }

    setIsLoading(false);
  };

  // Function to handle the "New Chat" action
  const handleNewChat = () => {
    // Set sessionData to an empty string in sessionStorage
    sessionStorage.setItem("chatSessionId", "");
  };

  return {
    historyExpanded,
    historyItems,
    isLoading,
    getChatSessions,
    handleNewChat,
    toggleHistoryExpanded,
    userName,
  };
}