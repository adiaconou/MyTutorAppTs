import { Route, Routes } from "react-router-dom";
import React from "react";
import { AuthenticationGuard } from "./auth/authentication-guard";
import LoginView from "./views/LoginView";
import ChatView from "./views/ChatView";
import SetupView from "./views/SetupView";
import SettingsView from "./views/SettingsView";
import NewSessionView from "./views/NewSessionView";
import CallbackPageView from "./auth/CallbackPageView";
import MainLayout from "./components/common/MainLayout";
import { LocaleProvider } from "./context/LocaleContext";

const App: React.FC = () => {

  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<MainLayout><AuthenticationGuard component={NewSessionView} /></MainLayout>} />
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