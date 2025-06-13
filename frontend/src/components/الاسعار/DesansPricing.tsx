import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, Search, X } from 'lucide-react';

interface DesansItem {
  id: string | number;
  name: string;
  price?: string | number;
  description?: string;
  category?: string;
}

interface DesansPricingProps {
  title: string;
}

interface ApiDesanRawItem {
  id?: string | number;
  name?: string;
  price?: string | number;
  PerakendeNakit?: string | number;
  description?: string;
}

interface ApiDesansResponse {
  data: {
    desans: ApiDesanRawItem[];
  };
}

interface DesanDetail {
  desan?: string;
  PerakendeNakit?: string;
  PerakendeTaksit?: string;
  ToptanNakit?: string;
  ToptanTaksit?: string;
  agirlik?: string;
  kompozisyon?: string;
  [key: string]: string | undefined;
}

interface ApiDesanDetailResponse {
  data: {
    desan: DesanDetail;
  };
}

const DesansPricing: React.FC<DesansPricingProps> = ({ title }) => {
  const [items, setItems] = useState<DesansItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesan, setSelectedDesan] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ApiDesanDetailResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchDesansData();
  }, []);

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

  const fetchDesansData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching desans data from external API...');
      const response = await fetch('https://istanbul.almaestro.org/api/desans', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      const result: ApiDesansResponse = await response.json();
      console.log('Desans API Response:', result);
      const rawItems = result.data.desans;

      if (rawItems.length > 0) {
        const mappedItems: DesansItem[] = rawItems.map((item, index) => ({
          id: item.id ?? index,
          name: item.name ?? `دسان ${index + 1}`,
          price: item.price ?? item.PerakendeNakit ?? '',
          description: item.description ?? `وصف تفصيلي للدسان ${item.name ?? index + 1}`
        }));
        setItems(mappedItems);
        setError(null);
        console.log('Successfully loaded', mappedItems.length, 'desans items from API');
      } else {
        throw new Error('No desans data received from API');
      }

    } catch (err) {
      console.error('Error fetching desans data:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل البيانات';
      setError(`API Error: ${errorMessage}`);
      // Fallback to sample data
      setItems([
        { id: 1, name: 'دسان 1', description: 'وصف تفصيلي للدسان الأول', price: '120' },
        { id: 2, name: 'دسان 2', description: 'وصف تفصيلي للدسان الثاني', price: '150' },
        { id: 3, name: 'دسان 3', description: 'وصف تفصيلي للدسان الثالث', price: '180' },
        { id: 4, name: 'دسان 4', description: 'وصف تفصيلي للدسان الرابع', price: '200' },
        { id: 5, name: 'دسان 5', description: 'وصف تفصيلي للدسان الخامس', price: '220' },
        { id: 6, name: 'دسان 6', description: 'وصف تفصيلي للدسان السادس', price: '250' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesanDetails = async (desanName: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      setSelectedDesan(desanName);
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch(`https://istanbul.almaestro.org/api/desan/${desanName}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiDesanDetailResponse = await response.json();
      console.log('Desan API Response:', result);
      setModalData(result);
    } catch (err) {
      console.error('Error fetching desan details:', err);
      setModalError(err instanceof Error ? err.message : 'خطأ في تحميل التفاصيل');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDesan(null);
    setModalData(null);
    setModalError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل أسعار الدسانات...</p>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في الدسانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right"
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg inline-flex items-center">
              <AlertCircle className="h-5 w-5 ml-2" />
              <span className="text-sm">تم استخدام بيانات تجريبية بسبب خطأ في الاتصال بالخادم</span>
              <button 
                onClick={fetchDesansData}
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
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => fetchDesanDetails(item.name)}
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
        )}

        {/* Search Results Summary */}
        {searchTerm.trim() && (
          <div className="text-center text-sm text-gray-500 mb-4">
            عرض {filteredItems.length} من أصل {items.length} دسان
          </div>        )}
      </div>      {/* Modal */}
      {selectedDesan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-3xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                تفاصيل {selectedDesan}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
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
            )}

            {modalData && !modalLoading && !modalError && (
              <div className="space-y-4">
                {(() => {
                  // Extract desan data from the API response
                  const detail = modalData.data.desan;
                  
                  if (!detail) {
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">لا توجد تفاصيل متاحة</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 text-left" dir="ltr">
                      {/* Desan */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">Desan</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black break-words">{detail.desan || selectedDesan}</span>
                        </div>
                      </div>

                      {/* PerakendeNakit */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-orange-600 break-words leading-tight w-full">PerakendeNakit</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-orange-600">{detail.PerakendeNakit || '-'}</span>
                          <span className="text-sm text-orange-600 ml-2">$ + KDV</span>
                        </div>
                      </div>

                      {/* PerakendeTaksit */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-orange-600 break-words leading-tight w-full">PerakendeTaksit</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-orange-600">{detail.PerakendeTaksit || '-'}</span>
                          <span className="text-sm text-orange-600 ml-2">$ DAHIL</span>
                        </div>
                      </div>

                      {/* ToptanNakit */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">ToptanNakit</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black">{detail.ToptanNakit || '-'}</span>
                          <span className="text-sm text-black ml-2">$ + KDV</span>
                        </div>
                      </div>

                      {/* ToptanTaksit */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">ToptanTaksit</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black">{detail.ToptanTaksit || '-'}</span>
                          <span className="text-sm text-black ml-2">$ DAHIL</span>
                        </div>
                      </div>

                      {/* agirlik */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">agirlik</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black">{detail.agirlik || '-'}</span>
                          <div className="flex items-center ml-2">
                            <div className="flex flex-col items-center leading-none -space-y-1">
                              <span className="text-xs font-bold text-black">+</span>
                              <span className="text-xs font-bold text-black">-</span>
                            </div>
                            <span className="text-sm font-semibold text-black ml-1">10%</span>
                          </div>
                        </div>
                      </div>

                      {/* kompozisyon */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">kompozisyon</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black break-words">{detail.kompozisyon || '-'}</span>
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
                className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
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

export default DesansPricing;
