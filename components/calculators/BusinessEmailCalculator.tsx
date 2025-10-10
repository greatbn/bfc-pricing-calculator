import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { businessEmailPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface BusinessEmailCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const BusinessEmailCalculator: React.FC<BusinessEmailCalculatorProps> = ({ onAddItem }) => {
  const [selectedPackageId, setSelectedPackageId] = useState(businessEmailPricing.packages[0].id);

  const { total, description } = useMemo(() => {
    const selectedPackage = businessEmailPricing.packages.find(p => p.id === selectedPackageId);
    if (!selectedPackage) return { total: 0, description: '' };

    const price = selectedPackage.price;
    const desc = `Package ${selectedPackage.id}: ${selectedPackage.storageGB}GB Storage, ${selectedPackage.emailsPerDay.toLocaleString('vi-VN')} emails/day`;
    
    return { total: price, description: desc };
  }, [selectedPackageId]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `bemail-${Date.now()}`,
        service: 'Business Email',
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
      title="Business Email"
      description="Choose a package based on your total storage and daily sending needs. All packages include unlimited accounts."
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1">
          <div>
            <label htmlFor="email-package" className="block text-sm font-medium text-gray-700">Business Email Package</label>
            <select
              id="email-package"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {businessEmailPricing.packages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.storageGB}GB Storage, {p.emailsPerDay.toLocaleString('vi-VN')} emails/day - {p.price.toLocaleString('vi-VN')} VNĐ/month
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default BusinessEmailCalculator;