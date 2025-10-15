import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface CloudVpsCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const CloudVpsCalculator: React.FC<CloudVpsCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const cloudVpsPricing = pricing!.cloudVps;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [selectedPackageId, setSelectedPackageId] = useState(cloudVpsPricing.packages[0].id);
  const [quantity, setQuantity] = useState('1');

  const { total, descriptionKey, descriptionOptions, singlePrice } = useMemo(() => {
    const selectedPackage = cloudVpsPricing.packages.find((p: any) => p.id === selectedPackageId);
    
    if (!selectedPackage) {
      return { total: 0, descriptionKey: '', descriptionOptions: {}, singlePrice: 0 };
    }
    
    const price = selectedPackage.price;
    const quantityNum = parseInt(quantity, 10) || 1;

    return { 
      total: price * quantityNum, 
      descriptionKey: 'cloud_vps.desc',
      descriptionOptions: { cpu: selectedPackage.cpu, ram: selectedPackage.ram, ssd: selectedPackage.ssd },
      singlePrice: price
    };
  }, [selectedPackageId, quantity, cloudVpsPricing]);

  const handleAdd = () => {
    const quantityNum = parseInt(quantity, 10) || 1;
    if (total > 0) {
      onAddItem({
        id: `vps-${Date.now()}`,
        service: t('services.CloudVps'),
        descriptionKey,
        descriptionOptions,
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
      title={t('cloud_vps.title')}
      description={t('cloud_vps.description')}
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1">
          <div>
            <label htmlFor="vps-package" className="block text-sm font-medium text-gray-700">{t('cloud_vps.package')}</label>
            <select
              id="vps-package"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {cloudVpsPricing.packages.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {t('cloud_vps.package_option', { cpu: p.cpu, ram: p.ram, ssd: p.ssd, price: p.price.toLocaleString(numberLocale)})}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
            <label htmlFor="quantity-vps" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-vps"
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

export default CloudVpsCalculator;
