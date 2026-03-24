import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);

function ForecastLineChart({ data }) {
  const cleaned = Array.isArray(data)
    ? data
        .map((item) => ({
          year: Number(item.Year ?? item["Forecast Year"]),
          victims: Number(
            item.Victims ?? item["Predicted Victims"] ?? item.PredictedVictims ?? 0
          ),
          type: item.Type ?? "Forecast"
        }))
        .filter((item) => Number.isFinite(item.year) && Number.isFinite(item.victims))
        .sort((a, b) => a.year - b.year)
    : [];

  if (cleaned.length === 0) {
    return (
      <div style={{ padding: "20px", color: "#9ca3af" }}>
        No future risk data available
      </div>
    );
  }

  const years = cleaned.map((item) => item.year);
  const victims = cleaned.map((item) => item.victims);
  const minVictims = Math.min(...victims);
  const maxVictims = Math.max(...victims);
  const padding = Math.max(100, Math.ceil((maxVictims - minVictims) * 0.2));
  const pointColors = cleaned.map((item) =>
    item.type === "Historical" ? "#60a5fa" : "#ff4d4d"
  );

  return (
    <div
      style={{
        height: "360px",
        marginTop: "20px",
        padding: "16px",
        background: "linear-gradient(145deg, #0f2238, #081424)",
        borderRadius: "16px"
      }}
    >
      <Line
        data={{
          labels: years,
          datasets: [
            {
              label: "Forecast Victims",
              data: victims,
              borderColor: "#ff4d4d",
              backgroundColor: "rgba(255,77,77,0.25)",
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: pointColors,
              segment: {
                borderColor: (ctx) => {
                  const current = cleaned[ctx.p0DataIndex]?.type;
                  const next = cleaned[ctx.p1DataIndex]?.type;
                  return current === "Historical" && next === "Historical"
                    ? "#60a5fa"
                    : "#ff4d4d";
                }
              }
            }
          ]
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: "#cfd8e3" }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} victims`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: "#9ca3af" },
              grid: { display: false }
            },
            y: {
              beginAtZero: false,
              suggestedMin: Math.max(0, minVictims - padding),
              suggestedMax: maxVictims + padding,
              ticks: {
                color: "#9ca3af",
                callback: (value) => value.toLocaleString()
              },
              grid: {
                color: "rgba(255,255,255,0.06)"
              }
            }
          }
        }}
      />
    </div>
  );
}

export default ForecastLineChart;
