import Box from '@mui/material/Box';
import LoginButton from '../auth/LoginButton';

const LoginView = () => {

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <LoginButton />
    </Box>
  );
};

export default LoginView;