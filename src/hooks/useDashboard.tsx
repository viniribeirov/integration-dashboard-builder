
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import { WidgetData } from '../components/dashboard/WidgetCard';

export interface DashboardWidget {
  id: string;
  project_id: string;
  name: string;
  type: 'kpi' | 'line' | 'bar' | 'area';
  platform: string;
  metrics: string[];
  position: number;
  size: string;
  custom_formula: string | null;
  created_at: string;
  updated_at: string;
  data?: WidgetData;
}

export const useDashboard = (projectId: string | undefined, dateRange: DateRange | undefined) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Fetch widgets from Supabase
  const fetchWidgets = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      setWidgets(data || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch widget data from Edge Function
  const fetchWidgetData = async () => {
    if (!projectId || !dateRange?.from || widgets.length === 0) return;
    
    const to = dateRange.to || dateRange.from;
    
    try {
      setIsLoadingData(true);
      
      // Group widgets by platform to minimize API calls
      const platforms = [...new Set(widgets.map(w => w.platform))];
      
      const updatedWidgets = [...widgets];
      
      for (const platform of platforms) {
        const platformWidgets = widgets.filter(w => w.platform === platform);
        
        // Collect all metrics needed for this platform
        const allMetrics = [...new Set(platformWidgets.flatMap(w => w.metrics))];
        
        try {
          const response = await supabase.functions.invoke('get-metrics', {
            body: {
              project_id: projectId,
              platform,
              metrics: allMetrics,
              start_date: dateRange.from.toISOString().split('T')[0],
              end_date: to.toISOString().split('T')[0]
            }
          });
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          // Update each widget with the data
          platformWidgets.forEach(widget => {
            const widgetIndex = updatedWidgets.findIndex(w => w.id === widget.id);
            if (widgetIndex !== -1) {
              updatedWidgets[widgetIndex] = {
                ...updatedWidgets[widgetIndex],
                data: response.data
              };
            }
          });
        } catch (error) {
          console.error(`Error fetching data for platform ${platform}:`, error);
        }
      }
      
      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Add a new widget
  const addWidget = async (widget: Omit<DashboardWidget, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          ...widget,
          project_id: projectId
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setWidgets([...widgets, data[0]]);
      }
      
      await fetchWidgetData();
      
      return data ? data[0] : null;
    } catch (error) {
      console.error('Error adding widget:', error);
      return null;
    }
  };
  
  // Remove a widget
  const removeWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', widgetId);
      
      if (error) throw error;
      
      setWidgets(widgets.filter(w => w.id !== widgetId));
      
      return true;
    } catch (error) {
      console.error('Error removing widget:', error);
      return false;
    }
  };
  
  // Update widget positions
  const updateWidgetPositions = async (reorderedWidgets: DashboardWidget[]) => {
    try {
      const updates = reorderedWidgets.map((widget, index) => ({
        id: widget.id,
        position: index
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('dashboard_widgets')
          .update({ position: update.position })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      setWidgets(reorderedWidgets);
      
      return true;
    } catch (error) {
      console.error('Error updating widget positions:', error);
      return false;
    }
  };
  
  // Effect to fetch widgets when project changes
  useEffect(() => {
    fetchWidgets();
  }, [projectId]);
  
  // Effect to fetch widget data when widgets or date range changes
  useEffect(() => {
    fetchWidgetData();
  }, [widgets.length, dateRange?.from, dateRange?.to]);
  
  // Establish realtime subscription for widgets
  useEffect(() => {
    if (!projectId) return;
    
    const channel = supabase
      .channel('dashboard_widgets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_widgets',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Dashboard widget change:', payload);
          fetchWidgets();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  return {
    widgets,
    isLoading,
    isLoadingData,
    fetchWidgets,
    fetchWidgetData,
    addWidget,
    removeWidget,
    updateWidgetPositions
  };
};
