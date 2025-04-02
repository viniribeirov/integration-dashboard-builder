
import { useState, createContext, useContext, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DashboardContextType } from '@/types/dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWidgetManagement } from '@/hooks/useWidgetManagement';

// Create dashboard context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  
  // Use our custom hooks
  const { dashboardData, isLoading, metrics } = useDashboardData(dateRange);
  const { widgets, addWidget, updateWidget, deleteWidget, refreshWidgets } = useWidgetManagement();
  
  const value: DashboardContextType = {
    dateRange,
    setDateRange,
    dashboardData,
    isLoading,
    widgets,
    addWidget,
    updateWidget,
    deleteWidget,
    refreshWidgets,
    metrics,
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook for using the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
