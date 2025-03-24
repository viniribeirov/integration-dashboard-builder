
import React from 'react';
import { useMemo } from 'react';
import { Card, CardHeader, CardBody, Flex, Heading, Text, Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Icon, useColorModeValue } from '@chakra-ui/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, MoreHorizontalIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

export interface WidgetData {
  daily?: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
  total: Record<string, number>;
  previous: Record<string, number>;
}

export interface WidgetProps {
  id: string;
  name: string;
  type: 'kpi' | 'line' | 'bar' | 'area';
  metrics: string[];
  platform: string;
  data?: WidgetData;
  isLoading: boolean;
  customFormula?: string;
  onRemove: (id: string) => void;
}

const calculateChange = (current: number, previous: number): [number, boolean] => {
  if (!previous) return [0, true];
  const change = ((current - previous) / previous) * 100;
  return [change, change >= 0];
};

const calculateFormula = (formula: string, data: Record<string, number>) => {
  try {
    // Replace metric names with their values
    let expression = formula;
    Object.entries(data).forEach(([key, value]) => {
      expression = expression.replace(new RegExp(key, 'g'), value.toString());
    });
    
    // Evaluate the expression
    return eval(expression);
  } catch (error) {
    console.error('Error calculating formula:', error);
    return 0;
  }
};

const formatMetricValue = (metric: string, value: number) => {
  if (!value && value !== 0) return '-';
  
  if (metric.toLowerCase().includes('spend') || metric.toLowerCase().includes('revenue')) {
    return formatCurrency(value);
  }
  
  if (metric.toLowerCase().includes('ctr') || metric.toLowerCase().includes('rate') || metric.toLowerCase().includes('roas')) {
    return formatPercent(value);
  }
  
  if (metric.toLowerCase().includes('cpc') || metric.toLowerCase().includes('cpm')) {
    return formatCurrency(value);
  }
  
  return formatNumber(value);
};

const WidgetCard: React.FC<WidgetProps> = ({ 
  id, 
  name, 
  type, 
  metrics, 
  data, 
  isLoading, 
  customFormula,
  onRemove
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex direction="column" align="center" justify="center" h="100%" py={6}>
          <Box className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin" />
          <Text mt={2} fontSize="sm" color="gray.500">Carregando dados...</Text>
        </Flex>
      );
    }
    
    if (!data) {
      return (
        <Flex direction="column" align="center" justify="center" h="100%" py={6}>
          <Icon as={TrendingUpIcon} boxSize={8} color="gray.400" />
          <Text mt={2} fontSize="sm" color="gray.500">Sem dados disponíveis</Text>
        </Flex>
      );
    }
    
    const metric = metrics[0]; // For KPI we use the first metric
    
    // For custom formula
    let value = customFormula 
      ? calculateFormula(customFormula, data.total)
      : data.total[metric];
    
    let previousValue = customFormula 
      ? calculateFormula(customFormula, data.previous)
      : data.previous[metric];
    
    const [changePercent, isPositive] = calculateChange(value, previousValue);
    
    if (type === 'kpi') {
      return (
        <Stat p={4}>
          <StatLabel fontSize="sm" color="gray.500">{name}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" my={2}>
            {formatMetricValue(customFormula ? 'custom' : metric, value)}
          </StatNumber>
          <StatHelpText mb={0}>
            <Flex align="center">
              <StatArrow type={isPositive ? 'increase' : 'decrease'} />
              <Text>{Math.abs(changePercent).toFixed(1)}%</Text>
            </Flex>
          </StatHelpText>
        </Stat>
      );
    }
    
    if (type === 'line' || type === 'bar') {
      const chartData = data.daily || [];
      
      if (chartData.length === 0) {
        return (
          <Flex direction="column" align="center" justify="center" h="100%" py={6}>
            <Icon as={TrendingUpIcon} boxSize={8} color="gray.400" />
            <Text mt={2} fontSize="sm" color="gray.500">Sem dados diários disponíveis</Text>
          </Flex>
        );
      }
      
      return (
        <Box p={4} h="100%">
          <Heading size="sm" mb={4}>{name}</Heading>
          <ResponsiveContainer width="100%" height={200}>
            {type === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatMetricValue(name, value as number), name]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                />
                {metrics.map((metric) => (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={`metrics.${metric}`} 
                    name={metric} 
                    stroke={metric.includes('spend') ? '#EF4444' : '#3B82F6'} 
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatMetricValue(name, value as number), name]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                />
                {metrics.map((metric) => (
                  <Bar 
                    key={metric}
                    dataKey={`metrics.${metric}`} 
                    name={metric} 
                    fill={metric.includes('spend') ? '#EF4444' : '#3B82F6'} 
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      );
    }
    
    return null;
  };
  
  return (
    <Card 
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
      borderRadius="lg"
      borderWidth="1px"
      h="100%"
      position="relative"
    >
      <Box 
        position="absolute" 
        top="0.5rem"
        right="0.5rem"
        cursor="pointer"
        onClick={() => onRemove(id)}
        zIndex={1}
      >
        <Icon as={MoreHorizontalIcon} boxSize={4} color="gray.500" />
      </Box>
      {renderContent()}
    </Card>
  );
};

export default WidgetCard;
