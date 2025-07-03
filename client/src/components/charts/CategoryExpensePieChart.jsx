// src/components/charts/CategoryExpensePieChart.jsx
// import React from 'react';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const CategoryExpensePieChart = ({ labels, data }) => {
//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Expense',
//         data,
//         backgroundColor: [
//           '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F67019',
//           '#FFD700', '#C0C0C0', '#8A2BE2', '#00FA9A'
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   return (
//     <div className="max-w-md mx-auto">
//       <Pie data={chartData} />
//     </div>
//   );
// };

// export default CategoryExpensePieChart;



import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryExpensePieChart = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Expense by Category',
        data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#8E44AD',
          '#2ECC71', '#E67E22', '#1ABC9C', '#F39C12',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle', // 👈 dot legend
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default CategoryExpensePieChart;
