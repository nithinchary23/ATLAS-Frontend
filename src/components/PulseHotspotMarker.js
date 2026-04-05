import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import "../styles/map-markers.css";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function PulseHotspotMarker({
  latitude,
  longitude,
  intensity = 0,
  maxIntensity = 1,
  label,
  children,
  highlighted = false
}) {
  const normalized = maxIntensity > 0 ? intensity / maxIntensity : 0;
  const size = Math.round(14 + clamp(normalized, 0.18, 1) * 16);
  const ringScale = highlighted ? 3.15 : 2.85;
  const ringScaleFar = highlighted ? 3.9 : 3.45;

  const icon = L.divIcon({
    className: "pulse-hotspot-wrapper",
    html: `
      <div
        class="pulse-hotspot ${highlighted ? "is-highlighted" : ""}"
        style="
          --pulse-size:${size}px;
          --pulse-ring-scale:${ringScale};
          --pulse-ring-scale-far:${ringScaleFar};
        "
      >
        <span class="pulse-glow"></span>
        <span class="pulse-aura"></span>
        <span class="pulse-core"></span>
        <span class="pulse-ring pulse-ring-primary"></span>
        <span class="pulse-ring pulse-ring-secondary"></span>
      </div>
    `,
    iconSize: [size * 4, size * 4],
    iconAnchor: [Math.round(size * 2), Math.round(size * 2)]
  });

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      {(label || children) && (
        <Popup>
          {label && <strong>{label}</strong>}
          {label && children ? <br /> : null}
          {children}
        </Popup>
      )}
    </Marker>
  );
}

export default PulseHotspotMarker;
