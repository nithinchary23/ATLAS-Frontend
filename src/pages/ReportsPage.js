import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import {
  getCountrySummary,
  getForecastTimeline,
  getHistoricalRisk
} from "../services/api";
import "../styles/reports.css";
import { loadSettings } from "../utils/settings";

const REPORT_COUNTRIES = ["India", "Nigeria", "France"];

function ReportsPage() {
  const [settings] = useState(() => loadSettings());
  const [history, setHistory] = useState([]);
  const [countrySummaries, setCountrySummaries] = useState([]);
  const [countryTimelines, setCountryTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportCountries = useMemo(() => {
    const preferredCountry = settings.countryProfile || "India";
    return [preferredCountry, ...REPORT_COUNTRIES.filter((country) => country !== preferredCountry)];
  }, [settings.countryProfile]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getHistoricalRisk(),
      Promise.all(reportCountries.map((country) => getCountrySummary(country))),
      Promise.all(reportCountries.map((country) => getForecastTimeline(country)))
    ])
      .then(([historyRows, summaryRows, timelineResults]) => {
        if (!mounted) return;
        setHistory(historyRows);
        setCountrySummaries(summaryRows);
        setCountryTimelines(
          reportCountries.map((country, index) => ({
            country,
            rows: timelineResults[index] || []
          }))
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load reports data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [reportCountries]);

  const historicalTotal = history.reduce(
    (sum, item) => sum + Number(item.Victims || 0),
    0
  );

  const historicalMedian = history.length
    ? Math.round(
        [...history]
          .map((item) => Number(item.Victims || 0))
          .sort((a, b) => a - b)[Math.floor(history.length / 2)]
      )
    : 0;

  const reportBriefs = useMemo(() => {
    return countrySummaries.map((summary) => {
      const timeline = countryTimelines.find((item) => item.country === summary.Country)?.rows || [];
      const historicalRows = timeline.filter((item) => item.Type === "Historical");
      const forecastRows = timeline.filter((item) => item.Type === "Forecast");
      const recentHistorical = historicalRows[historicalRows.length - 1]?.Victims || 0;
      const forecastPeak = forecastRows.reduce(
        (max, item) => Math.max(max, Number(item.Victims || 0)),
        0
      );

      return {
        ...summary,
        recentHistorical,
        forecastPeak,
        narrative:
          Number(summary["Percent Change"] || 0) > 0
            ? `${summary.Country} shows a rising projected risk profile relative to its latest historical reference point.`
            : `${summary.Country} shows a contained or stable projected profile relative to its latest historical reference point.`
      };
    });
  }, [countrySummaries, countryTimelines]);

  const archiveNotes = [
    "Historical totals are aggregated at country level and should be read as burden indicators, not incident counts for a single event.",
    "Forecast values represent modeled future direction rather than verified future observations.",
    "Future hotspot areas on the predictive pages are inferred geospatial projections around forecasted country-level risk."
  ];

  const reportingChecklist = [
    "Validate whether a country should be discussed through historical burden, forecast change, or both.",
    "Use the Country Profiles page for country-specific operational detail before publishing a report section.",
    "Use the Predictive Hotspots page when describing where future concentration may emerge spatially.",
    "Use the Historical Risk page when explaining long-term burden and persistent trafficking geography."
  ];

  const timelineNotes = countryTimelines.map((item) => {
    const historicalRows = item.rows.filter((row) => row.Type === "Historical");
    const forecastRows = item.rows.filter((row) => row.Type === "Forecast");
    const firstHistorical = historicalRows[0]?.Year;
    const lastHistorical = historicalRows[historicalRows.length - 1]?.Year;
    const lastForecast = forecastRows[forecastRows.length - 1]?.Year;

    return {
      country: item.country,
      note:
        historicalRows.length && forecastRows.length
          ? `${item.country} timeline spans ${firstHistorical}-${lastHistorical} historically and extends through ${lastForecast} in the forecast view.`
          : `${item.country} currently has limited timeline coverage.`
    };
  });

  const exportCsv = () => {
    const header = "Country,HistoricalVictims,ForecastYear,ForecastVictims,PercentChange";
    const lines = reportBriefs.map((item) =>
      [
        item.Country,
        item["Historical Victims"],
        item["Forecast Year"],
        item["Future Predicted Victims"],
        item["Percent Change"]
      ].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "atlas-country-briefs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const isEmpty = !history.length && !countrySummaries.length && !countryTimelines.length;

  return (
    <>
      <Header />

      <main className="reports-page">
        <div className="reports-backdrop" />

        <section className="reports-shell">
          {loading && (
            <div className="page-status">
              <strong>Loading reports workspace</strong>
              <p>Preparing report metrics, selected country briefs, and timeline coverage notes.</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-status error">
              <strong>Reports unavailable</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="page-status">
              <strong>No report data available</strong>
              <p>The reports workspace did not receive enough data to build briefing content.</p>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <>
          <section className="reports-hero">
            <div className="reports-hero-copy">
              <span className="reports-kicker">ATLAS Reports</span>
              <h1>Reporting and Briefing Workspace</h1>
              <p>
                This page is designed for narrative reporting, export preparation,
                and country-brief assembly rather than repeating the dashboard rankings.
              </p>
            </div>

            <div className="reports-side-meta">
              <div className="report-meta-card">
                <span>Prepared</span>
                <strong>{reportDate}</strong>
              </div>
              <div className="report-meta-card">
                <span>Format</span>
                <strong>{settings.reportFormat}</strong>
              </div>
              <div className="reports-actions">
                <button className="reports-btn primary" onClick={() => window.print()}>
                  Print Brief
                </button>
                <button className="reports-btn secondary" onClick={exportCsv}>
                  Export Country Briefs
                </button>
              </div>
            </div>
          </section>

          <section className="reports-summary-grid">
            <article className="report-card highlight">
              <span className="card-label">Historical Burden Total</span>
              <strong>{historicalTotal.toLocaleString()}</strong>
              <p>Total aggregated historical victims across all countries in the archive.</p>
            </article>

            <article className="report-card warm">
              <span className="card-label">Historical Median</span>
              <strong>{historicalMedian.toLocaleString()}</strong>
              <p>Median country-level historical burden used as a reporting anchor.</p>
            </article>

            <article className="report-card">
              <span className="card-label">Brief Countries</span>
              <strong>{reportCountries.join(", ")}</strong>
              <p>Selected countries prepared for briefing-style summaries below.</p>
            </article>

            <article className="report-card">
              <span className="card-label">Reporting Mode</span>
              <strong>{settings.alertMode} Review</strong>
              <p>Focused on interpretation, context, and ready-to-share outputs.</p>
            </article>
          </section>

          <section className="reports-grid">
            <article className="report-panel wide">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 01</span>
                  <h2>Selected Briefing Packets</h2>
                </div>
              </div>

              <div className="country-brief-grid">
                {reportBriefs.map((item) => (
                  <div key={item.Country} className="brief-card">
                    <h3>{item.Country}</h3>
                    <p className="brief-copy">{item.narrative}</p>
                    <div className="brief-metric">
                      <span>Historical total</span>
                      <strong>{Number(item["Historical Victims"] || 0).toLocaleString()}</strong>
                    </div>
                    <div className="brief-metric">
                      <span>Latest historical</span>
                      <strong>{Number(item.recentHistorical || 0).toLocaleString()}</strong>
                    </div>
                    <div className="brief-metric">
                      <span>{item["Forecast Year"]} forecast</span>
                      <strong>{Number(item["Future Predicted Victims"] || 0).toLocaleString()}</strong>
                    </div>
                    <div className="brief-metric">
                      <span>Forecast peak</span>
                      <strong>{Number(item.forecastPeak || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="report-panel">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 02</span>
                  <h2>Reporting Workflow</h2>
                </div>
              </div>

              <div className="recommendation-list">
                {reportingChecklist.map((item) => (
                  <div key={item} className="recommendation-item">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="reports-grid">
            <article className="report-panel">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 03</span>
                  <h2>Coverage Summary</h2>
                </div>
              </div>

              <div className="notes-list">
                {timelineNotes.map((item) => (
                  <p key={item.country}>{item.note}</p>
                ))}
              </div>
            </article>

            <article className="report-panel wide">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 04</span>
                  <h2>How To Read The Outputs</h2>
                </div>
              </div>

              <div className="notes-list">
                {archiveNotes.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          </section>

          <section className="reports-grid">
            <article className="report-panel">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 05</span>
                  <h2>Available Outputs</h2>
                </div>
              </div>

              <div className="recommendation-list">
                <div className="recommendation-item">Printable executive brief for stakeholder review</div>
                <div className="recommendation-item">CSV export of selected country briefing metrics</div>
                <div className="recommendation-item">Country profile packets for focused review</div>
              </div>
            </article>

            <article className="report-panel">
              <div className="panel-top">
                <div>
                  <span className="panel-kicker">Section 06</span>
                  <h2>Where This Page Fits</h2>
                </div>
              </div>

              <div className="notes-list">
                <p>Use the dashboard for scanning risk quickly.</p>
                <p>Use predictive hotspots for area-level future distribution.</p>
                <p>Use historical risk for archival burden review.</p>
                <p>Use this page when preparing shareable written summaries.</p>
              </div>
            </article>
          </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default ReportsPage;
