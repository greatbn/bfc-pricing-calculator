import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { databasePricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface DatabaseCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type Tier = 'premium' | 'enterprise' | 'dedicated';

const DatabaseCalculator: React.FC<DatabaseCalculatorProps> = ({ onAddItem }) => {
  const [tier, setTier] = useState<Tier>('premium');
  const [cpuCores, setCpuCores] = useState(databasePricing.cpu.premium[0].cores);
  const [ramGB, setRamGB] = useState(databasePricing.ram.premium[0].gb);
  const [diskSize, setDiskSize] = useState(20);
  const [backupSize, setBackupSize] = useState(0);

  const availableCpus = databasePricing.cpu[tier];
  const availableRams = databasePricing.ram[tier];
  
  useEffect(() => {
    // When tier changes, reset CPU and RAM to the first available option.
    // The dependency is only 'tier' to prevent the effect from re-running
    // on every render and resetting user selections within the same tier.
    const currentCpus = databasePricing.cpu[tier];
    const currentRams = databasePricing.ram[tier];
    setCpuCores(currentCpus[0].cores);
    setRamGB(currentRams[0].gb);
  }, [tier]);

  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    const { hoursPerMonth } = databasePricing;
    const descParts: string[] = [`Tier: ${tier}`];

    const selectedCpu = availableCpus.find(c => c.cores === cpuCores);
    if (selectedCpu) {
      currentTotal += selectedCpu.price * hoursPerMonth;
      descParts.push(`${cpuCores} vCPU`);
    }

    const selectedRam = availableRams.find(r => r.gb === ramGB);
    if (selectedRam) {
      currentTotal += selectedRam.price * hoursPerMonth;
      descParts.push(`${ramGB} GB RAM`);
    }
    
    let diskCost = 0;
    if (diskSize <= 100) {
        diskCost = diskSize * databasePricing.disk.pricePerGBHourFirst100GB;
    } else {
        diskCost = (100 * databasePricing.disk.pricePerGBHourFirst100GB) + ((diskSize - 100) * databasePricing.disk.pricePerGBHourAfter100GB);
    }
    currentTotal += diskCost * hoursPerMonth;
    descParts.push(`${diskSize} GB Disk`);

    if (backupSize > 0) {
      currentTotal += backupSize * databasePricing.backup.pricePerGBHour * hoursPerMonth;
      descParts.push(`${backupSize} GB Backup`);
    }

    return { total: Math.round(currentTotal), description: descParts.join(', ') };
  }, [tier, cpuCores, ramGB, diskSize, backupSize, availableCpus, availableRams]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `db-${Date.now()}`,
        service: 'Database',
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
      title="Database as a Service"
      description="Calculate monthly costs for managed databases. Prices are based on hourly rates, calculated for a full month (730 hours)."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">Database Tier</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as Tier)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
              <option value="dedicated">Dedicated</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">CPU Cores</label>
            <select id="cpu" value={cpuCores} onChange={e => setCpuCores(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availableCpus.map(c => <option key={c.cores} value={c.cores}>{c.cores} vCPU</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="ram" className="block text-sm font-medium text-gray-700">RAM (GB)</label>
            <select id="ram" value={ramGB} onChange={e => setRamGB(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availableRams.map(r => <option key={r.gb} value={r.gb}>{r.gb} GB</option>)}
            </select>
          </div>
        
          <div>
            <label htmlFor="disk" className="block text-sm font-medium text-gray-700">Data Disk (GB)</label>
            <input type="number" id="disk" value={diskSize} onChange={e => setDiskSize(Math.max(10, Number(e.target.value)))} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
           <div>
            <label htmlFor="backup" className="block text-sm font-medium text-gray-700">Backup Storage (GB)</label>
            <input type="number" id="backup" value={backupSize} onChange={e => setBackupSize(Math.max(0, Number(e.target.value)))} min="0" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default DatabaseCalculator;