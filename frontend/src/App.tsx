import { Route, Routes } from "react-router-dom";
import React from "react";
import { AuthenticationGuard } from "./auth/authentication-guard";
import ChatView from "./views/ChatView";
import SetupView from "./views/SetupView";
import SettingsView from "./views/SettingsView";
import NewSessionView from "./views/NewSessionView";
import CallbackPageView from "./views/CallbackPageView";
import MainLayout from "./components/common/MainLayout";
import { LocaleProvider } from "./context/LocaleContext";
import HomeView from "./views/HomeView";

const App: React.FC = () => {

  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/setup" element={<SetupView />} />
        <Route path="/new" element={<MainLayout><AuthenticationGuard component={NewSessionView} /></MainLayout>} />
        <Route path="/chat" element={<MainLayout><AuthenticationGuard component={ChatView} /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><AuthenticationGuard component={SettingsView} /></MainLayout>} />
        <Route path="/chat/:id" element={<MainLayout><AuthenticationGuard component={ChatView} /></MainLayout>} />
        <Route path="/callback" element={<CallbackPageView />} />
      </Routes>
    </LocaleProvider>
  );
};

export default App;