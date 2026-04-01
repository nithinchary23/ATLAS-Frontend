import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map-markers.css";

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
        const scale = Math.max(0.45, Math.min(1.25, riskValue / maxRisk));
        const size = Math.round(18 + scale * 18);

        const icon = L.divIcon({
          className: "pulse-hotspot-wrapper",
          html: `
            <div class="pulse-hotspot" style="--pulse-size:${size}px;">
              <span class="pulse-ring"></span>
              <span class="pulse-core"></span>
            </div>
          `,
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size]
        });

        return (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            icon={icon}
          />
        );
      })}
    </MapContainer>
  );
}

export default HotspotMap;
