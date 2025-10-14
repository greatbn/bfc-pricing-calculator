import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 p-1">
            <img src="https://bizflycloud.vn/footer/logo.svg" alt="Bizfly Cloud Logo" className="h-8" />
            <span className="hidden sm:block border-l border-gray-300 h-8"></span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-700">{t('header.title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} cta-bfc-pc-en`}
                >
                EN
                </button>
                <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} cta-bfc-pc-vi`}
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