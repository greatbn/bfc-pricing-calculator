import type { ReactNode } from 'react';

export interface EstimateItem {
  id: string;
  service: string;
  descriptionKey: string;
  descriptionOptions: Record<string, string | number>;
  price: number;
  quantity: number;
}

export type ServiceId = 
  | 'CloudServer'
  | 'CloudVps'
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
  | 'CustomImage'
  | 'CDN'
  | 'Vpn'
  | 'WAF';

export interface Service {
  id: ServiceId;
  name: string;
  icon: ReactNode;
}