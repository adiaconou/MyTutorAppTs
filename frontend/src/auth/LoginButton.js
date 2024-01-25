import { Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ ...props }) => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/new",
      },
      scope: 'openid profile email',
    });
  };

  return (
    <Button onClick={handleLogin} {...props}>
      Login
    </Button>
  );
};

export default LoginButton;