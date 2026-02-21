import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Example data (replace with API data if needed)
const exampleBookings = [
  { createdAt: "2025-01-15T10:00:00Z" },
  { createdAt: "2025-01-20T12:30:00Z" },
  { createdAt: "2025-02-05T09:00:00Z" },
  { createdAt: "2025-02-10T14:00:00Z" },
  { createdAt: "2025-03-01T11:00:00Z" },
  { createdAt: "2025-03-15T16:00:00Z" },
  { createdAt: "2025-03-20T08:00:00Z" },
];

const OrderBarChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Initialize month counts
    const monthCounts = Array(12).fill(0);

    // Count bookings per month
    exampleBookings.forEach((booking) => {
      const month = new Date(booking.createdAt).getMonth(); // 0 = Jan, 11 = Dec
      monthCounts[month] += 1;
    });

    setChartData({
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      datasets: [
        {
          label: "Orders per Month",
          data: monthCounts,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, []);

  return (
    <div style={{ maxWidth: "700px" }}>
      <h3 style={{ textAlign: "center" }}>Monthly Orders</h3>
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
    </div>
  );
};

export default OrderBarChart;
