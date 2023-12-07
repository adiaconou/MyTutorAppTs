import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BeginChatView: React.FC = () => {
  const navigate = useNavigate();

  const redirectToChat = () => {
    navigate("/chat", { state: { value: 1 } });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "white",
        paddingTop: "16px",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "16px",
          boxShadow: "0px 0px 10px 0px blue",
          width: "70%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Choose Practice</Typography>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={redirectToChat}
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Conversation
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Vocabulary
            </Typography>
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "200px", boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.5)" }}
          >
            <Typography variant="button" style={{ textTransform: "none", fontSize: "14px" }}>
              Verb Conjugations
            </Typography>
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BeginChatView;
