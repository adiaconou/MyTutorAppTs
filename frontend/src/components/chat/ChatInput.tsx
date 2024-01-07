import TextField from "@mui/material/TextField";
import { InputAdornment, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTextFieldViewModel } from "./ChatInputViewModel";

const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: "white",
        },
        notchedOutline: {
          "&:hover": {
            borderColor: blue[500],
          },
          "&.Mui-focused": {
            borderColor: blue[500],
          },
          borderColor: blue[500],
        },
      },
    },
  },
});

interface ChatInputProps {
  onSubmit: (inputValue: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit, disabled
}) => {
  const {
    inputValue,
    handleInputChange,
    handleSubmit,
    handleKeyPress,
    handleBlur,
  } = useTextFieldViewModel({ onSubmit });

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      <Container maxWidth="md">
        <form onSubmit={handleSubmit}>
          <ThemeProvider theme={theme}>
            <TextField
              id="textField"
              variant="outlined"
              value={inputValue}
              label="Send a message..."
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={1}
              fullWidth
              autoFocus={true}
              onBlur={handleBlur}
              disabled={disabled}
              sx={{
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: blue[500],
                  },
              }}
              InputLabelProps={{
                style: {
                  fontFamily: "Noto Sans, monospace", // Set the font family
                  fontSize: "16px", // Set the font size
                },
              }}
              InputProps={{
                style: {
                  fontFamily: "Noto Sans, monospace", // Set the font family
                  fontSize: "16px", // Set the font size
                  textAlign: "left",
                  borderRadius: "25px",
                },

                endAdornment: (
                  <InputAdornment position="end"  style={{
                     pointerEvents: inputValue.trim().length === 0 || disabled ? 'none' : 'auto',
                     opacity: inputValue.trim().length === 0 || disabled ? 0.3 : 1, 
                  }}>
                    <Tooltip title="Send it!">
                      <SendIcon
                        sx={{
                          color: blue[500],
                          cursor: "pointer",
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        onClick={handleSubmit}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </ThemeProvider>
        </form>
      </Container>
    </Box>
  );
};

export default ChatInput;
