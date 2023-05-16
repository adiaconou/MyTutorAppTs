import Box from '@mui/material/Box';
import LoginButton from './LoginButton';

const LoginPageView = () => {

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

export default LoginPageView;