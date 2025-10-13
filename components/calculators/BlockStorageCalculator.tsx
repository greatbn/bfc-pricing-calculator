import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface BlockStorageCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type BillingMethod = 'subscription' | 'onDemand';
type DiskType = 'hdd' | 'ssd' | 'nvme';

const BlockStorageCalculator: React.FC<BlockStorageCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const blockStoragePricing = pricing!.blockStorage;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [diskType, setDiskType] = useState<DiskType>('ssd');
  const [diskSize, setDiskSize] = useState('100');
  const [hours, setHours] = useState('730');
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    let singleItemTotal = 0;
    
    const pricingSource = blockStoragePricing; 
    const diskSizeNum = parseInt(diskSize, 10) || 10;
    const hoursNum = parseInt(hours, 10) || 1;
    const quantityNum = parseInt(quantity, 10) || 1;

    if (billingMethod === 'subscription') {
      const diskPricing = pricingSource.subscription[diskType];
      if (diskSizeNum <= 100) {
        singleItemTotal = diskPricing.under100GB * diskSizeNum;
      } else {
        singleItemTotal = (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100));
      }
    } else { // On-Demand
      const effectiveHours = Math.min(hoursNum, 730);
      const diskPricing = pricingSource.onDemand[diskType];
      if (diskSizeNum <= 100) {
        singleItemTotal = diskPricing.under100GB * diskSizeNum * effectiveHours;
      } else {
        singleItemTotal = ((diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100))) * effectiveHours;
      }
    }
    
    const descKey = billingMethod === 'subscription' ? 'block_storage.desc' : 'block_storage.desc_hours';
    const descOptions = {
        billing: t(`block_storage.${billingMethod}`),
        diskSize: diskSizeNum,
        diskType: diskType.toUpperCase(),
        hours: hoursNum
    };
    
    const finalPrice = Math.round(singleItemTotal);

    return { 
      total: finalPrice * quantityNum, 
      description: t(descKey, descOptions),
      singlePrice: finalPrice
    };
  }, [billingMethod, diskType, diskSize, hours, quantity, t, blockStoragePricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `bs-${Date.now()}`,
        service: t('services.BlockStorage'),
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
      title={t('block_storage.title')}
      description={t('block_storage.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('block_storage.billing_method')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('block_storage.subscription')}</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('block_storage.on_demand')}</button>
            </div>
          </div>
          {billingMethod === 'onDemand' && (
            <div className="animate-fade-in">
                <label htmlFor="bs-hours" className="block text-sm font-medium text-gray-700">{t('block_storage.hours')}</label>
                <input type="number" id="bs-hours" value={hours} onChange={e => setHours(e.target.value)} onBlur={() => handleBlur(setHours, hours, 1)} min="1" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"/>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label htmlFor="bs-disk-type" className="block text-sm font-medium text-gray-700">{t('block_storage.disk_type')}</label>
             <select id="bs-disk-type" value={diskType} onChange={e => setDiskType(e.target.value as DiskType)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="hdd">HDD</option>
                <option value="ssd">SSD</option>
                <option value="nvme">NVMe</option>
             </select>
          </div>
           <div>
            <label htmlFor="bs-disk-size" className="block text-sm font-medium text-gray-700">{t('block_storage.disk_size')}</label>
            <input type="number" id="bs-disk-size" value={diskSize} onChange={e => setDiskSize(e.target.value)} onBlur={() => handleBlur(setDiskSize, diskSize, 10)} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>
        <div className="pt-2">
            <label htmlFor="quantity-bs" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-bs"
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

export default BlockStorageCalculator;
