import { Routes, Route } from "react-router-dom";
import IndexPage from "./routes/index";
import SetupPage from "./routes/setup";
import SessionPage from "./routes/session.$id";
import ReportPage from "./routes/session.$id.report";
import ResumeBuilder from "./pages/ResumeBuilder";
import SessionsPage from "./routes/sessions";
import HowItWorksPage from "./routes/how-it-works";
import StealthCopilot from "./routes/stealth";
import Dashboard from "./routes/dashboard";
import StoryVault from "./routes/vault";
import NewLoop from "./routes/new-loop";
import LoopDetails from "./routes/loop-details";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/session/:id" element={<SessionPage />} />
      <Route path="/session/:id/report" element={<ReportPage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/resume" element={<ResumeBuilder />} />
      <Route path="/stealth" element={<StealthCopilot />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vault" element={<StoryVault />} />
      <Route path="/loops/new" element={<NewLoop />} />
      <Route path="/loops/:id" element={<LoopDetails />} />
    </Routes>
  );
}

export default App;
