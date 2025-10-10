
import React from 'react';

const KubernetesPlaceholder: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">Kubernetes Engine Calculator</h3>
      <p className="mt-1 text-sm text-gray-500">
        The calculator for this service is coming soon.
      </p>
      <div className="mt-6">
        <p className="text-sm text-gray-600">Pricing information for Kubernetes Engine was not available in the provided documents. Please contact Bizfly Cloud for a custom quote.</p>
      </div>
    </div>
  );
};

export default KubernetesPlaceholder;
