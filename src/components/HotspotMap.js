import { useEffect } from "react";
import { MapContainer, useMap, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PulseHotspotMarker from "./PulseHotspotMarker";

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const invalidate = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    const initialTimer = setTimeout(invalidate, 150);

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });

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

function HotspotMap({ data }) {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const validHotspots = rows
    .map((d) => {
      const lat = Number(
        d.Latitude ??
        d.lat ??
        d.latitude ??
        d.centroid_lat ??
        d.y
      );

      const lng = Number(
        d.Longitude ??
        d.lng ??
        d.lon ??
        d.longitude ??
        d.centroid_lon ??
        d.x
      );

      return { ...d, lat, lng };
    })
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

  const maxRisk = Math.max(
    ...validHotspots.map((point) =>
      Number(
        point.risk_score ??
        point["Predicted Victims"] ??
        point.predicted_victims ??
        0
      )
    ),
    1
  );

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
    >
      <ResizeMap />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {validHotspots.map((point, index) => {
        const riskValue = Number(
          point.risk_score ??
          point["Predicted Victims"] ??
          point.predicted_victims ??
          0
        );
        return (
          <PulseHotspotMarker
            key={index}
            latitude={point.lat}
            longitude={point.lng}
            intensity={riskValue}
            maxIntensity={maxRisk}
            label={point.Country || point.country}
          >
            Predicted risk: {riskValue.toLocaleString()}
          </PulseHotspotMarker>
        );
      })}
    </MapContainer>
  );
}

export default HotspotMap;
