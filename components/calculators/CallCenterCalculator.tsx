import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface CallCenterCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const CallCenterCalculator: React.FC<CallCenterCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const callCenterPricing = pricing!.callCenter;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [selectedPackageName, setSelectedPackageName] = useState(callCenterPricing.packages[0].name);
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    const selectedPackage = callCenterPricing.packages.find((p: any) => p.name === selectedPackageName);
    
    if (!selectedPackage) {
      return { total: 0, description: '', singlePrice: 0 };
    }
    
    const price = selectedPackage.price;
    const desc = t('call_center.desc', { name: selectedPackage.name, details: selectedPackage.details });
    const quantityNum = parseInt(quantity, 10) || 1;

    return { 
      total: price * quantityNum, 
      description: desc,
      singlePrice: price
    };
  }, [selectedPackageName, quantity, t, callCenterPricing]);

  const handleAdd = () => {
    const quantityNum = parseInt(quantity, 10) || 1;
    if (total > 0) {
      onAddItem({
        id: `cc-${Date.now()}`,
        service: t('services.CallCenter'),
        description,
        price: singlePrice,
        quantity: quantityNum,
      });
    }
  };

  const handleQuantityBlur = () => {
    const value = parseInt(quantity, 10);
    if (isNaN(value) || value < 1) {
      setQuantity('1');
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
      title={t('call_center.title')}
      description={t('call_center.description')}
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1">
          <div>
            <label htmlFor="cc-package" className="block text-sm font-medium text-gray-700">{t('call_center.package')}</label>
            <select
              id="cc-package"
              value={selectedPackageName}
              onChange={(e) => setSelectedPackageName(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {callCenterPricing.packages.map((p: any) => (
                <option key={p.name} value={p.name}>
                  {t('call_center.package_option', { name: p.name, details: p.details, price: p.price.toLocaleString(numberLocale)})}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
            <label htmlFor="quantity-cc" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-cc"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={handleQuantityBlur}
              min="1"
              className="mt-1 block w-full sm:w-1/4 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
        </div>
      </div>
    </CalculatorWrapper>
  );
};

export default CallCenterCalculator;
