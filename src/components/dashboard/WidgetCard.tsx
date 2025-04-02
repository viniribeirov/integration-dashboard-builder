
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { DashboardWidget, MetricData } from '@/types';
import { Line, Bar, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, BarChart, AreaChart } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';

interface WidgetCardProps {
  widget: DashboardWidget;
  isLoading?: boolean;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ 
  widget,
  isLoading = false 
}) => {
  const { metrics, dashboardData } = useDashboard();
  
  // Helper to format the value based on metric type
  const formatValue = (value: number | undefined, metricKey: string): string => {
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
  
  // Helper to render the change indicator
  const renderChangeIndicator = (percentChange: number | null) => {
    if (percentChange === null) return null;
    
    const isPositive = percentChange > 0;
    const isMetricBetter = isPositive; // This depends on the metric - for some metrics negative change is better
    
    return (
      <div className={`flex items-center text-sm ${isMetricBetter ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        <span>{Math.abs(percentChange).toFixed(1)}%</span>
      </div>
    );
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className={`shadow-sm h-full ${widget.size === 'large' ? 'col-span-2' : ''}`}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-[150px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const widgetData = dashboardData?.[widget.platform];
  
  // Function to render appropriate content based on widget type
  const renderContent = () => {
    // Safety check - make sure we have data
    if (!widgetData || !widgetData.daily || !widgetData.total) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <p>No data available</p>
        </div>
      );
    }
    
    // For KPI widgets
    if (widget.type === 'kpi') {
      // Check if metrics is an array and has items
      if (!Array.isArray(widget.metrics) || widget.metrics.length === 0) {
        return <div className="text-muted-foreground">No metrics selected</div>;
      }

      const metricKey = widget.metrics[0];
      // SafeGuard against undefined or null values
      const currentValue = widgetData.total && widgetData.total[metricKey] !== undefined 
        ? widgetData.total[metricKey] 
        : undefined;
      
      const previousValue = widgetData.previous && widgetData.previous[metricKey] !== undefined 
        ? widgetData.previous[metricKey] 
        : undefined;
      
      const percentChange = calculatePercentChange(currentValue, previousValue);
      
      return (
        <div className="flex flex-col">
          <div className="text-2xl font-bold">
            {formatValue(currentValue, metricKey)}
          </div>
          {renderChangeIndicator(percentChange)}
        </div>
      );
    }
    
    // For chart widgets
    const chartData = widgetData.daily.map((day: any) => {
      // Create an object with the date and all metrics for this widget
      const dataPoint: Record<string, any> = { date: day.date };
      
      // Add each metric to the data point
      widget.metrics.forEach((metricKey) => {
        if (day.metrics && day.metrics[metricKey] !== undefined) {
          dataPoint[metricKey] = day.metrics[metricKey];
        } else {
          dataPoint[metricKey] = 0; // Default to 0 if metric not found
        }
      });
      
      return dataPoint;
    });
    
    // Define chart components based on widget type
    if (widget.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
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
              formatter={(value, name) => [formatValue(Number(value), name as string), metrics.find(m => m.value === name)?.label || name]}
            />
            <Legend />
            {widget.metrics.map((metricKey, index) => (
              <Line 
                key={metricKey}
                type="monotone"
                dataKey={metricKey}
                name={metrics.find(m => m.value === metricKey)?.label || metricKey}
                stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (widget.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
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
              formatter={(value, name) => [formatValue(Number(value), name as string), metrics.find(m => m.value === name)?.label || name]}
            />
            <Legend />
            {widget.metrics.map((metricKey, index) => (
              <Bar 
                key={metricKey}
                dataKey={metricKey}
                name={metrics.find(m => m.value === metricKey)?.label || metricKey}
                fill={`hsl(${(index * 50) % 360}, 70%, 50%)`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (widget.type === 'area') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
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
              formatter={(value, name) => [formatValue(Number(value), name as string), metrics.find(m => m.value === name)?.label || name]}
            />
            <Legend />
            {widget.metrics.map((metricKey, index) => (
              <Area 
                key={metricKey}
                type="monotone"
                dataKey={metricKey}
                name={metrics.find(m => m.value === metricKey)?.label || metricKey}
                fill={`hsla(${(index * 50) % 360}, 70%, 50%, 0.5)`}
                stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    
    return null;
  };
  
  return (
    <Card className={`shadow-sm h-full ${widget.size === 'large' ? 'col-span-2' : ''}`}>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">{widget.name}</h3>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default WidgetCard;
