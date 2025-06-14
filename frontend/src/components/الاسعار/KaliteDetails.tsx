import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, X } from 'lucide-react';

interface KaliteItem {
  id: string | number;
  name: string;
  description?: string;
  // Add other fields based on API response
}

interface KaliteDetailsProps {
  mainDesan: string;
  onBack: () => void;
}

const KaliteDetails: React.FC<KaliteDetailsProps> = ({ mainDesan, onBack }) => {
  const [items, setItems] = useState<KaliteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const [selectedKalite, setSelectedKalite] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const fetchKaliteData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://istanbul.almaestro.org/api/kalite/${encodeURIComponent(mainDesan)}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );
       
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       const data = await response.json();
      console.log('Kalite API Response:', data);

      // Extract array of qualities from response
      const transformedData = Array.isArray(data)
        ? data
        : data?.data?.kalite || [];

       if (transformedData.length > 0) {
         setItems(transformedData.map((item: unknown, index: number) => {
           const kaliteItem = item as { id?: string | number; name?: string; kalite?: string; quality?: string; description?: string; desc?: string };
           return {
             id: kaliteItem.id || index,
             name: kaliteItem.name || kaliteItem.kalite || kaliteItem.quality || `جودة ${index + 1}`,
             description: kaliteItem.description || kaliteItem.desc || `وصف تفصيلي لجودة ${kaliteItem.name || kaliteItem.kalite || kaliteItem.quality || (index + 1)}`
           };
         }));
         setError(null);
         console.log('Successfully loaded', transformedData.length, 'qualities from API');
       } else {
         throw new Error('No kalite data received from API');
       }
      
    } catch (err) {      console.log('Error fetching kalite data:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل البيانات';
      
      // Handle rate limiting specifically
      if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        setError('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
      } else {
        setError(errorMessage);
      }
      
      // Fallback to sample data
      setItems([
        { id: 1, name: 'جودة عالية', description: 'وصف تفصيلي للجودة العالية' },
        { id: 2, name: 'جودة متوسطة', description: 'وصف تفصيلي للجودة المتوسطة' },
        { id: 3, name: 'جودة منخفضة', description: 'وصف تفصيلي للجودة المنخفضة' },
        { id: 4, name: 'جودة ممتازة', description: 'وصف تفصيلي للجودة الممتازة' },
        { id: 5, name: 'جودة مقبولة', description: 'وصف تفصيلي للجودة المقبولة' },
        { id: 6, name: 'جودة خاصة', description: 'وصف تفصيلي للجودة الخاصة' },
      ]);    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [mainDesan]); // Remove isFetching from dependencies to prevent infinite loop
  
  const fetchKaliteDetails = async (kaliteName: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      setSelectedKalite(kaliteName);
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch quality details from external API
      const response = await fetch(
        `https://istanbul.almaestro.org/api/details/${encodeURIComponent(kaliteName)}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Details API Response:', data);
      setModalData(data);
      
    } catch (err) {
      console.error('Error fetching kalite details:', err);
      setModalError(err instanceof Error ? err.message : 'خطأ في تحميل التفاصيل');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedKalite(null);
    setModalData(null);
    setModalError(null);
  };

  useEffect(() => {
    fetchKaliteData();
  }, [fetchKaliteData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الجودة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium transition-colors"
          >
            <ArrowRight className="h-5 w-5 ml-2" />
            العودة إلى التصانيف الرئيسية
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">التصنيف {mainDesan}</h1>
                        
            {error && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg inline-flex items-center">
                <AlertCircle className="h-5 w-5 ml-2" />
                <span className="text-sm">تم استخدام بيانات تجريبية بسبب خطأ في الاتصال بالخادم</span>
                <button 
                  onClick={fetchKaliteData}
                  className="mr-3 text-yellow-600 hover:text-yellow-800"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kalite Boxes Grid */}
        {/* Desktop: 6 columns (lg:grid-cols-6), Tablet: 3 columns (md:grid-cols-3), Mobile: 3 columns (grid-cols-3) */}        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => fetchKaliteDetails(item.name)}
              className="bg-white rounded-xl shadow-lg p-6 lg:p-8 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-gray-100 hover:border-orange-200"
            >
              <div className="text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-orange-600 leading-tight flex items-center justify-center min-h-[80px]">
                  {item.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Modal */}
      {selectedKalite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-3xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                تفاصيل {selectedKalite}
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
                  // Extract detail data from the API response
                  const apiResponse = modalData as { data?: { detail?: Record<string, string> } };
                  const detail = apiResponse?.data?.detail;
                  
                  if (!detail) {
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">لا توجد تفاصيل متاحة</p>
                      </div>
                    );
                  }                  return (
                    <div className="space-y-3 text-left" dir="ltr">                      {/* Kalite */}
                      <div className="border border-orange-200 rounded-lg bg-white grid grid-cols-10 min-h-[55px]">
                        <div className="p-2 sm:p-3 border-r border-orange-200 col-span-3 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-black break-words w-full">Kalite</span>
                        </div>
                        <div className="p-2 sm:p-3 col-span-7 flex items-center">
                          <span className="text-sm sm:text-base font-semibold text-black break-words">{detail.kalite || '-'}</span>
                        </div>
                      </div>{/* PerakendeNakit */}
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
                      </div>                      {/* kompozisyon */}
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
            )}            <div className="mt-6 flex justify-end">
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

export default KaliteDetails;
