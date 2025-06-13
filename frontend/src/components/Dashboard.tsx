import { useState, useEffect, useMemo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
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

// Type definitions
interface ClassicWarehouseItem {
  desan: string;
  desan_count: number;
  total_long: string;
}

interface ChineseWarehouseItem {
  type: string;
  count: number;
  total_long: string;
}

interface ScrapWarehouseItem {
  desan: string;
  desan_count: number;
  total_long: string;
}

interface SalesDataItem {
  period: string;
  total_pieces: number;
  total_meters: number;
  unique_customers?: number;
  unique_products?: number;
  unique_types?: number;
  unique_colors?: number;
}

interface TopProduct {
  type: string;
  color: string;
  total_pieces: number;
  total_meters: number;
  unique_customers: number;
  percentage: number;
}

interface CustomerSales {
  customer: string;
  total_pieces: number;
  total_meters: number;
  unique_products: number;
}

interface OrderItem {
  في_تصنيع: number;
  في_مصبغة: number;
  في_مستودع_الخام: number;
  max_end_date: string;
}

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

const Dashboard = ({ onPageChange, onWarehouseChange, onChineseSalesNavigation, onClassicSalesNavigation }: { 
  onPageChange?: (page: string, filterPeriod?: string) => void;
  onWarehouseChange?: (type: string) => void;
  onChineseSalesNavigation?: (filterPeriod: string) => void;
  onClassicSalesNavigation?: (filterPeriod: string) => void;
}) => {
  // Warehouse data state
  const [warehouseData, setWarehouseData] = useState({
    classic: { total: 0, totalLength: 0, loading: true },
    scrap: { total: 0, totalLength: 0, loading: true },
    chinese: { total: 0, totalLength: 0, loading: true }
  });

  // Orders data state
  const [ordersData, setOrdersData] = useState({
    total: 0,
    inProgress: 0,
    late: 0,
    warehouse: 0,
    loading: true
  });

  // Sales data state
  const [salesData, setSalesData] = useState<{
    main: { total_pieces: number; total_meters: number; unique_customers: number; unique_products: number };
    chinese: { total_pieces: number; total_meters: number; unique_types: number; unique_colors: number };
    combined: { total_pieces: number; total_meters: number };
    monthly: { main: SalesDataItem[]; chinese: SalesDataItem[] };
    loading: boolean;
  }>({
    main: { total_pieces: 0, total_meters: 0, unique_customers: 0, unique_products: 0 },
    chinese: { total_pieces: 0, total_meters: 0, unique_types: 0, unique_colors: 0 },
    combined: { total_pieces: 0, total_meters: 0 },
    monthly: { main: [], chinese: [] },
    loading: true
  });

  // Additional sales statistics states
  const [topMainProducts, setTopMainProducts] = useState<TopProduct[]>([]);
  const [topChineseProducts, setTopChineseProducts] = useState<TopProduct[]>([]);
  const [mainCustomers, setMainCustomers] = useState<CustomerSales[]>([]);
  const [chineseCustomers, setChineseCustomers] = useState<CustomerSales[]>([]);
  const [salesStatsLoading, setSalesStatsLoading] = useState(true);

  // Last 3 months chart data state
  const [last3MonthsData, setLast3MonthsData] = useState<{
    main: SalesDataItem[];
    chinese: SalesDataItem[];
    loading: boolean;
  }>({
    main: [],
    chinese: [],
    loading: true
  });

  // Quick filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('الشهر الماضي');
  
  const filterOptions = useMemo(() => [
    { key: 'يوم أمس', label: 'يوم أمس', period: 'yesterday' },
    { key: 'الأسبوع الماضي', label: 'الأسبوع الماضي', period: 'last_week' },
    { key: 'الشهر الماضي', label: 'الشهر الماضي', period: 'last_month' },
    { key: 'آخر ثلاثة أشهر', label: 'آخر ثلاثة أشهر', period: 'last_3_months' }
  ], []);

  // Map Dashboard filter to ChineseSales filter format
  const mapFilterToChineseSales = (dashboardFilter: string): string => {
    switch (dashboardFilter) {
      case 'يوم أمس':
        return 'yesterday';
      case 'الأسبوع الماضي':
        return 'week';
      case 'الشهر الماضي':
        return 'month';
      case 'آخر ثلاثة أشهر':
        return 'month'; // ChineseSales doesn't have 3 months option, use month as fallback
      default:
        return 'month';
    }
  };

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        // Fetch Classic warehouse data
        const classicResponse = await fetch('http://localhost:5000/api/warehouse/classic');
        const classicData = await classicResponse.json();
        const classicTotal = classicData.success ? 
          classicData.data.reduce((sum: number, item: ClassicWarehouseItem) => sum + (item.desan_count || 0), 0) : 0;
        const classicTotalLength = classicData.success ? 
          classicData.data.reduce((sum: number, item: ClassicWarehouseItem) => {
            const cleanedValue = item.total_long?.replace(/,/g, '') || '0';
            return sum + parseFloat(cleanedValue);
          }, 0) : 0;

        // Fetch Scrap warehouse data
        const scrapResponse = await fetch('http://localhost:5000/api/warehouse/scrap');
        const scrapData = await scrapResponse.json();
        const scrapTotal = scrapData.success ? 
          scrapData.data.reduce((sum: number, item: ScrapWarehouseItem) => sum + (item.desan_count || 0), 0) : 0;
        const scrapTotalLength = scrapData.success ? 
          scrapData.data.reduce((sum: number, item: ScrapWarehouseItem) => {
            const cleanedValue = item.total_long?.replace(/,/g, '') || '0';
            return sum + parseFloat(cleanedValue);
          }, 0) : 0;

        // Fetch Chinese warehouse data
        const chineseResponse = await fetch('http://localhost:5000/api/warehouse/chinese');
        const chineseData = await chineseResponse.json();
        const chineseTotal = chineseData.success ? 
          chineseData.data.reduce((sum: number, item: ChineseWarehouseItem) => sum + (item.count || 0), 0) : 0;
        const chineseTotalLength = chineseData.success ? 
          chineseData.data.reduce((sum: number, item: ChineseWarehouseItem) => {
            const cleanedValue = item.total_long?.replace(/,/g, '') || '0';
            return sum + parseFloat(cleanedValue);
          }, 0) : 0;

        console.log('Warehouse totals:', { classicTotal, scrapTotal, chineseTotal });
        console.log('Warehouse lengths:', { classicTotalLength, scrapTotalLength, chineseTotalLength });

        setWarehouseData({
          classic: { total: classicTotal, totalLength: classicTotalLength, loading: false },
          scrap: { total: scrapTotal, totalLength: scrapTotalLength, loading: false },
          chinese: { total: chineseTotal, totalLength: chineseTotalLength, loading: false }
        });
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
        setWarehouseData({
          classic: { total: 0, totalLength: 0, loading: false },
          scrap: { total: 0, totalLength: 0, loading: false },
          chinese: { total: 0, totalLength: 0, loading: false }
        });
      }
    };

    const fetchOrdersData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/warehouse/orders-in-progress');
        const data = await response.json();
        
        if (data.success) {
          const orders = data.data || [];
          
          // Calculate orders statistics
          const totalOrders = orders.length;
          
          // Check completed orders (manufacturing stages all 0)
          const completedOrders = orders.filter((order: OrderItem) => 
            order.في_تصنيع === 0 && order.في_مصبغة === 0 && order.في_مستودع_الخام === 0
          ).length;
          
          // Check late orders (non-completed orders past due date)
          const currentDate = new Date();
          const lateOrders = orders.filter((order: OrderItem) => {
            const isCompleted = order.في_تصنيع === 0 && order.في_مصبغة === 0 && order.في_مستودع_الخام === 0;
            if (isCompleted) return false;
            
            const endDate = new Date(order.max_end_date);
            return endDate < currentDate;
          }).length;
          
          // Orders in progress (not completed)
          const inProgressOrders = totalOrders - completedOrders;
          
          setOrdersData({
            total: totalOrders,
            inProgress: inProgressOrders,
            late: lateOrders,
            warehouse: completedOrders,
            loading: false
          });
        } else {
          throw new Error(data.error || 'Failed to fetch orders data');
        }
      } catch (error) {
        console.error('Error fetching orders data:', error);
        setOrdersData({
          total: 0,
          inProgress: 0,
          late: 0,
          warehouse: 0,
          loading: false
        });
      }
    };

    // Fetch last 3 months data for the comparison chart
    const fetchLast3MonthsData = async () => {
      try {
        const [mainResponse, chineseResponse] = await Promise.all([
          fetch('http://localhost:5000/api/warehouse/sales/main?period=last_3_months'),
          fetch('http://localhost:5000/api/warehouse/sales/chinese?period=last_3_months')
        ]);

        const [mainData, chineseData] = await Promise.all([
          mainResponse.json(),
          chineseResponse.json()
        ]);

        setLast3MonthsData({
          main: mainData.success ? mainData.data : [],
          chinese: chineseData.success ? chineseData.data : [],
          loading: false
        });

        console.log('📊 Last 3 months data loaded:', {
          main: mainData.success ? mainData.data : [],
          chinese: chineseData.success ? chineseData.data : []
        });
      } catch (error) {
        console.error('Error fetching last 3 months data:', error);
        setLast3MonthsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchWarehouseData();
    fetchOrdersData();
    fetchLast3MonthsData();
  }, []);

  // Effect to refetch sales data when filter changes
  useEffect(() => {
    const fetchSalesData = async (period?: string) => {
      try {
        setSalesStatsLoading(true);
        
        // Get the appropriate period parameter based on selected filter
        const selectedOption = filterOptions.find(opt => opt.key === selectedFilter);
        const apiPeriod = period || selectedOption?.period || 'last_month';
        
        console.log('🔍 Filter changed:', selectedFilter);
        console.log('🔍 Selected option:', selectedOption);
        console.log('🔍 API Period:', apiPeriod);
        
        // Fetch sales summary for selected period
        const summaryResponse = await fetch(`http://localhost:5000/api/warehouse/sales/summary?period=${apiPeriod}`);
        const summaryData = await summaryResponse.json();
        
        console.log('📊 Sales Summary API Response:', summaryData);
        console.log('📊 Summary Data Details:', {
          main: summaryData.data?.main,
          chinese: summaryData.data?.chinese,
          combined: summaryData.data?.combined
        });
        
        // Fetch monthly sales data for charts
        const mainMonthlyResponse = await fetch(`http://localhost:5000/api/warehouse/sales/main?period=${apiPeriod}`);
        const mainMonthlyData = await mainMonthlyResponse.json();
        
        const chineseMonthlyResponse = await fetch(`http://localhost:5000/api/warehouse/sales/chinese?period=${apiPeriod}`);
        const chineseMonthlyData = await chineseMonthlyResponse.json();

        console.log('📈 Monthly API Responses:', {
          main: mainMonthlyData,
          chinese: chineseMonthlyData
        });

        // Fetch top products and customer data for enhanced statistics
        const [mainTopProductsRes, chineseTopProductsRes, mainCustomersRes, chineseCustomersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/warehouse/sales/main/top-products?limit=5&period=${apiPeriod}`),
          fetch(`http://localhost:5000/api/warehouse/sales/chinese/top-products?limit=5&period=${apiPeriod}`),
          fetch(`http://localhost:5000/api/warehouse/sales/main/customers?limit=5&period=${apiPeriod}`),
          fetch(`http://localhost:5000/api/warehouse/sales/chinese/customers?limit=5&period=${apiPeriod}`)
        ]);

        const [mainTopProducts, chineseTopProducts, mainCustomersData, chineseCustomersData] = await Promise.all([
          mainTopProductsRes.json(),
          chineseTopProductsRes.json(),
          mainCustomersRes.json(),
          chineseCustomersRes.json()
        ]);
        
        console.log('🏆 Top Products API Responses:', {
          mainTopProducts,
          chineseTopProducts,
          mainCustomersData,
          chineseCustomersData
        });
        
        if (summaryData.success) {
          const summary = summaryData.data;
          const mainMonthly = mainMonthlyData.success ? mainMonthlyData.data : [];
          const chineseMonthly = chineseMonthlyData.success ? chineseMonthlyData.data : [];
          
          setSalesData({
            main: summary.main,
            chinese: summary.chinese,
            combined: summary.combined,
            monthly: { main: mainMonthly, chinese: chineseMonthly },
            loading: false
          });

          console.log('✅ Sales data updated with:', {
            main: summary.main,
            chinese: summary.chinese,
            combined: summary.combined
          });

          // Set additional sales statistics
          setTopMainProducts(mainTopProducts.success ? mainTopProducts.data : []);
          setTopChineseProducts(chineseTopProducts.success ? chineseTopProducts.data : []);
          setMainCustomers(mainCustomersData.success ? mainCustomersData.data : []);
          setChineseCustomers(chineseCustomersData.success ? chineseCustomersData.data : []);
        } else {
          throw new Error(summaryData.error || 'Failed to fetch sales data');
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData({
          main: { total_pieces: 0, total_meters: 0, unique_customers: 0, unique_products: 0 },
          chinese: { total_pieces: 0, total_meters: 0, unique_types: 0, unique_colors: 0 },
          combined: { total_pieces: 0, total_meters: 0 },
          monthly: { main: [], chinese: [] },
          loading: false
        });
        setTopMainProducts([]);
        setTopChineseProducts([]);
        setMainCustomers([]);
        setChineseCustomers([]);
      } finally {
        setSalesStatsLoading(false);
      }
    };

    // Fetch data when selectedFilter changes
    fetchSalesData();
  }, [selectedFilter, filterOptions]);

  // Dynamic sales chart data based on real data - Last 3 months comparison (Meters)
  const getMonthlyChartData = () => {
    if (last3MonthsData.loading || !last3MonthsData.main || !last3MonthsData.chinese) {
      return {
        labels: ['أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            label: 'الكلاسيك (متر)',
            data: [15000, 18000, 22000],
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
          {
            label: 'الصيني (متر)',
            data: [12000, 14000, 16000],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          },
        ],
      };
    }

    // Create labels from the last 3 months of data
    const mainMonthly = last3MonthsData.main.slice(0, 3);
    const chineseMonthly = last3MonthsData.chinese.slice(0, 3);
    
    // Get unique periods and sort them
    const allPeriods = [...new Set([
      ...mainMonthly.map((item: SalesDataItem) => item.period),
      ...chineseMonthly.map((item: SalesDataItem) => item.period)
    ])].sort().slice(-3);

    const labels = allPeriods.map(period => {
      const [year, month] = period.split('-');
      const monthNumber = parseInt(month);
      
      // Arabic month names
      const arabicMonths = [
        'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
        'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
      ];
      
      return `${arabicMonths[monthNumber - 1]} ${year}`;
    });

    // Map data to periods - using total_meters instead of total_pieces
    const mainData = allPeriods.map(period => {
      const item = mainMonthly.find((d: SalesDataItem) => d.period === period);
      return item ? item.total_meters : 0;
    });

    const chineseData = allPeriods.map(period => {
      const item = chineseMonthly.find((d: SalesDataItem) => d.period === period);
      return item ? item.total_meters : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'الكلاسيك (متر)',
          data: mainData,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'الصيني (متر)',
          data: chineseData,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  const lineChartData = getMonthlyChartData();

  const pieChartData = {
    labels: ['مستودع الكلاسيك', 'مستودع الصيني', 'مستودع السقط'],
    datasets: [
      {
        data: [
          warehouseData.classic.totalLength,
          warehouseData.chinese.totalLength,
          warehouseData.scrap.totalLength
        ],
        backgroundColor: [
          '#FF6384', // Pink for Classic
          '#36A2EB', // Blue for Chinese  
          '#FFCE56'  // Yellow for Scrap
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 10,
      },
    ],
  };

  // Enhanced warehouse statistics
  const warehouseStats = [
    {
      title: 'مستودع الكلاسيك',
      value: warehouseData.classic.loading ? 'جاري التحميل...' : `${warehouseData.classic.totalLength.toLocaleString('en-US', { maximumFractionDigits: 1 })} متر`,
      loading: warehouseData.classic.loading,
      color: 'from-pink-500 to-pink-600',
      icon: '🏪'
    },
    {
      title: 'مستودع الصيني',
      value: warehouseData.chinese.loading ? 'جاري التحميل...' : `${warehouseData.chinese.totalLength.toLocaleString('en-US', { maximumFractionDigits: 1 })} متر`,
      loading: warehouseData.chinese.loading,
      color: 'from-blue-500 to-blue-600',
      icon: '🏭'
    },
    {
      title: 'مستودع السقط',
      value: warehouseData.scrap.loading ? 'جاري التحميل...' : `${warehouseData.scrap.totalLength.toLocaleString('en-US', { maximumFractionDigits: 1 })} متر`,
      loading: warehouseData.scrap.loading,
      color: 'from-yellow-500 to-yellow-600',
      icon: '📦'
    },
    {
      title: 'اجمالي المخزون',
      value: warehouseData.classic.loading || warehouseData.chinese.loading || warehouseData.scrap.loading 
        ? 'جاري التحميل...' 
        : `${(warehouseData.classic.totalLength + warehouseData.chinese.totalLength + warehouseData.scrap.totalLength).toLocaleString('en-US', { maximumFractionDigits: 1 })} متر`,
      loading: warehouseData.classic.loading || warehouseData.chinese.loading || warehouseData.scrap.loading,
      color: 'from-green-500 to-green-600',
      icon: '🎯'
    }
  ];

  // Bar chart for warehouse comparison
  const warehouseBarData = {
    labels: ['مستودع الكلاسيك', 'مستودع الصيني', 'مستودع السقط'],
    datasets: [
      {
        label: 'الأمتار',
        data: [
          warehouseData.classic.totalLength,
          warehouseData.chinese.totalLength,
          warehouseData.scrap.totalLength
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Orders pie chart
  const ordersPieData = {
    labels: ['قيد التنفيذ', 'في المستودع', 'متأخرة'],
    datasets: [
      {
        data: [
          ordersData.inProgress - ordersData.late, // In progress but not late
          ordersData.warehouse,
          ordersData.late
        ],
        backgroundColor: [
          '#36A2EB', // Blue for in progress
          '#4BC0C0', // Teal for warehouse
          '#FF6384'  // Red for late
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 10,
      },
    ],
  };

  // Top products comparison pie chart
  const topProductsData = {
    labels: [...topMainProducts.slice(0, 3).map(p => `${p.type} - ${p.color}`), 
             ...topChineseProducts.slice(0, 3).map(p => `${p.type} - ${p.color}`)],
    datasets: [
      {
        data: [...topMainProducts.slice(0, 3).map(p => p.total_pieces), 
               ...topChineseProducts.slice(0, 3).map(p => p.total_pieces)],
        backgroundColor: [
          '#FF6B35', '#F7931E', '#FFD23F', // Main products colors
          '#06FFA5', '#118AB2', '#073B4C'  // Chinese products colors
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8,
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
            size: 14,
            family: 'Arial',
          },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Enhanced chart options for monthly comparison
  const monthlyComparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            size: 14,
            family: 'Arial',
          },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: number | string) {
            return Number(value).toLocaleString('en-US');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: true,
        labels: {
          font: {
            size: 14,
            family: 'Arial',
          },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  // Navigation handler for warehouse boxes
  const handleWarehouseBoxClick = (index: number) => {
    if (onPageChange && onWarehouseChange) {
      switch (index) {
        case 0: // مستودع الكلاسيك
          onPageChange('warehouse');
          onWarehouseChange('classic');
          break;
        case 1: // مستودع الصيني
          onPageChange('warehouse');
          onWarehouseChange('chinese');
          break;
        case 2: // مستودع السقط
          onPageChange('warehouse');
          onWarehouseChange('scrap');
          break;
        case 3: // اجمالي المخزون (no navigation)
          break;
        default:
          break;
      }
    }
  };

  // Function to map Dashboard filter values to Sales component filter values
  const mapDashboardFilterToSalesFilter = (dashboardFilter: string): string => {
    const filterMapping: { [key: string]: string } = {
      'يوم أمس': 'yesterday',
      'الأسبوع الماضي': 'week',
      'الشهر الماضي': 'month',
      'آخر ثلاثة أشهر': 'month' // Default to month since sales components don't have 3-month option
    };
    
    return filterMapping[dashboardFilter] || 'month';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* QUICK FILTER */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-800">⚡</span>
              <h3 className="text-lg font-semibold text-gray-800">فلتره سريعة:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedFilter(option.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === option.key
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  {option.label}
                  {selectedFilter === option.key && (
                    <span className="mr-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* � SALES SECTION */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 إحصائيات المبيعات الشاملة ({selectedFilter})</h2>
        
        {/* Main Sales Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => {
              const mappedFilter = mapDashboardFilterToSalesFilter(selectedFilter);
              if (onClassicSalesNavigation) {
                onClassicSalesNavigation(mappedFilter);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">مبيعات الكلاسيك</h3>
                <p className="text-xs opacity-70 mb-1">{selectedFilter}</p>
                {salesData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold">{salesData.main.total_pieces.toLocaleString('en-US')}</p>
                    <p className="text-sm opacity-80">{salesData.main.total_meters.toLocaleString('en-US')} متر</p>
                  </>
                )}
              </div>
              <div className="text-4xl">🏭</div>
            </div>
          </div>

          <div 
            className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onChineseSalesNavigation && onChineseSalesNavigation(mapFilterToChineseSales(selectedFilter))}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">مبيعات الصيني</h3>
                <p className="text-xs opacity-70 mb-1">{selectedFilter}</p>
                {salesData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold">{salesData.chinese.total_pieces.toLocaleString('en-US')}</p>
                    <p className="text-sm opacity-80">{salesData.chinese.total_meters.toLocaleString('en-US')} متر</p>
                  </>
                )}
              </div>
              <div className="text-4xl">🏮</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">إجمالي المبيعات</h3>
                <p className="text-xs opacity-70 mb-1">{selectedFilter}</p>
                {salesData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold">{salesData.combined.total_pieces.toLocaleString('en-US')}</p>
                    <p className="text-sm opacity-80">{salesData.combined.total_meters.toLocaleString('en-US')} متر</p>
                  </>
                )}
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Top Products and Customers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Main Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🏆 أفضل منتجات الكلاسيك ({selectedFilter})
            </h3>
            {salesStatsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {topMainProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-800">{product.type} - {product.color}</p>
                        <p className="text-sm text-gray-600">{product.total_pieces} توب • {product.total_meters.toLocaleString('en-US')} متر</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{product.percentage}%</p>
                      <p className="text-xs text-gray-500">{product.unique_customers} زبون</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Chinese Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🏆 أفضل انواع الصيني ({selectedFilter})
            </h3>
            {salesStatsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {topChineseProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-800">{product.type} - {product.color}</p>
                        <p className="text-sm text-gray-600">{product.total_pieces} توب • {product.total_meters.toLocaleString('en-US')} متر</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">{product.percentage}%</p>
                      <p className="text-xs text-gray-500">{product.unique_customers} زبون</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Main Customers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🌟 أكبر زبائن الكلاسيك ({selectedFilter})
            </h3>
            {salesStatsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {mainCustomers.slice(0, 3).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                        {customer.customer.charAt(0)}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-800">{customer.customer}</p>
                        <p className="text-sm text-gray-600">{customer.unique_products} دسان مختلف</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{customer.total_meters.toLocaleString('en-US')} متر</p>
                      <p className="text-xs text-gray-500">{customer.total_pieces} توب</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Chinese Customers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🌟 أكبر زبائن الصيني ({selectedFilter})
            </h3>
            {salesStatsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {chineseCustomers.slice(0, 3).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                        {customer.customer.charAt(0)}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-800">{customer.customer}</p>
                        <p className="text-sm text-gray-600">{customer.unique_products} نوع مختلف</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">{customer.total_meters.toLocaleString('en-US')} متر</p>
                      <p className="text-xs text-gray-500">{customer.total_pieces} توب</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">أفضل المنتجات مبيعاً ({selectedFilter})</h3>
            <Pie data={topProductsData} options={pieChartOptions} />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">مقارنة الأمتار - آخر 3 أشهر</h3>
            <Bar data={lineChartData} options={monthlyComparisonOptions} />
          </div>
        </div>
      </div>

      {/* �📦 WAREHOUSE SECTION */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📦 إحصائيات المستودعات</h2>
        
        {/* Warehouse Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {warehouseStats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 ${index < 3 ? 'cursor-pointer' : ''}`}
              onClick={() => index < 3 && handleWarehouseBoxClick(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                  {stat.loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                      <span className="text-sm">جاري التحميل...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Warehouse Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">توزيع الأمتار حسب المستودع</h3>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">مقارنة الأمتار بين المستودعات</h3>
            <Bar data={warehouseBarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 📋 ORDERS SECTION */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📋 إحصائيات الطلبيات</h2>
        
        {/* Orders Statistics Cards */}
        {/* Orders Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onPageChange && onPageChange('orders-in-progress')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">إجمالي الطلبيات</h3>
                {ordersData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{ordersData.total.toLocaleString('en-US')}</p>
                )}
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div 
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onPageChange && onPageChange('orders-in-progress')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">قيد التنفيذ</h3>
                {ordersData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{ordersData.inProgress.toLocaleString('en-US')}</p>
                )}
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>

          <div 
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onPageChange && onPageChange('orders-late')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">متأخرة</h3>
                {ordersData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{ordersData.late.toLocaleString('en-US')}</p>
                )}
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onPageChange && onPageChange('orders-warehouse')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">في المستودع</h3>
                {ordersData.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{ordersData.warehouse.toLocaleString('en-US')}</p>
                )}
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
        </div>

        {/* Orders Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">توزيع الطلبيات حسب الحالة</h3>
            <Pie data={ordersPieData} options={pieChartOptions} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">إحصائيات الطلبيات التفصيلية</h3>
            <Bar 
              data={{
                labels: ['إجمالي الطلبيات', 'قيد التنفيذ', 'متأخرة', 'في المستودع'],
                datasets: [
                  {
                    label: 'عدد الطلبيات',
                    data: [ordersData.total, ordersData.inProgress, ordersData.late, ordersData.warehouse],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',  // Blue for total
                      'rgba(249, 115, 22, 0.8)',  // Orange for in progress
                      'rgba(239, 68, 68, 0.8)',   // Red for late
                      'rgba(34, 197, 94, 0.8)'    // Green for warehouse
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(249, 115, 22, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    rtl: true,
                    bodyAlign: 'right',
                    titleAlign: 'right',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      callback: function(value: number | string) {
                        return Number(value).toLocaleString('en-US');
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;