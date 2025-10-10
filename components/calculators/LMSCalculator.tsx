import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { lmsPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface LMSCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const LMSCalculator: React.FC<LMSCalculatorProps> = ({ onAddItem }) => {
  const [selectedPackageName, setSelectedPackageName] = useState(lmsPricing.packages[0].name);
  const [additionalStorageGB, setAdditionalStorageGB] = useState(0);

  const { total, description } = useMemo(() => {
    const selectedPackage = lmsPricing.packages.find(p => p.name === selectedPackageName);
    if (!selectedPackage) return { total: 0, description: '' };

    let currentTotal = selectedPackage.price;
    const descParts = [`Package: ${selectedPackage.name} (${selectedPackage.ccu} CCU, ${selectedPackage.freeStorageGB}GB free storage)`];

    if (additionalStorageGB > 0) {
      const { blockSizeGB, pricePerBlock } = lmsPricing.additionalStorage;
      const numberOfBlocks = Math.ceil(additionalStorageGB / blockSizeGB);
      const storageCost = numberOfBlocks * pricePerBlock;
      currentTotal += storageCost;
      descParts.push(`${additionalStorageGB}GB additional storage`);
    }

    return { total: currentTotal, description: descParts.join(', ') };
  }, [selectedPackageName, additionalStorageGB]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `lms-${Date.now()}`,
        service: 'LMS',
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
      title="Bizfly Cloud LMS"
      description="Choose a package based on your Concurrent Connected Users (CCU) needs and add extra storage."
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lms-package" className="block text-sm font-medium text-gray-700">LMS Package</label>
            <select
              id="lms-package"
              value={selectedPackageName}
              onChange={(e) => setSelectedPackageName(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {lmsPricing.packages.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.ccu} CCU) - {p.price.toLocaleString('vi-VN')} VNĐ/month
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="additional-storage" className="block text-sm font-medium text-gray-700">
                Additional Storage (GB)
            </label>
            <input
              type="number"
              id="additional-storage"
              value={additionalStorageGB}
              onChange={e => setAdditionalStorageGB(Math.max(0, Number(e.target.value)))}
              min="0"
              step={lmsPricing.additionalStorage.blockSizeGB}
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">
                Billed in {lmsPricing.additionalStorage.blockSizeGB}GB blocks at {lmsPricing.additionalStorage.pricePerBlock.toLocaleString('vi-VN')} VNĐ/block.
            </p>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default LMSCalculator;
