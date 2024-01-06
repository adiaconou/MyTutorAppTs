import { Route, Routes } from "react-router-dom";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { AuthenticationGuard } from "./auth/authentication-guard";
import { useAuth0 } from "@auth0/auth0-react";
import LoginView from "./views/LoginView";
import ChatView from "./views/ChatView";
import SetupView from "./views/SetupView";
import SettingsView from "./views/SettingsView";
import NewSessionView from "./views/NewSessionView";
import CallbackPageView from "./auth/CallbackPageView";
import Loading from "./components/common/Loading";
import AppBarView from "./components/navigation/AppBarView";
import MainLayout from "./components/common/MainLayout";
import { LocaleProvider } from "./context/LocaleContext";

const App: React.FC = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box
        className="AppBarView_parent"
        sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}
      >
        <AppBarView />
        <Loading />
      </Box>);
  }

  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<AuthenticationGuard component={NewSessionView} />} />
        <Route path="/setup" element={<AuthenticationGuard component={SetupView} />} />
        <Route path="/chat" element={<MainLayout><AuthenticationGuard component={ChatView} /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><AuthenticationGuard component={SettingsView} /></MainLayout>} />
        <Route path="/chat/:id" element={<MainLayout><AuthenticationGuard component={ChatView} /></MainLayout>} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/callback" element={<CallbackPageView />} />
      </Routes>
    </LocaleProvider>
  );
};

export default App;