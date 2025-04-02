
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { MetricData } from '@/types';
import { formatDateTick, formatTooltipLabel, getColorForIndex } from './chart-utils';

interface LineChartComponentProps {
  data: any[];
  metrics: string[];
  metricsList: MetricData[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, metrics, metricsList }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
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
          <Line 
            key={metricKey}
            type="monotone"
            dataKey={metricKey}
            name={metricsList.find(m => m.value === metricKey)?.label || metricKey}
            stroke={getColorForIndex(index)}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
