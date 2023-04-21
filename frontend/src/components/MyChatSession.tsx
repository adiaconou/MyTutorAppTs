import React from "react";

interface ChatSessionProps {
  sessionId: string;
}

const ChatSession: React.FC<ChatSessionProps> = ({ sessionId }) => {
  return (
    <div>
      <h1>Chat Session: {sessionId}</h1>
      {/* Add your chat session-related components and logic here */}
    </div>
  );
};

export default ChatSession;