
import { DateRange } from 'react-day-picker';
import { DashboardWidget, MetricData } from '@/types';

// Dashboard context type
export interface DashboardContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  dashboardData: Record<string, any> | null;
  isLoading: boolean;
  widgets: DashboardWidget[];
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => Promise<void>;
  updateWidget: (id: string, widget: Partial<DashboardWidget>) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  refreshWidgets: () => Promise<void>;
  metrics: Array<MetricData>;
}

export type DashboardData = Record<string, any>;
