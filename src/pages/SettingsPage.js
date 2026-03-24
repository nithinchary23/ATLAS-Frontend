import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/settings.css";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings
} from "../utils/settings";

function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(timer);
  }, [saved]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(true);
  };

  return (
    <>
      <Header />

      <main className="settings-page">
        <div className="settings-backdrop" />

        <section className="settings-shell">
          <section className="settings-banner">
            <div className="settings-banner-copy">
              <span className="settings-kicker">System Preferences</span>
              <h1>ATLAS Workspace Settings</h1>
              <p>
                Manage how the platform opens, what context stays visible, and how
                reporting views should default across the workspace.
              </p>
            </div>

            <div className="settings-actions">
              <button className="settings-btn secondary" onClick={resetSettings}>
                Reset Defaults
              </button>
              <button className="settings-btn primary" onClick={saveSettings}>
                Save Settings
              </button>
            </div>
          </section>

          <section className="settings-status-row">
            <div className="status-card">
              <span>Default Forecast Year</span>
              <strong>{settings.forecastYear}</strong>
            </div>
            <div className="status-card">
              <span>Primary Country</span>
              <strong>{settings.countryProfile}</strong>
            </div>
            <div className="status-card">
              <span>Report Format</span>
              <strong>{settings.reportFormat}</strong>
            </div>
            <div className={`status-card ${saved ? "saved" : ""}`}>
              <span>Status</span>
              <strong>{saved ? "Saved" : "Unsaved"}</strong>
            </div>
          </section>

          <section className="settings-layout">
            <aside className="settings-sidebar-card">
              <span className="card-kicker">Workspace Mode</span>
              <h2>Current Profile</h2>
              <p>
                These preferences define the default reporting and exploration context
                when ATLAS opens.
              </p>

              <div className="focus-stack">
                <div className="focus-pill">
                  <span>Forecast View</span>
                  <strong>{settings.forecastYear}</strong>
                </div>
                <div className="focus-pill">
                  <span>Country Focus</span>
                  <strong>{settings.countryProfile}</strong>
                </div>
                <div className="focus-pill">
                  <span>Alert Mode</span>
                  <strong>{settings.alertMode}</strong>
                </div>
              </div>
            </aside>

            <section className="settings-main">
              <article className="settings-card">
                <div className="settings-card-head">
                  <span className="card-kicker">Defaults</span>
                  <h2>Forecast and Country Defaults</h2>
                </div>

                <div className="field-grid">
                  <label className="settings-field">
                    <span>Forecast Year</span>
                    <select
                      value={settings.forecastYear}
                      onChange={(e) => updateSetting("forecastYear", e.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </label>

                  <label className="settings-field">
                    <span>Country Profile</span>
                    <select
                      value={settings.countryProfile}
                      onChange={(e) => updateSetting("countryProfile", e.target.value)}
                    >
                      <option value="India">India</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Brazil">Brazil</option>
                    </select>
                  </label>
                </div>
              </article>

              <article className="settings-card">
                <div className="settings-card-head">
                  <span className="card-kicker">Reports</span>
                  <h2>Output Preferences</h2>
                </div>

                <div className="field-grid">
                  <label className="settings-field">
                    <span>Preferred Report Format</span>
                    <select
                      value={settings.reportFormat}
                      onChange={(e) => updateSetting("reportFormat", e.target.value)}
                    >
                      <option value="Executive Brief">Executive Brief</option>
                      <option value="Country Brief Pack">Country Brief Pack</option>
                      <option value="Operational Summary">Operational Summary</option>
                    </select>
                  </label>

                  <label className="settings-field">
                    <span>Alert Mode</span>
                    <select
                      value={settings.alertMode}
                      onChange={(e) => updateSetting("alertMode", e.target.value)}
                    >
                      <option value="Balanced">Balanced</option>
                      <option value="Conservative">Conservative</option>
                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </label>
                </div>
              </article>

              <article className="settings-card">
                <div className="settings-card-head">
                  <span className="card-kicker">Visibility</span>
                  <h2>Layer and Context Toggles</h2>
                </div>

                <div className="toggle-list">
                  <label className="toggle-row">
                    <div>
                      <strong>Historical context in country views</strong>
                      <p>Keep historical victim context visible alongside forecast output.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showHistoricalContext}
                      onChange={(e) =>
                        updateSetting("showHistoricalContext", e.target.checked)
                      }
                    />
                  </label>

                  <label className="toggle-row">
                    <div>
                      <strong>Hotspot labels on future maps</strong>
                      <p>Show named hotspot labels on predictive hotspot views.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showHotspotLabels}
                      onChange={(e) =>
                        updateSetting("showHotspotLabels", e.target.checked)
                      }
                    />
                  </label>
                </div>
              </article>
            </section>
          </section>
        </section>
      </main>
    </>
  );
}

export default SettingsPage;
