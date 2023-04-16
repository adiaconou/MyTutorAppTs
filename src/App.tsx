import React from "react";
import "./App.css";
import MyChatForm from "./components/MyChatForm";
import MyAppBar from "./components/MyAppBar";
import MyNavMenu from "./components/MyNavMenu";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { BrowserRouter, Route, Link, Outlet, Routes } from "react-router-dom";
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
        
        <MyAppBar
          sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}
      />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            paddingTop: "64px",
          }}
        >
          <Container maxWidth="md" sx={{ flexGrow: 1, paddingTop: "16px" }}>
            <Routes>
              <Route path="/" element={<MyChatForm />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;