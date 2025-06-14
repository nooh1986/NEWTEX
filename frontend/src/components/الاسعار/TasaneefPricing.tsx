import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, Search, X } from 'lucide-react';

interface TasaneefItem {
  id: string | number;
  name: string;
  price?: string | number;
  description?: string;
  category?: string;
}

interface TasaneefPricingProps {
  title: string;
  onItemClick?: (itemName: string) => void;
}

const TasaneefPricing: React.FC<TasaneefPricingProps> = ({ title, onItemClick }) => {
  const [items, setItems] = useState<TasaneefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasaneef, setSelectedTasaneef] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  useEffect(() => {
    fetchTasaneefData();
  }, []);
  const fetchTasaneefData = async () => {    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://istanbul.almaestro.org/api/main_desan', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
       
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
         const data = await response.json();

      // Transform returned array into TasaneefItem list
      // API returns object with `data.main_desans` array
      const transformedData = data?.data?.main_desans || [];
       
       if (transformedData.length > 0) {
         setItems(transformedData.map((item: { name: string; id?: string | number }, index: number) => ({
           id: item.id || index,
           name: item.name || `تصنيف ${index + 1}`,
           description: `وصف تفصيلي لتصنيف ${item.name || (index + 1)}`
         })));
         setError(null);
       } else {
         throw new Error('No tasaneef data received');
       }
    } catch (err) {
      console.error('Error fetching tasaneef data:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل البيانات';
      setError(`API Error: ${errorMessage}`);
      
      // Fallback to sample data
      setItems([
        { id: 1, name: 'تصنيف 1', description: 'وصف تفصيلي للتصنيف الأول' },
        { id: 2, name: 'تصنيف 2', description: 'وصف تفصيلي للتصنيف الثاني' },
        { id: 3, name: 'تصنيف 3', description: 'وصف تفصيلي للتصنيف الثالث' },
        { id: 4, name: 'تصنيف 4', description: 'وصف تفصيلي للتصنيف الرابع' },
        { id: 5, name: 'تصنيف 5', description: 'وصف تفصيلي للتصنيف الخامس' },
        { id: 6, name: 'تصنيف 6', description: 'وصف تفصيلي للتصنيف السادس' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
      return;
    }

    // Open modal and fetch details
    setSelectedTasaneef(itemName);
    setModalData(null);
    setModalError(null);
    setModalLoading(true);    try {
      const response = await fetch(`http://localhost:5000/api/warehouse/tasaneef-details-proxy/${encodeURIComponent(itemName)}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }      const data = await response.json();
      setModalData(data);
    } catch (err) {
      console.error('Error fetching tasaneef details:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل التفاصيل';
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTasaneef(null);
    setModalData(null);
    setModalError(null);
    setModalLoading(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل أسعار التصانيف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          {/* Search Input */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative" dir="rtl">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في التصانيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg inline-flex items-center">
              <AlertCircle className="h-5 w-5 ml-2" />
              <span className="text-sm">تم استخدام بيانات تجريبية بسبب خطأ في الاتصال بالخادم</span>
              <button 
                onClick={fetchTasaneefData}
                className="mr-3 text-yellow-600 hover:text-yellow-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>        {/* Pricing Boxes Grid */}
        {/* Desktop: 6 columns (lg:grid-cols-6), Tablet: 3 columns (md:grid-cols-3), Mobile: 3 columns (grid-cols-3) */}
        {filteredItems.length === 0 && searchTerm.trim() ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">لا توجد نتائج للبحث</div>
            <div className="text-gray-400 text-sm">جرب مصطلح بحث آخر</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.name)}
                className="bg-white rounded-xl shadow-lg p-6 lg:p-8 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-gray-100 hover:border-orange-200"
              >
                <div className="text-center">
                  <h3 className="text-xl lg:text-2xl font-bold text-orange-600 leading-tight flex items-center justify-center min-h-[80px]">
                    {item.name}
                  </h3>
                  {item.price && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">السعر</p>
                      <p className="text-lg font-semibold text-green-600">{item.price}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}        {/* Search Results Summary */}
        {searchTerm.trim() && (
          <div className="text-center text-sm text-gray-500 mb-4">
            عرض {filteredItems.length} من أصل {items.length} تصنيف
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedTasaneef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  تفاصيل {selectedTasaneef}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {modalLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل التفاصيل...</p>
                </div>
              )}

              {modalError && (
                <div className="text-center py-8">
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p>خطأ في تحميل التفاصيل: {modalError}</p>
                  </div>
                </div>
              )}              {modalData && !modalLoading && !modalError && (
                <div className="space-y-4">                  {(() => {
                    // Extract detail data from the API response
                    const apiResponse = modalData as { data?: { tasaneef?: Record<string, string> } };
                    const detail = apiResponse?.data?.tasaneef;
                    
                    if (!detail) {
                      return (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-600">لا توجد تفاصيل متاحة</p>
                          <p className="text-gray-500 text-sm mt-2">البيانات المستلمة: {JSON.stringify(modalData, null, 2)}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 text-left" dir="ltr">
                        {/* Tasaneef */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-black">Tasaneef</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-black">{detail.tasaneef || selectedTasaneef}</span>
                            </div>
                          </div>
                        </div>

                        {/* PerakendeNakit */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-orange-600 break-words">PerakendeNakit</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7 flex items-center">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-orange-600">{detail.PerakendeNakit || '-'}</span>
                              <span className="text-xs text-orange-600 ml-2">$ + KDV</span>
                            </div>
                          </div>
                        </div>

                        {/* PerakendeTaksit */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-orange-600 break-words">PerakendeTaksit</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7 flex items-center">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-orange-600">{detail.PerakendeTaksit || '-'}</span>
                              <span className="text-xs text-orange-600 ml-2">$ DAHIL</span>
                            </div>
                          </div>
                        </div>
                        

                        {/* ToptanNakit */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-black">ToptanNakit</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7 flex items-center">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-black">{detail.ToptanNakit || '-'}</span>
                              <span className="text-xs text-gray-600 ml-2">$ + KDV</span>
                            </div>
                          </div>
                        </div>

                        {/* ToptanTaksit */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-black">ToptanTaksit</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7 flex items-center">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-black">{detail.ToptanTaksit || '-'}</span>
                              <span className="text-xs text-gray-600 ml-2">$ DAHIL</span>
                            </div>
                          </div>
                        </div>

                        {/* agirlik */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-black">agirlik</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7 flex flex-col sm:flex-row sm:items-center">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-black">{detail.agirlik || '-'}</span>
                              <div className="sm:ml-3 flex items-center space-x-1 mt-1 sm:mt-0">
                                <div className="flex flex-col items-center leading-none -space-y-4">
                                  <span className="text-xs font-bold text-black py-0">+</span>
                                  <span className="text-xs font-bold text-black -mt-3 py-0">-</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-black">10%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* kompozisyon */}
                        <div className="border border-orange-200 rounded-lg bg-white">
                          <div className="grid grid-cols-10">
                            <div className="p-2 sm:p-3 lg:p-4 border-r border-orange-200 bg-gray-50 col-span-3">
                              <span className="text-xs sm:text-sm lg:text-lg font-bold text-black">kompozisyon</span>
                            </div>
                            <div className="p-2 sm:p-3 lg:p-4 col-span-7">
                              <span className="text-xs sm:text-sm lg:text-lg font-semibold text-black break-words">{detail.kompozisyon || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default TasaneefPricing;
