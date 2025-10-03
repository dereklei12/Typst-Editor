import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import SplitLayoutWithDocs from "./components/Layout/SplitLayoutWithDocs";
import "./App.css";

function AuthenticatedApp() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Typst 所见即所得编辑器</h1>
      </header>
      <SplitLayoutWithDocs />
    </div>
  );
}

function UnauthenticatedApp() {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <Login onSwitchToSignup={() => setShowLogin(false)} />
  ) : (
    <Signup onSwitchToLogin={() => setShowLogin(true)} />
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  return currentUser ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
