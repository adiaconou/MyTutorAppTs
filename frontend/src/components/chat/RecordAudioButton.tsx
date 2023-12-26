import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';

interface RecordAudioButtonProps {
    onStartRecording: () => void;
    onStopRecording: () => void;
}

const RecordAudioButton: React.FC<RecordAudioButtonProps> = ({ onStartRecording, onStopRecording }) => {
    const [isRecording, setIsRecording] = useState(false);

    const handleRecordingToggle = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            onStartRecording();
        } else {
            onStopRecording();
        }
    };

    const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
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
        <IconButton
            onContextMenu={handleContextMenu}
            onClick={handleRecordingToggle}
            sx={{
                backgroundColor: isRecording ? '#ff1744' : '#9e9e9e',
                '&:hover': {
                    backgroundColor: isRecording ? '#ff4569' : '#bdbdbd',
                },
                color: '#fff',
                width: '70px',
                height: '70px',
            }}
        >
            {isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
        </IconButton>
    );
};

export default RecordAudioButton;
