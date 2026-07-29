import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { LandingPage } from "./pages/LandingPage";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
  const token = useAuthStore((state: { token: string | null }) => state.token);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/chat" element={token ? <ChatPage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
