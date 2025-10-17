import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface CdnCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const CdnCalculator: React.FC<CdnCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const cdnPricing = pricing!.cdn;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [dataTransfer, setDataTransfer] = useState('200');
  const [quantity, setQuantity] = useState('1');

  const { total, singlePrice, currentTierPrice, descriptionOptions } = useMemo(() => {
    const dataTransferNum = parseInt(dataTransfer, 10) || 0;
    const effectiveDataTransfer = Math.max(dataTransferNum, cdnPricing.minGB);

    let pricePerGB = cdnPricing.tiers[cdnPricing.tiers.length - 1].pricePerGB;
    for (const tier of cdnPricing.tiers) {
      if (tier.maxGB === null || effectiveDataTransfer <= tier.maxGB) {
        pricePerGB = tier.pricePerGB;
        break;
      }
    }

    const calculatedPrice = effectiveDataTransfer * pricePerGB;
    const singleItemTotal = Math.max(calculatedPrice, cdnPricing.minPrice);

    const quantityNum = parseInt(quantity, 10) || 1;
    
    return { 
      total: singleItemTotal * quantityNum, 
      singlePrice: singleItemTotal,
      currentTierPrice: pricePerGB,
      descriptionOptions: { transfer: dataTransferNum }
    };
  }, [dataTransfer, quantity, cdnPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `cdn-${Date.now()}`,
        service: t('services.CDN'),
        descriptionKey: 'cdn.desc',
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
      <p className="text-gray-600">
        {t('calculator.total_monthly_cost')}:{' '}
        <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {t('cdn.price_tier_info', { price: currentTierPrice.toLocaleString(numberLocale)})}
      </p>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('cdn.title')}
      description={t('cdn.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:w-1/2">
           <div>
              <label htmlFor="cdn-transfer" className="block text-sm font-medium text-gray-700">{t('cdn.data_transfer_gb')}</label>
              <input 
                type="number" 
                id="cdn-transfer" 
                value={dataTransfer} 
                onChange={e => setDataTransfer(e.target.value)} 
                onBlur={() => handleBlur(setDataTransfer, dataTransfer, cdnPricing.minGB)}
                min={cdnPricing.minGB}
                step="100" 
                className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" 
              />
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded-r-lg">
          {t('cdn.min_usage_note')}
        </div>

        <div>
            <label htmlFor="quantity-cdn" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-cdn"
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

export default CdnCalculator;