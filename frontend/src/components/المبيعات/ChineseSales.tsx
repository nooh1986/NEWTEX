import React, { useState, useEffect, useCallback } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

interface SalesSummary {
  total_pieces: number;
  total_meters: number;
}

interface TopProduct {
  type: string;
  color: string;
  total_pieces: number;
  total_meters: number;
  unique_customers?: number;
  percentage?: number;
}

interface DetailedSalesItem {
  number: string;
  type: string;
  color: string;
  length: number;
  customer: string;
  date: string;
}

interface CustomerSalesData {
  customer: string;
  total_pieces: number;
  total_meters: number;
  unique_products: number;
}

interface ChineseSalesProps {
  initialFilterPeriod?: string;
}

const ChineseSales: React.FC<ChineseSalesProps> = ({ initialFilterPeriod = 'month' }) => {  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    total_pieces: 0,
    total_meters: 0
  });  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customerSales, setCustomerSales] = useState<CustomerSalesData[]>([]);
  const [detailedSales, setDetailedSales] = useState<DetailedSalesItem[]>([]);
  const [showDetailed, setShowDetailed] = useState(false);  const [loading, setLoading] = useState(true);  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState(initialFilterPeriod); // Use initial filter period
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isUsingCustomDate, setIsUsingCustomDate] = useState(false);  const fetchDetailedSales = useCallback(async () => {
    try {
      let queryParams = 'limit=50&type=chinese';
      
      if (isUsingCustomDate && startDate && endDate) {
        queryParams += `&start_date=${startDate}&end_date=${endDate}`;
      } else {
        queryParams += `&period=${dateFilter}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/sales/chinese/detailed?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch detailed sales data');
      }
      const data = await response.json();
      if (data.success) {
        setDetailedSales(data.data);
      }
    } catch (err) {
      console.error('Error fetching detailed sales:', err);
    }
  }, [dateFilter, isUsingCustomDate, startDate, endDate]);

  const API_BASE_URL = 'http://localhost:5000/api/warehouse';  const fetchSalesData = useCallback(async (useCustomDates = false) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      let queryParams = `type=chinese`;
      
      if (useCustomDates && startDate && endDate) {
        queryParams += `&start_date=${startDate}&end_date=${endDate}`;
      } else {
        queryParams += `&period=${dateFilter}`;
      }

      // Fetch sales summary for Chinese products with period filter
      const summaryResponse = await fetch(`${API_BASE_URL}/sales/summary?${queryParams}`);
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch sales summary');
      }
      const summaryData = await summaryResponse.json();

      if (summaryData.success) {
        setSalesSummary(summaryData.data.chinese);
      }      // Fetch top Chinese products using the dedicated Chinese endpoint with period filter
      const productsResponse = await fetch(`${API_BASE_URL}/sales/chinese/top-products?limit=10&${queryParams}`);
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch top products');
      }
      const productsData = await productsResponse.json();
      if (productsData.success) {
        setTopProducts(productsData.data || []);
      }

      // Fetch customer sales data
      const customerResponse = await fetch(`${API_BASE_URL}/sales/chinese/customers?limit=10&${queryParams}`);
      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer sales data');
      }
      const customerData = await customerResponse.json();
      if (customerData.success) {
        setCustomerSales(customerData.data || []);
      }

      // Clear detailed sales data when date filter changes
      setDetailedSales([]);
      setShowDetailed(false);

    } catch (err) {
      console.error('Error fetching Chinese sales data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }  }, [dateFilter, startDate, endDate]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Prepare chart data
  const getPieChartData = () => {
    if (!topProducts || topProducts.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const colors = [
      '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C',
      '#FF9F40', '#36A2EB', '#4BC0C0', '#9966FF', '#FF6384', '#C9CBCF'
    ];

    return {
      labels: topProducts.map(product => `${product.type} - ${product.color}`),
      datasets: [
        {
          data: topProducts.map(product => product.total_pieces),
          backgroundColor: colors.slice(0, topProducts.length),
          borderColor: colors.slice(0, topProducts.length),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };  };
  // Prepare bar chart data for customer analysis
  const getBarChartData = () => {
    if (!customerSales || customerSales.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: customerSales.slice(0, 6).map(customer => customer.customer || 'غير محدد'),
      datasets: [
        {
          label: 'إجمالي الأمتار',
          data: customerSales.slice(0, 6).map(customer => customer.total_meters),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
        {
          label: 'عدد القطع',
          data: customerSales.slice(0, 6).map(customer => customer.total_pieces),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: true,
        labels: {
          font: {
            size: 12,
            family: 'Arial',
          },
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            size: 12,
            family: 'Arial',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="mr-3 text-lg">جاري تحميل بيانات المبيعات الصينية...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
        <div className="flex">
          <div className="mr-3">
            <h3 className="text-sm font-medium text-red-800">
              خطأ في تحميل البيانات
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>            <div className="mt-4">
              <button
                onClick={() => fetchSalesData()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">مبيعات الصيني</h1>
      </div>      {/* Combined Date Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Quick Date Filter - Top on mobile, Right on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 order-2 lg:order-1">
            <h3 className="text-lg font-semibold text-gray-800 text-center sm:text-right">فلترة سريعة:</h3>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-gray-600">📅</span>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setIsUsingCustomDate(false);
                  setDetailedSales([]);
                  setShowDetailed(false);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0 flex-1 sm:flex-none"
              >
                <option value="yesterday">يوم الامس</option>
                <option value="week">الاسبوع</option>
                <option value="month">الشهر الماضي</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Search - Bottom on mobile, Left on desktop */}
          <div className="flex flex-col gap-3 order-1 lg:order-2">
            <h3 className="text-lg font-semibold text-gray-800 text-center sm:text-right">بحث بتاريخ مخصص:</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 text-center sm:text-right whitespace-nowrap">من:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 text-center sm:text-right whitespace-nowrap">إلى:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              <button
                onClick={() => {
                  if (startDate && endDate) {
                    setIsUsingCustomDate(true);
                    setDetailedSales([]);
                    setShowDetailed(false);
                    fetchSalesData(true);
                  }
                }}
                disabled={!startDate || !endDate}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto whitespace-nowrap"
              >
                بحث
              </button>
            </div>
          </div>
        </div>
      </div>{/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">إجمالي الاتواب</h3>
              <p className="text-3xl font-bold">{formatNumber(salesSummary.total_pieces)}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">إجمالي الأمتار</h3>
              <p className="text-3xl font-bold">{formatNumber(salesSummary.total_meters)}</p>
            </div>
            <div className="text-4xl">📏</div>
          </div>
        </div>
      </div>      {/* Charts Section - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">        {/* Customer Analysis Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center sm:text-right">أكبر الزبائن في المبيعات</h2>
          <div className="h-64 sm:h-80">
            <Bar data={getBarChartData()} options={barChartOptions} />
          </div>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">أفضل الانواع مبيعاً</h2>
          <div className="h-64 sm:h-80 flex justify-center">
            <Pie data={getPieChartData()} options={pieChartOptions} />
          </div>
        </div>
      </div>      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-gray-900 text-center sm:text-right">أفضل الانواع مبيعاً - تفصيلي</h2>
          <button
            onClick={() => {
              setShowDetailed(!showDetailed);
              if (!showDetailed && detailedSales.length === 0) {
                fetchDetailedSales();
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto whitespace-nowrap"
          >
            {showDetailed ? 'إخفاء التفاصيل' : 'عرض المبيعات التفصيلية'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اللون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد القطع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد الأمتار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الزبائن
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النسبة المئوية
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(product.total_pieces)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(product.total_meters)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(product.unique_customers || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${product.percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{product.percentage || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    لا توجد بيانات متاحة
                  </td>
                </tr>
              )}            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Sales Data Table */}
      {showDetailed && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            المبيعات التفصيلية
          </h2>          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرقم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اللون
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الطول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailedSales.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.color}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.length)} متر
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.customer}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
                {detailedSales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      لا توجد بيانات متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChineseSales;
