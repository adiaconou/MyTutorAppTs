import React, { useState, useEffect } from 'react';
import { SxProps, Theme } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface RecordAudioButtonProps {
    onStartRecording: () => void;
    onStopRecording: () => void;
    sx?: SxProps<Theme>;
    
}

const RecordAudioButton: React.FC<RecordAudioButtonProps> = ({ onStartRecording, onStopRecording, sx }) => {
    const [isRecording, setIsRecording] = useState(false);

    const handleRecordingToggle = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            onStartRecording();
        } else {
            onStopRecording();
        }
    };

    useEffect(() => {
        // Cleanup to stop recording when the component is unmounted
        return () => {
            if (isRecording) {
                onStopRecording();
            }
        };
    }, [isRecording, onStopRecording]);

    return (
        <>
            {isRecording ? (
                <MicIcon 
                    onClick={handleRecordingToggle} 
                    sx={{ color: '#ff1744', cursor: 'pointer', ...sx }}
                />
            ) : (
                <MicOffIcon
                    onClick={handleRecordingToggle} 
                    sx={{ color: '#9e9e9e', '&:hover': { color: '#bdbdbd' }, cursor: 'pointer', ...sx }}
                />
            )}
        </>
    );
};

export default RecordAudioButton;
