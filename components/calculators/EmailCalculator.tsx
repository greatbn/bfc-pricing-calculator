import React, { useState, useMemo, useEffect } from 'react';
import type { EstimateItem } from '../../types';
import { emailPricing } from './calculatorData';
import CalculatorWrapper from './CalculatorWrapper';

interface EmailCalculatorProps {
  onAddItem: (item: EstimateItem) => void;
}

const EmailCalculator: React.FC<EmailCalculatorProps> = ({ onAddItem }) => {
  const [planType, setPlanType] = useState<'shared' | 'dedicated'>('shared');
  const [emailsPerMonth, setEmailsPerMonth] = useState(50000);
  const [dedicatedPlan, setDedicatedPlan] = useState(emailPricing.dedicated[0].name);

  useEffect(() => {
    // When switching to dedicated plan, reset selection to the first option
    if (planType === 'dedicated') {
      setDedicatedPlan(emailPricing.dedicated[0].name);
    }
  }, [planType]);

  const { total, description } = useMemo(() => {
    if (planType === 'shared') {
      const currentTotal = emailsPerMonth * emailPricing.shared.pricePerEmail;
      return { total: currentTotal, description: `Shared IP Plan, ${emailsPerMonth.toLocaleString('vi-VN')} emails/month` };
    } else {
      const selectedPlan = emailPricing.dedicated.find(p => p.name === dedicatedPlan);
      if (selectedPlan) {
        return { total: selectedPlan.price, description: `Dedicated IP Plan: ${selectedPlan.name} (~${(selectedPlan.emailsPerDay * 30).toLocaleString('vi-VN')} emails/month)` };
      }
    }
    return { total: 0, description: '' };
  }, [planType, emailsPerMonth, dedicatedPlan]);

  const handleAdd = () => {
    if (total > 0) {
      onAddItem({
        id: `email-${Date.now()}`,
        service: 'Email Transaction',
        description,
        price: total,
        quantity: 1,
      });
    }
  };
  
  const summaryContent = (
    <div className="p-4 bg-blue-50 rounded-lg text-right sm:text-left">
      <span className="text-gray-600">Estimated monthly cost: </span>
      <span className="text-xl font-bold text-blue-700">{total.toLocaleString('vi-VN')} VNĐ</span>
    </div>
  );

  return (
    <CalculatorWrapper
      title="Email Transaction"
      description="Choose between a pay-as-you-go Shared IP plan or a fixed-price Dedicated IP plan."
      onAdd={handleAdd}
      summaryContent={summaryContent}
    >
      <div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPlanType('shared')}
              className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${planType === 'shared' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Shared IP
            </button>
            <button
              type="button"
              onClick={() => setPlanType('dedicated')}
              className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${planType === 'dedicated' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Dedicated IP
            </button>
          </div>
        </div>
        
        {planType === 'shared' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="emails-per-month" className="block text-sm font-medium text-gray-700">Estimated Emails per Month</label>
            <input
              type="number"
              id="emails-per-month"
              value={emailsPerMonth}
              onChange={(e) => setEmailsPerMonth(Math.max(0, parseInt(e.target.value, 10)))}
              min="0"
              step="1000"
              className="mt-1 block w-full md:w-1/2 bg-white pl-3 pr-2 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        )}

        {planType === 'dedicated' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="dedicated-plan" className="block text-sm font-medium text-gray-700">Dedicated IP Package</label>
            <select
              id="dedicated-plan"
              value={dedicatedPlan}
              onChange={(e) => setDedicatedPlan(e.target.value)}
              className="mt-1 block w-full md:w-1/2 bg-white pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {emailPricing.dedicated.map(p => <option key={p.name} value={p.name}>{p.name} - {p.price.toLocaleString('vi-VN')} VNĐ/month</option>)}
            </select>
          </div>
        )}
      </div>
    </CalculatorWrapper>
  );
};

export default EmailCalculator;