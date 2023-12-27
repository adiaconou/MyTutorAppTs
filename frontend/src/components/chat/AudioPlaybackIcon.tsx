import React, { useState } from 'react';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { LanguageTranslationService } from "../../services/LanguageTranslationService";
import { useAuth0 } from "@auth0/auth0-react";
import { SxProps, Theme } from '@mui/system';

interface AudioPlaybackIconProps {
    messageText: string;
    languageCode: string;
    sx?: SxProps<Theme>;
}

const AudioPlaybackIcon: React.FC<AudioPlaybackIconProps> = ({ messageText, languageCode, sx }) => {
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const { getAccessTokenSilently } = useAuth0();
    const translationService = new LanguageTranslationService();

    const handleAudioClick = async () => {
        setIsPlayingAudio(true);
        try {
            const token = await getAccessTokenSilently();
            const audio = await translationService.getTextToSpeech(messageText, languageCode, token);

            if (!audio) {
                return;
            }

            audio.play();

            audio.onended = () => {
                setIsPlayingAudio(false);
            };
        } catch (error) {
            console.error("Error playing audio", error);
            setIsPlayingAudio(false);
        }
    };

    return (
        <VolumeUp
            onClick={() => {
                if (!isPlayingAudio) {
                    handleAudioClick();
                }
            }}
            sx={{
                cursor: isPlayingAudio ? 'default' : 'pointer',
                color: isPlayingAudio ? 'grey' : 'white',
                ...sx
            }}
        />
    );
};

export default AudioPlaybackIcon;
