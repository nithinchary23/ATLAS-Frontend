import { useEffect, useMemo, useState } from "react";
import {
  getTop10Risk,
  getFutureHotspots,
  getHistoricalRisk
} from "../services/api";

import Header from "../components/Header";
import HotspotMap from "../components/HotspotMap";
import Top10BarChart from "../components/Top10BarChart";
import HistoricalTrendChart from "../components/HistoricalTrendChart";

import "../styles/dashboard-fixed.css";
import { loadSettings } from "../utils/settings";

function Dashboard() {
  const [top10, setTop10] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings] = useState(() => loadSettings());
  const forecastYear = Number(settings.forecastYear || 2027);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getTop10Risk(),
      getFutureHotspots(forecastYear),
      getHistoricalRisk()
    ])
      .then(([top10Rows, hotspotRows, historyRows]) => {
        if (!mounted) return;
        setTop10(top10Rows);
        setHotspots(hotspotRows);
        setHistory(historyRows);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [forecastYear]);

  const summary = useMemo(() => {
    const totalForecast = top10.reduce(
      (sum, item) => sum + Number(item["Predicted Victims"] || 0),
      0
    );
    const hottestCountry = top10[0]?.Country || "Unavailable";
    const historicalCountries = history.length;
    const hotspotCount = hotspots.length;

    return {
      totalForecast,
      hottestCountry,
      historicalCountries,
      hotspotCount
    };
  }, [top10, history, hotspots]);
  const isEmpty = !top10.length && !hotspots.length && !history.length;

  return (
    <>
      <Header />

      <main className="dashboard-root">
        <div className="dashboard-backdrop" />

        <section className="dashboard-shell">
          {loading && (
            <div className="page-status">
              <strong>Loading dashboard</strong>
              <p>Forecast, hotspot, and historical data are being prepared.</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-status error">
              <strong>Dashboard unavailable</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="page-status">
              <strong>No dashboard data available</strong>
              <p>The API returned no forecast or historical rows. Check the dataset and backend routes.</p>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <>
          <section className="dashboard-hero">
            <div className="hero-copy">
              <span className="hero-kicker">Trafficking Risk Command Center</span>
              <h1>Global Trafficking Risk Dashboard</h1>
              <p>
                Forecast hotspots, compare risk concentration, and review
                historical burden from a single operational screen.
              </p>
            </div>

            <div className="hero-summary">
              <div className="summary-tile summary-accent">
                <span>{forecastYear} Top-10 Forecast</span>
                <strong>{summary.totalForecast.toLocaleString()}</strong>
              </div>
              <div className="summary-tile">
                <span>Highest Forecast Country</span>
                <strong>{summary.hottestCountry}</strong>
              </div>
              <div className="summary-tile">
                <span>Tracked Hotspots</span>
                <strong>{summary.hotspotCount}</strong>
              </div>
              <div className="summary-tile">
                <span>Historical Countries</span>
                <strong>{summary.historicalCountries}</strong>
              </div>
            </div>
          </section>

          <section className="row row-main">
            <div className="panel map-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Map View</span>
                  <div className="panel-title">Predictive Hotspot Map</div>
                </div>
                <p>Projected risk centers based on historical patterns.</p>
              </div>
              <div className="panel-frame map-frame">
                <HotspotMap data={hotspots} />
              </div>
            </div>

            <div className="panel bar-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Priority List</span>
                  <div className="panel-title">High-Risk Countries</div>
                </div>
                <p>Top forecasted countries ranked by projected victims.</p>
              </div>
              <div className="panel-frame chart-frame">
                <Top10BarChart data={top10} />
              </div>
            </div>
          </section>

          <section className="row row-secondary">
            <div className="panel history-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Historical Lens</span>
                  <div className="panel-title">Historical Risk Snapshot</div>
                </div>
                <p>Countries with the highest observed historical victim burden.</p>
              </div>
              <div className="panel-frame history-frame">
                <HistoricalTrendChart data={history} />
              </div>
            </div>

            <div className="panel insights-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Briefing</span>
                  <div className="panel-title">Key Insights</div>
                </div>
              </div>

              <div className="insight-stack">
                <article className="insight-card">
                  <span className="insight-index">01</span>
                  <h3>Forecast clusters are concentrated</h3>
                  <p>
                    The map surfaces a relatively small set of countries carrying
                    most projected risk, which makes prioritization easier.
                  </p>
                </article>

                <article className="insight-card">
                  <span className="insight-index">02</span>
                  <h3>Historical burden remains relevant</h3>
                  <p>
                    Countries with high historical counts continue to shape the
                    forecast picture and should anchor intervention planning.
                  </p>
                </article>

                <article className="insight-card">
                  <span className="insight-index">03</span>
                  <h3>Search country profiles for context</h3>
                  <p>
                    Use the top search bar to move from the global dashboard into
                    a country-level forecast profile and hotspot view.
                  </p>
                </article>
              </div>
            </div>
          </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default Dashboard;
