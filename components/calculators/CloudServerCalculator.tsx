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

  const [chipModel, setChipModel] = useState<ChipModel>('intelGen2');
  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [tier, setTier] = useState<TierAmd | TierIntel>('basic');
  
  // Unified states for both chip models
  const [cpuCores, setCpuCores] = useState(4);
  const [ramGb, setRamGb] = useState(8);
  
  const [diskType, setDiskType] = useState<DiskType>('ssd');
  const [diskSize, setDiskSize] = useState('10');
  const [hours, setHours] = useState('720');
  const [quantity, setQuantity] = useState('1');

  const tiersForModel = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.tiers : cloudServerPricing.intelGen2.tiers;

  const currentPricingTier = useMemo(() => {
    return (cloudServerPricing[chipModel] as any)[billingMethod][tier];
  }, [chipModel, billingMethod, tier, cloudServerPricing]);

  const availableDiskTypes = useMemo(() => {
    return currentPricingTier?.disk ? Object.keys(currentPricingTier.disk) as DiskType[] : [];
  }, [currentPricingTier]);
  
  // Effects to reset selections on change
  useEffect(() => {
    const newTiers = chipModel === 'amdGen4' ? cloudServerPricing.amdGen4.tiers : cloudServerPricing.intelGen2.tiers;
    if (!newTiers.includes(tier as any)) {
      setTier(chipModel === 'amdGen4' ? 'premium' : 'basic');
    }
  }, [chipModel, tier, cloudServerPricing]);

  useEffect(() => {
    if (currentPricingTier?.cpu?.length > 0) {
        const currentCpuIsValid = currentPricingTier.cpu.some((c: any) => c.cores === cpuCores);
        if (!currentCpuIsValid) {
            setCpuCores(currentPricingTier.cpu[0].cores);
        }
    }
    if (currentPricingTier?.ram?.length > 0) {
        const currentRamIsValid = currentPricingTier.ram.some((r: any) => r.gb === ramGb);
        if (!currentRamIsValid) {
            setRamGb(currentPricingTier.ram[0].gb);
        }
    }
  }, [currentPricingTier, cpuCores, ramGb]);
  
  useEffect(() => {
    if (!availableDiskTypes.includes(diskType)) {
        if (availableDiskTypes.length > 0) {
            const newDiskType = availableDiskTypes.includes('ssd') ? 'ssd' : availableDiskTypes[0];
            setDiskType(newDiskType as DiskType);
        }
    }
  }, [availableDiskTypes, diskType]);

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    let singleItemTotal = 0;
    
    const diskSizeNum = parseInt(diskSize, 10) || 10;
    const hoursNum = parseInt(hours, 10) || 1;
    const quantityNum = parseInt(quantity, 10) || 1;
    
    if (!currentPricingTier) {
      return { total: 0, singlePrice: 0, descriptionKey: '', descriptionOptions: {} };
    }

    // --- Base Server Calculation Logic ---
    if (billingMethod === 'subscription') {
      const cpuPrice = currentPricingTier.cpu?.find((c: any) => c.cores === cpuCores)?.price || 0;
      const ramPrice = currentPricingTier.ram?.find((r: any) => r.gb === ramGb)?.price || 0;
      singleItemTotal += cpuPrice;
      singleItemTotal += ramPrice;
    } else { // On-Demand
      const effectiveHours = Math.min(hoursNum, 720);
      const cpuPrice = currentPricingTier.cpu?.find((c: any) => c.cores === cpuCores)?.on || 0;
      const ramPrice = currentPricingTier.ram?.find((r: any) => r.gb === ramGb)?.on || 0;
      singleItemTotal += cpuPrice * effectiveHours;
      singleItemTotal += ramPrice * effectiveHours;
    }

    // --- Disk Calculation ---
    const diskPricing = currentPricingTier.disk?.[diskType];
    if (diskPricing) {
        let diskCost = 0;
        if (diskSizeNum <= 100) {
            diskCost = diskPricing.under100GB * diskSizeNum;
        } else {
            diskCost = (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100));
        }

        if (billingMethod === 'onDemand') {
            diskCost *= Math.min(hoursNum, 720);
        }
        singleItemTotal += diskCost;
    }

    const descKey = billingMethod === 'subscription' ? 'cloud_server.desc' : 'cloud_server.desc_hours';
    const descOptions = {
        chip: chipModel === 'amdGen4' ? 'AMD Gen 4' : 'Intel Gen 2',
        tier,
        billing: billingMethod,
        cpu: cpuCores,
        ram: ramGb,
        diskSize: diskSizeNum,
        diskType: diskType.toUpperCase(),
        hours: hoursNum,
    };
    
    const finalSinglePrice = Math.round(singleItemTotal);

    return { 
      total: finalSinglePrice * quantityNum, 
      singlePrice: finalSinglePrice,
      descriptionKey: descKey,
      descriptionOptions: descOptions
    };

  }, [chipModel, billingMethod, tier, cpuCores, ramGb, diskType, diskSize, hours, quantity, t, currentPricingTier]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `cs-${Date.now()}`,
        service: t('services.CloudServer'),
        descriptionKey,
        descriptionOptions,
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
              <button type="button" onClick={() => setChipModel('amdGen4')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${chipModel === 'amdGen4' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-amdgen4`}>AMD Gen 4</button>
              <button type="button" onClick={() => setChipModel('intelGen2')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${chipModel === 'intelGen2' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-intelgen2`}>Intel Gen 2</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('cloud_server.billing_method')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-subscription`}>{t('cloud_server.subscription')}</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-ondemand`}>{t('cloud_server.on_demand')}</button>
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
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as TierAmd | TierIntel)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md capitalize">
              {tiersForModel.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="cpu-cores" className="block text-sm font-medium text-gray-700">{t('cloud_server.vcpu')}</label>
            <select id="cpu-cores" value={cpuCores} onChange={e => setCpuCores(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black rounded-md">
               {currentPricingTier?.cpu?.map((c: {cores: number}) => <option key={c.cores} value={c.cores}>{c.cores} vCPU</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ram-gb" className="block text-sm font-medium text-gray-700">{t('cloud_server.ram')}</label>
            <select id="ram-gb" value={ramGb} onChange={e => setRamGb(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black rounded-md">
              {currentPricingTier?.ram?.map((r: {gb: number}) => <option key={r.gb} value={r.gb}>{r.gb} GB</option>)}
            </select>
          </div>

          <div>
             <label htmlFor="disk-type" className="block text-sm font-medium text-gray-700">{t('cloud_server.disk_type')}</label>
             <select id="disk-type" value={diskType} onChange={e => setDiskType(e.target.value as DiskType)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                {availableDiskTypes.map(dt => <option key={dt} value={dt}>{dt.toUpperCase()}</option>)}
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