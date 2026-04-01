import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import Header from "../components/Header";
import PulseHotspotMarker from "../components/PulseHotspotMarker";
import {
  getCountrySummary,
  getForecastTimeline,
  getFutureRiskAreas
} from "../services/api";
import "../styles/country-profiles.css";
import "leaflet/dist/leaflet.css";
import { loadSettings } from "../utils/settings";

const FEATURED_COUNTRIES = ["India", "Nigeria", "France", "Germany", "Brazil"];

function ResizeCountryMap({ points }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
        if (points.length) {
          const bounds = points.map((point) => [point.latitude, point.longitude]);
          map.fitBounds(bounds, { padding: [28, 28], maxZoom: 5 });
        } else {
          map.setView([20, 78], 4);
        }
      });
    };

    const timer = setTimeout(invalidate, 120);
    return () => clearTimeout(timer);
  }, [map, points]);

  return null;
}

function CountryProfilesPage() {
  const { country } = useParams();
  const navigate = useNavigate();
  const [settings] = useState(() => loadSettings());
  const selectedCountry = decodeURIComponent(country || settings.countryProfile || "India");
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const defaultForecastYear = Number(settings.forecastYear || 2027);
  const showHistoricalContext = settings.showHistoricalContext;
  const showHotspotLabels = settings.showHotspotLabels;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getCountrySummary(selectedCountry),
      getForecastTimeline(selectedCountry),
      getFutureRiskAreas(defaultForecastYear, selectedCountry)
    ])
      .then(([summaryRow, timelineRows, areaRows]) => {
        if (!mounted) return;
        setSummary(summaryRow);
        setTimeline(timelineRows);
        setAreas(areaRows);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load country profile.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedCountry, defaultForecastYear]);

  const futureAreas = useMemo(() => {
    const rows = Array.isArray(areas) ? areas : [];
    return rows.map((item) => ({
      areaIndex: item.area_index,
      areaName: item.area_name || `Area ${item.area_index}`,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      riskScore: Number(item.risk_score || 0),
      country: item.country
    }));
  }, [areas]);

  const maxAreaRisk = Math.max(...futureAreas.map((item) => item.riskScore), 1);
  const forecastValue = summary?.["Future Predicted Victims"] || 0;
  const latestHistoricalVictims = summary?.["Latest Historical Victims"] || 0;
  const percentChange = summary?.["Percent Change"] || 0;
  const forecastYear = summary?.["Forecast Year"] || defaultForecastYear;
  const historicalTotal = summary?.["Historical Victims"] || 0;
  const riskLevel =
    percentChange >= 30 ? "High" : percentChange >= 5 ? "Medium" : percentChange >= 0 ? "Guarded" : "Stable";

  const forecastBreakdown = useMemo(() => {
    return futureAreas
      .slice()
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [futureAreas]);

  const derivedMetrics = [
    {
      label: "Historical Base",
      value: historicalTotal.toLocaleString(),
      tone: "warm"
    },
    {
      label: `${forecastYear} Forecast`,
      value: forecastValue.toLocaleString(),
      tone: "alert"
    },
    {
      label: "Projected Change",
      value: `${Math.abs(percentChange)}%`,
      tone: percentChange < 0 ? "cool" : "alert"
    },
    {
      label: "Risk Level",
      value: riskLevel,
      tone: "neutral"
    }
  ];

  const insights = [
    `${selectedCountry} shows a ${percentChange < 0 ? "contained" : "rising"} forecast profile heading into ${forecastYear}.`,
    `The latest historical observation recorded ${latestHistoricalVictims.toLocaleString()} victims before the forecast window.`,
    `Future risk is distributed across ${futureAreas.length || 0} inferred hotspot areas rather than one single centroid.`
  ];
  const isEmpty = !summary && !timeline.length && !futureAreas.length;

  return (
    <>
      <Header />

      <main className="profile-page">
        <div className="profile-backdrop" />

        <section className="profile-shell">
          {loading && (
            <div className="page-status">
              <strong>Loading country profile</strong>
              <p>Preparing the overview, hotspot map, and country indicators for {selectedCountry}.</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-status error">
              <strong>Country profile unavailable</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="page-status">
              <strong>No country profile data available</strong>
              <p>No summary, timeline, or hotspot rows were found for {selectedCountry}.</p>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <>
          <section className="profile-topbar">
            <div>
              <span className="profile-kicker">Country Profile</span>
              <h1>{selectedCountry}</h1>
              <p>Focused risk assessment with future hotspot areas, forecast change, and operational context.</p>
            </div>

            <div className="profile-country-switcher">
              {FEATURED_COUNTRIES.map((item) => (
                <button
                  key={item}
                  className={`country-chip ${selectedCountry === item ? "active" : ""}`}
                  onClick={() => navigate(`/countries/${encodeURIComponent(item)}`)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="profile-layout">
            <aside className="profile-side">
              <div className="side-card overview-card">
                <span className="side-label">Country Overview</span>
                <div className="country-flag-row">
                  <div className="flag-badge">{selectedCountry.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{selectedCountry}</strong>
                    <p>{riskLevel} alert</p>
                  </div>
                </div>

                <div className="risk-ring">
                  <div className="risk-ring-inner">
                    <strong>{Math.min(99, Math.max(12, Math.round(Math.abs(percentChange) + 40)))}</strong>
                    <span>Risk Score</span>
                  </div>
                </div>

                <button className="profile-btn" onClick={() => navigate(`/hotspots/${encodeURIComponent(selectedCountry)}`)}>
                  Open Future Hotspots
                </button>
              </div>

              <div className="side-card">
                <span className="side-label">Derived Metrics</span>
                <div className="metric-grid">
                  {derivedMetrics.map((metric) => (
                    <div key={metric.label} className={`metric-pill ${metric.tone}`}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="profile-main">
              <div className="hero-map-card">
                <div className="hero-map-head">
                  <div>
                    <span className="panel-kicker">Detail View</span>
                    <h2>{selectedCountry} Future Risk Map</h2>
                  </div>
                  <div className="risk-legend">
                    <span className="legend-dot high" /> High
                    <span className="legend-dot medium" /> Medium
                    <span className="legend-dot low" /> Low
                    <span className="legend-dot stable" /> Stable
                  </div>
                </div>

                <div className="profile-map-frame">
                  <MapContainer center={[20, 78]} zoom={4} className="profile-map">
                    <ResizeCountryMap points={futureAreas} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {futureAreas.map((area, index) => {
                      return (
                        <PulseHotspotMarker
                          key={`${area.country}-${area.areaIndex}-${index}`}
                          latitude={area.latitude}
                          longitude={area.longitude}
                          intensity={area.riskScore}
                          maxIntensity={maxAreaRisk}
                          label={showHotspotLabels ? area.country : ""}
                          highlighted={area.areaIndex === 1}
                        >
                          {area.areaName}
                          <br />
                          Risk score: {area.riskScore.toLocaleString()}
                        </PulseHotspotMarker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>

              <div className="profile-detail-grid">
                <div className="detail-card">
                  <div className="detail-head">
                    <h3>Detailed Risk Breakdown</h3>
                    <span>{forecastYear}</span>
                  </div>

                  <div className="breakdown-list">
                    {derivedMetrics.map((metric, index) => (
                      <div key={metric.label} className="breakdown-row">
                        <div className="breakdown-copy">
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className={`breakdown-fill ${metric.tone}`}
                            style={{ width: `${55 + index * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-head">
                    <h3>Hotspot Analysis</h3>
                    <span>Top Areas</span>
                  </div>

                  <div className="breakdown-list">
                    {forecastBreakdown.map((area) => (
                      <div key={`${area.areaName}-${area.areaIndex}`} className="breakdown-row">
                        <div className="breakdown-copy">
                          <span>{area.areaName}</span>
                          <strong>{area.riskScore.toLocaleString()}</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill alert"
                            style={{ width: `${40 + (area.riskScore / maxAreaRisk) * 60}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-bottom-grid">
                <div className="detail-card insights-card">
                  <div className="detail-head">
                    <h3>Recommendations & Insights</h3>
                  </div>

                  <ul className="insight-list">
                    {insights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-card recent-card">
                  <div className="detail-head">
                    <h3>Recent Markers for {selectedCountry}</h3>
                  </div>

                  <div className="recent-list">
                    {(showHistoricalContext
                      ? timeline
                      : timeline.filter((item) => item.Type === "Forecast")
                    ).slice(-3).map((item, index) => (
                      <div key={`${item.Year}-${index}`} className="recent-item">
                        <span className="recent-year">{item.Year}</span>
                        <div>
                          <strong>{Number(item.Victims || 0).toLocaleString()}</strong>
                          <p>{item.Type} victims level</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default CountryProfilesPage;
