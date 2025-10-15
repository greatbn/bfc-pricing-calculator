import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface LoadBalancerCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const LoadBalancerCalculator: React.FC<LoadBalancerCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const loadBalancerPricing = pricing!.loadBalancer;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [selectedPackage, setSelectedPackage] = useState(loadBalancerPricing.packages[0].name);
  const [dataOverage, setDataOverage] = useState('0');
  const [quantity, setQuantity] = useState('1');

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    let singleItemTotal = 0;
    const dataOverageNum = parseInt(dataOverage, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    const pkg = loadBalancerPricing.packages.find((p: any) => p.name === selectedPackage);
    if (pkg) {
      singleItemTotal += pkg.price;
      if (dataOverageNum > 0) {
        singleItemTotal += dataOverageNum * loadBalancerPricing.dataTransferOveragePricePerGB;
      }
    }
    
    const descKey = dataOverageNum > 0 ? 'load_balancer.desc_overage' : 'load_balancer.desc';
    const pkgDetails = loadBalancerPricing.packages.find((p: any) => p.name === selectedPackage);
    const descOptions = {
        name: pkgDetails?.name,
        connections: pkgDetails?.connections.toLocaleString(numberLocale),
        freeData: pkgDetails?.freeDataTB,
        overage: dataOverageNum
    };
    
    return { 
      total: singleItemTotal * quantityNum, 
      singlePrice: singleItemTotal,
      descriptionKey: descKey,
      descriptionOptions: descOptions
    };
  }, [selectedPackage, dataOverage, quantity, numberLocale, loadBalancerPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `lb-${Date.now()}`,
        service: t('services.LoadBalancer'),
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
      title={t('load_balancer.title')}
      description={t('load_balancer.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lb-package" className="block text-sm font-medium text-gray-700">{t('load_balancer.package')}</label>
            <select
              id="lb-package"
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {loadBalancerPricing.packages.map((p: any) => <option key={p.name} value={p.name}>{t('load_balancer.package_option', { name: p.name, price: p.price.toLocaleString(numberLocale)})}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="data-overage" className="block text-sm font-medium text-gray-700">{t('load_balancer.data_overage')}</label>
            <input
              type="number"
              id="data-overage"
              value={dataOverage}
              onChange={(e) => setDataOverage(e.target.value)}
              onBlur={() => handleBlur(setDataOverage, dataOverage, 0)}
              min="0"
              step="100"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <div>
            <label htmlFor="quantity-lb" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-lb"
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

export default LoadBalancerCalculator;
