import React, { useMemo, useState, useEffect } from 'react';
import type { EstimateItem } from '../types';
import { exportEstimateToPDF } from '../services/pdfService';
import { exportEstimateToCSV } from '../services/csvService';
import { useLanguage } from '../i18n/LanguageContext';

interface CostSummaryProps {
  items: EstimateItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  billingCycle: number;
  onBillingCycleChange: (cycle: number) => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
}

const CostSummary: React.FC<CostSummaryProps> = ({ items, onRemoveItem, onClearAll, billingCycle, onBillingCycleChange, discount, onDiscountChange }) => {
  const { language, t } = useLanguage();
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [discountInput, setDiscountInput] = useState(String(discount));

  useEffect(() => {
    setDiscountInput(String(discount));
  }, [discount]);

  const monthlyTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [items]);
  
  const subtotal = monthlyTotal * billingCycle;
  const vat = subtotal * 0.10;
  const discountAmount = subtotal * (discount / 100);
  const grandTotal = subtotal + vat - discountAmount;

  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountInput(e.target.value);
  };

  const handleDiscountInputBlur = () => {
    let value = parseInt(discountInput, 10);
    if (isNaN(value)) {
      value = 0;
    }
    value = Math.max(0, Math.min(90, value)); // Clamp between 0 and 90
    onDiscountChange(value);
  };

  const handleExportPDF = () => {
    try {
      exportEstimateToPDF(items, subtotal, vat, grandTotal, billingCycle, language, t, discount, discountAmount);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(t('summary.error_pdf'));
    }
  };
  
  const handleExportCSV = () => {
    try {
      exportEstimateToCSV(items, subtotal, vat, grandTotal, billingCycle, language, t, discount, discountAmount);
    } catch (error) {
      console.error("Failed to generate CSV:", error);
      alert(t('summary.error_csv'));
    }
  };
  
  const billingCycles = [1, 3, 6, 12, 24, 36];

  const getCycleLabel = (cycle: number) => {
    if (cycle === 1) return t('summary.monthly');
    return t('summary.months_cycle', { count: cycle });
  }

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-4 sticky top-[80px] h-fit">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{t('summary.title')}</h3>
        
        <div className="mb-4">
          <label htmlFor="billing-cycle" className="block text-sm font-medium text-gray-700">{t('summary.billing_cycle')}</label>
          <select
            id="billing-cycle"
            value={billingCycle}
            onChange={(e) => onBillingCycleChange(Number(e.target.value))}
            className="mt-1 block w-full bg-white pl-3 pr-10 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {billingCycles.map(cycle => (
              <option key={cycle} value={cycle}>{getCycleLabel(cycle)}</option>
            ))}
          </select>
        </div>

        {billingCycle > 1 && (
          <div className="mb-6 animate-fade-in">
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700">{t('summary.discount_label')}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
               <input
                type="number"
                id="discount"
                value={discountInput}
                onChange={handleDiscountInputChange}
                onBlur={handleDiscountInputBlur}
                min="0"
                max="90"
                className="block w-full bg-white pl-3 pr-12 py-2 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('summary.empty_message')}</p>
        ) : (
          <>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">{item.service}</p>
                      <p className="text-gray-600 text-xs">{item.description}</p>
                      <p className="text-blue-700 font-bold text-sm mt-1">
                        {item.quantity} x {item.price.toLocaleString(numberLocale)} VNĐ
                      </p>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors cta-bfc-pc-removeitem">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t('summary.subtotal')}</span>
                <span>{subtotal.toLocaleString(numberLocale)} VNĐ</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t('summary.vat')}</span>
                <span>{vat.toLocaleString(numberLocale)} VNĐ</span>
              </div>
               {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2 animate-fade-in">
                  <span>{t('summary.discount_amount_label', { percent: discount })}</span>
                  <span>- {discountAmount.toLocaleString(numberLocale)} VNĐ</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 mt-2">
                <span>{billingCycle === 1 ? t('summary.total') : t('summary.total_cycle', { duration: getCycleLabel(billingCycle) })}</span>
                <span>{grandTotal.toLocaleString(numberLocale)} VNĐ</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
               <button 
                onClick={handleExportPDF}
                className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center cta-bfc-pc-exporttopdf"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                {t('summary.export_pdf')}
              </button>
              <button 
                onClick={handleExportCSV}
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center cta-bfc-pc-exporttocsv"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                {t('summary.export_csv')}
              </button>
              <button onClick={onClearAll} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors cta-bfc-pc-clearall">
                {t('summary.clear_all')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CostSummary;