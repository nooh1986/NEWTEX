import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface OrderInProgress {
  customer: string;
  customer_number: string;
  customer_name: string;
  invoice: string | null;
  في_مستودع: number;
  في_تصنيع: number;
  في_مصبغة: number;
  في_مستودع_الخام: number;
  مشحون: number;
  totals: number;
  max_end_date: string;
}

interface OrdersInProgressTableProps {
  title: string;
  onRowClick?: (orderNum: string) => void;
}

const OrdersInProgressTable: React.FC<OrdersInProgressTableProps> = ({ title, onRowClick }) => {
  const [orders, setOrders] = useState<OrderInProgress[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderInProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Helper function to check if order is completed (all manufacturing stages are 0)
  const isOrderCompleted = (order: OrderInProgress): boolean => {
    return order.في_تصنيع === 0 && order.في_مصبغة === 0 && order.في_مستودع_الخام === 0;
  };

  // Helper function to check if date is late (only for non-completed orders)
  const isDateLate = (dateString: string, order: OrderInProgress): boolean => {
    if (!dateString || isOrderCompleted(order)) return false;
    const today = new Date();
    const orderDate = new Date(dateString);
    return orderDate < today;
  };
  // Helper function to format late date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    return dateString;
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);  // Filter orders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      console.log('Searching for:', searchTerm); // Debug log
      const filtered = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        
        // Convert all searchable fields to strings safely
        const customerStr = order.customer ? String(order.customer).toLowerCase() : '';
        const customerNameStr = order.customer_name ? String(order.customer_name).toLowerCase() : '';
        const customerNumberStr = order.customer_number ? String(order.customer_number) : '';
        const invoiceStr = order.invoice ? String(order.invoice).toLowerCase() : '';
        
        const matches = customerStr.includes(searchLower) || 
                       customerNameStr.includes(searchLower) || 
                       customerNumberStr.includes(searchTerm) || 
                       invoiceStr.includes(searchLower);
        
        if (matches) {
          console.log('Match found:', { 
            customer: order.customer, 
            customer_name: order.customer_name, 
            customer_number: order.customer_number, 
            invoice: order.invoice,
            searchTerm: searchTerm,
            invoiceStr: invoiceStr
          }); // Debug log
        }
        return matches;
      });
      setFilteredOrders(filtered);
    }
  }, [orders, searchTerm]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/warehouse/orders-in-progress');
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const data = await response.json();
      if (data.success) {
        console.log('Orders In Progress Data Sample:', data.data.slice(0, 2)); // Debug log
        setOrders(data.data || []);
        setFilteredOrders(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch orders data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };  // Calculate summary statistics
  const totalOrders = filteredOrders.length;
  const totalCustomers = new Set(filteredOrders.map(order => order.customer_name)).size;
  const totalWarehouse = filteredOrders.reduce((sum, order) => sum + order.في_مستودع, 0);
  const totalManufacturing = filteredOrders.reduce((sum, order) => sum + order.في_تصنيع, 0);
  const totalDyeing = filteredOrders.reduce((sum, order) => sum + order.في_مصبغة, 0);
  const totalRawWarehouse = filteredOrders.reduce((sum, order) => sum + order.في_مستودع_الخام, 0);
  const totalShipped = filteredOrders.reduce((sum, order) => sum + order.مشحون, 0);
  const grandTotal = filteredOrders.reduce((sum, order) => sum + order.totals, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>خطأ في تحميل البيانات: {error}</p>
            <button 
              onClick={fetchOrdersData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>        {/* Search and Refresh */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="البحث عن طلبية (اسم الزبون رقم الزبون، رقم الفاتورة)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>        {/* Summary Cards */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8 min-w-max">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {totalOrders.toLocaleString('en-US')}
              </div>
              <div className="text-blue-600 font-semibold text-sm">
                إجمالي الطلبيات
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-lg border border-cyan-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-cyan-700 mb-1">
                {totalCustomers.toLocaleString('en-US')}
              </div>
              <div className="text-cyan-600 font-semibold text-sm">
                الزبائن
              </div>
            </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {totalWarehouse.toLocaleString('en-US')}
            </div>
            <div className="text-green-600 font-semibold text-sm">
              في المستودع
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg border border-orange-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {totalManufacturing.toLocaleString('en-US')}
            </div>
            <div className="text-orange-600 font-semibold text-sm">
              في التصنيع
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {totalDyeing.toLocaleString('en-US')}
            </div>
            <div className="text-purple-600 font-semibold text-sm">
              في المصبغة
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg border border-yellow-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-yellow-700 mb-1">
              {totalRawWarehouse.toLocaleString('en-US')}
            </div>
            <div className="text-yellow-600 font-semibold text-sm">
              مستودع الخام
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg border border-indigo-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-indigo-700 mb-1">
              {totalShipped.toLocaleString('en-US')}
            </div>
            <div className="text-indigo-600 font-semibold text-sm">
              المشحونة
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg border border-red-200 p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-red-700 mb-1">
              {grandTotal.toLocaleString('en-US')}
            </div>            <div className="text-red-600 font-semibold text-sm">
              إجمالي الاتواب
            </div>
          </div>
        </div>
        </div>

        {/* Search Results Summary */}
        {searchTerm.trim() && (
          <div className="text-center text-sm text-gray-500 mb-4">
            عرض {filteredOrders.length} من أصل {orders.length} طلبية
          </div>
        )}        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      اسم الزبون
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      رقم الطلبية
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      فاتورة
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      مستودع
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      تصنيع
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      مصبغة
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      مستودع الخام
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      مشحون
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      المجموع
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      آخر تاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلبيات قيد التنفيذ'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {searchTerm ? 'جرب البحث بكلمة أخرى' : 'تحقق من قاعدة البيانات'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr 
                      key={index}
                      onClick={() => onRowClick?.(order.customer)}
                      className={`transition-all duration-200 cursor-pointer ${
                        isOrderCompleted(order)
                          ? 'bg-green-50 hover:bg-green-100 border-green-200'
                          : isDateLate(order.max_end_date, order)
                          ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                          : 'hover:bg-blue-50 hover:shadow-md'
                      }`}
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.customer_name}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {order.customer}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-600">
                          {order.invoice || 'غير محدد'}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-green-600">
                          {order.في_مستودع.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-orange-600">
                          {order.في_تصنيع.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-purple-600">
                          {order.في_مصبغة.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-yellow-600">
                          {order.في_مستودع_الخام.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-indigo-600">
                          {order.مشحون.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-red-600">
                          {order.totals.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className={`text-xs font-medium ${
                          isOrderCompleted(order) 
                            ? 'text-green-600 font-bold' 
                            : isDateLate(order.max_end_date, order) 
                            ? 'text-red-600 font-bold' 
                            : 'text-gray-600'
                        }`}>
                          {formatDate(order.max_end_date)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersInProgressTable;
