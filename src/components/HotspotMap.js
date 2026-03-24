import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
    >
      <ResizeMap />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {validHotspots.map((point, index) => (
        <CircleMarker
          key={index}
          center={[point.lat, point.lng]}
          radius={8}
          pathOptions={{
            color: "#ff3b3b",
            fillColor: "#ff3b3b",
            weight: 2,
            fillOpacity: 0.38
          }}
        />
      ))}
    </MapContainer>
  );
}

export default HotspotMap;
