
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { MetricData } from '@/types';
import { loadDashboardMetricsData } from '@/utils/dashboardUtils';

export function useDashboardData(dateRange: DateRange | undefined) {
  const [dashboardData, setDashboardData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Define available metrics
  const metrics: MetricData[] = [
    { value: 'spend', label: 'Spend', category: 'facebook' },
    { value: 'clicks', label: 'Clicks', category: 'facebook' },
    { value: 'ctr', label: 'CTR', category: 'facebook' },
    { value: 'cpc', label: 'CPC', category: 'facebook' },
    { value: 'cpm', label: 'CPM', category: 'facebook' },
  ];

  // Load dashboard data when date range changes
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const metricNames = metrics.map(m => m.value);
        const data = await loadDashboardMetricsData(dateRange, metricNames);
        if (data) {
          setDashboardData(data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [dateRange]);

  return { dashboardData, isLoading, metrics };
}
