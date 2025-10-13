import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface WanIpCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type BillingMethod = 'subscription' | 'onDemand';

const WanIpCalculator: React.FC<WanIpCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const wanIpPricing = pricing!.wanIp;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [billingMethod, setBillingMethod] = useState<BillingMethod>('subscription');
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    const price = wanIpPricing[billingMethod];
    const descKey = `wan_ip.desc_${billingMethod}`;
    const quantityNum = parseInt(quantity, 10) || 1;
    return { 
      total: price * quantityNum, 
      description: t(descKey),
      singlePrice: price
    };
  }, [billingMethod, quantity, t, wanIpPricing]);

  const handleAdd = () => {
    const quantityNum = parseInt(quantity, 10) || 1;
    onAddItem({
      id: `wanip-${Date.now()}`,
      service: t('services.WanIp'),
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

  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">{t('calculator.total_monthly_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('wan_ip.title')}
      description={t('wan_ip.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:w-1/2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('wan_ip.billing_method')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingMethod('subscription')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${billingMethod === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('wan_ip.subscription')}</button>
              <button type="button" onClick={() => setBillingMethod('onDemand')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${billingMethod === 'onDemand' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('wan_ip.on_demand')}</button>
            </div>
          </div>
        </div>
        <div>
            <label htmlFor="quantity-wanip" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-wanip"
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

export default WanIpCalculator;
