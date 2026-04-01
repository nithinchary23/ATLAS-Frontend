import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import Header from "../components/Header";
import PulseHotspotMarker from "../components/PulseHotspotMarker";
import { getHistoricalRisk } from "../services/api";
import "../styles/map.css";
import "leaflet/dist/leaflet.css";

function ResizeHistoricalMap() {
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

function HistoryMapPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getHistoricalRisk()
      .then((rows) => {
        if (!mounted) return;
        setData(rows);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load historical risk data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const historicalRows = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    return rows
      .map((item) => ({
        country: item.Country,
        latitude: Number(item.Latitude),
        longitude: Number(item.Longitude),
        victims: Number(item.Victims || 0)
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }, [data]);

  const topCountries = historicalRows.slice(0, 10);
  const maxVictims = Math.max(...historicalRows.map((item) => item.victims), 1);
  const totalVictims = historicalRows.reduce((sum, item) => sum + item.victims, 0);
  const topCountry = topCountries[0]?.country || "Unavailable";
  const averageVictims = historicalRows.length
    ? Math.round(totalVictims / historicalRows.length)
    : 0;
  const isEmpty = !historicalRows.length;

  return (
    <>
      <Header />

      <main className="historical-page">
        <div className="historical-backdrop" />

        <section className="historical-shell">
          {loading && (
            <div className="page-status">
              <strong>Loading historical archive</strong>
              <p>Preparing the historical burden map and ranking.</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-status error">
              <strong>Historical archive unavailable</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="page-status">
              <strong>No historical archive data available</strong>
              <p>The historical risk endpoint returned no country rows.</p>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <>
          <div className="historical-hero">
            <div className="historical-copy">
              <span className="historical-kicker">Historical Risk Archive</span>
              <h1>Recorded Global Risk Burden</h1>
              <p>
                This view focuses on observed victim burden already recorded in the dataset,
                highlighting where historical concentration has been strongest.
              </p>

              <div className="historical-ribbon">
                <div className="historical-ribbon-item">
                  <span>Highest burden</span>
                  <strong>{topCountry}</strong>
                </div>
                <div className="historical-ribbon-item">
                  <span>Average per country</span>
                  <strong>{averageVictims.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="historical-summary">
              <div className="historical-tile historical-accent">
                <span>Total Historical Victims</span>
                <strong>{totalVictims.toLocaleString()}</strong>
              </div>
              <div className="historical-tile">
                <span>Highest Historical Country</span>
                <strong>{topCountry}</strong>
              </div>
              <div className="historical-tile">
                <span>Countries Covered</span>
                <strong>{historicalRows.length}</strong>
              </div>
            </div>
          </div>

          <div className="historical-layout">
            <section className="historical-map-panel">
              <div className="historical-panel-head">
                <div>
                  <span className="historical-panel-kicker">Archive Map</span>
                  <h2>Observed Historical Risk Map</h2>
                </div>
                <p>
                  Pulsing markers reflect recorded historical victims aggregated by country.
                </p>
              </div>

              <div className="historical-map-frame">
                <MapContainer center={[20, 0]} zoom={2} className="historical-map">
                  <ResizeHistoricalMap />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {historicalRows.map((item, index) => {
                    return (
                      <PulseHotspotMarker
                        key={`${item.country}-${index}`}
                        latitude={item.latitude}
                        longitude={item.longitude}
                        intensity={item.victims}
                        maxIntensity={maxVictims}
                        label={item.country}
                      >
                        Historical victims: {item.victims.toLocaleString()}
                      </PulseHotspotMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </section>

            <aside className="historical-side-panel">
              <div className="historical-panel-head">
                <div>
                  <span className="historical-panel-kicker">Archive Ranking</span>
                  <h2>Top Historical Risk Countries</h2>
                </div>
                <p>Highest observed historical victim counts across the dataset.</p>
              </div>

              <div className="historical-list">
                {topCountries.map((item, index) => (
                  <div key={`${item.country}-${index}`} className="historical-row">
                    <span className="historical-rank">{String(index + 1).padStart(2, "0")}</span>
                    <span className="historical-country">{item.country}</span>
                    <span className="historical-score">{item.victims.toLocaleString()}</span>
                  </div>
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

export default HistoryMapPage;
