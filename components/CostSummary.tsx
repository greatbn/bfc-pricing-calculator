import React, { useState, useMemo } from 'react';
import type { EstimateItem } from '../types';
import { exportEstimateToPDF } from '../services/pdfService';
import { generateEstimateSummary } from '../services/geminiService';

interface CostSummaryProps {
  items: EstimateItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

const CostSummary: React.FC<CostSummaryProps> = ({ items, onRemoveItem, onClearAll }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const vat = total * 0.10;
  const grandTotal = total + vat;

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const summaryText = await generateEstimateSummary(items);
      exportEstimateToPDF(items, total, vat, grandTotal, summaryText);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-4 sticky top-[80px] h-fit">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Cost Estimate</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Your estimate is empty. Configure a service to add it here.</p>
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
                        {item.quantity} x {item.price.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
                <span>Subtotal</span>
                <span>{total.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>VAT (10%)</span>
                <span>{vat.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>{grandTotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
               <button 
                onClick={handleExport}
                disabled={isGenerating}
                className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-300 flex items-center justify-center"
              >
                {isGenerating ? (
                   <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                   </>
                ) : 'Export to PDF'}
              </button>
              <button onClick={onClearAll} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CostSummary;