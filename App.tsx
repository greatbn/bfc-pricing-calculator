import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CostSummary from './components/CostSummary';
import CloudServerCalculator from './components/calculators/CloudServerCalculator';
import DatabaseCalculator from './components/calculators/DatabaseCalculator';
import SimpleStorageCalculator from './components/calculators/SimpleStorageCalculator';
import CallCenterCalculator from './components/calculators/CallCenterCalculator';
import EmailCalculator from './components/calculators/EmailCalculator';
import LoadBalancerCalculator from './components/calculators/LoadBalancerCalculator';
import KubernetesCalculator from './components/calculators/KubernetesCalculator';
import KafkaCalculator from './components/calculators/KafkaCalculator';
import BusinessEmailCalculator from './components/calculators/BusinessEmailCalculator';
import BlockStorageCalculator from './components/calculators/BlockStorageCalculator';
import LMSCalculator from './components/calculators/LMSCalculator';
import type { EstimateItem, Service, ServiceId } from './types';

// Icons for the service selector
const services: Service[] = [
  {
    id: 'CloudServer',
    name: 'Cloud Server',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
  },
  {
    id: 'Database',
    name: 'Database',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-10v10M4 13h16M4 7a2 2 0 012-2h12a2 2 0 012 2m-2 10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
  },
  {
    id: 'SimpleStorage',
    name: 'Simple Storage',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
  },
  {
    id: 'BlockStorage',
    name: 'Block Storage',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-10v10M4 13h16M4 7a2 2 0 012-2h12a2 2 0 012 2" /></svg>
  },
  {
    id: 'LoadBalancer',
    name: 'Load Balancer',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
  },
  {
    id: 'Kubernetes',
    name: 'Kubernetes',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.621 10.121a4.5 4.5 0 00-6.364-6.364l-1.414 1.414a1.5 1.5 0 000 2.121l2.121 2.121a1.5 1.5 0 002.121 0l3.536-3.535zM3.379 13.879a4.5 4.5 0 006.364 6.364l1.414-1.414a1.5 1.5 0 000-2.121l-2.121-2.121a1.5 1.5 0 00-2.121 0L3.379 13.88z" /></svg>
  },
  {
    id: 'Kafka',
    name: 'Kafka',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  {
    id: 'CallCenter',
    name: 'Call Center',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
  },
  {
    id: 'BusinessEmail',
    name: 'Business Email',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
  },
  {
    id: 'EmailTransaction',
    name: 'Email Transaction',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  },
  {
    id: 'LMS',
    name: 'LMS',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
  }
];

const App: React.FC = () => {
  const [activeService, setActiveService] = useState<ServiceId>('CloudServer');
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);

  const handleAddItem = useCallback((item: EstimateItem) => {
    setEstimateItems(prevItems => [...prevItems, item]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setEstimateItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setEstimateItems([]);
  }, []);

  const activeCalculator = useMemo(() => {
    switch (activeService) {
      case 'CloudServer': return <CloudServerCalculator onAddItem={handleAddItem} />;
      case 'Database': return <DatabaseCalculator onAddItem={handleAddItem} />;
      case 'SimpleStorage': return <SimpleStorageCalculator onAddItem={handleAddItem} />;
      case 'BlockStorage': return <BlockStorageCalculator onAddItem={handleAddItem} />;
      case 'LoadBalancer': return <LoadBalancerCalculator onAddItem={handleAddItem} />;
      case 'Kubernetes': return <KubernetesCalculator onAddItem={handleAddItem} />;
      case 'Kafka': return <KafkaCalculator onAddItem={handleAddItem} />;
      case 'CallCenter': return <CallCenterCalculator onAddItem={handleAddItem} />;
      case 'BusinessEmail': return <BusinessEmailCalculator onAddItem={handleAddItem} />;
      case 'EmailTransaction': return <EmailCalculator onAddItem={handleAddItem} />;
      case 'LMS': return <LMSCalculator onAddItem={handleAddItem} />;
      default: return null;
    }
  }, [activeService, handleAddItem]);


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 xl:w-3/4 space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Service</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {services.map(service => (
                        <button
                            key={service.id}
                            onClick={() => setActiveService(service.id)}
                            className={`p-4 rounded-lg text-center transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 ${
                                activeService === service.id 
                                ? 'bg-blue-700 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div className={`transition-colors duration-200 ${activeService === service.id ? 'text-white' : 'text-blue-700'}`}>
                                {service.icon}
                            </div>
                            <span className="text-sm font-semibold block">{service.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {activeCalculator}
          </div>
          
          <CostSummary
            items={estimateItems}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
        </div>
      </main>
    </div>
  );
};

export default App;