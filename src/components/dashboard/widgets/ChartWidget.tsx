
import React from 'react';
import { WidgetType, MetricData } from '@/types';
import LineChartComponent from './LineChartComponent';
import BarChartComponent from './BarChartComponent';
import AreaChartComponent from './AreaChartComponent';

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
  // Render appropriate chart based on type
  switch (type) {
    case 'line':
      return (
        <LineChartComponent
          data={data}
          metrics={metrics}
          metricsList={metricsList}
        />
      );
    case 'bar':
      return (
        <BarChartComponent
          data={data}
          metrics={metrics}
          metricsList={metricsList}
        />
      );
    case 'area':
      return (
        <AreaChartComponent
          data={data}
          metrics={metrics}
          metricsList={metricsList}
        />
      );
    default:
      return null;
  }
};

export default ChartWidget;
