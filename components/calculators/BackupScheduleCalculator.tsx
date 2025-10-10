import React, { useMemo, useState } from 'react';
import type { EstimateItem } from '../../types';
import { backupSchedulePricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';

interface BackupScheduleCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const BackupScheduleCalculator: React.FC<BackupScheduleCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [quantity, setQuantity] = useState('1');

  const { total, description, singlePrice } = useMemo(() => {
    const price = backupSchedulePricing.price;
    const quantityNum = parseInt(quantity, 10) || 1;
    return { 
      total: price * quantityNum, 
      description: t('backup_schedule.desc'),
      singlePrice: price
    };
  }, [t, quantity]);

  const handleAdd = () => {
    const quantityNum = parseInt(quantity, 10) || 1;
    onAddItem({
      id: `backupschedule-${Date.now()}`,
      service: t('services.BackupSchedule'),
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
      title={t('backup_schedule.title')}
      description={t('backup_schedule.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div className="text-gray-700">
          <p>{t('backup_schedule.fixed_price_note', { price: singlePrice.toLocaleString(numberLocale) })}</p>
        </div>
        <div>
            <label htmlFor="quantity-backup" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-backup"
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

export default BackupScheduleCalculator;