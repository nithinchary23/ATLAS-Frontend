export const SETTINGS_KEY = "atlas_settings";

export const DEFAULT_SETTINGS = {
  forecastYear: "2027",
  countryProfile: "India",
  showHistoricalContext: true,
  showHotspotLabels: true,
  reportFormat: "Executive Brief",
  alertMode: "Balanced"
};

export function loadSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
