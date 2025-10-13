import React, { useState } from 'react';
import type { EstimateItem } from '../types';
import type { Page } from '../App';
import { useLanguage } from '../i18n/LanguageContext';
import { generateEstimateFromInput } from '../services/geminiService';

interface AiEstimatePageProps {
  onAddItems: (items: Omit<EstimateItem, 'id'>[]) => void;
  onNavigate: (page: Page) => void;
}

const AiEstimatePage: React.FC<AiEstimatePageProps> = ({ onAddItems, onNavigate }) => {
  const { language, t } = useLanguage();
  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<Omit<EstimateItem, 'id'>[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [meta, base64] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        resolve({ base64, mimeType });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedItems([]);

    let imageBase64: string | null = null;
    let imageMimeType: string | null = null;
    
    if (activeTab === 'upload' && imageFile) {
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            imageBase64 = base64;
            imageMimeType = mimeType;
        } catch (e) {
            setError("Failed to read the image file.");
            setIsLoading(false);
            return;
        }
    }
    
    try {
        const items = await generateEstimateFromInput(inputText, imageBase64, imageMimeType);
        setGeneratedItems(items);
    } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddItems = () => {
    onAddItems(generatedItems);
    onNavigate('calculator');
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">{t('ai_estimate.title')}</h2>
      <p className="mt-2 text-gray-600 mb-6">{t('ai_estimate.description')}</p>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upload' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {t('ai_estimate.tab_upload')}
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'text' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {t('ai_estimate.tab_text')}
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'upload' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('ai_estimate.upload_label')}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
                ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                    <span>{t('ai_estimate.upload_label')}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{t('ai_estimate.upload_supported')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">{t('ai_estimate.text_label')}</label>
            <textarea
              id="text-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-1 block w-full bg-white p-3 text-base text-black border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              placeholder={t('ai_estimate.text_placeholder')}
            ></textarea>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={isLoading || (activeTab === 'upload' && !imageFile)}
          className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('ai_estimate.generating_message')}
            </>
          ) : (
            t('ai_estimate.generate_button')
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
          <h3 className="font-bold">{t('ai_estimate.error_title')}</h3>
          <p>{error}</p>
        </div>
      )}

      {generatedItems.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('ai_estimate.results_title')}</h3>
          <div className="space-y-3">
            {generatedItems.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">{t(`services.${item.service}` as any, { defaultValue: item.service })}</p>
                <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                <p className="text-blue-700 font-bold text-sm mt-2">
                  {item.quantity} x {item.price.toLocaleString(numberLocale)} VNĐ
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={handleAddItems}
              className="w-full bg-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
            >
              {t('ai_estimate.add_to_main_estimate')}
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && generatedItems.length === 0 && !error && (
        <div className="mt-8 border-t pt-6 text-center text-gray-500">
           <p>{t('ai_estimate.no_results')}</p>
        </div>
      )}
    </div>
  );
};

export default AiEstimatePage;
