import { createContext, useContext, useState } from 'react';

type FeatureFlagsTabsContextType = {
  activeTab: string;
  isArchiveTab: boolean;
  setActiveTab: (tab: string) => void;
};

const FeatureFlagsTabsContext =
  createContext<FeatureFlagsTabsContextType | null>(null);

export const FeatureFlagsTabsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = useState('active');

  const isArchiveTab = activeTab === 'archive';

  return (
    <FeatureFlagsTabsContext.Provider value={{ activeTab, isArchiveTab, setActiveTab }}>
      {children}
    </FeatureFlagsTabsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFeatureFlagsTabs = () => {
  const context = useContext(FeatureFlagsTabsContext);
  if (!context) {
    throw new Error('useFeatureFlagsTabs must be used within a FeatureFlagsTabsProvider');
  }
  return context;
};
