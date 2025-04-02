
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { MetricData } from '@/types';
import { formatDateTick, formatTooltipLabel, getColorForIndex } from './chart-utils';

interface BarChartComponentProps {
  data: any[];
  metrics: string[];
  metricsList: MetricData[];
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, metrics, metricsList }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={formatDateTick}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => {
            return formatTooltipLabel(Number(value), String(name), metricsList);
          }}
        />
        <Legend />
        {metrics.map((metricKey, index) => (
          <Bar 
            key={metricKey}
            dataKey={metricKey}
            name={metricsList.find(m => m.value === metricKey)?.label || metricKey}
            fill={getColorForIndex(index)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
