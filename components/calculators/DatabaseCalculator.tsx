import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePricing } from '../../contexts/PricingContext';

interface DatabaseCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

type Tier = 'premium' | 'enterprise' | 'dedicated';

const DatabaseCalculator: React.FC<DatabaseCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const { pricing } = usePricing();
  const databasePricing = pricing!.database;
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [tier, setTier] = useState<Tier>('premium');
  const [cpuCores, setCpuCores] = useState(databasePricing.cpu.premium[0].cores);
  const [ramGB, setRamGB] = useState(databasePricing.ram.premium[0].gb);
  const [diskSize, setDiskSize] = useState('20');
  const [backupSize, setBackupSize] = useState('0');
  const [quantity, setQuantity] = useState('1');

  const availableCpus = databasePricing.cpu[tier];
  const availableRams = databasePricing.ram[tier];
  
  useEffect(() => {
    const currentCpus = databasePricing.cpu[tier];
    const currentRams = databasePricing.ram[tier];
    setCpuCores(currentCpus[0].cores);
    setRamGB(currentRams[0].gb);
  }, [tier, databasePricing]);

  const { total, singlePrice, descriptionKey, descriptionOptions } = useMemo(() => {
    let singleItemTotal = 0;
    const { hoursPerMonth } = databasePricing;
    
    const diskSizeNum = parseInt(diskSize, 10) || 10;
    const backupSizeNum = parseInt(backupSize, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    const selectedCpu = availableCpus.find((c: any) => c.cores === cpuCores);
    if (selectedCpu) {
      singleItemTotal += selectedCpu.price * hoursPerMonth;
    }

    const selectedRam = availableRams.find((r: any) => r.gb === ramGB);
    if (selectedRam) {
      singleItemTotal += selectedRam.price * hoursPerMonth;
    }
    
    let diskCost = 0;
    if (diskSizeNum <= 100) {
        diskCost = diskSizeNum * databasePricing.disk.pricePerGBHourFirst100GB;
    } else {
        diskCost = (100 * databasePricing.disk.pricePerGBHourFirst100GB) + ((diskSizeNum - 100) * databasePricing.disk.pricePerGBHourAfter100GB);
    }
    singleItemTotal += diskCost * hoursPerMonth;

    if (backupSizeNum > 0) {
      singleItemTotal += backupSizeNum * databasePricing.backup.pricePerGBHour * hoursPerMonth;
    }
    
    const descKey = backupSizeNum > 0 ? 'database.desc_backup' : 'database.desc';
    const descOptions = {
        tier: tier,
        cpu: cpuCores,
        ram: ramGB,
        disk: diskSizeNum,
        backup: backupSizeNum
    };
    
    const finalSinglePrice = Math.round(singleItemTotal);

    return { 
      total: finalSinglePrice * quantityNum, 
      singlePrice: finalSinglePrice,
      descriptionKey: descKey,
      descriptionOptions: descOptions
    };
  }, [tier, cpuCores, ramGB, diskSize, backupSize, quantity, availableCpus, availableRams, databasePricing]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `db-${Date.now()}`,
        service: t('services.Database'),
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
      <span className="text-gray-600">{t('calculator.estimated_cost')}: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString(numberLocale)} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title={t('database.title')}
      description={t('database.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">{t('database.tier')}</label>
            <select id="tier" value={tier} onChange={e => setTier(e.target.value as Tier)} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="premium">{t('database.premium')}</option>
              <option value="enterprise">{t('database.enterprise')}</option>
              <option value="dedicated">{t('database.dedicated')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">{t('database.cpu_cores')}</label>
            <select id="cpu" value={cpuCores} onChange={e => setCpuCores(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availableCpus.map((c: any) => <option key={c.cores} value={c.cores}>{c.cores} vCPU</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="ram" className="block text-sm font-medium text-gray-700">{t('database.ram_gb')}</label>
            <select id="ram" value={ramGB} onChange={e => setRamGB(Number(e.target.value))} className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {availableRams.map((r: any) => <option key={r.gb} value={r.gb}>{r.gb} GB</option>)}
            </select>
          </div>
        
          <div>
            <label htmlFor="disk" className="block text-sm font-medium text-gray-700">{t('database.disk_gb')}</label>
            <input type="number" id="disk" value={diskSize} onChange={e => setDiskSize(e.target.value)} onBlur={() => handleBlur(setDiskSize, diskSize, 10)} min="10" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
           <div>
            <label htmlFor="backup" className="block text-sm font-medium text-gray-700">{t('database.backup_gb')}</label>
            <input type="number" id="backup" value={backupSize} onChange={e => setBackupSize(e.target.value)} onBlur={() => handleBlur(setBackupSize, backupSize, 0)} min="0" step="10" className="mt-1 block w-full bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
          </div>
        </div>

        <div>
            <label htmlFor="quantity-db" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-db"
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

export default DatabaseCalculator;
