import React, { useState, useEffect } from 'react';

interface ColorDetail {
  number: string;
  long2: number;
  date3: string;
}

interface ColorDetailsTableProps {
  desan: string;
  color: string;
  warehouseType: string; // Add warehouse type to determine which API endpoint to use
  onBack: () => void;
}

const ColorDetailsTable: React.FC<ColorDetailsTableProps> = ({ desan, color, warehouseType, onBack }) => {
  const [details, setDetails] = useState<ColorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine the API endpoint based on warehouse type
        const endpoint = warehouseType === 'classic'
          ? `http://localhost:5000/api/warehouse/classic/color-details/${encodeURIComponent(desan)}/${encodeURIComponent(color)}`
          : `http://localhost:5000/api/warehouse/scrap/color-details/${encodeURIComponent(desan)}/${encodeURIComponent(color)}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.success) {
          setDetails(data.data);
        } else {
          setError(data.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Error connecting to server: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };    if (desan && color) {
      fetchColorDetails();
    }
  }, [desan, color, warehouseType]);

  // Calculate totals
  const totalRecords = details.length;
  const totalLength = details.reduce((sum, detail) => sum + detail.long2, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            العودة لتفاصيل الدسان
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">تفاصيل اللون: {color} - الدسان: {desan}</h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            العودة لتفاصيل الدسان
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">تفاصيل اللون: {color} - الدسان: {desan}</h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">خطأ في تحميل البيانات:</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            العودة لتفاصيل الدسان
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل اللون: {color}</h1>
          <h2 className="text-xl font-semibold text-gray-600 mt-2">الدسان: {desan}</h2>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {totalRecords.toLocaleString('en-US')}
            </div>
            <div className="text-blue-600 font-semibold text-lg">
              اجمالي الأثواب
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {totalLength.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-purple-600 font-semibold text-lg">
              اجمالي الأمتار
            </div>
          </div>
        </div>
      
        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    رقم التوب
                  </th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    الطول
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          لا توجد أثواب متاحة لهذا اللون
                        </p>
                        <p className="text-gray-400 text-sm">تحقق من البيانات أو جرب لون آخر</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  details.map((detail, index) => (
                    <tr key={index} className="hover:bg-orange-50 transition-colors duration-200">
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-md shadow-sm inline-block">
                          <div className="text-base font-semibold">
                            {detail.number || 'غير محدد'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {detail.long2.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">متر</div>
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

export default ColorDetailsTable;
