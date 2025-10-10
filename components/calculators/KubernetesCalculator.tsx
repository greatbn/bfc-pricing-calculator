import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { kubernetesPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface KubernetesCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const KubernetesCalculator: React.FC<KubernetesCalculatorProps> = ({ onAddItem }) => {
  const [planType, setPlanType] = useState<'standard' | 'everywhere'>('standard');
  const [selectedPackage, setSelectedPackage] = useState(kubernetesPricing.standard[0].name);

  useEffect(() => {
    if (planType === 'standard') {
      setSelectedPackage(kubernetesPricing.standard[0].name);
    } else {
      setSelectedPackage(kubernetesPricing.everywhere[0].name);
    }
  }, [planType]);

  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    let desc = '';

    if (planType === 'standard') {
      const pkg = kubernetesPricing.standard.find(p => p.name === selectedPackage);
      if (pkg) {
        currentTotal = pkg.price;
        desc = `Standard Plan: ${pkg.name}`;
      }
    } else {
      const pkg = kubernetesPricing.everywhere.find(p => p.name === selectedPackage);
      if (pkg) {
        currentTotal = pkg.price;
        desc = `Everywhere Plan: ${pkg.name} (Up to ${pkg.maxNodes} nodes)`;
      }
    }

    return { total: currentTotal, description: desc };
  }, [planType, selectedPackage]);

  const handleAdd = () => {
    onAddItem({
      id: `k8s-${Date.now()}`,
      service: 'Kubernetes Engine',
      description,
      price: total,
      quantity: 1,
    });
  };

  const packageOptions = planType === 'standard' ? kubernetesPricing.standard : kubernetesPricing.everywhere;
  
  const summaryContent = (
      <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
        <span className="text-gray-600">Management fee: </span>
        <span className="text-xl font-bold text-blue-700">{total.toLocaleString('vi-VN')} VNĐ</span>
      </div>
  );

  return (
    <CalculatorWrapper
      title="Kubernetes Engine"
      description="Calculate the monthly management fee for your Kubernetes cluster."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPlanType('standard')}
              className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md w-1/2 ${planType === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setPlanType('everywhere')}
              className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md w-1/2 ${planType === 'everywhere' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Everywhere
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="k8s-package" className="block text-sm font-medium text-gray-700">Package</label>
          <select
            id="k8s-package"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {packageOptions.map(p => <option key={p.name} value={p.name}>{p.name} - {p.price.toLocaleString('vi-VN')} VNĐ/month</option>)}
          </select>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-r-lg">
        <p className="font-bold">Additional Costs</p>
        <p className="text-sm">Worker nodes (Cloud Server), Persistent Volumes, and Load Balancers are billed separately. Please add them to your estimate using their respective calculators.</p>
      </div>
    </CalculatorWrapper>
  );
};

export default KubernetesCalculator;