import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Example data (replace this with API response if needed)
const exampleBookings = [
  { status: "pending" },
  { status: "accepted" },
  { status: "completed" },
  { status: "pending" },
  { status: "rejected" },
  { status: "accepted" },
  { status: "completed" },
  { status: "pending" },
];

const statusColors = {
  rejected: "red",
  accepted: "green",
  completed: "blue",
  pending: "orange",
};

const OrderChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const counts = exampleBookings.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const backgroundColor = labels.map((status) => statusColors[status] || "gray");

    setChartData({
      labels,
      datasets: [
        {
          label: "Orders",
          data,
          backgroundColor,
          borderWidth: 1,
        },
      ],
    });
  }, []);

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Orders by Status</h3>
      <Pie data={chartData} />
    </div>
  );
};

export default OrderChart;
