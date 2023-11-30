import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { keyframes } from '@emotion/react';

const typingIndicator = keyframes`
  0%, 80%, 100% {
    transform: scaleY(0.4);
  }
  40% {
    transform: scaleY(1);
  }
`;

const TypingIndicator = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '30px',
        color: '#fff', // Set the color of the parent Box component to white
      }}
    >
      <CircularProgress
        size={6}
        color="inherit" // Set the color prop to "inherit"
        sx={{
          animation: `${typingIndicator} 1.4s infinite`,
          animationDelay: '0s',
        }}
      />
      <CircularProgress
        size={6}
        color="inherit" // Set the color prop to "inherit"
        sx={{
          animation: `${typingIndicator} 1.4s infinite`,
          animationDelay: '0.2s',
        }}
      />
      <CircularProgress
        size={6}
        color="inherit" // Set the color prop to "inherit"
        sx={{
          animation: `${typingIndicator} 1.4s infinite`,
          animationDelay: '0.4s',
        }}
      />
    </Box>
  );
};

export default TypingIndicator;