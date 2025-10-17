import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface SnapshotCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type Tier = 'basic' | 'premium' | 'enterprise' | 'dedicated';
type VolumeType = 'hdd' | 'ssd' | 'nvme';

const SnapshotCalculator: React.FC<SnapshotCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const { snapshot: snapshotPricing, blockStorage: blockStoragePricing } = pricing!;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [tier, setTier] = useState<Tier>('basic');
  const [volumeType, setVolumeType] = useState<VolumeType>('ssd');
  const [volumeSize, setVolumeSize] = useState('100');
  const [quantity, setQuantity] = useState('1');

  const availableTiers: Tier[] = ['basic', 'premium', 'enterprise', 'dedicated'];
  
  const availableVolumeTypes = useMemo(() => {
    const tierPricing = blockStoragePricing.subscription[tier as keyof typeof blockStoragePricing.subscription];
    if (!tierPricing) return [];
    return Object.keys(tierPricing) as VolumeType[];
  }, [tier, blockStoragePricing]);

  useEffect(() => {
    if (!availableVolumeTypes.includes(volumeType)) {
        setVolumeType(availableVolumeTypes.includes('ssd') ? 'ssd' : availableVolumeTypes[0] || 'hdd');
    }
  }, [availableVolumeTypes, volumeType]);

  const { total, singlePrice, descriptionOptions } = useMemo(() => {
    const sizeNum = parseInt(volumeSize, 10) || 10;
    const quantityNum = parseInt(quantity, 10) || 1;

    const tierPricing = blockStoragePricing.subscription[tier];
    if (!tierPricing) {
      return { total: 0, singlePrice: 0, descriptionOptions: {} };
    }

    const diskPricing = tierPricing[volumeType];
    if (!diskPricing) {
      return { total: 0, singlePrice: 0, descriptionOptions: {} };
    }

    let blockStorageCost = 0;
    if (sizeNum <= 100) {
      blockStorageCost = (diskPricing.under100GB || 0) * sizeNum;
    } else {
      blockStorageCost = ((diskPricing.under100GB || 0) * 100) + ((diskPricing.over100GB || 0) * (sizeNum - 100));
    }
    
    const snapshotCost = blockStorageCost * snapshotPricing.costPercentageOfBlockStorage;
    const finalSinglePrice = Math.round(snapshotCost);

    return { 
      total: finalSinglePrice * quantityNum, 
      singlePrice: finalSinglePrice,
      descriptionOptions: { 
        size: sizeNum,
        type: volumeType.toUpperCase(),
        tier: tier,
      }
    };
  }, [tier, volumeType, volumeSize, quantity, snapshotPricing, blockStoragePricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `snapshot-${Date.now()}`,
        service: t('services.Snapshot'),
        descriptionKey: 'snapshot.desc',
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
      <span className="text-gray-600">{t('calculator.total_monthly_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('snapshot.title')}
      description={t('snapshot.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="snapshot-tier" className="block text-sm font-medium text-gray-700">{t('snapshot.tier')}</label>
            <select
              id="snapshot-tier"
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black capitalize focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {availableTiers.map(t_option => <option key={t_option} value={t_option}>{t(`block_storage.${t_option}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="snapshot-volume-type" className="block text-sm font-medium text-gray-700">{t('snapshot.volume_type')}</label>
            <select
              id="snapshot-volume-type"
              value={volumeType}
              onChange={(e) => setVolumeType(e.target.value as VolumeType)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {availableVolumeTypes.map(vt => <option key={vt} value={vt}>{vt.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="snapshot-volume-size" className="block text-sm font-medium text-gray-700">{t('snapshot.volume_size')}</label>
            <input 
              type="number" 
              id="snapshot-volume-size" 
              value={volumeSize} 
              onChange={e => setVolumeSize(e.target.value)} 
              onBlur={() => handleBlur(setVolumeSize, volumeSize, 10)}
              min="10" 
              step="10" 
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="quantity-snap" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
          <input
            type="number"
            id="quantity-snap"
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

export default SnapshotCalculator;