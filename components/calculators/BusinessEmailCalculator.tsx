import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface BusinessEmailCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const BusinessEmailCalculator: React.FC<BusinessEmailCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const businessEmailPricing = pricing!.businessEmail;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [selectedPackageId, setSelectedPackageId] = useState(businessEmailPricing.packages[0].id);
  const [quantity, setQuantity] = useState('1');

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    const selectedPackage = businessEmailPricing.packages.find((p: any) => p.id === selectedPackageId);
    if (!selectedPackage) return { total: 0, singlePrice: 0, descriptionKey: '', descriptionOptions: {} };

    const price = selectedPackage.price;
    const descOptions = {
        id: selectedPackage.id,
        storageGB: selectedPackage.storageGB,
        emailsPerDay: selectedPackage.emailsPerDay.toLocaleString(numberLocale)
    };
    const quantityNum = parseInt(quantity, 10) || 1;
    
    return { 
      total: price * quantityNum, 
      singlePrice: price,
      descriptionKey: 'business_email.desc',
      descriptionOptions: descOptions
    };
  }, [selectedPackageId, quantity, numberLocale, businessEmailPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `bemail-${Date.now()}`,
        service: t('services.BusinessEmail'),
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
      title={t('business_email.title')}
      description={t('business_email.description')}
      onAdd={handleAdd}
      isAddDisabled={total <= 0}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1">
          <div>
            <label htmlFor="email-package" className="block text-sm font-medium text-gray-700">{t('business_email.package')}</label>
            <select
              id="email-package"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {businessEmailPricing.packages.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {t('business_email.package_option', {
                      storageGB: p.storageGB,
                      emailsPerDay: p.emailsPerDay.toLocaleString(numberLocale),
                      price: p.price.toLocaleString(numberLocale)
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
            <label htmlFor="quantity-bemail" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-bemail"
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

export default BusinessEmailCalculator;
