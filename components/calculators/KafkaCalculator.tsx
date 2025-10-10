import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import { kafkaPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface KafkaCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type Tier = 'premium' | 'enterprise' | 'dedicated';

const KafkaCalculator: React.FC<KafkaCalculatorProps> = ({ onAddItem }) => {
  const [tier, setTier] = useState<Tier>('premium');
  const [cpuCores, setCpuCores] = useState(4);
  const [ramGB, setRamGB] = useState(16);
  const [diskSize, setDiskSize] = useState(100);
  const [hasWanIp, setHasWanIp] = useState(true);

  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    const descParts: string[] = [`Tier: ${tier}`];

    const cpuPrice = kafkaPricing.cpu[tier] * cpuCores;
    currentTotal += cpuPrice;
    descParts.push(`${cpuCores} vCPU`);

    const ramPrice = kafkaPricing.ram[tier] * ramGB;
    currentTotal += ramPrice;
    descParts.push(`${ramGB} GB RAM`);
    
    const diskPrice = kafkaPricing.disk.price * diskSize;
    currentTotal += diskPrice;
    descParts.push(`${diskSize} GB SSD`);

    if (hasWanIp) {
      currentTotal += kafkaPricing.wanIP.price;
      descParts.push('WAN IP');
    }

    return { total: currentTotal, description: descParts.join(', ') };
  }, [tier, cpuCores, ramGB, diskSize, hasWanIp]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `kafka-${Date.now()}`,
        service: 'Kafka',
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
      title="Bizfly Cloud Kafka"
      description="Configure your managed Kafka service based on resource allocation. Prices are calculated on a monthly basis."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">Service Tier</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as Tier)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
              <option value="dedicated">Dedicated</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">CPU Cores</label>
             <input type="number" id="cpu" value={cpuCores} onChange={e => setCpuCores(Math.max(1, Number(e.target.value)))} min="1" step="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>

          <div>
            <label htmlFor="ram" className="block text-sm font-medium text-gray-700">RAM (GB)</label>
            <input type="number" id="ram" value={ramGB} onChange={e => setRamGB(Math.max(1, Number(e.target.value)))} min="1" step="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>

          <div>
            <label htmlFor="disk" className="block text-sm font-medium text-gray-700">SSD Storage (GB)</label>
            <input type="number" id="disk" value={diskSize} onChange={e => setDiskSize(Math.max(10, Number(e.target.value)))} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>
         <div className="mt-4">
          <div className="flex items-center">
              <input id="wanip-kafka" name="wanip" type="checkbox" checked={hasWanIp} onChange={e => setHasWanIp(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
              <label htmlFor="wanip-kafka" className="ml-2 block text-sm text-gray-900">Include WAN IP (+{kafkaPricing.wanIP.price.toLocaleString('vi-VN')} VNĐ/month)</label>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default KafkaCalculator;