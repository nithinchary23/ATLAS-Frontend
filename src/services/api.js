const BASE = (process.env.REACT_APP_API_BASE_URL || "https://atlas-backend-zj22.onrender.com/api").replace(/\/$/, "");

const encodeCountry = (country) => encodeURIComponent((country || "").trim());

const fetchJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
};

export const getTop10Risk = () =>
  fetchJson(`${BASE}/risk/top10`);

export const getAggregatedForecast = (country) =>
  fetchJson(`${BASE}/forecast/aggregated?country=${encodeCountry(country)}`);

export const getForecastTimeline = (country) =>
  fetchJson(`${BASE}/forecast/timeline?country=${encodeCountry(country)}`);

export const getCountrySummary = (country) =>
  fetchJson(`${BASE}/risk/summary?country=${encodeCountry(country)}`);

export const getFutureHotspots = (year = 2027) =>
  fetchJson(`${BASE}/geo-hotspots?year=${year}`);

export const getFutureRiskAreas = (year = 2027, country = "") => {
  const countryQuery = country ? `&country=${encodeCountry(country)}` : "";
  return fetchJson(`${BASE}/geo-future-areas?year=${year}${countryQuery}`);
};

export const getHistoricalRisk = () =>
  fetchJson(`${BASE}/risk/history`);
