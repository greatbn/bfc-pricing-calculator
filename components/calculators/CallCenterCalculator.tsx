import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { callCenterPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface CallCenterCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const CallCenterCalculator: React.FC<CallCenterCalculatorProps> = ({ onAddItem }) => {
  const [selectedPackageName, setSelectedPackageName] = useState(callCenterPricing.packages[0].name);

  const { total, description } = useMemo(() => {
    const selectedPackage = callCenterPricing.packages.find(p => p.name === selectedPackageName);
    
    if (!selectedPackage) {
      return { total: 0, description: '' };
    }

    return { 
      total: selectedPackage.price, 
      description: `Package: ${selectedPackage.name} (${selectedPackage.details})` 
    };
  }, [selectedPackageName]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `cc-${Date.now()}`,
        service: 'Call Center',
        description,
        price: total,
        quantity: 1,
      });
    }
  };
  
  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">Total monthly cost: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString('vi-VN')} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title="Bizfly Call Center"
      description="Select a monthly package for your call center needs based on the number of extensions and storage."
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1">
          <div>
            <label htmlFor="cc-package" className="block text-sm font-medium text-gray-700">Call Center Package</label>
            <select
              id="cc-package"
              value={selectedPackageName}
              onChange={(e) => setSelectedPackageName(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {callCenterPricing.packages.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.details}) - {p.price.toLocaleString('vi-VN')} VNĐ/month
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default CallCenterCalculator;