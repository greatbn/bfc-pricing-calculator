import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { simpleStoragePricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface SimpleStorageCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const SimpleStorageCalculator: React.FC<SimpleStorageCalculatorProps> = ({ onAddItem }) => {
  const [storageType, setStorageType] = useState<'standard' | 'cold'>('standard');
  const [billingModel, setBillingModel] = useState<'subscription' | 'payg'>('subscription');
  const [storageAmount, setStorageAmount] = useState(500); // For PAYG
  const [subscriptionPackage, setSubscriptionPackage] = useState(simpleStoragePricing.subscription.standard[0].gb);
  const [dataTransfer, setDataTransfer] = useState(100);

  const availablePackages = simpleStoragePricing.subscription[storageType];

  useEffect(() => {
    // When storage type changes, reset the subscription package to the first available option.
    // The dependency is only 'storageType' to prevent the effect from re-running
    // on every render and resetting the user's package selection.
    const currentPackages = simpleStoragePricing.subscription[storageType];
    setSubscriptionPackage(currentPackages[0].gb);
  }, [storageType]);

  const { total, description } = useMemo(() => {
    let storageCost = 0;
    let descParts: string[] = [`Type: ${storageType}`];

    if (billingModel === 'subscription') {
      const pkg = availablePackages.find(p => p.gb === subscriptionPackage);
      if (pkg) {
        storageCost = pkg.price;
        descParts.push(`Subscription: ${pkg.gb} GB`);
      }
    } else { // PAYG
      const paygPrice = simpleStoragePricing.payAsYouGo[storageType].pricePerGBHour;
      storageCost = paygPrice * storageAmount * 730; // 730 hours/month
      descParts.push(`Pay-as-you-go: ${storageAmount} GB`);
    }

    const transferCost = dataTransfer * simpleStoragePricing.dataTransferPricePerGB;
    descParts.push(`Data Transfer: ${dataTransfer} GB`);

    return { total: Math.round(storageCost + transferCost), description: descParts.join(', ') };
  }, [storageType, billingModel, storageAmount, subscriptionPackage, dataTransfer, availablePackages]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `ss-${Date.now()}`,
        service: 'Simple Storage',
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
      title="Simple Storage"
      description="Calculate costs for object storage. Choose your storage type, billing model, and estimate data transfer."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Storage Type</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setStorageType('standard')} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${storageType === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Standard</button>
              <button type="button" onClick={() => setStorageType('cold')} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${storageType === 'cold' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Cold</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Model</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingModel('subscription')} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${billingModel === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Subscription</button>
              <button type="button" onClick={() => setBillingModel('payg')} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${billingModel === 'payg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Pay-As-You-Go</button>
            </div>
          </div>
        </div>

        {billingModel === 'subscription' ? (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="sub-package" className="block text-sm font-medium text-gray-700">Subscription Package (GB)</label>
            <select id="sub-package" value={subscriptionPackage} onChange={e => setSubscriptionPackage(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availablePackages.map(p => <option key={p.gb} value={p.gb}>{p.gb.toLocaleString('vi-VN')} GB - {p.price.toLocaleString('vi-VN')} VNĐ</option>)}
            </select>
          </div>
        ) : (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="payg-amount" className="block text-sm font-medium text-gray-700">Storage Amount (GB)</label>
            <input type="number" id="payg-amount" value={storageAmount} onChange={e => setStorageAmount(Math.max(1, Number(e.target.value)))} min="1" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="data-transfer" className="block text-sm font-medium text-gray-700">Estimated Data Transfer (Download) (GB/Month)</label>
          <input type="number" id="data-transfer" value={dataTransfer} onChange={e => setDataTransfer(Math.max(0, Number(e.target.value)))} min="0" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default SimpleStorageCalculator;