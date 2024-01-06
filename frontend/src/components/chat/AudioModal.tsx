import React, { useState, useCallback, useRef } from 'react';
import { Modal, Box, Typography, AppBar, Toolbar, Card, CircularProgress } from '@mui/material';
import RecordAudioButton from './RecordAudioButton';
import { OpenAIService } from '../../services/OpenAIService';
import { useAuth0 } from '@auth0/auth0-react';
import stringSimilarity from 'string-similarity';
import Waveform from './WaveForm';
import { blue, grey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import AudioPlaybackIcon from './AudioPlaybackIcon';

interface AudioModalProps {
    open: boolean;
    messageText: string;
    languageCode: string;
    onClose: () => void;
}

const AudioModal: React.FC<AudioModalProps> = ({ open, messageText, languageCode, onClose }) => {
    const theme = useTheme();

    const [transcript, setTranscript] = useState('');
    const [similarityScore, setSimilarityScore] = useState<number | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isLoading, setIsLoading] = useState(false); // New state for tracking loading status
    const [isRecording, setIsRecording] = useState(false); // State to track recording status

    // Use useRef to persist the references
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const { getAccessTokenSilently } = useAuth0();

    const openaiService = new OpenAIService();

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        mediaRecorder?.stop();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Close the audio context and reset variables
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
            });
        }

        analyzerRef.current = null;
        microphoneRef.current = null;
    }, []);

    const startRecording = useCallback(async () => {
        // Zero out old values
        setTranscript('');
        setSimilarityScore(null);
        setIsRecording(true);

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyzerRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
            microphoneRef.current.connect(analyzerRef.current);
            analyzerRef.current.fftSize = 256;

            // Record the audio
            const options = { mimeType: 'audio/webm' };
            const newMediaRecorder = new MediaRecorder(streamRef.current, options);
            setMediaRecorder(newMediaRecorder);
            newMediaRecorder.start();

            // Event handler fired when recording stops
            newMediaRecorder.ondataavailable = async (event) => {
                setIsLoading(true);
                if (event.data.size > 0) {
                    const token = await getAccessTokenSilently();
                    const text = await openaiService.transcribe(event.data, token, languageCode);
                    if (text) {
                        setTranscript(text);
                        const score = stringSimilarity.compareTwoStrings(messageText, text) * 100;
                        setSimilarityScore(score);
                    }
                }
                setIsLoading(false);
            };
        } catch (error) {
            console.error('Error accessing the microphone:', error);
        }
    }, [transcript, similarityScore]);

    const handleClose = useCallback(() => {
        stopRecording();
        onClose();
        setTranscript('');
        setSimilarityScore(null);
    }, [onClose, stopRecording]);

    const getBorderColor = (score: number | null) => {
        if (score === null) return theme.palette.divider;
        if (score > 89) return theme.palette.success.main; // Green for scores above 89
        if (score >= 80) return theme.palette.warning.main; // Yellow for scores between 80 and 89
        return theme.palette.error.main; // Red for scores below 80
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '90vw',
                    maxWidth: '500px',
                    bgcolor: theme.palette.primary.light,
                    opacity: 1.0,
                    p: 0,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '@media (max-width: 600px)': {
                        width: '90vw',
                    },
                    outline: 'none', // Remove focus outline
                }}
                // Adding tabIndex={-1} makes the element focusable but not tabbable
                tabIndex={-1}
            >
                <AppBar position="static">
                    <Toolbar sx={{ bgcolor: theme.palette.info.dark }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                            Speech Practice
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Card sx={{
                    display: 'flex',
                    bgcolor: theme.palette.action.selected,
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 2,
                    marginBottom: 2,
                    boxShadow: 3,
                    width: '90%',
                    boxSizing: 'border-box',
                }}>
                    <AppBar position="static" sx={{ backgroundColor: theme.palette.grey[700], width: '100%', height: '23px', mb: 2 }}>
                        <Toolbar sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            minHeight: '23px',
                        }}>
                            <Typography sx={{ fontSize: '13px', textAlign: 'center' }}>
                                Read Message
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {messageText && (
                        <Box sx={{ width: '100%', textAlign: 'left', padding: '0 16px' }}> {/* Adjust padding as needed */}
                            <Typography
                                sx={{
                                    mb: 1,
                                    color: theme.palette.primary.contrastText,
                                    fontFamily: 'Noto Sans, monospace',
                                    fontSize: '16px',
                                    whiteSpace: 'pre-line',
                                    marginLeft: 3,
                                }}
                            >
                                {messageText}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', mb: 1 }}>
                        <RecordAudioButton
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            sx={{ mb: 1, fontSize: '2.5rem' }}
                        />
                        <AudioPlaybackIcon messageText={messageText} languageCode={languageCode} activeColor={blue[500]} inactiveColor={grey[300]} sx={{ fontSize: '1.5rem' }} />
                    </Box>
                    {isRecording && (
                        <Waveform audioContext={audioContextRef.current} analyser={analyzerRef.current} />
                    )}
                </Card>
                <Card sx={{
                    display: 'flex',
                    bgcolor: theme.palette.action.selected,
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 2,
                    boxShadow: 3,
                    width: '90%',
                    boxSizing: 'border-box',
                }}>
                    <AppBar
                        position="static"
                        sx={{
                            backgroundColor: theme.palette.grey[700],
                            width: '100%',
                            height: '23px',
                            mb: 2
                        }}
                    >
                        <Toolbar sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            minHeight: '23px',
                        }}>
                            <Typography sx={{ fontSize: '13px', textAlign: 'center' }}>
                                Transcribed Speech
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {isLoading ? (
                        <CircularProgress sx={{ mt: 2 }} />
                    ) : transcript && (
                        <Box sx={{ width: '100%', textAlign: 'left', padding: '0 16px' }}>
                            <Typography
                                sx={{
                                    mb: 1,
                                    color: theme.palette.primary.contrastText,
                                    fontFamily: 'Noto Sans, monospace',
                                    fontSize: '16px',
                                    whiteSpace: 'pre-line',
                                    marginLeft: 3,
                                }}
                            >
                                {transcript}
                            </Typography>
                        </Box>
                    )}
                    <Box
                        sx={{
                            padding: 1,
                            width: '95%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <AppBar
                            position="static"
                            sx={{
                                backgroundColor: getBorderColor(similarityScore),
                                width: '40%',
                                height: '30px'
                            }}
                        >
                            <Toolbar sx={{
                                justifyContent: 'center', // Center horizontally
                                alignItems: 'center', // Center vertically
                                height: '100%',
                                minHeight: '30px',
                            }}>
                                <Typography sx={{ fontSize: '16px', textAlign: 'center', color: theme.palette.primary.contrastText }}>
                                    Score: {similarityScore !== null ? similarityScore.toFixed(0) : '--'}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};

export default AudioModal;
