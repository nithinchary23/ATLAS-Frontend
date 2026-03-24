import { render, screen, waitFor } from "@testing-library/react";

import App from "./App";

jest.mock("./components/HotspotMap", () => () => <div>Hotspot Map Mock</div>);
jest.mock("./components/Top10BarChart", () => () => <div>Top10 Chart Mock</div>);
jest.mock("./components/HistoricalTrendChart", () => () => <div>History Chart Mock</div>);
jest.mock("./components/ForecastLineChart", () => () => <div>Forecast Chart Mock</div>);
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div>Tile Layer Mock</div>,
  Circle: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({
    invalidateSize: jest.fn(),
    fitBounds: jest.fn(),
    setView: jest.fn(),
    getContainer: () => ({})
  }),
}));

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("dashboard renders loaded data", async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes("/risk/top10")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ Country: "India", "Predicted Victims": 1000 }]),
      });
    }
    if (url.includes("/geo-hotspots")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ country: "India", latitude: 10, longitude: 20, risk_score: 1000 }]),
      });
    }
    if (url.includes("/risk/history")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ Country: "India", Victims: 500, Latitude: 10, Longitude: 20 }]),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  render(<App />);

  expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();

  await waitFor(() =>
    expect(screen.getByText(/Global Trafficking Risk Dashboard/i)).toBeInTheDocument()
  );
});

test("dashboard renders error state when api fails", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: { message: "Backend unavailable" } }),
    })
  );

  render(<App />);

  await waitFor(() =>
    expect(screen.getByText(/Dashboard unavailable/i)).toBeInTheDocument()
  );
  expect(screen.getByText(/Backend unavailable/i)).toBeInTheDocument();
});
