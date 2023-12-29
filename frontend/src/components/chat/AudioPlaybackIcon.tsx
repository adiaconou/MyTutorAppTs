import React, { useState } from 'react';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { LanguageTranslationService } from "../../services/LanguageTranslationService";
import { useAuth0 } from "@auth0/auth0-react";
import { SxProps, Theme } from '@mui/system';
import { Button, Divider, Popover, Typography } from '@mui/material';

interface AudioPlaybackIconProps {
    messageText: string;
    languageCode: string;
    activeColor?: string;
    inactiveColor?: string;
    sx?: SxProps<Theme>;
}

const AudioPlaybackIcon: React.FC<AudioPlaybackIconProps> = ({ messageText, languageCode, activeColor, inactiveColor, sx }) => {
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const { getAccessTokenSilently } = useAuth0();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const translationService = new LanguageTranslationService();

    const handleAudioClick = async (speed: number) => {
        setIsPlayingAudio(true);
        try {
            const token = await getAccessTokenSilently();
            const audio = await translationService.getTextToSpeech(messageText, languageCode, token);

            if (!audio) {
                return;
            }

            audio.onloadedmetadata = () => {
                audio.playbackRate = speed;
                audio.play();
            };

            audio.onended = () => {
                setIsPlayingAudio(false);
            };
        } catch (error) {
            console.error("Error playing audio", error);
            setIsPlayingAudio(false);
        }
    };

    const handlePopupSelection = (speed: number) => {
        setAnchorEl(null);
        handleAudioClick(speed);
    }

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        setAnchorEl(event.currentTarget as unknown as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'playback-speed-popover' : undefined;

    const iconColor = isPlayingAudio ? (inactiveColor || 'grey') : (activeColor || 'white');

    return (
        <>
            <VolumeUp
                aria-describedby={id}
                onClick={(event) => {
                    handleClick(event);
                }}

                sx={{
                    color: iconColor,
                    cursor: 'pointer',
                    ...sx
                }}
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div style={{ padding: '4px' }}>
                    <Typography variant="subtitle1" style={{ marginBottom: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: 'smaller' }}>
                        Speed
                    </Typography>
                    <Divider />
                    <Button variant="text" onClick={() => handlePopupSelection(1)} style={{ display: 'block', width: '100%', textTransform: 'none' }}>1x</Button>
                    <Divider />
                    <Button variant="text" onClick={() => handlePopupSelection(0.5)} style={{ display: 'block', width: '100%', textTransform: 'none' }}>0.5x</Button>
                </div>
            </Popover>
        </>
    );
};

export default AudioPlaybackIcon;
