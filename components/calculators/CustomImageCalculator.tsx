import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface CustomImageCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const CustomImageCalculator: React.FC<CustomImageCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const customImagePricing = pricing!.customImage;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [size, setSize] = useState('20');
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    const sizeNum = parseInt(size, 10) || 1;
    const quantityNum = parseInt(quantity, 10) || 1;
    const price = sizeNum * customImagePricing.pricePerGB;
    return { 
      total: price * quantityNum, 
      description: t('custom_image.desc', { size: sizeNum }),
      singlePrice: price
    };
  }, [size, quantity, t, customImagePricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `customimg-${Date.now()}`,
        service: t('services.CustomImage'),
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
      <span className="text-gray-600">{t('calculator.total_monthly_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('custom_image.title')}
      description={t('custom_image.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:w-1/2">
           <div>
              <label htmlFor="custom-image-size" className="block text-sm font-medium text-gray-700">{t('custom_image.size')}</label>
              <input 
                type="number" 
                id="custom-image-size" 
                value={size} 
                onChange={e => setSize(e.target.value)} 
                onBlur={() => handleBlur(setSize, size, 1)}
                min="1" 
                step="10" 
                className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md" 
              />
          </div>
        </div>
        <div>
            <label htmlFor="quantity-ci" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-ci"
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

export default CustomImageCalculator;
