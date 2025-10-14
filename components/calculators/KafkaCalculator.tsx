import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface KafkaCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type Tier = 'premium' | 'enterprise' | 'dedicated';

const KafkaCalculator: React.FC<KafkaCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const kafkaPricing = pricing!.kafka;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [tier, setTier] = useState<Tier>('premium');
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(2); // Default to 4c/16gb
  const [diskSize, setDiskSize] = useState('100');
  const [hasWanIp, setHasWanIp] = useState(true);
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    let singleItemTotal = 0;
    
    const selectedPackage = kafkaPricing.packages[selectedPackageIndex];
     if (!selectedPackage) {
        return { total: 0, description: '', singlePrice: 0 };
    }

    const diskSizeNum = parseInt(diskSize, 10) || 10;
    const quantityNum = parseInt(quantity, 10) || 1;

    const cpuPrice = kafkaPricing.cpu[tier] * selectedPackage.cpu;
    const ramPrice = kafkaPricing.ram[tier] * selectedPackage.ram;
    singleItemTotal += cpuPrice + ramPrice;
    
    const diskPrice = kafkaPricing.disk.price * diskSizeNum;
    singleItemTotal += diskPrice;

    if (hasWanIp) {
      singleItemTotal += kafkaPricing.wanIP.price;
    }
    
    const descKey = hasWanIp ? 'kafka.desc_wan' : 'kafka.desc';
    const descOptions = {
        tier: tier,
        cpu: selectedPackage.cpu,
        ram: selectedPackage.ram,
        disk: diskSizeNum
    };

    return { 
      total: singleItemTotal * quantityNum, 
      description: t(descKey, descOptions),
      singlePrice: singleItemTotal
    };
  }, [tier, selectedPackageIndex, diskSize, hasWanIp, quantity, t, kafkaPricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `kafka-${Date.now()}`,
        service: t('services.Kafka'),
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
      title={t('kafka.title')}
      description={t('kafka.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">{t('kafka.tier')}</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as Tier)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="premium">{t('kafka.premium')}</option>
              <option value="enterprise">{t('kafka.enterprise')}</option>
              <option value="dedicated">{t('kafka.dedicated')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="kafka-package" className="block text-sm font-medium text-gray-700">{t('kafka.package')}</label>
            <select 
              id="kafka-package" 
              value={selectedPackageIndex} 
              onChange={e => setSelectedPackageIndex(Number(e.target.value))} 
              className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {kafkaPricing.packages.map((pkg: any, index: number) => {
                const cpuCost = kafkaPricing.cpu[tier] * pkg.cpu;
                const ramCost = kafkaPricing.ram[tier] * pkg.ram;
                const packagePrice = cpuCost + ramCost;
                return (
                  <option key={index} value={index}>
                    {t('kafka.package_option', { 
                      cpu: pkg.cpu, 
                      ram: pkg.ram, 
                      price: packagePrice.toLocaleString(numberLocale) 
                    })}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="disk" className="block text-sm font-medium text-gray-700">{t('kafka.disk_gb')}</label>
            <input type="number" id="disk" value={diskSize} onChange={e => setDiskSize(e.target.value)} onBlur={() => handleBlur(setDiskSize, diskSize, 10)} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>
         <div className="mt-4">
          <div className="flex items-center">
              <input id="wanip-kafka" name="wanip" type="checkbox" checked={hasWanIp} onChange={e => setHasWanIp(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-black rounded"/>
              <label htmlFor="wanip-kafka" className="ml-2 block text-sm text-gray-900">{t('kafka.include_wan', { price: kafkaPricing.wanIP.price.toLocaleString(numberLocale)})}</label>
          </div>
        </div>

        <div>
            <label htmlFor="quantity-kafka" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-kafka"
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

export default KafkaCalculator;