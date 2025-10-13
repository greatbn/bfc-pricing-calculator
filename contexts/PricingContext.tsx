import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface PricingData {
  blockStorage: any;
  businessEmail: any;
  callCenter: any;
  cloudServer: any;
  customImage: any;
  database: any;
  email: any;
  kafka: any;
  kubernetes: any;
  lms: any;
  loadBalancer: any;
  simpleStorage: any;
  snapshot: any;
  wanIp: any;
  backupSchedule: any;
}

interface PricingContextType {
  pricing: PricingData | null;
  isLoading: boolean;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

const pricingFiles: (keyof PricingData)[] = [
  'blockStorage', 'businessEmail', 'callCenter', 'cloudServer', 'customImage',
  'database', 'email', 'kafka', 'kubernetes', 'lms', 'loadBalancer',
  'simpleStorage', 'snapshot', 'wanIp', 'backupSchedule'
];

export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const responses = await Promise.all(
          pricingFiles.map(file => fetch(`/pricing/${file}.json`))
        );
        
        for (const res of responses) {
          if (!res.ok) {
            throw new Error(`Failed to fetch pricing data: ${res.status} ${res.statusText}`);
          }
        }

        const jsonData = await Promise.all(responses.map(res => res.json()));

        const combinedPricing: Partial<PricingData> = {};
        pricingFiles.forEach((file, index) => {
          combinedPricing[file] = jsonData[index];
        });

        setPricing(combinedPricing as PricingData);
      } catch (error) {
        console.error('Failed to load pricing files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPricingData();
  }, []);

  return (
    <PricingContext.Provider value={{ pricing, isLoading }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = (): PricingContextType => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};
