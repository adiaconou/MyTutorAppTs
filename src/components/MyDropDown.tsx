import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Slider, Typography, Divider, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { blue } from '@mui/material/colors';

const customTheme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: blue[500],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: blue[500],
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: blue[500], // Set the color of the dropdown arrow
        },
        select: {
          color: 'lightgrey',
          fontSize: '13px', // Set the color of the selected item in the Select component
        },
      },
    },
  },
});

interface MyDropDownProps {
  languageChoice: string;
  handleLanguageChoiceChange: (event: SelectChangeEvent<string>) => void;
}

const MyDropDown: React.FC<MyDropDownProps> = ({ languageChoice, handleLanguageChoiceChange }) => {
  return (
    <ThemeProvider theme={customTheme}>
      <Select
        value={languageChoice} // Use languageChoice prop to set the value of Select
        onChange={handleLanguageChoiceChange} // Use handleLanguageChoiceChange prop to handle value changes
        sx={{
          marginTop: '10px',
          marginBottom: '10px',
          width: '150px',
          height: '40px',
          '& fieldset': {
            borderColor: blue[500],
          },
        }}
      >
        <MenuItem value="Greek">Greek</MenuItem>
        <MenuItem value="French">French</MenuItem>
        <MenuItem value="Spanish">Spanish</MenuItem>
      </Select>
    </ThemeProvider>
  );
};

export default MyDropDown;