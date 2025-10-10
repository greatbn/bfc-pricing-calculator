import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { cloudServerPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface CloudServerCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type ChipModel = 'amdGen4' | 'intelGen2';
type BillingMethod = 'subscription' | 'onDemand';
type TierAmd = 'premium' | 'enterprise' | 'dedicated';
type TierIntel = 'basic' | 'premium' | 'enterprise' | 'dedicated';
type DiskType = 'hdd' | 'ssd' | 'nvme';

const CloudServerCalculator: React.FC<CloudServerCalculatorProps> = ({ onAddItem }) => {
  const [chipModel, setChipModel] = useState<ChipModel>('amdGen4');
  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [tier, setTier] = useState<TierAmd | TierIntel>('premium');
  
  // AMD states
  const [cpuCoresAmd, setCpuCoresAmd] = useState(4);
  const [ramGbAmd, setRamGbAmd] = useState(8);

  // Intel states
  const [cpuIntel, setCpuIntel] = useState(cloudServerPricing.intelGen2.subscription.premium.cpu[0].cores);
  const [ramIntel, setRamIntel] = useState(cloudServerPricing.intelGen2.subscription.premium.ram[0].gb);
  
  const [diskType, setDiskType] = useState<DiskType>('ssd');
  const [diskSize, setDiskSize] = useState(100);
  const [hours, setHours] = useState(730);
  
  const tiersForModel = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.tiers : cloudServerPricing.intelGen2.tiers;

  // Effects to reset selections on change
  useEffect(() => {
    setTier(chipModel === 'amdGen4' ? 'premium' : 'basic');
  }, [chipModel]);

  useEffect(() => {
    if (chipModel === 'intelGen2' && billingMethod === 'subscription') {
      const pricing = cloudServerPricing.intelGen2.subscription[tier as TierIntel];
      if(pricing.cpu) setCpuIntel(pricing.cpu[0].cores);
      if(pricing.ram) setRamIntel(pricing.ram[0].gb);
    }
     if (chipModel === 'intelGen2' && billingMethod === 'onDemand') {
      const pricing = cloudServerPricing.intelGen2.onDemand[tier as TierIntel];
      if(pricing.cpu) setCpuIntel(pricing.cpu[0].cores);
      if(pricing.ram) setRamIntel(pricing.ram[0].gb);
    }
  }, [chipModel, tier, billingMethod]);
  
  const { total, description } = useMemo(() => {
    let currentTotal = 0;
    const descParts: string[] = [`Chip: ${chipModel === 'amdGen4' ? 'AMD Gen 4' : 'Intel Gen 2'}`, `Tier: ${tier}`, `Billing: ${billingMethod}`];
    
    // --- Calculation Logic ---
    if (billingMethod === 'subscription') {
      if (chipModel === 'amdGen4') {
        const pricing = cloudServerPricing.amdGen4.subscription;
        currentTotal += pricing.cpu[tier as TierAmd] * cpuCoresAmd;
        currentTotal += pricing.ram[tier as TierAmd] * ramGbAmd;
        descParts.push(`${cpuCoresAmd} vCPU`);
        descParts.push(`${ramGbAmd}GB RAM`);
      } else { // Intel Gen 2
        const pricing = cloudServerPricing.intelGen2.subscription[tier as TierIntel];
        const cpuPrice = pricing.cpu?.find(c => c.cores === cpuIntel)?.price || 0;
        const ramPrice = pricing.ram?.find(r => r.gb === ramIntel)?.price || 0;
        currentTotal += cpuPrice;
        currentTotal += ramPrice;
        descParts.push(`${cpuIntel} vCPU`);
        descParts.push(`${ramIntel}GB RAM`);
      }
      
      const diskTier = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.disk.subscription : cloudServerPricing.intelGen2.subscription.disk;
      const diskPricing = (diskTier as any)[diskType];
      
      if (diskSize <= 100) {
        currentTotal += diskPricing.under100GB * diskSize;
      } else {
        currentTotal += (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSize - 100));
      }

    } else { // On-Demand
      const effectiveHours = Math.min(hours, 730);
      if (chipModel === 'amdGen4') {
        const pricing = cloudServerPricing.amdGen4.onDemand.on;
        currentTotal += pricing.cpu[tier as TierAmd] * cpuCoresAmd * effectiveHours;
        currentTotal += pricing.ram[tier as TierAmd] * ramGbAmd * effectiveHours;
        descParts.push(`${cpuCoresAmd} vCPU`);
        descParts.push(`${ramGbAmd}GB RAM`);
      } else { // Intel Gen 2
        const pricing = cloudServerPricing.intelGen2.onDemand[tier as TierIntel];
        const cpuPrice = pricing.cpu?.find(c => c.cores === cpuIntel)?.on || 0;
        const ramPrice = pricing.ram?.find(r => r.gb === ramIntel)?.on || 0;
        currentTotal += cpuPrice * effectiveHours;
        currentTotal += ramPrice * effectiveHours;
        descParts.push(`${cpuIntel} vCPU`);
        descParts.push(`${ramIntel}GB RAM`);
      }
      
      const diskTier = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.disk.onDemand : cloudServerPricing.intelGen2.onDemand.disk;
      const diskPricing = (diskTier as any)[diskType];
      
      if (diskSize <= 100) {
          currentTotal += diskPricing.under100GB * diskSize * effectiveHours;
      } else {
          currentTotal += ((diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSize - 100))) * effectiveHours;
      }
      descParts.push(`${effectiveHours} hours`);
    }

    descParts.push(`${diskSize}GB ${diskType.toUpperCase()}`);

    return { total: Math.round(currentTotal), description: descParts.join(', ') };

  }, [chipModel, billingMethod, tier, cpuCoresAmd, ramGbAmd, cpuIntel, ramIntel, diskType, diskSize, hours]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `cs-${Date.now()}`,
        service: 'Cloud Server',
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
      title="Cloud Server"
      description="Configure your virtual machine by selecting a chip model, billing method, and resources."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chip Model</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setChipModel('amdGen4')} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md w-full ${chipModel === 'amdGen4' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>AMD Gen 4</button>
              <button type="button" onClick={() => setChipModel('intelGen2')} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md w-full ${chipModel === 'intelGen2' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Intel Gen 2</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Method</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Subscription</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>On-Demand</button>
            </div>
          </div>
        </div>
        
        {billingMethod === 'onDemand' && (
            <div className="animate-fade-in">
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Number of Hours</label>
                <input type="number" id="hours" value={hours} onChange={e => setHours(Math.max(1, Number(e.target.value)))} min="1" className="mt-1 block w-full sm:w-1/2 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"/>
            </div>
        )}

        <hr/>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">Server Tier</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as any)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md capitalize">
              {tiersForModel.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {chipModel === 'amdGen4' ? (
            <>
              <div>
                <label htmlFor="cpu-cores-amd" className="block text-sm font-medium text-gray-700">vCPU Cores</label>
                <input type="number" id="cpu-cores-amd" value={cpuCoresAmd} onChange={e => setCpuCoresAmd(Math.max(1, Number(e.target.value)))} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="ram-gb-amd" className="block text-sm font-medium text-gray-700">RAM (GB)</label>
                <input type="number" id="ram-gb-amd" value={ramGbAmd} onChange={e => setRamGbAmd(Math.max(1, Number(e.target.value)))} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="cpu-intel" className="block text-sm font-medium text-gray-700">vCPU</label>
                <select id="cpu-intel" value={cpuIntel} onChange={e => setCpuIntel(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 rounded-md">
                   {(cloudServerPricing.intelGen2[billingMethod][tier as TierIntel] as any).cpu?.map((c: {cores: number}) => <option key={c.cores} value={c.cores}>{c.cores} vCPU</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ram-intel" className="block text-sm font-medium text-gray-700">RAM</label>
                <select id="ram-intel" value={ramIntel} onChange={e => setRamIntel(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 rounded-md">
                  {(cloudServerPricing.intelGen2[billingMethod][tier as TierIntel] as any).ram?.map((r: {gb: number}) => <option key={r.gb} value={r.gb}>{r.gb} GB</option>)}
                </select>
              </div>
            </>
          )}

          <div>
             <label htmlFor="disk-type" className="block text-sm font-medium text-gray-700">Disk Type</label>
             <select id="disk-type" value={diskType} onChange={e => setDiskType(e.target.value as DiskType)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 rounded-md">
                <option value="hdd">HDD</option>
                <option value="ssd">SSD</option>
                <option value="nvme">NVMe</option>
             </select>
          </div>
           <div>
            <label htmlFor="disk-size" className="block text-sm font-medium text-gray-700">Disk Size (GB)</label>
            <input type="number" id="disk-size" value={diskSize} onChange={e => setDiskSize(Math.max(10, Number(e.target.value)))} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default CloudServerCalculator;