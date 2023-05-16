import { Grid, Box, Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const REACT_APP_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Box>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Button onClick={() => loginWithRedirect({scope: 'openid profile email'})} variant="contained">
            Login with Google
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginButton;
