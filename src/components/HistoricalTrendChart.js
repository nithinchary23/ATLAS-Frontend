import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

function HistoricalTrendChart({ data = [] }) {
  const cleaned = data
    .map((item) => ({
      country: item.Country,
      victims:
        Number(item.Victims) ||
        Number(item["Reported Victims"]) ||
        Number(item["Total Victims"]) ||
        0
    }))
    .filter((item) => item.country && item.victims > 0)
    .slice(0, 8);

  if (cleaned.length === 0) {
    return (
      <div style={{ color: "#9ca3af", fontSize: "13px" }}>
        No historical data available
      </div>
    );
  }

  return (
    <Line
      data={{
        labels: cleaned.map((item) => item.country),
        datasets: [
          {
            data: cleaned.map((item) => item.victims),
            borderColor: "rgba(255,90,79,0.9)",
            backgroundColor: "rgba(255,90,79,0.18)",
            pointBackgroundColor: "#ff6b5c",
            pointBorderColor: "#ffd9d4",
            pointBorderWidth: 1.5,
            pointRadius: 5,
            pointHoverRadius: 6,
            tension: 0.28,
            fill: false
          }
        ]
      }}
      options={{
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#9ca3af",
              autoSkip: false,
              maxRotation: 18,
              minRotation: 18
            }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#9ca3af",
              callback: (value) => value.toLocaleString()
            }
          }
        },
        maintainAspectRatio: false
      }}
    />
  );
}

export default HistoricalTrendChart;
