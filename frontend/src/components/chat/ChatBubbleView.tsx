import React, { useState } from "react";
import { Typography, Popover } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { SxProps, Theme } from "@mui/system";
import SmartToy from "@mui/icons-material/SmartToy";
import TypingIndicator from "./TypingIndicatorView";
import TranslateIcon from "@mui/icons-material/Translate";
import { keyframes } from '@emotion/react';
import { LanguageTranslationService } from "../../services/LanguageTranslationService";
import { useAuth0 } from "@auth0/auth0-react";
import VolumeUp from '@mui/icons-material/VolumeUp';

interface ChatBubbleViewProps {
  message: { displayableText: string; rawText: string; isUser: boolean; };
  sx?: SxProps<Theme>;
  waitingForMessageFromAI: boolean;
}

const ChatBubbleView: React.FC<ChatBubbleViewProps> = ({ message, sx, waitingForMessageFromAI }) => {
  const textColor = "#ffffff";
  const translationService = new LanguageTranslationService(); // Initialize the translation service
  const { getAccessTokenSilently } = useAuth0();
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
  const [translation, setTranslation] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // TODO: Move this into view model. Got it working for now though.
  const handleTranslateClick = async (event: React.MouseEvent<SVGSVGElement>) => {
    setIsTranslating(true);

    let currentTarget = event.currentTarget;

    try {
      const token = await getAccessTokenSilently();

      // TODO: Translating ain't cheap. Cache translated strings
      const translatedText = await translationService.translate(
        message.displayableText,
        "en", //TODO: pass in the language from user settings
        token
      );
      setTranslation(translatedText);
      setAnchorEl(currentTarget as unknown as HTMLElement);
      setIsTranslating(false);

    } catch (error) {
      setTranslation("Translation error");
    } finally {

    }
  };

  const handleAudioClick = async () => {
    setIsPlayingAudio(true);
    try {
      const token = await getAccessTokenSilently();
      const audioUrl = await translationService.getTextToSpeech(message.displayableText, token);

      // TODO: Handle this better
      if (!audioUrl) {
        return;
      }

      // Play the audio
      const audio = new Audio("https://storage.cloud.google.com/" + audioUrl);
      console.log("Getting audio from " + "https://storage.cloud.google.com/" + audioUrl);
      audio.play();

      // When the audio finishes playing, set isPlayingAudio to false
      audio.onended = () => {
        setIsPlayingAudio(false);
      };
    } catch (error) {
      console.error("Error playing audio", error);
      setIsPlayingAudio(false);
    } 
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
              {message.displayableText}
            </Typography>)}
          {!message.isUser && !waitingForMessageFromAI && ( // Only render for bot messages
            <>
              <div style={{ height: '10px' }} />  {/* New line for spacing */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'left', // Center the icons
                  alignItems: 'center'
                }}
              >

                <TranslateIcon
                  aria-describedby={id}
                  onClick={(event) => {
                    if (!isTranslating) {
                      handleTranslateClick(event);
                    }
                  }}
                  sx={{
                    cursor: isTranslating ? 'default' : 'pointer',
                    color: isTranslating ? 'grey' : 'white',
                    fontSize: '1rem',
                    alignSelf: 'center',
                    animation: `${pulse} 2s infinite`, // Apply the pulse animation here
                  }}
                />

                <VolumeUp
                  onClick={() => {
                    if (!isPlayingAudio) {
                      handleAudioClick();
                    }
                  }}
                  sx={{
                    cursor: isPlayingAudio ? 'default' : 'pointer',
                    color: isPlayingAudio ? 'grey' : 'white',
                    fontSize: '1rem',
                    alignSelf: 'center',
                    marginLeft: 1, // Add some space between the icons
                  }}
                />

              </Box>
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
                {translation ? (
                  <Typography sx={{ p: 2 }}>{translation}</Typography>
                ) : (
                  <Typography sx={{ p: 2 }}>Translation loading...</Typography>
                )}
              </Popover>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatBubbleView;
