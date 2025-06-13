import React, { useState, useEffect, useCallback } from 'react';
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

interface ReadyOrdersTableProps {
  onRowClick?: (orderNum: string) => void;
}

const ReadyOrdersTable: React.FC<ReadyOrdersTableProps> = ({ onRowClick }) => {
  const [orders, setOrders] = useState<OrderInProgress[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderInProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to check if order is ready (all manufacturing stages are 0, only warehouse items remain)
  const isOrderReady = useCallback((order: OrderInProgress): boolean => {
    return order.في_تصنيع === 0 && order.في_مصبغة === 0 && order.في_مستودع_الخام === 0 && order.في_مستودع > 0;
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    return dateString;
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  // Filter orders based on search term and only show ready orders
  useEffect(() => {
    let filtered = orders.filter(order => isOrderReady(order));

    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm); // Debug log
      filtered = filtered.filter(order => {
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
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, isOrderReady]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/warehouse/orders/ready');
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Ready Orders Data Sample:', data.data.slice(0, 2)); // Debug log
        setOrders(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch orders data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  // Calculate summary statistics for ready orders only
  const totalOrders = filteredOrders.length;
  const totalCustomers = new Set(filteredOrders.map(order => order.customer_name)).size;
  const totalWarehouse = filteredOrders.reduce((sum, order) => sum + order.في_مستودع, 0);
  const totalShipped = filteredOrders.reduce((sum, order) => sum + order.مشحون, 0);
  const grandTotal = filteredOrders.reduce((sum, order) => sum + order.totals, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-green-700">الطلبيات الجاهزة للشحن</h1>
        </div>

        {/* Search */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="البحث عن طلبية (اسم الزبون، رقم الزبون، رقم الفاتورة)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>        {/* Summary Cards */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 min-w-max">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {totalOrders.toLocaleString('en-US')}
              </div>
              <div className="text-green-600 font-semibold text-sm">
                الطلبيات الجاهزة
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {totalCustomers.toLocaleString('en-US')}
              </div>
              <div className="text-green-600 font-semibold text-sm">
                الزبائن
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {totalWarehouse.toLocaleString('en-US')}
              </div>
              <div className="text-green-600 font-semibold text-sm">
                في المستودع
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg border border-indigo-200 p-4 text-center">
              <div className="text-2xl font-bold text-indigo-700 mb-1">
                {totalShipped.toLocaleString('en-US')}
              </div>
              <div className="text-indigo-600 font-semibold text-sm">
                المشحونة
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {grandTotal.toLocaleString('en-US')}
              </div>
              <div className="text-green-600 font-semibold text-sm">
                إجمالي الاتواب
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert for ready orders */}
        {totalOrders > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <div className="text-green-500 text-xl mr-3">✅</div>
              <div>
                <p className="font-bold">ممتاز! يوجد {totalOrders} طلبية جاهزة للشحن!</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md border-2 border-green-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    اسم العميل
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    رقم الطلبية
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    فاتورة
                  </th>                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    مستودع
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    مشحون
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    المجموع
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                    تاريخ التسليم
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلبيات جاهزة للشحن حالياً'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {searchTerm ? 'جرب البحث بكلمة أخرى' : 'جميع الطلبيات ما زالت قيد المعالجة'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr 
                      key={index}
                      className="bg-green-50 hover:bg-green-100 border-green-200 transition-all duration-200 cursor-pointer"
                      onClick={() => onRowClick?.(order.customer)}
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
                      </td>                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-green-600">
                          {order.في_مستودع.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-indigo-600">
                          {order.مشحون.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-green-600">
                          {order.totals.toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
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
  );
};

export default ReadyOrdersTable;
