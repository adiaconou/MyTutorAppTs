import React, { useRef, useEffect } from 'react';
import List from '@mui/material/List';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

interface MyChatWindowProps {
  messages: { text: string; isUser: boolean }[];
}

const theme = createTheme({});

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  }
}

const MyChatWindow: React.FC<MyChatWindowProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const listItemStyle = {
    paddingTop: '10px',
    paddingBottom: '10px',
  };

  const textColor = '#ffffff';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ marginTop: 'auto' }}>
        <List
          id="chatBox"
          sx={{
            width: '100%',
            paddingTop: '4px',
          }}
        >
          {messages.map((message, index) => (
            <ListItem key={index} style={listItemStyle}>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    style={{
                      fontFamily: 'Noto Sans, monospace',
                      fontSize: '13px',
                      color: textColor,
                    }}
                  >
                    {message.text}
                  </Typography>
                }
                sx={{
                  textAlign: 'left',
                }}
              />
            </ListItem>
          ))}
          <div ref={bottomRef} />
        </List>
      </Box>
    </ThemeProvider>
  );
};

export default MyChatWindow;