import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

const Statistics = () => {
  // Sample data for statistics cards
  const stats = [
    { title: 'إجمالي المبيعات السنوية', value: '1,234,567 ريال', change: '+15%', isPositive: true },
    { title: 'متوسط المبيعات الشهرية', value: '102,880 ريال', change: '+8%', isPositive: true },
    { title: 'عدد العملاء النشطين', value: '3,456', change: '+25%', isPositive: true },
    { title: 'معدل تكرار الشراء', value: '65%', change: '+5%', isPositive: true },
    { title: 'نسبة رضا العملاء', value: '94%', change: '+2%', isPositive: true },
    { title: 'معدل إكمال الطلبات', value: '89%', change: '-3%', isPositive: false },
    { title: 'متوسط وقت التسليم', value: '2.5 يوم', change: '-12%', isPositive: true },
    { title: 'نسبة المرتجعات', value: '4.5%', change: '-8%', isPositive: true },
  ];

  const yearlyData = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'المبيعات السنوية',
        data: [800000, 950000, 1100000, 1300000, 1500000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
      },
    ],
  };

  const customerSegmentation = {
    labels: ['عملاء جدد', 'عملاء متكررون', 'عملاء دائمون'],
    datasets: [
      {
        data: [30, 45, 25],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  const monthlyComparison = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: '2023',
        data: [65000, 59000, 80000, 81000, 56000, 95000],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: '2024',
        data: [70000, 62000, 85000, 88000, 61000, 98000],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">تحليل البيانات والإحصائيات</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-orange-500 mb-2">{stat.value}</p>
            <p className={`text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {stat.change}
              <span className="mr-1">{stat.isPositive ? '↑' : '↓'}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">تطور المبيعات السنوية</h3>
          <Line data={yearlyData} options={chartOptions} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">تقسيم العملاء</h3>
          <Pie data={customerSegmentation} options={chartOptions} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">مقارنة المبيعات الشهرية</h3>
          <Bar data={monthlyComparison} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;