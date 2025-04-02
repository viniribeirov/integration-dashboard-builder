
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { MetricData } from '@/types';

interface KpiWidgetProps {
  metricKey: string;
  currentValue?: number;
  previousValue?: number;
  metrics: MetricData[];
}

const KpiWidget: React.FC<KpiWidgetProps> = ({
  metricKey,
  currentValue,
  previousValue,
  metrics
}) => {
  // Helper to format the value based on metric type
  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    
    if (metricKey === 'spend') {
      return formatCurrency(value);
    } else if (metricKey === 'ctr') {
      return formatPercentage(value);
    } else if (metricKey === 'cpc' || metricKey === 'cpm') {
      return formatCurrency(value);
    } else {
      return value.toLocaleString();
    }
  };
  
  // Helper to determine percentage change
  const calculatePercentChange = (current?: number, previous?: number): number | null => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };
  
  const percentChange = calculatePercentChange(currentValue, previousValue);
  
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold">
        {formatValue(currentValue)}
      </div>
      {percentChange !== null && (
        <div className={`flex items-center text-sm ${percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentChange > 0 ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
          <span>{Math.abs(percentChange).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

export default KpiWidget;
