import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface SimpleStorageCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const SimpleStorageCalculator: React.FC<SimpleStorageCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const simpleStoragePricing = pricing!.simpleStorage;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [storageType, setStorageType] = useState<'standard' | 'cold'>('standard');
  const [billingModel, setBillingModel] = useState<'subscription' | 'payg'>('subscription');
  const [storageAmount, setStorageAmount] = useState('500'); // For PAYG
  const [subscriptionPackage, setSubscriptionPackage] = useState(simpleStoragePricing.subscription.standard[0].gb);
  const [dataTransfer, setDataTransfer] = useState('100');
  const [quantity, setQuantity] = useState('1');

  const availablePackages = simpleStoragePricing.subscription[storageType];

  useEffect(() => {
    const currentPackages = simpleStoragePricing.subscription[storageType];
    setSubscriptionPackage(currentPackages[0].gb);
  }, [storageType, simpleStoragePricing]);

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    let storageCost = 0;
    let storageDisplayAmount = 0;

    const storageAmountNum = parseInt(storageAmount, 10) || 1;
    const dataTransferNum = parseInt(dataTransfer, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    if (billingModel === 'subscription') {
      const pkg = availablePackages.find((p: any) => p.gb === subscriptionPackage);
      if (pkg) {
        storageCost = pkg.price;
        storageDisplayAmount = pkg.gb;
      }
    } else { // PAYG
      const paygPrice = simpleStoragePricing.payAsYouGo[storageType].pricePerGBHour;
      storageCost = paygPrice * storageAmountNum * 720; // 720 hours/month
      storageDisplayAmount = storageAmountNum;
    }

    const transferCost = dataTransferNum * simpleStoragePricing.dataTransferPricePerGB;
    const singleItemTotal = Math.round(storageCost + transferCost);

    const descOptions = {
        type: storageType,
        billing: billingModel,
        storage: storageDisplayAmount,
        transfer: dataTransferNum
    };

    return { 
        total: singleItemTotal * quantityNum, 
        singlePrice: singleItemTotal,
        descriptionKey: 'simple_storage.desc',
        descriptionOptions: descOptions
    };
  }, [storageType, billingModel, storageAmount, subscriptionPackage, dataTransfer, quantity, availablePackages, simpleStoragePricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `ss-${Date.now()}`,
        service: t('services.SimpleStorage'),
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
      title={t('simple_storage.title')}
      description={t('simple_storage.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('simple_storage.storage_type')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setStorageType('standard')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${storageType === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-standard`}>{t('simple_storage.standard')}</button>
              <button type="button" onClick={() => setStorageType('cold')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${storageType === 'cold' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-cold`}>{t('simple_storage.cold')}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('simple_storage.billing_model')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setBillingModel('subscription')} className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${billingModel === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-subscription`}>{t('simple_storage.subscription')}</button>
              <button type="button" onClick={() => setBillingModel('payg')} className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${billingModel === 'payg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} cta-bfc-pc-payasyougo`}>{t('simple_storage.payg')}</button>
            </div>
          </div>
        </div>

        {billingModel === 'subscription' ? (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="sub-package" className="block text-sm font-medium text-gray-700">{t('simple_storage.package')}</label>
            <select id="sub-package" value={subscriptionPackage} onChange={e => setSubscriptionPackage(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availablePackages.map((p: any) => <option key={p.gb} value={p.gb}>{t('simple_storage.package_option', { gb: p.gb.toLocaleString(numberLocale), price: p.price.toLocaleString(numberLocale)})}</option>)}
            </select>
          </div>
        ) : (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="payg-amount" className="block text-sm font-medium text-gray-700">{t('simple_storage.storage_amount')}</label>
            <input type="number" id="payg-amount" value={storageAmount} onChange={e => setStorageAmount(e.target.value)} onBlur={() => handleBlur(setStorageAmount, storageAmount, 1)} min="1" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="data-transfer" className="block text-sm font-medium text-gray-700">{t('simple_storage.data_transfer')}</label>
          <input type="number" id="data-transfer" value={dataTransfer} onChange={e => setDataTransfer(e.target.value)} onBlur={() => handleBlur(setDataTransfer, dataTransfer, 0)} min="0" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
        </div>
        
        <div className="mt-4">
            <label htmlFor="quantity-ss" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-ss"
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

export default SimpleStorageCalculator;