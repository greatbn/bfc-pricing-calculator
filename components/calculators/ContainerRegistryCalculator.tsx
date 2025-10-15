import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface ContainerRegistryCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const ContainerRegistryCalculator: React.FC<ContainerRegistryCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const containerRegistryPricing = pricing!.containerRegistry;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [storage, setStorage] = useState('100'); // GB
  const [dataTransfer, setDataTransfer] = useState('50'); // GB
  const [quantity, setQuantity] = useState('1');

  const { total, singlePrice, descriptionOptions } = useMemo(() => {
    const storageNum = parseInt(storage, 10) || 0;
    const transferNum = parseInt(dataTransfer, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    const storageCost = storageNum * containerRegistryPricing.storagePricePerGBHour * containerRegistryPricing.hoursPerMonth;
    const transferCost = transferNum * containerRegistryPricing.dataTransferPricePerGB;
    
    const price = Math.round(storageCost + transferCost);

    return {
      total: price * quantityNum,
      singlePrice: price,
      descriptionOptions: { storage: storageNum, transfer: transferNum },
    };
  }, [storage, dataTransfer, quantity, containerRegistryPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `cr-${Date.now()}`,
        service: t('services.ContainerRegistry'),
        descriptionKey: 'container_registry.desc',
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
      title={t('container_registry.title')}
      description={t('container_registry.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cr-storage" className="block text-sm font-medium text-gray-700">{t('container_registry.storage')}</label>
            <input
              type="number"
              id="cr-storage"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              onBlur={() => handleBlur(setStorage, storage, 0)}
              min="0"
              step="10"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
          </div>
          <div>
            <label htmlFor="cr-transfer" className="block text-sm font-medium text-gray-700">{t('container_registry.data_transfer')}</label>
            <input
              type="number"
              id="cr-transfer"
              value={dataTransfer}
              onChange={(e) => setDataTransfer(e.target.value)}
              onBlur={() => handleBlur(setDataTransfer, dataTransfer, 0)}
              min="0"
              step="10"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="quantity-cr" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
          <input
            type="number"
            id="quantity-cr"
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

export default ContainerRegistryCalculator;
