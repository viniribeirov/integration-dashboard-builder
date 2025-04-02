
import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from 'recharts';
import { MetricData } from '@/types';
import { formatDateTick, formatTooltipLabel, getColorForIndex } from './chart-utils';

interface AreaChartComponentProps {
  data: any[];
  metrics: string[];
  metricsList: MetricData[];
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ data, metrics, metricsList }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
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
          <Area 
            key={metricKey}
            type="monotone"
            dataKey={metricKey}
            name={metricsList.find(m => m.value === metricKey)?.label || metricKey}
            fill={`hsla(${(index * 50) % 360}, 70%, 50%, 0.5)`}
            stroke={getColorForIndex(index)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;
