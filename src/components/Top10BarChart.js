import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

function Top10BarChart({ data }) {
  if (!data || data.length === 0) return null;

  const cleaned = data.slice(0, 8);

  return (
    <Bar
      data={{
        labels: cleaned.map((item) => item.Country),
        datasets: [
          {
            data: cleaned.map((item) => item["Predicted Victims"]),
            backgroundColor: [
              "#ff6b57",
              "#f45449",
              "#ef4444",
              "#e64141",
              "#dc3d3d",
              "#d33737",
              "#c93131",
              "#bf2c2c"
            ],
            borderRadius: 999,
            borderSkipped: false,
            barThickness: 18,
            categoryPercentage: 0.72,
            barPercentage: 0.9
          }
        ]
      }}
      options={{
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.raw.toLocaleString()
            }
          }
        },
        layout: {
          padding: {
            top: 4,
            right: 10,
            bottom: 4,
            left: 6
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#9ca3af",
              callback: (value) => value.toLocaleString(),
              maxTicksLimit: 5
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "#cfd8e3",
              font: {
                size: 12
              }
            }
          }
        },
        maintainAspectRatio: false
      }}
    />
  );
}

export default Top10BarChart;
