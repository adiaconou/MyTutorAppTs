import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Box, Stepper, Step, StepLabel, Typography, Button } from "@mui/material";
import { UserSettings } from "../models/UserSettings";
import { useLocale } from "../context/LocaleContext";
import LanguageList from "../components/common/LanguageList";
import "../components/common/step-transition.css";
import config from "../config";
import { UserSettingsService } from "../services/UserSettingsService";

const SetupView: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
    const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [languageProficiency, setLanguageProficiency] = useState<string | null>("BEGINNER");
    const [transitionDirection, setTransitionDirection] = useState('forward');

    const { user, getAccessTokenSilently, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();
    const intl = useIntl();
    const { setLocale } = useLocale();

    const userSettingsService: UserSettingsService = new UserSettingsService();

    function handleSkillLevelSelection(value: string): void {
        setLanguageProficiency(value.toUpperCase());
        submitSettings();
    }

    const handleSourceLanguageSelection = (selectedLanguage: string) => {
        // This will localize all the strings in the app based on users spoken language
        setLocale(config.languages[selectedLanguage]);

        setSourceLanguage(selectedLanguage);
        setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, 2));
    }

    const handleTargetLanguageSelection = (selectedLanguage: string) => {
        setTargetLanguage(selectedLanguage);
        setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, 2));
    }

    async function submitSettings() {
        setSavingSettings(true);

        if (!sourceLanguage || !targetLanguage || !languageProficiency) {
            navigate('/setup');
            return;
        }

        let skillLevel: number;
        if (languageProficiency === 'BEGINNER') {
            skillLevel = 1;
        } else if (languageProficiency === 'INTERMEDIATE') {
            skillLevel = 2;
        } else {
            skillLevel = 3;
        }

        if (!user || !user.email) { // New user (not logged in) executed setup flow
            const userSettings: UserSettings = {
                userId: '', // user doesn't exist yet, will be set after redirect on login
                settings: {
                    sourceLanguage: sourceLanguage,
                    languageChoice: targetLanguage,
                    languageProficiency: skillLevel
                }
            };

            // Convert userSettings to JSON to be put in the URL params
            const appStateJSON = encodeURIComponent(JSON.stringify(userSettings));

            await loginWithRedirect({
                authorizationParams: {
                    screen_hint: "signup",
                },
                appState: {
                    appStateJSON,
                    returnTo: "/new",
                },
            });
        } else { // User running setup flow while already logged in
            const userSettings: UserSettings = {
                userId: user.email,
                settings: {
                    sourceLanguage: sourceLanguage,
                    languageChoice: targetLanguage,
                    languageProficiency: skillLevel
                }
            };

            const token = await getAccessTokenSilently();
            userSettingsService.updateUserSettings(userSettings, token);
            window.location.href = "/new";
        }
        
        setSavingSettings(false);
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Box
                            className="step-0-outer-box"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "80%",
                                flexGrow: 1,
                                overflow: "auto",
                            }}
                        >
                            <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 'bold' }}>
                                <FormattedMessage id="SetupView.speakLanguage" />
                            </Typography>
                            <LanguageList
                                handleLanguageChoiceChange={handleSourceLanguageSelection}
                            />
                        </Box>
                    </>
                );
            case 1:
                return (
                    <>
                        <Box
                            className="step-0-outer-box"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "80%",
                                flexGrow: 1,
                                overflow: "auto",
                            }}
                        >
                            <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 'bold' }}>
                                <FormattedMessage id="SetupView.learnLanguage" />
                            </Typography>
                            <LanguageList
                                handleLanguageChoiceChange={handleTargetLanguageSelection}
                            />
                        </Box>
                    </>
                );
            case 2:
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            width: '80%'
                        }}
                    >
                        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 'bold' }}>
                            <FormattedMessage id="SetupView.skillLevel" values={{
                                language: intl.formatMessage({ id: `language.${targetLanguage?.toLowerCase()}` }),
                            }} />
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => handleSkillLevelSelection('Beginner')}
                            sx={{
                                width: "200px",
                                mb: 1
                            }}
                        >
                            <FormattedMessage id="SetupView.beginner" />
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleSkillLevelSelection('Intermediate')}
                            sx={{
                                width: "200px",
                                mb: 1,
                            }}
                        >
                            <FormattedMessage id="SetupView.intermediate" />
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleSkillLevelSelection('Advanced')}
                            sx={{
                                width: "200px",
                                mb: 1
                            }}
                        >
                            <FormattedMessage id="SetupView.advanced" />
                        </Button>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: window.innerHeight,
                alignItems: "center",
                width: "100%",
            }}
        >
            <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                    mt: 2,
                    mb: 4,
                    width: '90vw',
                    maxWidth: '600px',
                    height: '35px'
                }}
            >
                <Step>
                    <StepLabel>
                        {sourceLanguage && activeStep > 0 && (
                            <img
                                src={config.languageToFlagIcon[config.languages[sourceLanguage]]}
                                alt={`${sourceLanguage} flag`}
                                style={{
                                    marginLeft: '20px',
                                    marginRight: '20px',
                                    width: '20px',
                                    height: 'auto'
                                }}
                            />
                        )}
                    </StepLabel>
                </Step>
                <Step>
                    <StepLabel>
                        {targetLanguage && activeStep > 0 && (
                            <img
                                src={config.languageToFlagIcon[config.languages[targetLanguage]]}
                                alt={`${targetLanguage} flag`}
                                style={{
                                    marginLeft: '20px',
                                    marginRight: '20px',
                                    width: '20px',
                                    height: 'auto'
                                }}
                            />
                        )}
                    </StepLabel>
                </Step>
                <Step><StepLabel></StepLabel></Step>
            </Stepper>
            <Box sx={{ position: 'relative', flexGrow: 1, width: '100%' }}>
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={activeStep}
                        classNames={`step-transition-${transitionDirection}`}
                        timeout={300}
                    >
                        <Box
                            className="transition-group-innter-box"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            {renderStepContent(activeStep)}
                        </Box>
                    </CSSTransition>
                </TransitionGroup>
            </Box>
        </Box>
    );
};

export default SetupView;
