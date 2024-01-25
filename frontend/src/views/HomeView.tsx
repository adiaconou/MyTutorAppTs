import { Box, Container, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoginButton from '../auth/LoginButton';
import Loading from '../components/common/Loading';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserSettingsService } from '../services/UserSettingsService';
import { UserSettings } from '../models/UserSettings';

const HomeView = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const [isChecking, setIsChecking] = useState(true);
    const userSettingsService: UserSettingsService = new UserSettingsService();

    useEffect(() => {
        console.log("useEffect HomeView", { isAuthenticated, isLoading });
        const fetchData = async () => {
            if (!isLoading) {
                setIsChecking(false);
                if (isAuthenticated && user && user.email) {
                    // The UserSettings are passed as appState through the URI
                    // from the auth redirect as part of the setup flow for new users.
                    const queryParameters = new URLSearchParams(window.location.search);
                    const appStateJSON = queryParameters.get("appStateJSON");
                    if (appStateJSON) {
                        const userSettings: UserSettings = JSON.parse(appStateJSON);
                        userSettings.userId = user.email;
                        const token = await getAccessTokenSilently();
                        userSettingsService.updateUserSettings(userSettings, token);
                    }

                    navigate('/new');
                }
            }
        };

        fetchData();
    }, [isAuthenticated, isLoading]);

    if (isChecking || isLoading) {
        return <Loading />;
    }

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                gap={2}
            >
                <img src={process.env.PUBLIC_URL + '/MyTutor_logo_192.png'} alt="My Tutor Logo" />
                <h1>Welcome to My Tutor!</h1>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                            borderRadius: 50,
                            color: theme.palette.getContrastText(theme.palette.primary.main),
                            width: '250px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                        }}
                        onClick={() => navigate('/setup')}
                    >
                        Get Started
                    </Button>
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}                >
                    <Typography variant="caption">Already a user?</Typography>
                    <LoginButton
                        variant="outlined"
                        style={{
                            borderRadius: 50,
                            color: theme.palette.secondary.main,
                            borderColor: theme.palette.secondary.main,
                            width: '250px',
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Log in
                    </LoginButton>
                </Box>
            </Box>
        </Container>
    );
}

export default HomeView;