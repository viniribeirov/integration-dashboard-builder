
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardWidget, MetricData } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Define dashboard context type
interface DashboardContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  dashboardData: Record<string, any> | null;
  isLoading: boolean;
  widgets: DashboardWidget[];
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => Promise<void>;
  updateWidget: (id: string, widget: Partial<DashboardWidget>) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  refreshWidgets: () => Promise<void>;
  metrics: Array<MetricData>;
}

// Create dashboard context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  
  const [dashboardData, setDashboardData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  
  // Define available metrics
  const metrics: MetricData[] = [
    { value: 'spend', label: 'Spend', category: 'facebook' },
    { value: 'clicks', label: 'Clicks', category: 'facebook' },
    { value: 'ctr', label: 'CTR', category: 'facebook' },
    { value: 'cpc', label: 'CPC', category: 'facebook' },
    { value: 'cpm', label: 'CPM', category: 'facebook' },
  ];
  
  // Load widgets
  const loadWidgets = async () => {
    try {
      const { data, error } = await supabase
        .from('project_widgets')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // Type-safe conversion for dashboard widgets
      const typedWidgets: DashboardWidget[] = data.map((widget: any) => ({
        id: widget.id,
        name: widget.widget_name,
        type: widget.visualization_type as "kpi" | "line" | "bar" | "area",
        platform: widget.platform as "facebook" | "google" | "instagram" | "twitter" | "linkedin",
        metrics: widget.metrics || [],
        size: 'medium',
        position: widget.position,
        custom_formula: widget.formula || '',
        project_id: widget.project_id
      }));
      
      setWidgets(typedWidgets);
    } catch (error) {
      console.error('Error loading widgets:', error);
      toast.error('Failed to load dashboard widgets');
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setIsLoading(true);
    try {
      const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
      
      // Load Facebook data
      const { data: fbData, error: fbError } = await supabase
        .rpc('get_dashboard_metrics', {
          p_project_id: null, // Current project
          p_platform: 'facebook',
          p_metrics: metrics.filter(m => m.category === 'facebook').map(m => m.value),
          p_start_date: formatDate(dateRange.from),
          p_end_date: formatDate(dateRange.to)
        });
      
      if (fbError) {
        console.error('Error loading Facebook data:', fbError);
        toast.error('Failed to load Facebook metrics');
      } else {
        setDashboardData(prev => ({ ...prev, facebook: fbData }));
      }
      
      // Here you would add code to load metrics from other platforms
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add widget
  const addWidget = async (widget: Omit<DashboardWidget, 'id'>) => {
    try {
      // Calculate next position
      const nextPosition = widgets.length > 0 
        ? Math.max(...widgets.map(w => w.position)) + 1 
        : 0;
      
      // Insert new widget
      const { data, error } = await supabase
        .from('project_widgets')
        .insert({
          widget_name: widget.name,
          visualization_type: widget.type,
          platform: widget.platform,
          metrics: widget.metrics,
          position: nextPosition,
          formula: widget.custom_formula || null
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Add to local state
      const newWidget: DashboardWidget = {
        id: data.id,
        name: data.widget_name,
        type: data.visualization_type as "kpi" | "line" | "bar" | "area",
        platform: data.platform as "facebook" | "google" | "instagram" | "twitter" | "linkedin",
        metrics: data.metrics || [],
        size: 'medium',
        position: data.position,
        custom_formula: data.formula || '',
        project_id: data.project_id
      };
      
      setWidgets([...widgets, newWidget]);
      toast.success('Widget added successfully');
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error('Failed to add widget');
    }
  };
  
  // Update widget
  const updateWidget = async (id: string, widget: Partial<DashboardWidget>) => {
    try {
      // Map widget data to database columns
      const updateData: Record<string, any> = {};
      if (widget.name) updateData.widget_name = widget.name;
      if (widget.type) updateData.visualization_type = widget.type;
      if (widget.platform) updateData.platform = widget.platform;
      if (widget.metrics) updateData.metrics = widget.metrics;
      if (widget.position !== undefined) updateData.position = widget.position;
      if (widget.custom_formula !== undefined) updateData.formula = widget.custom_formula;
      
      const { error } = await supabase
        .from('project_widgets')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setWidgets(widgets.map(w => 
        w.id === id 
          ? { ...w, ...widget } 
          : w
      ));
      
      toast.success('Widget updated successfully');
    } catch (error) {
      console.error('Error updating widget:', error);
      toast.error('Failed to update widget');
    }
  };
  
  // Delete widget
  const deleteWidget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_widgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from local state
      setWidgets(widgets.filter(w => w.id !== id));
      toast.success('Widget deleted successfully');
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Failed to delete widget');
    }
  };
  
  // Refresh widgets
  const refreshWidgets = async () => {
    await loadWidgets();
  };
  
  // Initial load
  useEffect(() => {
    loadWidgets();
  }, []);
  
  // Load data when date range changes
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);
  
  // Subscribe to real-time updates for widgets
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_widgets'
        },
        () => {
          refreshWidgets();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const value = {
    dateRange,
    setDateRange,
    dashboardData,
    isLoading,
    widgets,
    addWidget,
    updateWidget,
    deleteWidget,
    refreshWidgets,
    metrics,
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook for using the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
