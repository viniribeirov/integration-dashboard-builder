
import React from 'react';
import { Line, Bar, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, BarChart, AreaChart } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { WidgetType, MetricData } from '@/types';

interface ChartWidgetProps {
  type: Exclude<WidgetType, 'kpi'>;
  metrics: string[];
  data: any[];
  metricsList: MetricData[];
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  type,
  metrics,
  data,
  metricsList
}) => {
  // Function to format tooltip values based on metric type
  const formatTooltipValue = (value: number, name: string) => {
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

  // Common chart props
  const chartProps = {
    data,
    margin: { top: 5, right: 20, left: 20, bottom: 5 }
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => {
              return [formatTooltipValue(Number(value), String(name)), metricsList.find(m => m.value === String(name))?.label || String(name)];
            }}
          />
          <Legend />
          {metrics.map((metricKey, index) => (
            <Line 
              key={metricKey}
              type="monotone"
              dataKey={metricKey}
              name={metricsList.find(m => m.value === metricKey)?.label || metricKey}
              stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  } 
  
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => {
              return [formatTooltipValue(Number(value), String(name)), metricsList.find(m => m.value === String(name))?.label || String(name)];
            }}
          />
          <Legend />
          {metrics.map((metricKey, index) => (
            <Bar 
              key={metricKey}
              dataKey={metricKey}
              name={metricsList.find(m => m.value === metricKey)?.label || metricKey}
              fill={`hsl(${(index * 50) % 360}, 70%, 50%)`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  } 
  
  // Default to area chart
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart {...chartProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => {
            return [formatTooltipValue(Number(value), String(name)), metricsList.find(m => m.value === String(name))?.label || String(name)];
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
            stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ChartWidget;
