import type { ReactNode } from 'react';

export interface EstimateItem {
  id: string;
  service: string;
  description: string;
  price: number;
  quantity: number;
}

export type ServiceId = 
  | 'CloudServer' 
  | 'Database' 
  | 'SimpleStorage' 
  | 'BlockStorage'
  | 'LoadBalancer' 
  | 'Kubernetes' 
  | 'Kafka' 
  | 'CallCenter' 
  | 'BusinessEmail' 
  | 'EmailTransaction'
  | 'LMS'
  | 'WanIp'
  | 'Snapshot'
  | 'BackupSchedule'
  | 'CustomImage';

export interface Service {
  id: ServiceId;
  name: string;
  icon: ReactNode;
}