import { Grid, Box, Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/",
      }, 
      scope: 'openid profile email',
    });
  }

  return (
    <Box>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Button onClick={handleLogin} variant="contained">
            Login
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginButton;
