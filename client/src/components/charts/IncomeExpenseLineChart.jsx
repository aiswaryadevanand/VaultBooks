// import React from 'react';
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   Filler,
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// ChartJS.register(
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   Filler
// );

// const IncomeExpenseLineChart = ({ labels, incomeData, expenseData }) => {
//   const data = {
//     labels,
//     datasets: [
//       {
//         label: 'Income',
//         data: incomeData,
//         borderColor: 'green',
//         backgroundColor: 'rgba(0, 128, 0, 0.1)',
//         tension: 0.4,
//         fill: true,
//       },
//       {
//         label: 'Expense',
//         data: expenseData,
//         borderColor: 'red',
//         backgroundColor: 'rgba(255, 0, 0, 0.1)',
//         tension: 0.4,
//         fill: true,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//     },
//   };

//   return <Line data={data} options={options} />;
// };

// export default IncomeExpenseLineChart;


import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const IncomeExpenseLineChart = ({ labels, incomeData, expenseData }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Expense',
        data: expenseData,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle', // 👈 dot legend
          
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default IncomeExpenseLineChart;
