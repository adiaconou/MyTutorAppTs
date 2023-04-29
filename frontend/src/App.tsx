import React from "react";
import "./App.css";
import MyChatForm from "./components/MyChatForm";
import MyAppBar from "./components/MyAppBar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Settings from "./nav/Settings";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}>
          <MyAppBar />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "center",
            bgcolor: "purple"
          }}
        >
          <Container maxWidth="md" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<MyChatForm />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/c/:id" element={<MyChatForm />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>  
  );
}

export default App;