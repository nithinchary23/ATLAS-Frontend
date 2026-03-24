import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CountryPage from "./pages/CountryPage";
import CountryProfilesPage from "./pages/CountryProfilesPage";
import HotspotPage from "./pages/HotspotPage";
import HistoryMapPage from "./pages/HistoryMapPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/country/:country" element={<CountryPage />} />
        <Route path="/countries" element={<CountryProfilesPage />} />
        <Route path="/countries/:country" element={<CountryProfilesPage />} />
        <Route path="/hotspots" element={<HotspotPage />} />
        <Route path="/hotspots/:country" element={<HotspotPage />} />
        <Route path="/history-map" element={<HistoryMapPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
