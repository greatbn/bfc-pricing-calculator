import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface WafCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const WafCalculator: React.FC<WafCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const wafPricing = pricing!.waf;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [requests, setRequests] = useState('10'); // in millions
  const [dataTransfer, setDataTransfer] = useState('100'); // in GB
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    const requestsNum = parseInt(requests, 10) || 0;
    const dataTransferNum = parseInt(dataTransfer, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    let price = wafPricing.subscription;
    price += requestsNum * wafPricing.requestsMillion;
    price += dataTransferNum * wafPricing.dataTransferOutboundGB;
    
    const desc = t('waf.desc', { 
        requests: requestsNum, 
        transfer: dataTransferNum 
    });

    return {
      total: price * quantityNum,
      description: desc,
      singlePrice: price,
    };
  }, [requests, dataTransfer, quantity, t, wafPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `waf-${Date.now()}`,
        service: t('services.WAF'),
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
      title={t('waf.title')}
      description={t('waf.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="waf-requests" className="block text-sm font-medium text-gray-700">{t('waf.requests_per_month')}</label>
            <input
              type="number"
              id="waf-requests"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              onBlur={() => handleBlur(setRequests, requests, 0)}
              min="0"
              step="1"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black rounded-md"
            />
          </div>
          <div>
            <label htmlFor="waf-transfer" className="block text-sm font-medium text-gray-700">{t('waf.data_transfer')}</label>
            <input
              type="number"
              id="waf-transfer"
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
          <label htmlFor="quantity-waf" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
          <input
            type="number"
            id="quantity-waf"
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

export default WafCalculator;
