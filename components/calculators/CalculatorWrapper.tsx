import React from 'react';

interface CalculatorWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onAdd: () => void;
  isAddDisabled?: boolean;
  summaryContent: React.ReactNode;
}

const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({ title, description, children, onAdd, isAddDisabled = false, summaryContent }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="mt-2 text-gray-600 mb-6">{description}</p>
      
      <div className="space-y-6">
        {children}
      </div>

      <div className="mt-8 border-t pt-6">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-auto flex-grow">
              {summaryContent}
            </div>
            <button
              onClick={onAdd}
              disabled={isAddDisabled}
              className="w-full sm:w-auto bg-blue-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add to Estimate
            </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorWrapper;