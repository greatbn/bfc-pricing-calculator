import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { emailPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';
import { useLanguage } from '../../i18n/LanguageContext';

interface EmailCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const EmailCalculator: React.FC<EmailCalculatorProps> = ({ onAddItem }) => {
  const { language, t } = useLanguage();
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [planType, setPlanType] = useState<'shared' | 'dedicated'>('shared');
  const [emailsPerMonth, setEmailsPerMonth] = useState('50000');
  const [dedicatedPlan, setDedicatedPlan] = useState(emailPricing.dedicated[0].name);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (planType === 'dedicated') {
      setDedicatedPlan(emailPricing.dedicated[0].name);
    }
  }, [planType]);

  const { total, description, singlePrice } = useMemo(() => {
    let price = 0;
    let desc = '';
    const emailsPerMonthNum = parseInt(emailsPerMonth, 10) || 0;
    const quantityNum = parseInt(quantity, 10) || 1;

    if (planType === 'shared') {
      price = emailsPerMonthNum * emailPricing.shared.pricePerEmail;
      desc = t('email.desc_shared', { emails: emailsPerMonthNum.toLocaleString(numberLocale) });
    } else {
      const selectedPlan = emailPricing.dedicated.find(p => p.name === dedicatedPlan);
      if (selectedPlan) {
        price = selectedPlan.price;
        desc = t('email.desc_dedicated', { name: selectedPlan.name, emails: (selectedPlan.emailsPerDay * 30).toLocaleString(numberLocale) });
      }
    }
    
    return { 
      total: price * quantityNum, 
      description: desc,
      singlePrice: price
    };
  }, [planType, emailsPerMonth, dedicatedPlan, quantity, t, numberLocale]);

  const handleAdd = () => {
    if (total > 0) {
      const quantityNum = parseInt(quantity, 10) || 1;
      onAddItem({
        id: `email-${Date.now()}`,
        service: t('services.EmailTransaction'),
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
      title={t('email.title')}
      description={t('email.description')}
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('email.plan_type')}</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPlanType('shared')}
              className={`px-4 py-2 border border-black text-sm font-medium rounded-l-md w-full ${planType === 'shared' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('email.shared_ip')}
            </button>
            <button
              type="button"
              onClick={() => setPlanType('dedicated')}
              className={`-ml-px px-4 py-2 border border-black text-sm font-medium rounded-r-md w-full ${planType === 'dedicated' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('email.dedicated_ip')}
            </button>
          </div>
        </div>
        
        {planType === 'shared' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="emails-per-month" className="block text-sm font-medium text-gray-700">{t('email.emails_per_month')}</label>
            <input
              type="number"
              id="emails-per-month"
              value={emailsPerMonth}
              onChange={(e) => setEmailsPerMonth(e.target.value)}
              onBlur={() => handleBlur(setEmailsPerMonth, emailsPerMonth, 0)}
              min="0"
              step="1000"
              className="mt-1 block w-full md:w-1/2 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        )}

        {planType === 'dedicated' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="dedicated-plan" className="block text-sm font-medium text-gray-700">{t('email.dedicated_package')}</label>
            <select
              id="dedicated-plan"
              value={dedicatedPlan}
              onChange={(e) => setDedicatedPlan(e.target.value)}
              className="mt-1 block w-full md:w-1/2 bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {emailPricing.dedicated.map(p => <option key={p.name} value={p.name}>{t('email.dedicated_option', { name: p.name, price: p.price.toLocaleString(numberLocale)})}</option>)}
            </select>
          </div>
        )}
        
        <div>
            <label htmlFor="quantity-email" className="block text-sm font-medium text-gray-700">{t('calculator.quantity')}</label>
            <input
              type="number"
              id="quantity-email"
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

export default EmailCalculator;