import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { cloudServerPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface BlockStorageCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type BillingMethod = 'subscription' | 'onDemand';
type DiskType = 'hdd' | 'ssd' | 'nvme';

const BlockStorageCalculator: React.FC<BlockStorageCalculatorProps> = ({ onAddItem }) => {
  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [diskType, setDiskType] = useState<DiskType>('ssd');
  const [diskSize, setDiskSize] = useState(100);
  const [hours, setHours] = useState(730);

  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    const descParts: string[] = [`Billing: ${billingMethod}`, `${diskSize}GB ${diskType.toUpperCase()}`];
    
    const pricingSource = cloudServerPricing.amdGen4.disk; // Use AMD as a consistent source for disk pricing

    if (billingMethod === 'subscription') {
      const diskPricing = pricingSource.subscription[diskType];
      if (diskSize <= 100) {
        currentTotal = diskPricing.under100GB * diskSize;
      } else {
        currentTotal = (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSize - 100));
      }
    } else { // On-Demand
      const effectiveHours = Math.min(hours, 730);
      const diskPricing = pricingSource.onDemand[diskType];
      if (diskSize <= 100) {
        currentTotal = diskPricing.under100GB * diskSize * effectiveHours;
      } else {
        currentTotal = ((diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSize - 100))) * effectiveHours;
      }
      descParts.push(`${effectiveHours} hours`);
    }

    return { total: Math.round(currentTotal), description: descParts.join(', ') };
  }, [billingMethod, diskType, diskSize, hours]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `bs-${Date.now()}`,
        service: 'Block Storage',
        description,
        price: total,
        quantity: 1,
      });
    }
  };

  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">Estimated cost: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString('vi-VN')} VNĐ</span>
       <span className="text-sm text-gray-500"> / {billingMethod === 'subscription' ? 'month' : `${hours} hours`}</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title="Block Storage (Volume)"
      description="Calculate costs for standalone storage volumes. Pricing is based on the Cloud Server disk rates."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Method</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Subscription</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>On-Demand</button>
            </div>
          </div>
          {billingMethod === 'onDemand' && (
            <div className="animate-fade-in">
                <label htmlFor="bs-hours" className="block text-sm font-medium text-gray-700">Number of Hours</label>
                <input type="number" id="bs-hours" value={hours} onChange={e => setHours(Math.max(1, Number(e.target.value)))} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"/>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label htmlFor="bs-disk-type" className="block text-sm font-medium text-gray-700">Disk Type</label>
             <select id="bs-disk-type" value={diskType} onChange={e => setDiskType(e.target.value as DiskType)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="hdd">HDD</option>
                <option value="ssd">SSD</option>
                <option value="nvme">NVMe</option>
             </select>
          </div>
           <div>
            <label htmlFor="bs-disk-size" className="block text-sm font-medium text-gray-700">Disk Size (GB)</label>
            <input type="number" id="bs-disk-size" value={diskSize} onChange={e => setDiskSize(Math.max(10, Number(e.target.value)))} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default BlockStorageCalculator;