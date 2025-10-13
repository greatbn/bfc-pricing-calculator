import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Page } from '../App';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('calculator')} className="flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1">
            <img src="https://bizflycloud.vn/footer/logo.svg" alt="Bizfly Cloud Logo" className="h-8" />
            <span className="hidden sm:block border-l border-gray-300 h-8"></span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-700">{t('header.title')}</h1>
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('aiEstimate')}
              className={`hidden md:flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${currentPage === 'aiEstimate' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title={t('header.ai_estimate_button')}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636-6.364l-.707-.707M19 19l-1.414-1.414M12 21v-1m-6.364-1.636l.707-.707" /></svg>
               {t('header.ai_estimate_button')}
            </button>

            <div className="flex items-center space-x-2">
                <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                EN
                </button>
                <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                VI
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
