
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { MetricData } from '@/types';

// Format tooltip values based on metric type
export const formatTooltipValue = (value: number, name: string): string => {
  const metricName = String(name);
  if (metricName === 'spend') {
    return formatCurrency(Number(value));
  } else if (metricName === 'ctr') {
    return formatPercentage(Number(value));
  } else if (metricName === 'cpc' || metricName === 'cpm') {
    return formatCurrency(Number(value));
  } else {
    return value.toLocaleString();
  }
};

// Format date for x-axis ticks
export const formatDateTick = (value: string): string => {
  const date = new Date(value);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

// Format tooltip label using metric list
export const formatTooltipLabel = (value: number, name: string, metricsList: MetricData[]): [string, string] => {
  return [
    formatTooltipValue(Number(value), String(name)), 
    metricsList.find(m => m.value === String(name))?.label || String(name)
  ];
};

// Helper to generate color based on index
export const getColorForIndex = (index: number): string => {
  return `hsl(${(index * 50) % 360}, 70%, 50%)`;
};
