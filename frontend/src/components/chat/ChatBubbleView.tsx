import React from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { SxProps, Theme } from "@mui/system";
import SmartToy from "@mui/icons-material/SmartToy";

interface ChatBubbleViewProps {
  message: { text: string; isUser: boolean };
  sx?: SxProps<Theme>;
}

const ChatBubbleView: React.FC<ChatBubbleViewProps> = ({ message, sx }) => {
  const textColor = "#ffffff";

  return (
    <Box
      sx={{
        maxWidth: "90%",
        alignSelf: message.isUser ? "flex-start" : "flex-end",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: message.isUser ? "row" : "row-reverse",
          alignItems: "flex-end",
          gap: 1,
          paddingLeft: "8px",
          paddingRight: "8px",
        }}
      >
        {!message.isUser && (
          <SmartToy
            sx={{
              width: 24,
              height: 24,
              color: (theme) => theme.palette.grey[500],
            }}
          />
        )}
        <Paper
          elevation={3}
          sx={{
            padding: "8px 12px",
            borderRadius: "12px",
            backgroundColor: message.isUser
              ? (theme) => theme.palette.primary.main
              : (theme) => theme.palette.grey[800],
          }}
        >
          <Typography
            variant="body1"
            style={{
              fontFamily: "Noto Sans, monospace",
              fontSize: "13px",
              color: textColor,
            }}
          >
            {message.text}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatBubbleView;
