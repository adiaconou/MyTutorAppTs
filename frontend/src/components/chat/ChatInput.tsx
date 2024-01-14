import TextField from "@mui/material/TextField";
import { InputAdornment, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTextFieldViewModel } from "./ChatInputViewModel";

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
              onBlur={handleBlur}
              disabled={disabled}
              InputLabelProps={{
                style: {
                  fontFamily: "Noto Sans, monospace",
                  fontSize: "16px",
                },
              }}
              InputProps={{
                style: {
                  fontFamily: "Noto Sans, monospace",
                  fontSize: "16px",
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
        </form>
      </Container>
    </Box>
  );
};

export default ChatInput;
