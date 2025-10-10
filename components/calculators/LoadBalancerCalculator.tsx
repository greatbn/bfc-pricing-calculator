import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { loadBalancerPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface LoadBalancerCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const LoadBalancerCalculator: React.FC<LoadBalancerCalculatorProps> = ({ onAddItem }) => {
  const [selectedPackage, setSelectedPackage] = useState(loadBalancerPricing.packages[0].name);
  const [dataOverage, setDataOverage] = useState(0);

  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    const descParts: string[] = [];

    const pkg = loadBalancerPricing.packages.find(p => p.name === selectedPackage);
    if (pkg) {
      currentTotal += pkg.price;
      descParts.push(`Package: ${pkg.name} (${pkg.connections.toLocaleString('vi-VN')} connections)`);
      
      if (dataOverage > 0) {
        const overageCost = dataOverage * loadBalancerPricing.dataTransferOveragePricePerGB;
        currentTotal += overageCost;
        descParts.push(`${dataOverage} GB Data Overage`);
      } else {
        descParts.push(`Includes ${pkg.freeDataTB}TB free data transfer`);
      }
    }
    
    return { total: currentTotal, description: descParts.join(', ') };
  }, [selectedPackage, dataOverage]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `lb-${Date.now()}`,
        service: 'Load Balancer',
        description,
        price: total,
        quantity: 1,
      });
    }
  };

  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">Estimated monthly cost: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString('vi-VN')} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title="Load Balancer"
      description="Select a Load Balancer package. Each package includes 5TB of free data transfer per month."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lb-package" className="block text-sm font-medium text-gray-700">Package</label>
            <select
              id="lb-package"
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {loadBalancerPricing.packages.map(p => <option key={p.name} value={p.name}>{p.name} - {p.price.toLocaleString('vi-VN')} VNĐ</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="data-overage" className="block text-sm font-medium text-gray-700">Estimated Data Transfer Overage (GB/Month)</label>
            <input
              type="number"
              id="data-overage"
              value={dataOverage}
              onChange={(e) => setDataOverage(Math.max(0, parseInt(e.target.value, 10)))}
              min="0"
              step="100"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default LoadBalancerCalculator;