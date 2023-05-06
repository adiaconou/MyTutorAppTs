import React, { useState } from "react";
import { UserChatSession } from "../../models/UserChatSession";
import { BackendService } from "../../services/BackendService";

export default function NavigationMenuViewModel() {
  const [historyExpanded, setHistoryExpanded] = React.useState(false);
  const [historyItems, setHistoryItems] = useState<UserChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state variable to track loading status

  const backend = new BackendService();

  const userName = "Alex Diaconou";

  const toggleHistoryExpanded = () => {
    setHistoryExpanded(!historyExpanded);
  };

  // Function to get chat sessions
  const getChatSessions = async (userId: string, limit: number) => {
    const sessions: UserChatSession[] = await backend.getChatSessions(
      userId,
      limit
    );
    setHistoryItems(sessions);
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
    userName
  };
}
