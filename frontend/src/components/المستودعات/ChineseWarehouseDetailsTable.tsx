import React, { useState, useEffect } from 'react';

interface ChineseTypeDetail {
  type: string;
  color: string;
  count: number;
}

interface ChineseWarehouseDetailsTableProps {
  type: string;
  onBack: () => void;
  onColorClick?: (type: string, color: string) => void;
}

const ChineseWarehouseDetailsTable: React.FC<ChineseWarehouseDetailsTableProps> = ({ 
  type, 
  onBack, 
  onColorClick 
}) => {
  const [details, setDetails] = useState<ChineseTypeDetail[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<ChineseTypeDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5000/api/warehouse/chinese/details/${encodeURIComponent(type)}`);
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
          setDetails(data.data || []);
          setFilteredDetails(data.data || []);
        } else {
          throw new Error(data.error || 'Failed to fetch details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type]);

  // Filter details based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDetails(details);
    } else {
      const filtered = details.filter(detail =>
        detail.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDetails(filtered);
    }
  }, [details, searchTerm]);

  const handleColorClick = (color: string) => onColorClick?.(type, color);

  // Calculate summary statistics
  const totalColors = filteredDetails.length;
  const totalPieces = filteredDetails.reduce((sum, d) => sum + d.count, 0);

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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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
            العودة لمستودع الصيني
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل النوع: {type}</h1>
        </div>        {/* Search */}
        <div className="mb-6">
          <div className="max-w-lg mx-auto">
            <input
              type="text"
              placeholder="البحث عن لون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {totalColors.toLocaleString('en-US')}
            </div>
            <div className="text-blue-600 font-semibold text-lg">
              عدد الألوان
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {totalPieces.toLocaleString('en-US')}
            </div>
            <div className="text-green-600 font-semibold text-lg">
              إجمالي الأثواب
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
                    النوع
                  </th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    اللون
                  </th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    عدد الأثواب
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد ألوان متاحة'}
                        </p>
                        <p className="text-gray-400 text-sm">تحقق من البيانات أو جرب البحث بكلمة أخرى</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((detail, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-orange-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleColorClick(detail.color)}
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-md shadow-sm inline-block">
                          <div className="text-base font-semibold">
                            {detail.type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-1 rounded-md shadow-sm inline-block">
                          <div className="text-base font-semibold">
                            {detail.color}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-green-600">
                          {detail.count.toLocaleString('en-US')}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">ثوب</div>
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

export default ChineseWarehouseDetailsTable;
