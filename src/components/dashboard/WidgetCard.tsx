
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardWidget } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import KpiWidget from './widgets/KpiWidget';
import ChartWidget from './widgets/ChartWidget';
import WidgetLoadingSkeleton from './WidgetLoadingSkeleton';

interface WidgetCardProps {
  widget: DashboardWidget;
  isLoading?: boolean;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ 
  widget,
  isLoading = false 
}) => {
  const { metrics, dashboardData } = useDashboard();
  
  // Handle loading state
  if (isLoading) {
    return <WidgetLoadingSkeleton isLarge={widget.size === 'large'} />;
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
      
      return (
        <KpiWidget
          metricKey={metricKey}
          currentValue={currentValue}
          previousValue={previousValue}
          metrics={metrics}
        />
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
    
    // Use our ChartWidget component for all chart types
    return (
      <ChartWidget
        type={widget.type}
        metrics={widget.metrics}
        data={chartData}
        metricsList={metrics}
      />
    );
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
