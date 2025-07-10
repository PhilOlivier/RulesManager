'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ApiEnvironment = 'UAT' | 'PROD';

export interface EnvironmentContextType {
  environment: ApiEnvironment;
  setEnvironment: (environment: ApiEnvironment) => void;
}

export const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined,
);

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  const [environment, setEnvironment] = useState<ApiEnvironment>(() => {
    if (typeof window !== 'undefined') {
      const storedEnv = localStorage.getItem('apiEnvironment');
      if (storedEnv === 'UAT' || storedEnv === 'PROD') {
        return storedEnv;
      }
    }
    return 'PROD'; // Default environment
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiEnvironment', environment);
    }
  }, [environment]);

  const value = { environment, setEnvironment };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}; 