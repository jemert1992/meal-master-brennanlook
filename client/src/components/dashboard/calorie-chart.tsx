import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CalorieChartProps {
  dailyData?: {
    day: string;
    calories: number;
    goal: number;
  }[];
  className?: string;
}

const defaultData = [
  { day: 'Mon', calories: 2000, goal: 2100 },
  { day: 'Tue', calories: 1800, goal: 2100 },
  { day: 'Wed', calories: 2200, goal: 2100 },
  { day: 'Thu', calories: 1900, goal: 2100 },
  { day: 'Fri', calories: 2100, goal: 2100 },
  { day: 'Sat', calories: 2300, goal: 2100 },
  { day: 'Sun', calories: 1750, goal: 2100 },
];

export default function CalorieChart({ dailyData = defaultData, className }: CalorieChartProps) {
  const chartData = {
    labels: dailyData.map(item => item.day),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Calories',
        data: dailyData.map(item => item.calories),
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        type: 'line' as const,
        label: 'Goal',
        data: dailyData.map(item => item.goal),
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 4,
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
      }
    ],
  };

  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Calorie Trend',
        font: {
          family: "'Poppins', sans-serif",
          size: 16,
          weight: 'bold',
        },
        color: '#4f4f4f',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: 'rgba(200, 200, 200, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} calories`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    transitions: {
      active: {
        animation: {
          duration: 300
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className={`relative p-4 bg-white rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="h-[300px]">
        <Chart options={chartOptions} data={chartData} type="bar" />
      </div>
    </div>
  );
}