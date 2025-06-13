import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface OrderDetail {
  customerName: string;
  Number: string | null;
  Desan: string | null;
  Color: string | null;
  Long2: string | null;
  Status: string | null;
  customerNumber: string;
  Date: string | null;
  Date4: string | null;
  endDate: string | null;
}

const OrderDetails: React.FC<{ orderNumber: string; onBack: () => void }> = ({ orderNumber, onBack }) => {
  const [details, setDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [orderSummary, setOrderSummary] = useState({
    totalItems: 0,
    uniqueDesans: 0,
    uniqueColors: 0
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/warehouse/orders/details?orderNumber=${orderNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDetails(data.data);          // Calculate summary statistics
          const uniqueDesans = new Set(data.data.map((item: OrderDetail) => item.Desan).filter(Boolean)).size;
          const uniqueColors = new Set(data.data.map((item: OrderDetail) => item.Color).filter(Boolean)).size;
          
          setOrderSummary({
            totalItems: data.data.length,
            uniqueDesans,
            uniqueColors
          });
        } else {
          setError(data.error || 'Failed to load details');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderNumber]);
  // Helper function to format dates properly (Gregorian format)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    // Try to parse the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };  // Helper function to determine status color (enhanced styling)
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-200 text-gray-800 border-gray-300';
    switch(status.toLowerCase()) {
      case 'مستودع': return 'bg-green-200 text-green-800 border-green-300';
      case 'تصنيع': return 'bg-blue-200 text-blue-800 border-blue-300';
      case 'مصبغة': return 'bg-purple-200 text-purple-800 border-purple-300';
      case 'مستودع الخام': return 'bg-yellow-200 text-yellow-800 border-yellow-300';
      case 'مشحون': return 'bg-indigo-200 text-indigo-800 border-indigo-300';
      case 'سقط': return 'bg-red-200 text-red-800 border-red-300';
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-xl font-medium text-gray-700">جاري تحميل تفاصيل الطلب...</span>
        <p className="text-sm text-gray-500 mt-2">يرجى الانتظار بينما يتم جلب البيانات</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-6 m-4">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
          <ArrowRight size={18} className="ml-1" />
          <span>العودة للقائمة السابقة</span>
        </button>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="mr-3 text-lg font-medium text-red-800">خطأ في تحميل البيانات</h3>
        </div>
        <p className="text-base text-red-700 mr-12">{error}</p>
      </div>
    );
  }  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6" dir="rtl">
      <div className="mb-8">
        {/* Mobile-First Header Layout */}
        <div className="mb-6">
          {/* Back Button - Always at top on mobile */}
          <div className="mb-4">
            <button 
              onClick={onBack} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg shadow-sm"
            >
              <ArrowRight size={18} className="ml-1" />
              <span className="text-sm sm:text-base">العودة للقائمة السابقة</span>
            </button>
          </div>
          
          {/* Title and Customer Info - Centered and stacked on mobile */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              تفاصيل الطلب رقم {orderNumber}
            </h2>
            {details.length > 0 && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 inline-block">
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {details[0].customerName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  رقم العميل: {details[0].customerNumber}
                </p>
              </div>
            )}
          </div>
        </div>        {/* Order Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-3 sm:p-4 text-center transform transition-transform duration-200 hover:scale-105">
            <div className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">
              {orderSummary.totalItems}
            </div>
            <div className="text-blue-600 font-semibold text-xs sm:text-sm">
              عدد الاتواب
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-3 sm:p-4 text-center transform transition-transform duration-200 hover:scale-105">
            <div className="text-xl sm:text-2xl font-bold text-green-700 mb-1">
              {orderSummary.uniqueDesans}
            </div>
            <div className="text-green-600 font-semibold text-xs sm:text-sm">
              عدد الدسانات
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-3 sm:p-4 text-center transform transition-transform duration-200 hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-purple-700 mb-1">
              {orderSummary.uniqueColors}
            </div>
            <div className="text-purple-600 font-semibold text-xs sm:text-sm">
              عدد الألوان
            </div>
          </div>
        </div>
      </div>
        {/* Order Details Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-3 sm:px-4 py-4 sm:py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">تفاصيل الاتواب</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم التوب</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدسان</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اللون</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الطول</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">تاريخ الطلبية</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">تاريخ الاستثناء</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">تاريخ الانتهاء</th>
              </tr>
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {details.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                    <div className="font-medium">{item.Number || 'غير محدد'}</div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                    <div className="font-medium">{item.Desan || 'غير محدد'}</div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900">{item.Color || 'غير محدد'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900">{item.Long2 || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm">
                    <span className={`px-2 sm:px-3 py-1 sm:py-2 inline-flex text-xs sm:text-sm font-semibold rounded-lg border-2 ${getStatusColor(item.Status)}`}>
                      {item.Status || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {formatDate(item.Date)}                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                    {formatDate(item.Date4)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {formatDate(item.endDate)}
                  </td>
                </tr>
              ))}
              {details.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M12 20h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                      <span className="text-lg font-medium">لا توجد بيانات متاحة لهذا الطلب</span>
                      <p className="text-sm text-gray-500 mt-1">يرجى التحقق من رقم الطلب أو المحاولة لاحقًا</p>
                    </div>
                  </td>
                </tr>
              )}            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;