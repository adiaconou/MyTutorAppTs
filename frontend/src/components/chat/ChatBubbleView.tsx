import React, { useState } from "react";
import { Typography, Popover } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { SxProps, Theme } from "@mui/system";
import SmartToy from "@mui/icons-material/SmartToy";
import TypingIndicator from "./TypingIndicatorView";
import TranslateIcon from "@mui/icons-material/Translate";
import { keyframes } from '@emotion/react';


interface ChatBubbleViewProps {
  message: { text: string; isUser: boolean; };
  sx?: SxProps<Theme>;
  waitingForMessageFromAI: boolean;
}

const ChatBubbleView: React.FC<ChatBubbleViewProps> = ({ message, sx, waitingForMessageFromAI }) => {
  const textColor = "#ffffff";

  const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleTranslateClick = (event: React.MouseEvent<SVGSVGElement>) => {
    //TODO: Implement call to openai to translate the text in quesiton and display in the popover
    setAnchorEl(event.currentTarget as unknown as HTMLElement);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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
            borderRadius: message.isUser ? "12px 12px 12px 12px" : "12px 12px 0px 12px",
            backgroundColor: message.isUser
              ? (theme) => theme.palette.primary.main
              : (theme) => theme.palette.grey[800],
          }}
        >
          {waitingForMessageFromAI && !message.isUser ? (
            <TypingIndicator /> // Render TypingIndicator when waitingForMessageFromAI is true and message is not from the user
          ) : (
            <Typography
              variant="body1"
              style={{
                fontFamily: "Noto Sans, monospace",
                fontSize: "13px",
                color: textColor,
                whiteSpace: 'pre-line' // This will make CSS handle newlines as they are
              }}
            >
              {message.text}
            </Typography>)}
          {!message.isUser && !waitingForMessageFromAI && ( // Only render for bot messages
            <>
              <div style={{ height: '10px' }} />  {/* New line for spacing */}
              <TranslateIcon
                aria-describedby={id}
                onClick={handleTranslateClick}
                sx={{
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '1rem',
                  alignSelf: 'flex-start',
                  marginTop: 0.5,
                  animation: `${pulse} 2s infinite`, // Apply the pulse animation here
                }}
              />
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <Typography sx={{ p: 2 }}>Translated!</Typography>
              </Popover>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatBubbleView;
