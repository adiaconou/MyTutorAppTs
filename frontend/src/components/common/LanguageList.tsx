import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, List, ListItem, Card, Input } from '@mui/material';
import config from '../../config';

interface LanguageListProps {
  handleLanguageChoiceChange: (selectedLanguage: string) => void;
}

const LanguageList: React.FC<LanguageListProps> = ({ handleLanguageChoiceChange }) => {
  const languages = Object.keys(config.languages);
  const [searchTerm, setSearchTerm] = useState('');
  const intl = useIntl();

  const handleSelectionChange = (selectedLanguage: string) => {
    handleLanguageChoiceChange(selectedLanguage);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flexGrow: 1,
        overflow: 'auto',
        maxWidth: '600px'
      }}>
      <Input
        placeholder={intl.formatMessage({ id: "SetupView.search", defaultMessage: "Search..." })}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: '10px', fontSize: '13px', width: '70%' }}
      />
      <List
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'auto',
          mb: 3,
        }}
      >
        {languages.filter(language => language.toLowerCase().includes(searchTerm.toLowerCase())).map((language) => {
          return (
            <ListItem
              key={language}
              onClick={() => handleSelectionChange(language)}
              sx={{ p: "3px" }}
            >
              <Card
                sx={{
                  height: "50px",
                  display: 'flex',
                  alignItems: 'center',
                  width: "100%"
                }}
              >
                <img
                  src={config.languageToFlagIcon[config.languages[language]]}
                  alt={`${language} flag`}
                  style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                    width: '20px',
                    height: 'auto'
                  }}
                />
                {intl.formatMessage({ id: `language.${language.toLowerCase()}` })}
              </Card>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default LanguageList;