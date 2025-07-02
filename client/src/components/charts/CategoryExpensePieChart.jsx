// src/components/charts/CategoryExpensePieChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryExpensePieChart = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Expense',
        data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F67019',
          '#FFD700', '#C0C0C0', '#8A2BE2', '#00FA9A'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-md mx-auto">
      <Pie data={chartData} />
    </div>
  );
};

export default CategoryExpensePieChart;
