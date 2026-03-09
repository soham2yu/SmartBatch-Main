import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DatasetContextType {
  activeDatasetId: number | undefined;
  setActiveDatasetId: (id: number | undefined) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [activeDatasetId, setActiveDatasetId] = useState<number | undefined>(undefined);

  return (
    <DatasetContext.Provider value={{ activeDatasetId, setActiveDatasetId }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useActiveDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useActiveDataset must be used within a DatasetProvider');
  }
  return context;
}
