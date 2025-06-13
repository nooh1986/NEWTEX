import React, { useState } from 'react';
import { Menu, X, Home, Package, Warehouse, BarChart as ChartBar, ShoppingCart } from 'lucide-react';
import { Menu as HeadlessMenu } from '@headlessui/react';

interface NavbarProps {
  onPageChange: (page: string) => void;
  onWarehouseChange: (type: string) => void;
  onPricingChange: (type: string) => void;
  onSalesChange: (type: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onPageChange, onWarehouseChange, onPricingChange, onSalesChange, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleWarehouseClick = (type: string) => {
    onPageChange('warehouse');
    onWarehouseChange(type);
    setIsOpen(false);
  };

  const handlePricingClick = (type: string) => {
    onPageChange('pricing');
    onPricingChange(type);
    setIsOpen(false);
  };

  const handleSalesClick = (type: string) => {
    onPageChange('sales');
    onSalesChange(type);
    setIsOpen(false);
  };

  const handleOrdersClick = (type: string) => {
    onPageChange(`orders-${type}`);
    setIsOpen(false);
  };
  const getNavItemClasses = (page: string) => {
    // Check if current page matches the nav item
    const isActive = currentPage === page || 
      (page === 'orders' && currentPage.startsWith('orders-')) ||
      (page === 'sales' && currentPage.startsWith('sales-'));
    
    return `flex items-center ${
      isActive
        ? 'text-orange-500 font-semibold'
        : 'text-gray-700 hover:text-orange-500'
    } px-3 py-2 rounded-md text-sm font-medium`;
  };
  return (
    <nav className="bg-white shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src="/1-0١-1.webp" alt="Logo" className="h-8 w-auto" />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4 md:space-x-reverse">            <button 
              onClick={() => {
                onPageChange('dashboard');
                setIsOpen(false);
              }}
              className={getNavItemClasses('dashboard')}
            >
              <Home className="ml-2 h-5 w-5" />
              الرئيسية
            </button>            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className={getNavItemClasses('pricing')}>
                <Package className="ml-2 h-5 w-5" />
                الاسعار
              </HeadlessMenu.Button>
              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handlePricingClick('tasaneef')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      اسعار التصانيف
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handlePricingClick('dasanat')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      اسعار الدسانات
                    </button>
                  )}
                </HeadlessMenu.Item>
              </HeadlessMenu.Items>
            </HeadlessMenu>            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className={getNavItemClasses('warehouse')}>
                <Warehouse className="ml-2 h-5 w-5" />
                المستودعات
              </HeadlessMenu.Button>
              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleWarehouseClick('classic')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      مستودع الكلاسيك
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleWarehouseClick('scrap')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      مستودع السقط
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleWarehouseClick('chinese')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      مستودع الصيني
                    </button>
                  )}
                </HeadlessMenu.Item>
              </HeadlessMenu.Items>
            </HeadlessMenu>            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className={getNavItemClasses('orders')}>
                <ShoppingCart className="ml-2 h-5 w-5" />
                الطلبيات
              </HeadlessMenu.Button>              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleOrdersClick('in-progress')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      طلبيات قيد التنفيذ
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleOrdersClick('warehouse')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      طلبيات جاهزة للشحن  
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (                    <button
                      onClick={() => handleOrdersClick('late')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      الطلبيات المتأخرة
                    </button>
                  )}
                </HeadlessMenu.Item>
                
              </HeadlessMenu.Items>            </HeadlessMenu>            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className={getNavItemClasses('sales')}>
                <ChartBar className="ml-2 h-5 w-5" />
                المبيعات
              </HeadlessMenu.Button>
              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSalesClick('classic')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      مبيعات الكلاسيك
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSalesClick('chinese')}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-right px-4 py-2 text-sm text-gray-700`}
                    >
                      مبيعات الصيني
                    </button>
                  )}
                </HeadlessMenu.Item>              </HeadlessMenu.Items>
            </HeadlessMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden relative z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">            <button
              onClick={() => {
                onPageChange('dashboard');
                setIsOpen(false);
              }}
              className={`${getNavItemClasses('dashboard')} w-full text-right`}
            >
              <Home className="ml-2 h-5 w-5" />
              الرئيسية
            </button>
            
            <div className="space-y-1">
              <button
                onClick={() => handlePricingClick('tasaneef')}
                className={`${getNavItemClasses('pricing')} w-full text-right`}
              >
                <Package className="ml-2 h-5 w-5" />
                اسعار التصانيف
              </button>
              <button
                onClick={() => handlePricingClick('dasanat')}
                className={`${getNavItemClasses('pricing')} w-full text-right`}
              >
                <Package className="ml-2 h-5 w-5" />
                اسعار الدسانات
              </button>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => handleWarehouseClick('classic')}
                className={`${getNavItemClasses('warehouse')} w-full text-right`}
              >
                <Warehouse className="ml-2 h-5 w-5" />
                مستودع الكلاسيك
              </button>
              <button
                onClick={() => handleWarehouseClick('scrap')}
                className={`${getNavItemClasses('warehouse')} w-full text-right`}
              >
                <Warehouse className="ml-2 h-5 w-5" />
                مستودع السقط
              </button>
              <button
                onClick={() => handleWarehouseClick('chinese')}
                className={`${getNavItemClasses('warehouse')} w-full text-right`}
              >
                <Warehouse className="ml-2 h-5 w-5" />
                مستودع الصيني
              </button>
            </div>              <div className="space-y-1">
              <button
                onClick={() => handleOrdersClick('warehouse')}
                className={`${getNavItemClasses('orders')} w-full text-right`}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                الطلبات في المستودع
              </button>
              <button
                onClick={() => handleOrdersClick('late')}
                className={`${getNavItemClasses('orders')} w-full text-right`}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                الطلبيات المتأخرة
              </button>
              <button
                onClick={() => handleOrdersClick('in-progress')}
                className={`${getNavItemClasses('orders')} w-full text-right`}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                طلبيات قيد التنفيذ
              </button>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => handleSalesClick('classic')}
                className={`${getNavItemClasses('sales')} w-full text-right`}
              >
                <ChartBar className="ml-2 h-5 w-5" />
                مبيعات الكلاسيك
              </button>
              <button
                onClick={() => handleSalesClick('chinese')}
                className={`${getNavItemClasses('sales')} w-full text-right`}
              >
                <ChartBar className="ml-2 h-5 w-5" />
                مبيعات الصيني              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;