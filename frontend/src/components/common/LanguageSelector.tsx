import React, { useEffect, useState } from 'react';
import { Divider } from '@mui/material';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import config from '../../config';

interface LanguageSelectorProps {
  languageChoice?: string;
  handleLanguageChoiceChange: (event: SelectChangeEvent<string>) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ languageChoice, handleLanguageChoiceChange }) => {
  const languages = Object.keys(config.languages);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);

  const handleSelectionChange = (event: SelectChangeEvent<string>) => {
    setSelectedLanguage(event.target.value);
    handleLanguageChoiceChange(event);
  };

  useEffect(() => {
    if (languageChoice) {
      setSelectedLanguage(languageChoice);
    }
  }, [languageChoice]);

  return (
    <FormControl>
      <Select
        value={selectedLanguage || ''}
        labelId="language-select-label"
        onChange={handleSelectionChange}
        sx={{
          marginTop: '4px',
          width: '200px',
          height: '55px',
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: '290px',
            },
          },
        }}
      >
        {languages.map((language, index) => {
          return [
            <MenuItem key={language} value={language}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={config.languageToFlagIcon[config.languages[language]]}
                  alt=""
                  style={{
                    marginLeft: "5px",
                    marginRight: '20px',
                    width: '20px',
                    height: 'auto'
                  }}
                />
                {language}
              </Box>
            </MenuItem>,
            index < languages.length - 1 && <Divider key={`divider-${language}`} />
          ];
        })}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;