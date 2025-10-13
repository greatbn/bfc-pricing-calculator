import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface CloudServerCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type ChipModel = 'amdGen4' | 'intelGen2';
type BillingMethod = 'subscription' | 'onDemand';
type TierAmd = 'premium' | 'enterprise' | 'dedicated';
type TierIntel = 'basic' | 'premium' | 'enterprise' | 'dedicated';
type DiskType = 'hdd' | 'ssd' | 'nvme';

const CloudServerCalculator: React.FC<CloudServerCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const cloudServerPricing = pricing!.cloudServer;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [chipModel, setChipModel] = useState<ChipModel>('amdGen4');
  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [tier, setTier] = useState<TierAmd | TierIntel>('premium');
  
  // AMD states
  const [cpuCoresAmd, setCpuCoresAmd] = useState('4');
  const [ramGbAmd, setRamGbAmd] = useState('8');

  // Intel states
  const [cpuIntel, setCpuIntel] = useState(cloudServerPricing.intelGen2.subscription.premium.cpu[0].cores);
  const [ramIntel, setRamIntel] = useState(cloudServerPricing.intelGen2.subscription.premium.ram[0].gb);
  
  const [diskType, setDiskType] = useState<DiskType>('ssd');
  const [diskSize, setDiskSize] = useState('100');
  const [hours, setHours] = useState('730');
  const [quantity, setQuantity] = useState('1');

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
  }, [chipModel, tier, billingMethod, cloudServerPricing]);
  
  const { total, description, singlePrice } = useMemo(() => {
    let singleItemTotal = 0;
    
    const cpuCoresAmdNum = parseInt(cpuCoresAmd, 10) || 1;
    const ramGbAmdNum = parseInt(ramGbAmd, 10) || 1;
    const diskSizeNum = parseInt(diskSize, 10) || 10;
    const hoursNum = parseInt(hours, 10) || 1;
    const quantityNum = parseInt(quantity, 10) || 1;

    // --- Base Server Calculation Logic ---
    if (billingMethod === 'subscription') {
      if (chipModel === 'amdGen4') {
        const pricing = cloudServerPricing.amdGen4.subscription;
        singleItemTotal += pricing.cpu[tier as TierAmd] * cpuCoresAmdNum;
        singleItemTotal += pricing.ram[tier as TierAmd] * ramGbAmdNum;
      } else { // Intel Gen 2
        const pricing = cloudServerPricing.intelGen2.subscription[tier as TierIntel];
        const cpuPrice = pricing.cpu?.find((c: any) => c.cores === cpuIntel)?.price || 0;
        const ramPrice = pricing.ram?.find((r: any) => r.gb === ramIntel)?.price || 0;
        singleItemTotal += cpuPrice;
        singleItemTotal += ramPrice;
      }
      
      const diskTier = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.disk.subscription : cloudServerPricing.intelGen2.subscription.disk;
      const diskPricing = (diskTier as any)[diskType];
      
      if (diskSizeNum <= 100) {
        singleItemTotal += diskPricing.under100GB * diskSizeNum;
      } else {
        singleItemTotal += (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100));
      }

    } else { // On-Demand
      const effectiveHours = Math.min(hoursNum, 730);
      if (chipModel === 'amdGen4') {
        const pricing = cloudServerPricing.amdGen4.onDemand.on;
        singleItemTotal += pricing.cpu[tier as TierAmd] * cpuCoresAmdNum * effectiveHours;
        singleItemTotal += pricing.ram[tier as TierAmd] * ramGbAmdNum * effectiveHours;
      } else { // Intel Gen 2
        const pricing = cloudServerPricing.intelGen2.onDemand[tier as TierIntel];
        const cpuPrice = pricing.cpu?.find((c: any) => c.cores === cpuIntel)?.on || 0;
        const ramPrice = pricing.ram?.find((r: any) => r.gb === ramIntel)?.on || 0;
        singleItemTotal += cpuPrice * effectiveHours;
        singleItemTotal += ramPrice * effectiveHours;
      }
      
      const diskTier = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.disk.onDemand : cloudServerPricing.intelGen2.onDemand.disk;
      const diskPricing = (diskTier as any)[diskType];
      
      if (diskSizeNum <= 100) {
          singleItemTotal += diskPricing.under100GB * diskSizeNum * effectiveHours;
      } else {
          singleItemTotal += ((diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100))) * effectiveHours;
      }
    }

    // --- Description Generation ---
    const descKey = billingMethod === 'subscription' ? 'cloud_server.desc' : 'cloud_server.desc_hours';
    const descOptions = {
        chip: chipModel === 'amdGen4' ? 'AMD Gen 4' : 'Intel Gen 2',
        tier,
        billing: t(`cloud_server.${billingMethod}`),
        cpu: chipModel === 'amdGen4' ? cpuCoresAmdNum : cpuIntel,
        ram: chipModel === 'amdGen4' ? ramGbAmdNum : ramIntel,
        diskSize: diskSizeNum,
        diskType: diskType.toUpperCase(),
        hours: hoursNum,
    };
    
    const finalDescription = t(descKey, descOptions);
    const finalSinglePrice = Math.round(singleItemTotal);

    return { 
      total: finalSinglePrice * quantityNum, 
      description: finalDescription,
      singlePrice: finalSinglePrice
    };

  }, [chipModel, billingMethod, tier, cpuCoresAmd, ramGbAmd, cpuIntel, ramIntel, diskType, diskSize, hours, quantity, t, cloudServerPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `cs-${Date.now()}`,
        service: t('services.CloudServer'),
        description,
        price: singlePrice,
        quantity: quantityNum,
      });
    }
  };
  
  const handleBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, min: number) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min) {
      setter(String(min));
    }
  };

  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">{t('calculator.estimated_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
      <span className="text-sm text-gray-500">
        {billingMethod === 'subscription' ? t('calculator.per_month') : t('calculator.per_hours', { hours })}
      </span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('cloud_server.title')}
      description={t('cloud_server.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('cloud_server.chip_model')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setChipModel('amdGen4')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${chipModel === 'amdGen4' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>AMD Gen 4</button>
              <button type="button" onClick={() => setChipModel('intelGen2')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${chipModel === 'intelGen2' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Intel Gen 2</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('cloud_server.billing_method')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('cloud_server.subscription')}</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('cloud_server.on_demand')}</button>
            </div>
          </div>
        </div>
        
        {billingMethod === 'onDemand' && (
            <div className="animate-fade-in">
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">{t('cloud_server.hours')}</label>
                <input type="number" id="hours" value={hours} onChange={e => setHours(e.target.value)} onBlur={() => handleBlur(setHours, hours, 1)} min="1" className="mt-1 block w-full sm:w-1/2 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"/>
            </div>
        )}

        <hr/>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">{t('cloud_server.tier')}</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as any)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md capitalize">
              {tiersForModel.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {chipModel === 'amdGen4' ? (
            <>
              <div>
                <label htmlFor="cpu-cores-amd" className="block text-sm font-medium text-gray-700">{t('cloud_server.vcpu_cores')}</label>
                <input type="number" id="cpu-cores-amd" value={cpuCoresAmd} onChange={e => setCpuCoresAmd(e.target.value)} onBlur={() => handleBlur(setCpuCoresAmd, cpuCoresAmd, 1)} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" />
              </div>
              <div>
                <label htmlFor="ram-gb-amd" className="block text-sm font-medium text-gray-700">{t('cloud_server.ram_gb')}</label>
                <input type="number" id="ram-gb-amd" value={ramGbAmd} onChange={e => setRamGbAmd(e.target.value)} onBlur={() => handleBlur(setRamGbAmd, ramGbAmd, 1)} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="cpu-intel" className="block text-sm font-medium text-gray-700">{t('cloud_server.vcpu')}</label>
                <select id="cpu-intel" value={cpuIntel} onChange={e => setCpuIntel(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black rounded-md">
                   {(cloudServerPricing.intelGen2[billingMethod][tier as TierIntel] as any).cpu?.map((c: {cores: number}) => <option key={c.cores} value={c.cores}>{c.cores} vCPU</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ram-intel" className="block text-sm font-medium text-gray-700">{t('cloud_server.ram')}</label>
                <select id="ram-intel" value={ramIntel} onChange={e => setRamIntel(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black rounded-md">
                  {(cloudServerPricing.intelGen2[billingMethod][tier as TierIntel] as any).ram?.map((r: {gb: number}) => <option key={r.gb} value={r.gb}>{r.gb} GB</option>)}
                </select>
              </div>
            </>
          )}

          <div>
             <label htmlFor="disk-type" className="block text-sm font-medium text-gray-700">{t('cloud_server.disk_type')}</label>
             <select id="disk-type" value={diskType} onChange={e => setDiskType(e.target.value as DiskType)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="hdd">HDD</option>
                <option value="ssd">SSD</option>
                <option value="nvme">NVMe</option>
             </select>
          </div>
           <div>
            <label htmlFor="disk-size" className="block text-sm font-medium text-gray-700">{t('cloud_server.disk_size')}</label>
            <input type="number" id="disk-size" value={diskSize} onChange={e => setDiskSize(e.target.value)} onBlur={() => handleBlur(setDiskSize, diskSize, 10)} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" />
          </div>
        </div>

        <hr/>
        
        <div>
            <label htmlFor="quantity-cs" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-cs"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => handleBlur(setQuantity, quantity, 1)}
              min="1"
              className="mt-1 block w-full sm:w-1/4 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default CloudServerCalculator;
