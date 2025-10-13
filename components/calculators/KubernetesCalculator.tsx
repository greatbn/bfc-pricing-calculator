import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface KubernetesCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const KubernetesCalculator: React.FC<KubernetesCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const kubernetesPricing = pricing!.kubernetes;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [planType, setPlanType] = useState<'standard' | 'everywhere'>('standard');
  const [selectedPackage, setSelectedPackage] = useState(kubernetesPricing.standard[0].name);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (planType === 'standard') {
      setSelectedPackage(kubernetesPricing.standard[0].name);
    } else {
      setSelectedPackage(kubernetesPricing.everywhere[0].name);
    }
  }, [planType, kubernetesPricing]);

  const { total, description, singlePrice } = useMemo(() => {
    let price = 0;
    let desc = '';
    const quantityNum = parseInt(quantity, 10) || 1;

    if (planType === 'standard') {
      const pkg = kubernetesPricing.standard.find((p: any) => p.name === selectedPackage);
      if (pkg) {
        price = pkg.price;
        desc = t('kubernetes.desc_standard', { name: pkg.name });
      }
    } else {
      const pkg = kubernetesPricing.everywhere.find((p: any) => p.name === selectedPackage);
      if (pkg) {
        price = pkg.price;
        desc = t('kubernetes.desc_everywhere', { name: pkg.name, nodes: pkg.maxNodes });
      }
    }

    return { 
      total: price * quantityNum, 
      description: desc,
      singlePrice: price
    };
  }, [planType, selectedPackage, quantity, t, kubernetesPricing]);

  const handleAdd = () => {
    const quantityNum = parseInt(quantity, 10) || 1;
    onAddItem({
      id: `k8s-${Date.now()}`,
      service: t('services.Kubernetes'),
      description,
      price: singlePrice,
      quantity: quantityNum,
    });
  };

  const handleQuantityBlur = () => {
    const value = parseInt(quantity, 10);
    if (isNaN(value) || value < 1) {
      setQuantity('1');
    }
  };

  const packageOptions = planType === 'standard' ? kubernetesPricing.standard : kubernetesPricing.everywhere;
  
  const summaryContent = (
      <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
        <span className="text-gray-600">{t('kubernetes.management_fee')}: </span>
        <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
      </div>
  );

  return (
    <CalculatorWrapper
      title={t('kubernetes.title')}
      description={t('kubernetes.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('kubernetes.plan_type')}</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPlanType('standard')}
              className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-1/2 ${planType === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('kubernetes.standard')}
            </button>
            <button
              type="button"
              onClick={() => setPlanType('everywhere')}
              className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-1/2 ${planType === 'everywhere' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('kubernetes.everywhere')}
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="k8s-package" className="block text-sm font-medium text-gray-700">{t('kubernetes.package')}</label>
          <select
            id="k8s-package"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {packageOptions.map((p: any) => <option key={p.name} value={p.name}>{t('kubernetes.package_option', { name: p.name, price: p.price.toLocaleString(numberLocale) })}</option>)}
          </select>
        </div>
        
        <div>
            <label htmlFor="quantity-k8s" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-k8s"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={handleQuantityBlur}
              min="1"
              className="mt-1 block w-full sm:w-1/4 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-r-lg">
        <p className="font-bold">{t('kubernetes.additional_costs_title')}</p>
        <p className="text-sm">{t('kubernetes.additional_costs_desc')}</p>
      </div>
    </CalculatorWrapper>
  );
};

export default KubernetesCalculator;
