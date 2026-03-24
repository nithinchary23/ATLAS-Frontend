import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import Header from "../components/Header";
import { getFutureHotspots, getFutureRiskAreas } from "../services/api";
import "../styles/map.css";
import "leaflet/dist/leaflet.css";
import { loadSettings } from "../utils/settings";

function ResizeHotspotMap() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const invalidate = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    const initialTimer = setTimeout(invalidate, 150);
    const resizeObserver = new ResizeObserver(invalidate);

    resizeObserver.observe(container);
    window.addEventListener("resize", invalidate);

    return () => {
      clearTimeout(initialTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  return null;
}

function HotspotPage() {
  const { country } = useParams();
  const navigate = useNavigate();
  const [settings] = useState(() => loadSettings());
  const [year, setYear] = useState(() => Number(loadSettings().forecastYear || 2027));
  const [areas, setAreas] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedCountry = decodeURIComponent(country || "");
  const showHotspotLabels = settings.showHotspotLabels;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getFutureRiskAreas(year, selectedCountry),
      getFutureHotspots(year)
    ])
      .then(([areaRows, summaryRows]) => {
        if (!mounted) return;
        setAreas(areaRows);
        setSummary(summaryRows);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load hotspot data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [year, selectedCountry]);

  const hotspots = useMemo(() => {
    const rows = Array.isArray(areas) ? areas : [];
    return rows
      .map((item) => ({
        country: item.country,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        riskScore: Number(item.risk_score || 0),
        areaIndex: item.area_index
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }, [areas]);

  const filteredHotspots = useMemo(() => {
    if (!selectedCountry) {
      return hotspots;
    }

    return hotspots.filter(
      (item) => item.country?.trim().toLowerCase() === selectedCountry.trim().toLowerCase()
    );
  }, [hotspots, selectedCountry]);

  const topCountries = useMemo(() => {
    const source = Array.isArray(summary) ? summary : [];
    const filteredSource = selectedCountry
      ? source.filter(
          (item) => item.country?.trim().toLowerCase() === selectedCountry.trim().toLowerCase()
        )
      : source;
    return [...filteredSource]
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);
  }, [summary, selectedCountry]);

  const mapRows = selectedCountry && filteredHotspots.length > 0 ? filteredHotspots : hotspots;
  const maxRisk = Math.max(...mapRows.map((item) => item.riskScore), 1);
  const heading = selectedCountry
    ? `${selectedCountry} Future Hotspot Risk Areas`
    : "Future Hotspot Risk Areas";
  const subheading = selectedCountry
    ? `Focused risk view for ${selectedCountry} in ${year}.`
    : `Country-level hotspot risk areas for ${year}, distinct from the dashboard summary map.`;
  const isEmpty = !hotspots.length && !topCountries.length;

  return (
    <>
      <Header />

      <main className="hotspot-page">
        <div className="hotspot-backdrop" />

        <section className="hotspot-shell">
          {loading && (
            <div className="page-status">
              <strong>Loading predictive hotspots</strong>
              <p>Preparing the future risk-area map and ranking for {year}.</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-status error">
              <strong>Predictive hotspots unavailable</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="page-status">
              <strong>No hotspot data available</strong>
              <p>No future hotspot rows were returned for {selectedCountry || `the ${year} view`}.</p>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <>
          <div className="hotspot-hero">
            <div>
              <span className="hotspot-kicker">Predictive Hotspots</span>
              <h1>{heading}</h1>
              <p>{subheading}</p>
            </div>

            <div className="hotspot-controls">
              <div className="hotspot-year-group">
                <span>Forecast Year</span>
                <div className="hotspot-year-pills">
                  {[2025, 2026, 2027].map((itemYear) => (
                    <button
                      key={itemYear}
                      className={`year-pill ${year === itemYear ? "active" : ""}`}
                      onClick={() => setYear(itemYear)}
                    >
                      {itemYear}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCountry && (
                <button className="ghost-btn" onClick={() => navigate("/hotspots")}>
                  View All Countries
                </button>
              )}
            </div>
          </div>

          <div className="hotspot-layout">
            <section className="hotspot-map-panel">
              <div className="hotspot-panel-head">
                <div>
                  <span className="hotspot-panel-kicker">Map View</span>
                  <h2>Risk Area Distribution</h2>
                </div>
                <p>
                  These are inferred future risk-area locations projected around each country,
                  not the dashboard summary centroids.
                </p>
              </div>

              <div className="hotspot-map-frame">
                <MapContainer center={[20, 0]} zoom={2} className="hotspot-map">
                  <ResizeHotspotMap />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {mapRows.map((item, index) => {
                    const radius = Math.max(
                      40000,
                      Math.min(220000, 40000 + (item.riskScore / maxRisk) * 180000)
                    );
                    const isSelected =
                      selectedCountry &&
                      item.country?.trim().toLowerCase() === selectedCountry.trim().toLowerCase();

                    return (
                      <Circle
                        key={`${item.country}-${index}`}
                        center={[item.latitude, item.longitude]}
                        radius={radius}
                        pathOptions={{
                          color: isSelected ? "#ffd166" : "#ff5c4d",
                          fillColor: isSelected ? "#ffd166" : "#ff5c4d",
                          weight: isSelected ? 2.5 : 1.5,
                          fillOpacity: isSelected ? 0.7 : 0.36
                        }}
                      >
                        {showHotspotLabels && (
                          <Popup>
                            <strong>{item.country}</strong>
                            <br />
                            Area: {item.areaIndex}
                            <br />
                            Risk score: {item.riskScore.toLocaleString()}
                          </Popup>
                        )}
                      </Circle>
                    );
                  })}
                </MapContainer>
              </div>
            </section>

            <aside className="hotspot-side-panel">
              <div className="hotspot-panel-head">
                <div>
                  <span className="hotspot-panel-kicker">Country Ranking</span>
                  <h2>Top Future Risk Areas</h2>
                </div>
                <p>
                  {selectedCountry
                    ? `Focused ranking for ${selectedCountry}.`
                    : "Highest projected hotspot risk scores for the selected forecast year."}
                </p>
              </div>

              <div className="risk-list">
                {topCountries.map((item, index) => (
                  <button
                    key={`${item.country}-${index}`}
                    className="risk-row"
                    onClick={() => navigate(`/hotspots/${encodeURIComponent(item.country)}`)}
                  >
                    <span className="risk-rank">{String(index + 1).padStart(2, "0")}</span>
                    <span className="risk-country">{item.country}</span>
                    <span className="risk-score">{Number(item.risk_score || 0).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default HotspotPage;
