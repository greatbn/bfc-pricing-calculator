import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface VpnCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const VpnCalculator: React.FC<VpnCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const vpnPricing = pricing!.vpn;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [selectedPackageName, setSelectedPackageName] = useState(vpnPricing.packages[0].name);
  const [dataTransfer, setDataTransfer] = useState('0');
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    let singleItemTotal = 0;
    const dataTransferNum = parseInt(dataTransfer, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    const pkg = vpnPricing.packages.find((p: any) => p.name === selectedPackageName);
    if (pkg) {
      singleItemTotal += pkg.price;
    }
    
    if (dataTransferNum > 0) {
        singleItemTotal += dataTransferNum * vpnPricing.dataTransferPricePerGB;
    }
    
    const descKey = dataTransferNum > 0 ? 'vpn.desc_transfer' : 'vpn.desc';
    const descOptions = {
        package: selectedPackageName,
        transfer: dataTransferNum,
    };
    
    return { 
      total: singleItemTotal * quantityNum, 
      description: t(descKey, descOptions),
      singlePrice: singleItemTotal
    };
  }, [selectedPackageName, dataTransfer, quantity, t, vpnPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `vpn-${Date.now()}`,
        service: t('services.Vpn'),
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
      title={t('vpn.title')}
      description={t('vpn.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vpn-package" className="block text-sm font-medium text-gray-700">{t('vpn.package')}</label>
            <select
              id="vpn-package"
              value={selectedPackageName}
              onChange={(e) => setSelectedPackageName(e.target.value)}
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {vpnPricing.packages.map((p: any) => <option key={p.name} value={p.name}>{t('vpn.package_option', { name: p.name, price: p.price.toLocaleString(numberLocale)})}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="data-transfer" className="block text-sm font-medium text-gray-700">{t('vpn.data_transfer')}</label>
            <input
              type="number"
              id="data-transfer"
              value={dataTransfer}
              onChange={(e) => setDataTransfer(e.target.value)}
              onBlur={() => handleBlur(setDataTransfer, dataTransfer, 0)}
              min="0"
              step="10"
              className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <div>
            <label htmlFor="quantity-vpn" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-vpn"
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

export default VpnCalculator;