import React, { useState, useEffect } from 'react';

interface ScrapProduct {
  desan: string;
  desan_count: number;
  total_long: string;
}

interface WarehouseTableProps {
  title: string;
  warehouseType: string;
  onDesanClick?: (desan: string) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({ title, warehouseType, onDesanClick }) => {
  const [products, setProducts] = useState<ScrapProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ScrapProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (warehouseType === 'scrap') {
          const response = await fetch('http://localhost:5000/api/warehouse/scrap');
          const data = await response.json();
          if (data.success) {
            setProducts(data.data);
            setFilteredProducts(data.data);
          } else {
            setError(data.error || 'Failed to fetch data');
          }
        } else if (warehouseType === 'classic') {
          const response = await fetch('http://localhost:5000/api/warehouse/classic');
          const data = await response.json();
          if (data.success) {
            setProducts(data.data);
            setFilteredProducts(data.data);
          } else {
            setError(data.error || 'Failed to fetch data');
          }
        } else {
          // For other warehouse types, show empty data for now
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        setError('Error connecting to server: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [warehouseType]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.desan.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  const handleViewDetails = (product: ScrapProduct) => {
    if (onDesanClick) {
      onDesanClick(product.desan);
    } else {
      alert(`تفاصيل الدسان: ${product.desan}\nعدد القطع: ${product.desan_count}\nإجمالي الطول: ${product.total_long}`);
    }
  };
  // Calculate summary statistics
  const totalAtwab = filteredProducts.reduce((sum, product) => sum + product.desan_count, 0);
  // Fix the calculation for total meters - remove commas and parse properly
  const totalAmtar = filteredProducts.reduce((sum, product) => {
    // Remove commas and parse the total_long string to number
    const cleanedValue = product.total_long?.replace(/,/g, '') || '0';
    return sum + parseFloat(cleanedValue);
  }, 0);
  const uniqueDesans = filteredProducts.length;

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
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="max-w-lg">
            <input
              type="text"
              placeholder="البحث عن دسان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {uniqueDesans.toLocaleString('en-US')}
            </div>
            <div className="text-blue-600 font-semibold text-lg">
              عدد الدسانات
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {totalAtwab.toLocaleString('en-US')}
            </div>
            <div className="text-green-600 font-semibold text-lg">
              إجمالي الأثواب
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {totalAmtar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-purple-600 font-semibold text-lg">
              إجمالي الأمتار
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    الدسان
                  </th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    عدد الأثواب
                  </th>
                  <th className="px-6 py-4 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    إجمالي الطول
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد دسانات متاحة'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-orange-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleViewDetails(product)}
                    >                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-md shadow-sm inline-block">
                          <div className="text-base font-semibold">
                            {product.desan}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-green-600">
                          {product.desan_count.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">ثوب</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {product.total_long}
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

export default WarehouseTable;