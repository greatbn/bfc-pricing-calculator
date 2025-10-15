import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface LMSCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const LMSCalculator: React.FC<LMSCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const lmsPricing = pricing!.lms;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [selectedPackageName, setSelectedPackageName] = useState(lmsPricing.packages[0].name);
  const [additionalStorageGB, setAdditionalStorageGB] = useState('0');
  const [quantity, setQuantity] = useState('1');

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    const selectedPackage = lmsPricing.packages.find((p: any) => p.name === selectedPackageName);
    if (!selectedPackage) return { total: 0, singlePrice: 0, descriptionKey: '', descriptionOptions: {} };

    let singleItemTotal = selectedPackage.price;
    const additionalStorageGBNum = parseInt(additionalStorageGB, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;
    
    if (additionalStorageGBNum > 0) {
      const { blockSizeGB, pricePerBlock } = lmsPricing.additionalStorage;
      const numberOfBlocks = Math.ceil(additionalStorageGBNum / blockSizeGB);
      const storageCost = numberOfBlocks * pricePerBlock;
      singleItemTotal += storageCost;
    }

    const descKey = additionalStorageGBNum > 0 ? 'lms.desc_additional' : 'lms.desc';
    const descOptions = {
        name: selectedPackage.name,
        ccu: selectedPackage.ccu,
        storage: selectedPackage.freeStorageGB,
        additional: additionalStorageGBNum
    };

    return { 
      total: singleItemTotal * quantityNum, 
      singlePrice: singleItemTotal,
      descriptionKey: descKey,
      descriptionOptions: descOptions
    };
  }, [selectedPackageName, additionalStorageGB, quantity, lmsPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `lms-${Date.now()}`,
        service: t('services.LMS'),
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
      <span className="text-gray-600">{t('calculator.total_monthly_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('lms.title')}
      description={t('lms.description')}
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lms-package" className="block text-sm font-medium text-gray-700">{t('lms.package')}</label>
            <select
              id="lms-package"
              value={selectedPackageName}
              onChange={(e) => setSelectedPackageName(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {lmsPricing.packages.map((p: any) => (
                <option key={p.name} value={p.name}>
                  {t('lms.package_option', { name: p.name, ccu: p.ccu, price: p.price.toLocaleString(numberLocale) })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="additional-storage" className="block text-sm font-medium text-gray-700">
                {t('lms.additional_storage')}
            </label>
            <input
              type="number"
              id="additional-storage"
              value={additionalStorageGB}
              onChange={e => setAdditionalStorageGB(e.target.value)}
              onBlur={() => handleBlur(setAdditionalStorageGB, additionalStorageGB, 0)}
              min="0"
              step={lmsPricing.additionalStorage.blockSizeGB}
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">
                {t('lms.storage_note', { 
                    blockSize: lmsPricing.additionalStorage.blockSizeGB, 
                    price: lmsPricing.additionalStorage.pricePerBlock.toLocaleString(numberLocale)
                })}
            </p>
          </div>
        </div>
        <div>
            <label htmlFor="quantity-lms" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-lms"
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

export default LMSCalculator;
