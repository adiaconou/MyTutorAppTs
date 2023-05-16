import React, { useState } from "react";
import { UserChatSession } from "../../models/UserChatSession";
import { BackendService } from "../../services/BackendService";
import { useAuth0 } from "@auth0/auth0-react";

export default function NavigationMenuViewModel() {
  const { user } = useAuth0();
  const [historyExpanded, setHistoryExpanded] = React.useState(false);
  const [historyItems, setHistoryItems] = useState<UserChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state variable to track loading status

  const backend = new BackendService();

  const userName = user?.name;

  const toggleHistoryExpanded = () => {
    setHistoryExpanded(!historyExpanded);
  };

  // Function to get chat sessions
  const getChatSessions = async (limit: number, userId: string | null) => {
    if (userId !== undefined && userId !== null) {
      const sessions: UserChatSession[] = await backend.getChatSessions(userId, limit);
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