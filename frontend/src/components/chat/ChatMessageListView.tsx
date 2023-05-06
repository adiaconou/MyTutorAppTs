import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import ChatBubbleView from './ChatBubbleView';

interface ChatMessageListViewProps {
  messages: { text: string; isUser: boolean }[];
}

const ChatMessageListView: React.FC<ChatMessageListViewProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      {messages.map((message, index) => (
        <ChatBubbleView key={index} message={message} sx={{ marginBottom: "8px" }} />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatMessageListView;