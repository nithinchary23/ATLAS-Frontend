import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getForecastTimeline,
  getCountrySummary
} from "../services/api";
import ForecastLineChart from "../components/ForecastLineChart";
import "../styles/country.css";
import { loadSettings } from "../utils/settings";

function CountryPage() {
  const { country } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const decodedCountry = decodeURIComponent(country || "");
  const [settings] = useState(() => loadSettings());
  const showHistoricalContext = settings.showHistoricalContext;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getForecastTimeline(decodedCountry),
      getCountrySummary(decodedCountry)
    ])
      .then(([timelineRows, summaryRow]) => {
        if (!mounted) return;
        setTimeline(timelineRows);
        setSummary(summaryRow);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load country data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [decodedCountry]);

  const historical = summary?.["Historical Victims"] || 0;
  const forecastYear = summary?.["Forecast Year"] || 2027;
  const forecastValue = summary?.["Future Predicted Victims"] || 0;
  const percentChange = summary?.["Percent Change"] || 0;
  const latestHistoricalYear = summary?.["Latest Historical Year"] || "Recent";
  const latestHistoricalVictims = summary?.["Latest Historical Victims"] || 0;
  const changeLabel = percentChange < 0 ? "Projected Decrease" : "Projected Change";
  const changeTone = percentChange < 0 ? "calm" : "alert";
  const displayPercent = Math.abs(percentChange);
  const timelineRows = showHistoricalContext
    ? timeline
    : timeline.filter((item) => item.Type === "Forecast");
  const isEmpty = !summary && !timelineRows.length;

  return (
    <section className="country-page">
      <div className="country-backdrop" />

      <div className="country-shell">
        {loading && (
          <div className="page-status">
            <strong>Loading country profile</strong>
            <p>Preparing the forecast timeline and summary for {decodedCountry}.</p>
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
            <strong>No country data available</strong>
            <p>No summary or timeline data was found for {decodedCountry}.</p>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <>
        <div className="country-hero">
          <div className="country-copy">
            <div className="country-kicker">Country Forecast Profile</div>
            <h1>{decodedCountry}</h1>
            <p>
              Review recent victim history, near-term forecast direction, and
              projected hotspot movement in a single view.
            </p>

            <div className="country-meta">
              <div className="meta-pill">
                <span>Latest historical year</span>
                <strong>{latestHistoricalYear}</strong>
              </div>
              <div className="meta-pill">
                <span>Forecast horizon</span>
                <strong>{forecastYear}</strong>
              </div>
            </div>
          </div>

          <div className="country-actions">
            <button
              className="primary-btn"
              onClick={() => navigate(`/hotspots/${encodeURIComponent(decodedCountry)}`)}
            >
              View Future Hotspots
            </button>
          </div>
        </div>

        {summary && (
          <div className="stats-grid">
            <article className="stat-card">
              <span className="label">Historical Total</span>
              <strong>{historical.toLocaleString()}</strong>
              <p>Combined victim count across all recorded historical years.</p>
            </article>

            <article className="stat-card emphasis">
              <span className="label">{forecastYear} Forecast</span>
              <strong>{forecastValue.toLocaleString()}</strong>
              <p>Predicted victim count for the most recent forecast year.</p>
            </article>

            <article className={`stat-card ${changeTone}`}>
              <span className="label">{changeLabel}</span>
              <strong>{displayPercent}%</strong>
              <p>
                Compared with {latestHistoricalYear} where the observed count was{" "}
                {latestHistoricalVictims.toLocaleString()}.
              </p>
            </article>
          </div>
        )}

        <div className="country-content">
          <div className="chart-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">Timeline</span>
                <h2>{showHistoricalContext ? "Historical vs Forecast Trend" : "Forecast Trend"}</h2>
              </div>
              <p>
                {showHistoricalContext
                  ? "The line combines the latest historical years with the projected values so the forecast is easier to interpret."
                  : "The line isolates projected values when you want a cleaner forward-looking view."}
              </p>
            </div>

            <ForecastLineChart data={timelineRows} />
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  );
}

export default CountryPage;
