import React, { useState, useCallback, useRef } from 'react';
import { Modal, Box, Typography, AppBar, Toolbar } from '@mui/material';
import RecordAudioButton from './RecordAudioButton';
import { OpenAIService } from '../../services/OpenAIService';
import { useAuth0 } from '@auth0/auth0-react';
import stringSimilarity from 'string-similarity';
import Waveform from './WaveForm';
import { grey } from '@mui/material/colors';

interface AudioModalProps {
    open: boolean;
    messageText: string;
    language: string;
    onClose: () => void;
}

const AudioModal: React.FC<AudioModalProps> = ({ open, messageText, language, onClose }) => {
    const [transcript, setTranscript] = useState('');
    const [similarityScore, setSimilarityScore] = useState<number | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const openaiService = new OpenAIService();

    // Use useRef to persist the references
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const { getAccessTokenSilently } = useAuth0();

    const stopRecording = useCallback(async () => {
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
                if (event.data.size > 0) {
                    const token = await getAccessTokenSilently();
                    const text = await openaiService.transcribe(event.data, token, language);
                    if (text) {
                        setTranscript(text);
                        const score = stringSimilarity.compareTwoStrings(messageText, text) * 100;
                        setSimilarityScore(score);
                    }
                }
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


    return (
        <Modal
            open={open}
            onClose={handleClose}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
            }}
        >
            <Box
                sx={{
                    width: '90vw', // Default width
                    maxWidth: '500px', // Adjust to your preference for larger screens
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 0,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '@media (max-width: 600px)': {
                        width: '90vw', // Smaller width for mobile devices
                    }
                }}
            >
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                            Speech Practice
                        </Typography>
                    </Toolbar>
                </AppBar>
                {messageText && (
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 2,
                            textAlign: 'left',
                            fontFamily: 'Noto Sans, monospace',
                            fontSize: '16px',
                            whiteSpace: 'pre-line',
                            marginLeft: 3,
                            marginRight: 3,
                        }}
                    >
                        {messageText}
                    </Typography>
                )}
                <Box sx={{
                    marginTop: 3,
                    width: '90%',
                }}>
                    <RecordAudioButton
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                    />
                </Box>
                <Waveform audioContext={audioContextRef.current} analyser={analyzerRef.current} />
                <Box sx={{
                    marginBottom: 3,
                    width: '90%',
                    textAlign: 'left',
                    display: 'flex'
                }}>
                    {transcript && (
                        <Typography variant="body1">{transcript}</Typography>
                    )}
                </Box>
                <AppBar position="static" sx={{ backgroundColor: grey[600], height: '40px' }}>
                    <Toolbar sx={{
                        justifyContent: 'center', // Center horizontally
                        alignItems: 'center', // Center vertically
                        height: '100%',
                        minHeight: '40px',
                    }}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            Score: {similarityScore !== null ? similarityScore.toFixed(0) : '--'}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
        </Modal>
    );
};

export default AudioModal;
