import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import ChatBubbleView from './ChatBubbleView';
import { Session } from '../../models/Session';

interface ChatMessageListViewProps {
  messages: { displayableText: string; rawText: string; isUser: boolean; isVisibleToUser?: boolean }[];
  waitingForMessageFromAI: boolean;
  chatSession: Session;
}

const ChatMessageListView: React.FC<ChatMessageListViewProps> = ({ messages, waitingForMessageFromAI, chatSession }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Filter out messages with isVisibleToUser set to false
  const visibleMessages = messages.filter((message) => message.isVisibleToUser !== false);

  return (
    <Box
      sx={{
        marginTop: "auto",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        width: "100%",
      }}
    >
      {visibleMessages.map((message, index) => (
        <ChatBubbleView key={index} message={message} chatSession={chatSession} sx={{ marginBottom: "8px" }} waitingForMessageFromAI={false} />
      ))}
      {waitingForMessageFromAI && (
        <ChatBubbleView
          key={messages.length}
          message={{ displayableText: '...', rawText: '', isUser: false }}
          sx={{ marginBottom: "8px" }}
          waitingForMessageFromAI={true}
          chatSession={chatSession}
        />
      )}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatMessageListView;