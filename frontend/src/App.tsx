import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TasaneefPricing from './components/الاسعار/TasaneefPricing';
import DesansPricing from './components/الاسعار/DesansPricing';
import KaliteDetails from './components/الاسعار/KaliteDetails';
import WarehouseTable from './components/المستودعات/WarehouseTable';
import ChineseWarehouseTable from './components/المستودعات/ChineseWarehouseTable';
import WarehouseDetailsTable from './components/المستودعات/WarehouseDetailsTableNew';
import ClassicWarehouseDetailsTable from './components/المستودعات/ClassicWarehouseDetailsTable';
import ClassicColorDetailsTable from './components/المستودعات/ClassicColorDetailsTable';
import ScrapWarehouseDetailsTable from './components/المستودعات/ScrapWarehouseDetailsTable';
import ScrapColorDetailsTable from './components/المستودعات/ScrapColorDetailsTable';
import ChineseWarehouseDetailsTable from './components/المستودعات/ChineseWarehouseDetailsTable';
import ColorDetailsTable from './components/المستودعات/ColorDetailsTable';
import ChineseColorDetailsTable from './components/المستودعات/ChineseColorDetailsTable';
import OrdersInProgressTable from './components/الطلبيات/OrdersInProgressTable';
import LateOrdersTable from './components/الطلبيات/LateOrdersTable';
import ReadyOrdersTable from './components/الطلبيات/ReadyOrdersTable';
import ClassicSales from './components/المبيعات/ClassicSales';
import ChineseSales from './components/المبيعات/ChineseSales';
import OrderDetails from './components/الطلبيات/OrderDetails';

// Main app content that needs authentication
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Main app content for authenticated users
  return <AuthenticatedApp />;
};

// The authenticated app component
const AuthenticatedApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('dashboard');
  const [warehouseType, setWarehouseType] = useState('');
  const [pricingType, setPricingType] = useState('');
  const [salesType, setSalesType] = useState('');
  const [salesFilterPeriod, setSalesFilterPeriod] = useState('month'); // Default period for sales pages
  const [selectedDesan, setSelectedDesan] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ desan: string; color: string } | null>(null);
  const [selectedClassicColor, setSelectedClassicColor] = useState<{ desan: string; color: string } | null>(null);
  const [selectedScrapColor, setSelectedScrapColor] = useState<{ desan: string; color: string } | null>(null);
  // Chinese warehouse states
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedChineseColor, setSelectedChineseColor] = useState<{ type: string; color: string } | null>(null);
  // Tasaneef classification state
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleWarehouseChange = (type: string) => {
    setWarehouseType(type);
    // Reset drill-down state when switching warehouse types
    setSelectedDesan(null);
    setSelectedColor(null);
    setSelectedClassicColor(null);
    setSelectedScrapColor(null);
    setSelectedType(null);
    setSelectedChineseColor(null);
  };

  const handlePageChange = (page: string, filterPeriod?: string) => {
    setCurrentPage(page);
    
    // Set the sales filter period if provided
    if (filterPeriod) {
      setSalesFilterPeriod(filterPeriod);
    }
    
    // Reset drill-down state when navigating away from warehouse
    if (page !== 'warehouse') {
      setSelectedDesan(null);
      setSelectedColor(null);
      setSelectedClassicColor(null);
      setSelectedScrapColor(null);
      setSelectedType(null);
      setSelectedChineseColor(null);
    }
    // Reset classification state when navigating away from pricing
    if (page !== 'pricing') {
      setSelectedClassification(null);
    }
  };

  const handlePricingChange = (type: string) => {
    setPricingType(type);
    // Reset classification state when switching pricing types
    setSelectedClassification(null);
  };

  const handleSalesChange = (type: string) => {
    setSalesType(type);
  };

  const handleChineseSalesNavigation = (filterPeriod: string) => {
    setSalesType('chinese');
    setSalesFilterPeriod(filterPeriod);
    setCurrentPage('sales');
  };

  const handleClassicSalesNavigation = (filterPeriod: string) => {
    setSalesType('classic');
    setSalesFilterPeriod(filterPeriod);
    setCurrentPage('sales');
  };

  const handleOrderDetails = (orderNum: string) => {
    setPreviousPage(currentPage);
    setOrderNumber(orderNum);
    setCurrentPage('order-details');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onPageChange={handlePageChange}
        onWarehouseChange={handleWarehouseChange}
        onPricingChange={handlePricingChange}
        onSalesChange={handleSalesChange}
        currentPage={currentPage}
      />
      
      {currentPage === 'order-details' && orderNumber && <OrderDetails orderNumber={orderNumber} onBack={() => setCurrentPage(previousPage || 'orders-in-progress')} />}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onPageChange={handlePageChange} 
          onWarehouseChange={handleWarehouseChange}
          onChineseSalesNavigation={handleChineseSalesNavigation}
          onClassicSalesNavigation={handleClassicSalesNavigation}
        />
      )}
      
      {currentPage === 'pricing' && pricingType === 'tasaneef' && !selectedClassification && (
        <TasaneefPricing 
          title="التصانيف الرئيسية" 
          onItemClick={(classificationName) => setSelectedClassification(classificationName)}
        />
      )}      {currentPage === 'pricing' && pricingType === 'tasaneef' && selectedClassification && (
        <KaliteDetails 
          mainDesan={selectedClassification}
          onBack={() => setSelectedClassification(null)}
        />
      )}

      {currentPage === 'pricing' && pricingType === 'dasanat' && (
        <DesansPricing title="اسعار الدسانات" />
      )}
      
      {currentPage === 'warehouse' && !selectedDesan && !selectedColor && !selectedType && !selectedChineseColor && warehouseType !== 'chinese' && (
        <WarehouseTable 
          title={
            warehouseType === 'classic' ? 'مستودع الكلاسيك' :
            'مستودع السقط'
          }
          warehouseType={warehouseType || 'scrap'}
          onDesanClick={setSelectedDesan}
        />
      )}

      {currentPage === 'warehouse' && !selectedType && !selectedChineseColor && warehouseType === 'chinese' && (
        <ChineseWarehouseTable 
          title="مستودع الصيني"
          onTypeClick={setSelectedType}
        />
      )}

      {currentPage === 'warehouse' && selectedDesan && !selectedClassicColor && warehouseType === 'classic' && (
        <ClassicWarehouseDetailsTable 
          desan={selectedDesan} 
          onBack={() => setSelectedDesan(null)}
          onColorClick={(desan, color) => setSelectedClassicColor({ desan, color })}
        />
      )}

      {currentPage === 'warehouse' && selectedDesan && !selectedScrapColor && warehouseType === 'scrap' && (
        <ScrapWarehouseDetailsTable 
          desan={selectedDesan} 
          onBack={() => setSelectedDesan(null)}
          onColorClick={(desan, color) => setSelectedScrapColor({ desan, color })}
        />
      )}

      {currentPage === 'warehouse' && selectedDesan && !selectedColor && warehouseType !== 'chinese' && warehouseType !== 'classic' && warehouseType !== 'scrap' && (
        <WarehouseDetailsTable 
          desan={selectedDesan} 
          warehouseType={warehouseType || 'scrap'}
          onBack={() => setSelectedDesan(null)}
          onColorClick={(desan, color) => setSelectedColor({ desan, color })}
        />
      )}

      {currentPage === 'warehouse' && selectedType && !selectedChineseColor && warehouseType === 'chinese' && (
        <ChineseWarehouseDetailsTable 
          type={selectedType} 
          onBack={() => setSelectedType(null)}
          onColorClick={(type, color) => setSelectedChineseColor({ type, color })}
        />
      )}

      {currentPage === 'warehouse' && selectedColor && warehouseType !== 'chinese' && warehouseType !== 'classic' && (
        <ColorDetailsTable 
          desan={selectedColor.desan}
          color={selectedColor.color}
          warehouseType={warehouseType || 'scrap'}
          onBack={() => setSelectedColor(null)}
        />
      )}

      {currentPage === 'warehouse' && selectedClassicColor && warehouseType === 'classic' && (
        <ClassicColorDetailsTable 
          desan={selectedClassicColor.desan}
          color={selectedClassicColor.color}
          onBack={() => setSelectedClassicColor(null)}
        />
      )}

      {currentPage === 'warehouse' && selectedScrapColor && warehouseType === 'scrap' && (
        <ScrapColorDetailsTable 
          desan={selectedScrapColor.desan}
          color={selectedScrapColor.color}
          onBack={() => setSelectedScrapColor(null)}
        />
      )}

      {currentPage === 'warehouse' && selectedChineseColor && warehouseType === 'chinese' && (
        <ChineseColorDetailsTable 
          type={selectedChineseColor.type}
          color={selectedChineseColor.color}
          onBack={() => setSelectedChineseColor(null)}
        />
      )}

      {currentPage === 'orders-warehouse' && (
        <ReadyOrdersTable 
          onRowClick={handleOrderDetails}
        />
      )}

      {currentPage === 'orders-late' && (
        <LateOrdersTable 
          title="الطلبيات المتأخرة"
          onRowClick={handleOrderDetails}
        />
      )}

      {currentPage === 'orders-in-progress' && (
        <OrdersInProgressTable 
          title="طلبيات قيد التنفيذ"
          onRowClick={handleOrderDetails}
        />
      )}

      {currentPage === 'sales' && salesType === 'classic' && (
        <ClassicSales initialFilterPeriod={salesFilterPeriod} />
      )}
      
      {currentPage === 'sales' && salesType === 'chinese' && (
        <ChineseSales initialFilterPeriod={salesFilterPeriod} />
      )}
    </div>
  );
};

// Main App component wrapped with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;