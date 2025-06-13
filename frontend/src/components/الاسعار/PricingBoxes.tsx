import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PricingBoxProps {
  title: string;
  items: Array<{
    name: string;
    price: string;
    description: string;
  }>;
}

const PricingBoxes: React.FC<PricingBoxProps> = ({ title, items }) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedItem(index)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
            <p className="text-2xl font-bold text-orange-500">{item.price}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {items[selectedItem].name}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-3xl font-bold text-orange-500 mb-4">
              {items[selectedItem].price}
            </p>
            <p className="text-gray-600">
              {items[selectedItem].description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingBoxes;